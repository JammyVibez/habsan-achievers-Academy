import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminFromRequest } from '@/lib/require-admin-api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  const rows = await prisma.student.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
    include: {
      user: { select: { firstName: true, lastName: true } },
    },
  });

  const students = rows.map((s) => ({
    id: s.id,
    userId: s.userId,
    firstName: s.user.firstName,
    lastName: s.user.lastName,
    admissionNumber: s.admissionNumber,
    name: `${s.user.firstName} ${s.user.lastName}`.trim(),
    classLevel: s.classLevel,
    section: s.section ?? '',
    classLabel: [s.classLevel, s.section].filter(Boolean).join(' '),
    gender: s.gender,
    dateOfBirth: s.dateOfBirth.toISOString().slice(0, 10),
    parentName: s.parentGuardianName,
    parentPhone: s.parentGuardianPhone,
    status: s.status,
  }));

  return NextResponse.json({ students });
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  let body: {
    id?: string;
    firstName?: string;
    lastName?: string;
    classLevel?: string;
    section?: string;
    parentName?: string;
    parentPhone?: string;
    status?: 'active' | 'suspended' | 'graduated' | 'withdrawn';
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: 'Student id is required' }, { status: 400 });
  }

  const student = await prisma.student.findUnique({
    where: { id: body.id },
    include: { user: true },
  });
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  const firstName = body.firstName?.trim();
  const lastName = body.lastName?.trim();
  const classLevel = body.classLevel?.trim();
  const parentName = body.parentName?.trim();
  const parentPhone = body.parentPhone?.trim();

  if (firstName !== undefined && firstName.length === 0) {
    return NextResponse.json({ error: 'First name cannot be empty' }, { status: 400 });
  }
  if (lastName !== undefined && lastName.length === 0) {
    return NextResponse.json({ error: 'Last name cannot be empty' }, { status: 400 });
  }
  if (classLevel !== undefined && classLevel.length === 0) {
    return NextResponse.json({ error: 'Class level cannot be empty' }, { status: 400 });
  }
  if (parentName !== undefined && parentName.length === 0) {
    return NextResponse.json({ error: 'Parent/guardian name cannot be empty' }, { status: 400 });
  }
  if (parentPhone !== undefined && parentPhone.length === 0) {
    return NextResponse.json({ error: 'Parent/guardian phone cannot be empty' }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    if (firstName !== undefined || lastName !== undefined) {
      await tx.user.update({
        where: { id: student.userId },
        data: {
          ...(firstName !== undefined ? { firstName } : {}),
          ...(lastName !== undefined ? { lastName } : {}),
        },
      });
    }

    await tx.student.update({
      where: { id: student.id },
      data: {
        ...(classLevel !== undefined ? { classLevel } : {}),
        ...(body.section !== undefined ? { section: body.section.trim() || null } : {}),
        ...(parentName !== undefined ? { parentGuardianName: parentName } : {}),
        ...(parentPhone !== undefined ? { parentGuardianPhone: parentPhone } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
      },
    });
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Student id is required' }, { status: 400 });

  const student = await prisma.student.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

  await prisma.user.delete({ where: { id: student.userId } });
  return NextResponse.json({ success: true });
}

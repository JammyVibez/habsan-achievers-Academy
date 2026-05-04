import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminFromRequest } from '@/lib/require-admin-api';
import type { SubjectClassAssignment } from '@/lib/teacher-utils';
import { ensureSubjectByName } from '@/lib/sequences';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  const rows = await prisma.teacher.findMany({
    orderBy: { createdAt: 'desc' },
    take: 300,
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true } },
      subjects: { include: { subject: { select: { name: true } } } },
    },
  });

  const teachers = rows.map((t) => {
    const subjectNames = [...new Set(t.subjects.map((ts) => ts.subject.name))];
    const classes = [...new Set(t.subjects.map((ts) => ts.classLevel.trim()))];
    if (t.homeroomClass) classes.push(t.homeroomClass);

    return {
      id: t.id,
      userId: t.userId,
      firstName: t.user.firstName,
      lastName: t.user.lastName,
      staffId: t.staffId,
      name: `${t.user.firstName} ${t.user.lastName}`.trim(),
      email: t.user.email,
      phone: t.user.phone ?? '—',
      homeroomClass: t.homeroomClass ?? '',
      subjects: subjectNames,
      classes,
      subjectClassAssignments: t.subjects.map((ts) => ({
        subject: ts.subject.name,
        classLevel: ts.classLevel,
      })),
      status: t.status,
    };
  });

  return NextResponse.json({ teachers });
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  let body: {
    id?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    homeroomClass?: string;
    status?: 'active' | 'on_leave' | 'terminated';
    subjectClassAssignments?: SubjectClassAssignment[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.id) return NextResponse.json({ error: 'Teacher id is required' }, { status: 400 });

  const teacher = await prisma.teacher.findUnique({
    where: { id: body.id },
    include: { user: true },
  });
  if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });

  const firstName = body.firstName?.trim();
  const lastName = body.lastName?.trim();
  const phone = body.phone?.trim();
  const homeroomClass = body.homeroomClass?.trim();
  const assignments = (body.subjectClassAssignments ?? [])
    .map((a) => ({ subject: a.subject.trim(), classLevel: a.classLevel.trim() }))
    .filter((a) => a.subject && a.classLevel);

  if (firstName !== undefined && firstName.length === 0) {
    return NextResponse.json({ error: 'First name cannot be empty' }, { status: 400 });
  }
  if (lastName !== undefined && lastName.length === 0) {
    return NextResponse.json({ error: 'Last name cannot be empty' }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    if (firstName !== undefined || lastName !== undefined || phone !== undefined) {
      await tx.user.update({
        where: { id: teacher.userId },
        data: {
          ...(firstName !== undefined ? { firstName } : {}),
          ...(lastName !== undefined ? { lastName } : {}),
          ...(phone !== undefined ? { phone: phone || null } : {}),
        },
      });
    }

    await tx.teacher.update({
      where: { id: teacher.id },
      data: {
        ...(homeroomClass !== undefined ? { homeroomClass: homeroomClass || null } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
      },
    });

    if (body.subjectClassAssignments) {
      const prepared = [];
      for (const a of assignments) {
        const sub = await ensureSubjectByName(a.subject);
        prepared.push({ subjectId: sub.id, classLevel: a.classLevel });
      }

      await tx.teacherSubject.deleteMany({ where: { teacherId: teacher.id } });
      if (prepared.length > 0) {
        await tx.teacherSubject.createMany({
          data: prepared.map((p) => ({
            teacherId: teacher.id,
            subjectId: p.subjectId,
            classLevel: p.classLevel,
          })),
        });
      }
    }
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Teacher id is required' }, { status: 400 });

  const teacher = await prisma.teacher.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });
  if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });

  await prisma.user.delete({ where: { id: teacher.userId } });
  return NextResponse.json({ success: true });
}

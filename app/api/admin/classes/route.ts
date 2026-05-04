import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminFromRequest } from '@/lib/require-admin-api';
import { getClassCatalog, setClassCatalog } from '@/lib/class-catalog';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  const classes = await getClassCatalog();
  return NextResponse.json({ classes });
}

export async function PUT(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  let body: { classes?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!Array.isArray(body.classes)) {
    return NextResponse.json({ error: 'classes must be an array' }, { status: 400 });
  }

  const classes = await setClassCatalog(body.classes);
  return NextResponse.json({ success: true, classes });
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  let body: { oldName?: string; newName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const oldName = (body.oldName ?? '').trim();
  const newName = (body.newName ?? '').trim();
  if (!oldName || !newName) {
    return NextResponse.json({ error: 'oldName and newName are required' }, { status: 400 });
  }
  if (oldName === newName) {
    return NextResponse.json({ success: true, message: 'No changes made' });
  }

  const current = await getClassCatalog();
  if (!current.includes(oldName)) {
    return NextResponse.json({ error: `Class "${oldName}" not found` }, { status: 404 });
  }
  if (current.includes(newName)) {
    return NextResponse.json({ error: `Class "${newName}" already exists` }, { status: 409 });
  }

  const next = current.map((c) => (c === oldName ? newName : c));

  await prisma.$transaction(async (tx) => {
    await tx.student.updateMany({
      where: { classLevel: oldName },
      data: { classLevel: newName },
    });
    await tx.teacher.updateMany({
      where: { homeroomClass: oldName },
      data: { homeroomClass: newName },
    });
    await tx.siteContentBlock.upsert({
      where: { key: 'class_catalog' },
      create: { key: 'class_catalog', payload: { classes: next } },
      update: { payload: { classes: next } },
    });
  });

  return NextResponse.json({ success: true, classes: next });
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  const { searchParams } = new URL(request.url);
  const className = (searchParams.get('name') ?? '').trim();
  if (!className) return NextResponse.json({ error: 'name is required' }, { status: 400 });

  const [studentsAssigned, teachersAssigned] = await Promise.all([
    prisma.student.count({ where: { classLevel: className } }),
    prisma.teacher.count({ where: { homeroomClass: className } }),
  ]);
  if (studentsAssigned > 0 || teachersAssigned > 0) {
    return NextResponse.json(
      {
        error: `Cannot delete "${className}" because it is assigned to ${studentsAssigned} student(s) and ${teachersAssigned} teacher(s).`,
        studentsAssigned,
        teachersAssigned,
      },
      { status: 409 },
    );
  }

  const current = await getClassCatalog();
  if (!current.includes(className)) {
    return NextResponse.json({ error: `Class "${className}" not found` }, { status: 404 });
  }
  const next = current.filter((c) => c !== className);
  await setClassCatalog(next);
  return NextResponse.json({ success: true, classes: next });
}


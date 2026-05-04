import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminFromRequest } from '@/lib/require-admin-api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  const subjects = await prisma.subject.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, code: true, isActive: true },
  });
  return NextResponse.json({ subjects });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  let body: { name?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const name = (body.name ?? '').trim();
  const code = (body.code ?? '').trim().toUpperCase();
  if (!name || !code) {
    return NextResponse.json({ error: 'name and code are required' }, { status: 400 });
  }

  const created = await prisma.subject.create({
    data: { name, code, isActive: true },
    select: { id: true, name: true, code: true, isActive: true },
  });
  return NextResponse.json({ success: true, subject: created }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  let body: { id?: string; name?: string; code?: string; isActive?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  const name = body.name?.trim();
  const code = body.code?.trim().toUpperCase();

  const updated = await prisma.subject.update({
    where: { id: body.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(code !== undefined ? { code } : {}),
      ...(typeof body.isActive === 'boolean' ? { isActive: body.isActive } : {}),
    },
    select: { id: true, name: true, code: true, isActive: true },
  });

  return NextResponse.json({ success: true, subject: updated });
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const usage = await prisma.result.count({ where: { subjectId: id } });
  if (usage > 0) {
    await prisma.subject.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({
      success: true,
      softDeleted: true,
      message: 'Subject is used in results and was deactivated instead of deleted.',
    });
  }

  await prisma.subject.delete({ where: { id } });
  return NextResponse.json({ success: true });
}


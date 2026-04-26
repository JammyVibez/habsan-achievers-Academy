import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminFromRequest } from '@/lib/require-admin-api';

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
    const subjectNames = t.subjects.map((ts) => ts.subject.name);
    const classes: string[] = [];
    if (t.homeroomClass) classes.push(t.homeroomClass);

    return {
      id: t.id,
      staffId: t.staffId,
      name: `${t.user.firstName} ${t.user.lastName}`.trim(),
      email: t.user.email,
      phone: t.user.phone ?? '—',
      subjects: subjectNames,
      classes,
      status: t.status,
    };
  });

  return NextResponse.json({ teachers });
}

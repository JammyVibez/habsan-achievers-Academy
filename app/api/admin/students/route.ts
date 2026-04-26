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
    admissionNumber: s.admissionNumber,
    name: `${s.user.firstName} ${s.user.lastName}`.trim(),
    classLabel: [s.classLevel, s.section].filter(Boolean).join(' '),
    gender: s.gender,
    dateOfBirth: s.dateOfBirth.toISOString().slice(0, 10),
    parentName: s.parentGuardianName,
    parentPhone: s.parentGuardianPhone,
    status: s.status,
  }));

  return NextResponse.json({ students });
}

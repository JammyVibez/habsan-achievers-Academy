import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminFromRequest } from '@/lib/require-admin-api';
import { documentMetaToFlags } from '@/lib/admission-document-meta';

export async function GET(request: NextRequest) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status')?.trim();

  const applications = await prisma.admissionApplication.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      applicationRef: true,
      firstName: true,
      lastName: true,
      classLevel: true,
      parentName: true,
      parentEmail: true,
      parentPhone: true,
      status: true,
      createdAt: true,
      documentMeta: true,
    },
  });

  const payload = applications.map((row) => ({
    id: row.id,
    applicationRef: row.applicationRef,
    studentName: `${row.firstName} ${row.lastName}`.trim(),
    classLevel: row.classLevel,
    parentName: row.parentName ?? '—',
    parentEmail: row.parentEmail,
    parentPhone: row.parentPhone ?? '—',
    applicationDate: row.createdAt.toISOString(),
    status: row.status,
    documents: documentMetaToFlags(row.documentMeta),
  }));

  return NextResponse.json({ applications: payload });
}

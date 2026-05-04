import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminFromRequest } from '@/lib/require-admin-api';
import { buildReportCardForStudent } from '@/lib/report-card';
import { buildReportCardHtml } from '@/lib/report-card-html';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  try {
    const { classLevel, sessionId, termId } = await request.json();
    if (!classLevel || !sessionId || !termId) {
      return NextResponse.json({ error: 'classLevel, sessionId and termId are required' }, { status: 400 });
    }

    const students = await prisma.student.findMany({
      where: { classLevel: String(classLevel) },
      orderBy: [{ admissionNumber: 'asc' }],
      take: 500,
    });

    const cards = [];
    for (const s of students) {
      const payload = await buildReportCardForStudent(s.id, String(termId), String(sessionId));
      if (!payload) continue;
      cards.push({
        studentId: s.id,
        admissionNumber: s.admissionNumber,
        html: buildReportCardHtml(payload),
        hasResults: payload.results.length > 0,
      });
    }

    return NextResponse.json({
      count: cards.length,
      cards,
    });
  } catch (error) {
    console.error('Bulk report cards error:', error);
    return NextResponse.json({ error: 'Failed to generate report cards' }, { status: 500 });
  }
}

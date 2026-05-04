import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminFromRequest } from '@/lib/require-admin-api';
import { decimalToNumber } from '@/lib/grades';
import { getCurrentTermAndSession } from '@/lib/report-card';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  const totalStudents = await prisma.student.count();
  const ctx = await getCurrentTermAndSession();
  if (!ctx) {
    return NextResponse.json({
      totalStudents,
      uploaded: 0,
      pending: totalStudents,
      averageScore: null,
      byClass: [],
    });
  }

  const [results, students] = await Promise.all([
    prisma.result.findMany({
      where: { termId: ctx.term.id, sessionId: ctx.session.id },
      select: { total: true, student: { select: { classLevel: true } } },
    }),
    prisma.student.findMany({ select: { classLevel: true } }),
  ]);

  const uploaded = results.length;
  const avg = uploaded > 0 ? results.reduce((a, r) => a + decimalToNumber(r.total), 0) / uploaded : null;

  const classTotals = new Map<string, number>();
  for (const s of students) classTotals.set(s.classLevel, (classTotals.get(s.classLevel) ?? 0) + 1);
  const classUploaded = new Map<string, { count: number; scoreSum: number }>();
  for (const r of results) {
    const k = r.student.classLevel;
    const prev = classUploaded.get(k) ?? { count: 0, scoreSum: 0 };
    classUploaded.set(k, { count: prev.count + 1, scoreSum: prev.scoreSum + decimalToNumber(r.total) });
  }

  const byClass = Array.from(classTotals.entries()).map(([classLevel, total]) => {
    const up = classUploaded.get(classLevel) ?? { count: 0, scoreSum: 0 };
    return {
      classLevel,
      totalStudents: total,
      uploaded: up.count,
      pending: Math.max(0, total - up.count),
      average: up.count > 0 ? Number((up.scoreSum / up.count).toFixed(1)) : null,
    };
  });

  return NextResponse.json({
    totalStudents,
    uploaded,
    pending: Math.max(0, totalStudents - uploaded),
    averageScore: avg === null ? null : Number(avg.toFixed(1)),
    byClass,
  });
}

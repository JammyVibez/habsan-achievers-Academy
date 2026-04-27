import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth-session';
import { getCurrentTermAndSession } from '@/lib/report-card';
import { decimalToNumber } from '@/lib/grades';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, isActive: true },
  });
  if (!user?.isActive || user.role !== 'teacher') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
    select: { homeroomClass: true },
  });
  if (!teacher) return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });

  const classFilter = teacher.homeroomClass?.trim() || undefined;
  const ctx = await getCurrentTermAndSession();

  const students = await prisma.student.findMany({
    where: classFilter ? { classLevel: classFilter } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { firstName: true, lastName: true } },
      results: ctx ? { where: { termId: ctx.term.id, sessionId: ctx.session.id }, select: { total: true } } : false,
      attendance: { select: { status: true } },
    },
    take: 300,
  });

  const rows = students.map((s) => {
    const scores = s.results?.map((r) => decimalToNumber(r.total)) ?? [];
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
    const attended = s.attendance.filter((a) => a.status === 'present' || a.status === 'late').length;
    const attendanceRate = s.attendance.length > 0 ? (attended / s.attendance.length) * 100 : null;
    return {
      id: s.id,
      name: `${s.user.firstName} ${s.user.lastName}`.trim(),
      admissionNumber: s.admissionNumber,
      classLevel: s.classLevel,
      average: avg === null ? null : Number(avg.toFixed(1)),
      attendanceRate: attendanceRate === null ? null : Number(attendanceRate.toFixed(1)),
    };
  });

  return NextResponse.json({ students: rows, classFilter: classFilter ?? null });
}

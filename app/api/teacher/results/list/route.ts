import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth-session';
import { decimalToNumber } from '@/lib/grades';
import { listAcademicSessionOptions } from '@/lib/academic-calendar';
import { getCurrentTermAndSession } from '@/lib/report-card';

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

  const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } });
  if (!teacher) return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });

  const sessions = await listAcademicSessionOptions();
  const current = await getCurrentTermAndSession();
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId') || current?.session.id;
  const termId = searchParams.get('termId') || current?.term.id;

  if (!sessionId || !termId) {
    return NextResponse.json({ sessions, rows: [], current: null });
  }

  const assignments = await prisma.teacherSubject.findMany({
    where: { teacherId: teacher.id },
    select: { subjectId: true, classLevel: true },
  });

  const rows = await prisma.result.findMany({
    where: {
      sessionId,
      termId,
      OR: [
        { teacherId: teacher.id },
        ...assignments.map((a) => ({
          subjectId: a.subjectId,
          student: { classLevel: a.classLevel },
        })),
      ],
    },
    orderBy: { updatedAt: 'desc' },
    take: 500,
    include: {
      student: {
        select: {
          admissionNumber: true,
          classLevel: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
      subject: { select: { name: true } },
      teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
      session: { select: { sessionName: true } },
      term: { select: { termName: true } },
    },
  });

  return NextResponse.json({
    sessions,
    current: { sessionId, termId },
    rows: rows.map((r) => ({
      id: r.id,
      studentName: `${r.student.user.firstName} ${r.student.user.lastName}`.trim(),
      admissionNumber: r.student.admissionNumber,
      classLevel: r.student.classLevel,
      subject: r.subject.name,
      ca1: decimalToNumber(r.ca1),
      ca2: decimalToNumber(r.ca2),
      exam: decimalToNumber(r.exam),
      total: decimalToNumber(r.total),
      grade: r.grade,
      remark: r.remark,
      teacherName: r.teacher ? `${r.teacher.user.firstName} ${r.teacher.user.lastName}`.trim() : '—',
      sessionName: r.session.sessionName,
      termName: r.term.termName,
      updatedAt: r.updatedAt,
    })),
  });
}

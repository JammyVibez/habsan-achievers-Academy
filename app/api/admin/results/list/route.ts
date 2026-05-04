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

  const sessions = await prisma.academicSession.findMany({
    orderBy: { startDate: 'desc' },
    include: {
      terms: { orderBy: { startDate: 'asc' }, select: { id: true, termName: true, isCurrent: true } },
    },
  });
  const current = await getCurrentTermAndSession();

  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get('teacherId') || undefined;
  const sessionId = searchParams.get('sessionId') || current?.session.id;
  const termId = searchParams.get('termId') || current?.term.id;

  if (!sessionId || !termId) {
    return NextResponse.json({
      sessions: sessions.map((s) => ({ id: s.id, sessionName: s.sessionName, isCurrent: s.isCurrent, terms: s.terms })),
      teachers: [],
      rows: [],
      current: null,
    });
  }

  const [teachers, rows] = await Promise.all([
    prisma.teacher.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true } } },
    }),
    prisma.result.findMany({
      where: { sessionId, termId, ...(teacherId ? { teacherId } : {}) },
      orderBy: [{ updatedAt: 'desc' }],
      take: 1000,
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
    }),
  ]);

  return NextResponse.json({
    sessions: sessions.map((s) => ({ id: s.id, sessionName: s.sessionName, isCurrent: s.isCurrent, terms: s.terms })),
    teachers: teachers.map((t) => ({ id: t.id, name: `${t.user.firstName} ${t.user.lastName}`.trim() })),
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

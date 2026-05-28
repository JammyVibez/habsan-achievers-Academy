import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth-session';
import { canManageResult, getResultForManage } from '@/lib/result-access';
import { scoreToComment, scoreToGrade } from '@/lib/grades';

type RouteContext = { params: { id: string } };

async function authUser(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, isActive: true },
  });
  if (!user?.isActive || (user.role !== 'admin' && user.role !== 'teacher')) return null;
  return user;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const user = await authUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resultId = context.params.id;
  const access = await canManageResult({ userId: user.id, role: user.role, resultId });
  if (!access.allowed) {
    return NextResponse.json({ error: access.reason ?? 'Forbidden' }, { status: 403 });
  }

  let body: { ca1?: number | string; ca2?: number | string; exam?: number | string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const ca1 = parseFloat(String(body.ca1));
  const ca2 = parseFloat(String(body.ca2));
  const exam = parseFloat(String(body.exam));
  if (Number.isNaN(ca1) || ca1 < 0 || ca1 > 20) {
    return NextResponse.json({ error: 'CA1 must be between 0 and 20' }, { status: 400 });
  }
  if (Number.isNaN(ca2) || ca2 < 0 || ca2 > 20) {
    return NextResponse.json({ error: 'CA2 must be between 0 and 20' }, { status: 400 });
  }
  if (Number.isNaN(exam) || exam < 0 || exam > 60) {
    return NextResponse.json({ error: 'Exam must be between 0 and 60' }, { status: 400 });
  }

  const total = ca1 + ca2 + exam;
  const grade = scoreToGrade(total);
  const remark = scoreToComment(grade);

  const updated = await prisma.result.update({
    where: { id: resultId },
    data: { ca1, ca2, exam, total, grade, remark },
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
    success: true,
    result: {
      id: updated.id,
      studentName: `${updated.student.user.firstName} ${updated.student.user.lastName}`.trim(),
      admissionNumber: updated.student.admissionNumber,
      classLevel: updated.student.classLevel,
      subject: updated.subject.name,
      ca1: Number(updated.ca1),
      ca2: Number(updated.ca2),
      exam: Number(updated.exam),
      total: Number(updated.total),
      grade: updated.grade,
      remark: updated.remark,
      teacherName: updated.teacher
        ? `${updated.teacher.user.firstName} ${updated.teacher.user.lastName}`.trim()
        : '—',
      sessionName: updated.session.sessionName,
      termName: updated.term.termName,
      updatedAt: updated.updatedAt,
    },
  });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const user = await authUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resultId = context.params.id;
  const access = await canManageResult({ userId: user.id, role: user.role, resultId });
  if (!access.allowed) {
    return NextResponse.json({ error: access.reason ?? 'Forbidden' }, { status: 403 });
  }

  const existing = await getResultForManage(resultId);
  if (!existing) return NextResponse.json({ error: 'Result not found' }, { status: 404 });

  await prisma.result.delete({ where: { id: resultId } });
  return NextResponse.json({ success: true });
}

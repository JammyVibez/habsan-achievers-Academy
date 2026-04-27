import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth-session';
import { getCurrentTermAndSession } from '@/lib/report-card';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, isActive: true, firstName: true },
  });
  if (!user?.isActive || user.role !== 'teacher') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
    include: { subjects: { include: { subject: true } } },
  });
  if (!teacher) return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });

  const homeroom = teacher.homeroomClass?.trim() || null;
  const studentsCount = homeroom
    ? await prisma.student.count({ where: { classLevel: homeroom } })
    : 0;

  const ctx = await getCurrentTermAndSession();
  let uploadedThisTerm = 0;
  if (ctx) {
    uploadedThisTerm = await prisma.result.count({
      where: { teacherId: teacher.id, termId: ctx.term.id, sessionId: ctx.session.id },
    });
  }

  const subjectsCount = teacher.subjects.length;
  const pending = Math.max(0, studentsCount * Math.max(1, subjectsCount) - uploadedThisTerm);

  const recent = await prisma.result.findMany({
    where: { teacherId: teacher.id },
    orderBy: { updatedAt: 'desc' },
    take: 8,
    include: {
      subject: { select: { name: true } },
      student: { select: { classLevel: true, admissionNumber: true } },
    },
  });

  return NextResponse.json({
    teacherName: user.firstName,
    stats: {
      students: studentsCount,
      subjects: subjectsCount,
      uploadedThisTerm,
      pending,
      homeroomClass: homeroom,
    },
    assignedSubjects: teacher.subjects.map((s) => s.subject.name),
    recentUploads: recent.map((r) => ({
      id: r.id,
      subject: r.subject.name,
      classLevel: r.student.classLevel,
      admissionNumber: r.student.admissionNumber,
      updatedAt: r.updatedAt.toISOString(),
      score: Number(r.total.toString()),
    })),
  });
}

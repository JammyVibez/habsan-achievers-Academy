import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth-session';
import { getClassCatalog } from '@/lib/class-catalog';

export const dynamic = 'force-dynamic';

export type UploadMetaAssignment = { subject: string; classLevel: string };

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, isActive: true },
  });
  if (!user?.isActive || (user.role !== 'teacher' && user.role !== 'admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (user.role === 'admin') {
    const [subjects, classes] = await Promise.all([
      prisma.subject.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { name: true } }),
      getClassCatalog(),
    ]);
    return NextResponse.json({
      subjects: subjects.map((s) => s.name),
      classes,
      assignments: null as UploadMetaAssignment[] | null,
      role: 'admin',
    });
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
    include: { subjects: { include: { subject: { select: { name: true } } } } },
  });
  if (!teacher) return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });

  const assignments: UploadMetaAssignment[] = teacher.subjects.map((ts) => ({
    subject: ts.subject.name,
    classLevel: ts.classLevel.trim(),
  }));

  const classCatalog = await getClassCatalog();

  const subjects = [...new Set(assignments.map((a) => a.subject))].sort((a, b) => a.localeCompare(b));
  const classesForTeacher = [...new Set(assignments.map((a) => a.classLevel))].sort((a, b) => a.localeCompare(b));

  return NextResponse.json({
    subjects,
    classes: classesForTeacher.length > 0 ? classesForTeacher : classCatalog,
    assignments,
    homeroomClass: teacher.homeroomClass?.trim() || null,
    role: 'teacher',
    sessions,
    current: current ? { sessionId: current.session.id, termId: current.term.id } : null,
  });
}

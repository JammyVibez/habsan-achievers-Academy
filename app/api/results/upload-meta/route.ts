import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth-session';

export const dynamic = 'force-dynamic';

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
    const [subjects, students] = await Promise.all([
      prisma.subject.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { name: true } }),
      prisma.student.findMany({ select: { classLevel: true }, distinct: ['classLevel'], orderBy: { classLevel: 'asc' } }),
    ]);
    return NextResponse.json({
      subjects: subjects.map((s) => s.name),
      classes: students.map((s) => s.classLevel),
      role: 'admin',
    });
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
    include: { subjects: { include: { subject: { select: { name: true } } } } },
  });
  if (!teacher) return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });

  const classes = teacher.homeroomClass ? [teacher.homeroomClass] : [];
  return NextResponse.json({
    subjects: teacher.subjects.map((s) => s.subject.name),
    classes,
    role: 'teacher',
  });
}

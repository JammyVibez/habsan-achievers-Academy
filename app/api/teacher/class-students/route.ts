import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth-session';

export const dynamic = 'force-dynamic';

/** Students in a class — allowed if teacher is homeroom for that class or has any subject assignment for that class. */
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

  const { searchParams } = new URL(request.url);
  const classLevel = searchParams.get('classLevel')?.trim() || '';
  if (!classLevel) {
    return NextResponse.json({ error: 'classLevel is required' }, { status: 400 });
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
    include: { subjects: true },
  });
  if (!teacher) return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });

  const homeroom = teacher.homeroomClass?.trim() || null;
  const hasAssignment = teacher.subjects.some((s) => s.classLevel.trim() === classLevel);
  const isHomeroom = homeroom === classLevel;

  if (!hasAssignment && !isHomeroom) {
    return NextResponse.json(
      { error: 'You do not have access to this class (assign subject–class in Admin or set homeroom).' },
      { status: 403 },
    );
  }

  const students = await prisma.student.findMany({
    where: { classLevel },
    include: { user: { select: { firstName: true, lastName: true } } },
    orderBy: [{ user: { lastName: 'asc' } }, { admissionNumber: 'asc' }],
    take: 400,
  });

  return NextResponse.json({
    students: students.map((s) => ({
      id: s.id,
      admissionNumber: s.admissionNumber,
      name: `${s.user.firstName} ${s.user.lastName}`.trim(),
    })),
  });
}

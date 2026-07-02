import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth-session';
import { classLevelsForPickerValue, getJssGroupKey, isJssGroupLabel } from '@/lib/class-groups';
import { getClassCatalog } from '@/lib/class-catalog';

export const dynamic = 'force-dynamic';

/** Students in a class or JSS group — allowed if teacher is homeroom or has a subject assignment. */
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

  const { searchParams } = new URL(request.url);
  const classLevel = searchParams.get('classLevel')?.trim() || '';
  const classGroup = searchParams.get('classGroup')?.trim() || '';
  const pickerValue = classGroup || classLevel;

  if (!pickerValue) {
    return NextResponse.json({ error: 'classLevel or classGroup is required' }, { status: 400 });
  }

  const catalog = await getClassCatalog();
  const targetLevels = classLevelsForPickerValue(pickerValue, catalog);

  if (user.role === 'teacher') {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id },
      include: { subjects: true },
    });
    if (!teacher) return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });

    const homeroom = teacher.homeroomClass?.trim() || null;
    const assignedLevels = new Set(teacher.subjects.map((s) => s.classLevel.trim()));
    if (homeroom) assignedLevels.add(homeroom);

    const hasAccess = targetLevels.some((level) => assignedLevels.has(level));
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'You do not have access to this class (assign subject–class in Admin or set homeroom).' },
        { status: 403 },
      );
    }
  }

  const students = await prisma.student.findMany({
    where: { classLevel: { in: targetLevels } },
    include: { user: { select: { firstName: true, lastName: true } } },
    orderBy: [{ classLevel: 'asc' }, { user: { lastName: 'asc' } }, { admissionNumber: 'asc' }],
    take: 400,
  });

  return NextResponse.json({
    classGroup: isJssGroupLabel(pickerValue) ? pickerValue : getJssGroupKey(pickerValue),
    streams: targetLevels,
    students: students.map((s) => ({
      id: s.id,
      admissionNumber: s.admissionNumber,
      name: `${s.user.firstName} ${s.user.lastName}`.trim(),
      classLevel: s.classLevel,
    })),
  });
}

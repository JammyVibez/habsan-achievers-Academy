import { prisma } from '@/lib/prisma';

export async function getResultForManage(resultId: string) {
  return prisma.result.findUnique({
    where: { id: resultId },
    include: {
      student: { select: { classLevel: true } },
      subject: { select: { id: true, name: true } },
      teacher: { select: { id: true, userId: true } },
    },
  });
}

export async function canManageResult(params: {
  userId: string;
  role: 'admin' | 'teacher' | 'student' | 'guest';
  resultId: string;
}): Promise<{ allowed: boolean; reason?: string }> {
  const { userId, role, resultId } = params;
  if (role === 'admin') return { allowed: true };

  if (role !== 'teacher') {
    return { allowed: false, reason: 'Forbidden' };
  }

  const teacher = await prisma.teacher.findUnique({ where: { userId } });
  if (!teacher) return { allowed: false, reason: 'Teacher profile not found' };

  const result = await getResultForManage(resultId);
  if (!result) return { allowed: false, reason: 'Result not found' };

  if (result.teacherId === teacher.id) return { allowed: true };

  const assigned = await prisma.teacherSubject.findFirst({
    where: {
      teacherId: teacher.id,
      subjectId: result.subjectId,
      classLevel: result.student.classLevel.trim(),
    },
  });

  if (assigned) return { allowed: true };

  return { allowed: false, reason: 'You can only edit results you uploaded or for your assigned class/subject' };
}

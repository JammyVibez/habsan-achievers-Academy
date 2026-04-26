import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth-session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, isActive: true, firstName: true, lastName: true },
  });
  if (!user?.isActive || user.role !== 'student') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    select: { admissionNumber: true, classLevel: true },
  });
  if (!student) {
    return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
  }

  return NextResponse.json({
    firstName: user.firstName,
    lastName: user.lastName,
    admissionNumber: student.admissionNumber,
    classLevel: student.classLevel,
  });
}

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth-session';
import { validateResultCheckingPin } from '@/lib/issued-result-pin';
import { buildReportCardForStudent, getCurrentTermAndSession } from '@/lib/report-card';

export const dynamic = 'force-dynamic';

/**
 * Logged-in students: same report payload as public checker, but admission number comes from the session
 * so the student only enters their **result** PIN (from PIN shop or physical sale).
 */
export async function POST(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, isActive: true },
  });
  if (!user?.isActive || user.role !== 'student') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: { pin?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const pin = body.pin;
  if (!pin || typeof pin !== 'string') {
    return NextResponse.json({ error: 'Result PIN is required' }, { status: 400 });
  }

  const pinCheck = await validateResultCheckingPin(pin);
  if (!pinCheck.ok) {
    return NextResponse.json(
      { error: pinCheck.message, pinShopUrl: pinCheck.pinShopPath },
      { status: pinCheck.status },
    );
  }

  const student = await prisma.student.findUnique({
    where: { userId: user.id },
  });
  if (!student) {
    return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
  }

  const ctx = await getCurrentTermAndSession();
  if (!ctx) {
    return NextResponse.json(
      { error: 'Results are not available yet (academic calendar not configured).' },
      { status: 503 },
    );
  }

  const studentResults = await buildReportCardForStudent(student.id, ctx.term.id, ctx.session.id);
  if (!studentResults || studentResults.results.length === 0) {
    return NextResponse.json(
      { error: 'No results uploaded for you for the current term yet.' },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Results retrieved successfully',
    results: studentResults,
    canDownload: true,
  });
}

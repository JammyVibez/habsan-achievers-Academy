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
export async function GET(request: NextRequest) {
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

  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!student) {
    return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
  }

  const sessions = await prisma.academicSession.findMany({
    orderBy: { startDate: 'desc' },
    include: {
      terms: {
        orderBy: { startDate: 'asc' },
        select: { id: true, termName: true, isCurrent: true },
      },
    },
  });
  const current = await getCurrentTermAndSession();

  return NextResponse.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      sessionName: s.sessionName,
      isCurrent: s.isCurrent,
      terms: s.terms,
    })),
    current: current
      ? {
          sessionId: current.session.id,
          termId: current.term.id,
        }
      : null,
  });
}

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

  let body: { pin?: string; sessionId?: string; termId?: string };
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

  let selectedSessionId: string;
  let selectedTermId: string;
  if (body.sessionId || body.termId) {
    if (!body.sessionId || !body.termId) {
      return NextResponse.json({ error: 'Select both session and term' }, { status: 400 });
    }
    const term = await prisma.term.findFirst({
      where: { id: body.termId, sessionId: body.sessionId },
      select: { id: true, sessionId: true },
    });
    if (!term) {
      return NextResponse.json({ error: 'Invalid session/term selection' }, { status: 400 });
    }
    selectedSessionId = term.sessionId;
    selectedTermId = term.id;
  } else {
    const ctx = await getCurrentTermAndSession();
    if (!ctx) {
      return NextResponse.json(
        { error: 'Results are not available yet (academic calendar not configured).' },
        { status: 503 },
      );
    }
    selectedSessionId = ctx.session.id;
    selectedTermId = ctx.term.id;
  }

  const studentResults = await buildReportCardForStudent(student.id, selectedTermId, selectedSessionId);
  if (!studentResults || studentResults.results.length === 0) {
    return NextResponse.json(
      { error: 'No results uploaded for you in the selected session/term yet.' },
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

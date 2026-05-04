import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildReportCardForStudent, getCurrentTermAndSession } from '@/lib/report-card';
import { validateResultCheckingPin } from '@/lib/issued-result-pin';

export async function GET() {
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
  try {
    const { pin, admissionNumber, sessionId, termId } = await request.json();

    if (!pin || !admissionNumber) {
      return NextResponse.json({ error: 'PIN and admission number are required' }, { status: 400 });
    }

    const admissionPattern = /^HAA\/\d{4}\/\d{3}$/;
    if (!admissionPattern.test(admissionNumber)) {
      return NextResponse.json({ error: 'Invalid admission number format' }, { status: 400 });
    }

    const pinCheck = await validateResultCheckingPin(String(pin));
    if (!pinCheck.ok) {
      return NextResponse.json(
        { error: pinCheck.message, pinShopUrl: pinCheck.pinShopPath },
        { status: pinCheck.status },
      );
    }

    const student = await prisma.student.findUnique({
      where: { admissionNumber },
      include: { user: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found for this admission number' }, { status: 404 });
    }

    let selectedSessionId: string;
    let selectedTermId: string;
    if (sessionId || termId) {
      if (!sessionId || !termId) {
        return NextResponse.json({ error: 'Select both session and term' }, { status: 400 });
      }
      const term = await prisma.term.findFirst({
        where: { id: String(termId), sessionId: String(sessionId) },
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
        { error: 'No published results for this student in the selected session/term.' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Results retrieved successfully',
        results: studentResults,
        canDownload: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Result check error:', error);
    return NextResponse.json({ error: 'Failed to retrieve results' }, { status: 500 });
  }
}

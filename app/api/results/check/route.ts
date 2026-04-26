import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildReportCardForStudent, getCurrentTermAndSession } from '@/lib/report-card';
import { validateResultCheckingPin } from '@/lib/issued-result-pin';

export async function POST(request: NextRequest) {
  try {
    const { pin, admissionNumber } = await request.json();

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
        { error: 'No published results for this student for the current term yet.' },
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

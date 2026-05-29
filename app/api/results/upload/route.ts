import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveSessionAndTerm } from '@/lib/academic-calendar';
import { scoreToComment, scoreToGrade } from '@/lib/grades';
import { getSessionFromRequest } from '@/lib/auth-session';

type ResultRow = {
  studentId?: string;
  admissionNumber: string;
  studentName?: string;
  ca1: string | number;
  ca2: string | number;
  exam: string | number;
};

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, role: true, isActive: true },
    });
    if (!user?.isActive || (user.role !== 'teacher' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();
    const { subject, classAssigned, results, sessionId, termId } = data as {
      subject: string;
      classAssigned: string;
      results: ResultRow[];
      sessionId?: string;
      termId?: string;
    };

    if (!subject || !classAssigned || !results || results.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!sessionId || !termId) {
      return NextResponse.json({ error: 'Academic session and term are required.' }, { status: 400 });
    }

    const classNorm = classAssigned.trim();

    for (const result of results) {
      if (
        !result.admissionNumber ||
        result.ca1 === undefined ||
        result.ca1 === null ||
        result.ca2 === undefined ||
        result.ca2 === null ||
        result.exam === undefined ||
        result.exam === null
      ) {
        return NextResponse.json({ error: 'Invalid result entry format' }, { status: 400 });
      }

      const ca1 = parseFloat(String(result.ca1));
      const ca2 = parseFloat(String(result.ca2));
      const exam = parseFloat(String(result.exam));
      if (Number.isNaN(ca1) || ca1 < 0 || ca1 > 20) {
        return NextResponse.json({ error: 'CA1 must be between 0 and 20' }, { status: 400 });
      }
      if (Number.isNaN(ca2) || ca2 < 0 || ca2 > 20) {
        return NextResponse.json({ error: 'CA2 must be between 0 and 20' }, { status: 400 });
      }
      if (Number.isNaN(exam) || exam < 0 || exam > 60) {
        return NextResponse.json({ error: 'Exam must be between 0 and 60' }, { status: 400 });
      }
    }

    let teacherIdForRow: string | null = null;
    if (user.role === 'teacher') {
      const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } });
      if (!teacher) {
        return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
      }
      teacherIdForRow = teacher.id;
    }

    const subjectRecord = await prisma.subject.findUnique({
      where: { name: subject.trim() },
    });
    if (!subjectRecord) {
      return NextResponse.json(
        { error: `Subject "${subject}" not found. Add it under Admin → Subjects or seed the database.` },
        { status: 400 },
      );
    }

    if (user.role === 'teacher' && teacherIdForRow) {
      const assigned = await prisma.teacherSubject.findFirst({
        where: { teacherId: teacherIdForRow, subjectId: subjectRecord.id, classLevel: classNorm },
      });
      if (!assigned) {
        return NextResponse.json(
          { error: 'You are not assigned to this subject for this class' },
          { status: 403 },
        );
      }
    }

    let ctx;
    try {
      ctx = await resolveSessionAndTerm(String(sessionId), String(termId));
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Invalid session/term selection' },
        { status: 400 },
      );
    }

    let uploaded = 0;
    const teacher = user.role === 'teacher' && teacherIdForRow ? { id: teacherIdForRow } : null;

    for (const row of results) {
      const ca1 = parseFloat(String(row.ca1));
      const ca2 = parseFloat(String(row.ca2));
      const exam = parseFloat(String(row.exam));
      const total = ca1 + ca2 + exam;
      const student = await prisma.student.findUnique({
        where: { admissionNumber: row.admissionNumber.trim() },
      });
      if (!student) {
        return NextResponse.json(
          { error: `Student with admission number ${row.admissionNumber} was not found` },
          { status: 404 },
        );
      }
      if (student.classLevel.trim() !== classNorm) {
        return NextResponse.json(
          {
            error: `Student ${row.admissionNumber} is in "${student.classLevel}", not "${classNorm}".`,
          },
          { status: 400 },
        );
      }

      const grade = scoreToGrade(total);
      const remark = scoreToComment(grade);

      const existing = await prisma.result.findFirst({
        where: {
          studentId: student.id,
          subjectId: subjectRecord.id,
          sessionId: ctx.session.id,
          termId: ctx.term.id,
        },
      });

      const teacherFk = user.role === 'admin' ? null : teacher?.id ?? null;

      if (existing) {
        await prisma.result.update({
          where: { id: existing.id },
          data: {
            ca1,
            ca2,
            exam,
            total,
            grade,
            remark,
            ...(teacherFk ? { teacherId: teacherFk } : {}),
          },
        });
      } else {
        await prisma.result.create({
          data: {
            studentId: student.id,
            subjectId: subjectRecord.id,
            sessionId: ctx.session.id,
            termId: ctx.term.id,
            ca1,
            ca2,
            exam,
            total,
            grade,
            remark,
            teacherId: teacherFk,
          },
        });
      }
      uploaded += 1;
    }

    return NextResponse.json(
      {
        success: true,
        message: `Successfully uploaded ${uploaded} student results for ${subject.trim()} in ${classNorm}`,
        uploadedCount: uploaded,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Result upload error:', error);
    return NextResponse.json({ error: 'Failed to upload results' }, { status: 500 });
  }
}

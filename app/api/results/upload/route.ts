import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentTermAndSession } from '@/lib/report-card';
import { scoreToComment, scoreToGrade } from '@/lib/grades';
import { getSessionFromRequest } from '@/lib/auth-session';

type ResultRow = {
  studentId?: string;
  admissionNumber: string;
  studentName?: string;
  score: string | number;
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
    const { subject, classAssigned, results } = data as {
      subject: string;
      classAssigned: string;
      results: ResultRow[];
    };

    if (!subject || !classAssigned || !results || results.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    for (const result of results) {
      if (!result.admissionNumber || result.score === undefined || result.score === null) {
        return NextResponse.json({ error: 'Invalid result entry format' }, { status: 400 });
      }

      const score = parseFloat(String(result.score));
      if (Number.isNaN(score) || score < 0 || score > 100) {
        return NextResponse.json({ error: 'Score must be between 0 and 100' }, { status: 400 });
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
        where: { teacherId: teacherIdForRow, subjectId: subjectRecord.id },
      });
      if (!assigned) {
        return NextResponse.json({ error: 'You are not assigned to this subject' }, { status: 403 });
      }
    }

    const ctx = await getCurrentTermAndSession();
    if (!ctx) {
      return NextResponse.json(
        { error: 'No current academic session or term configured. Run database seed or admin setup.' },
        { status: 503 },
      );
    }

    const classNorm = classAssigned.trim();
    let uploaded = 0;
    const teacher = user.role === 'teacher' && teacherIdForRow ? { id: teacherIdForRow } : null;

    for (const row of results) {
      const score = parseFloat(String(row.score));
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

      const grade = scoreToGrade(score);
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
            exam: score,
            total: score,
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
            ca1: 0,
            ca2: 0,
            exam: score,
            total: score,
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

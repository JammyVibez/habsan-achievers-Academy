import { prisma } from '@/lib/prisma';
import { decimalToNumber, gradeToPoint, scoreToComment, scoreToGrade } from '@/lib/grades';

export type ReportSubjectRow = {
  subject: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  score: number;
  grade: string;
  comment: string;
};

export type ReportCardPayload = {
  studentName: string;
  admissionNumber: string;
  className: string;
  academicSession: string;
  term: string;
  results: ReportSubjectRow[];
  gpa: number;
  overallGrade: string;
  position: string;
  attendance: { daysPresent: number; daysAbsent: number; daysLate: number };
  conduct: string;
  comments: string;
  principalSignature: boolean;
  classTeacherComment: string;
};

function overallGradeFromGpa(gpa: number): string {
  if (gpa >= 4.5) return 'A';
  if (gpa >= 3.5) return 'B';
  if (gpa >= 2.5) return 'C';
  if (gpa >= 1.5) return 'D';
  return 'F';
}

export async function buildReportCardForStudent(
  studentId: string,
  termId: string,
  sessionId: string,
): Promise<ReportCardPayload | null> {
  const term = await prisma.term.findFirst({
    where: { id: termId, sessionId },
    include: { session: true },
  });
  if (!term) return null;

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: true,
      results: {
        where: { termId, sessionId },
        include: { subject: true },
      },
    },
  });

  if (!student) return null;

  const session = term.session;

  const results: ReportSubjectRow[] = student.results.map((r) => {
    const ca1 = decimalToNumber(r.ca1);
    const ca2 = decimalToNumber(r.ca2);
    const exam = decimalToNumber(r.exam);
    const total = decimalToNumber(r.total);
    const grade = r.grade ?? scoreToGrade(total);
    return {
      subject: r.subject.name,
      ca1,
      ca2,
      exam,
      total,
      score: total,
      grade,
      comment: r.remark ?? scoreToComment(grade),
    };
  });

  const gpaRaw =
    results.length > 0
      ? results.reduce((sum, row) => sum + gradeToPoint(row.grade), 0) / results.length
      : 0;
  const gpa = Math.round(gpaRaw * 10) / 10;
  const overallGrade = overallGradeFromGpa(gpa);

  const from = term.startDate;
  const to = term.endDate;

  const attendanceRows = await prisma.attendance.findMany({
    where: {
      studentId,
      date: { gte: from, lte: to },
    },
  });

  const daysPresent = attendanceRows.filter((a) => a.status === 'present').length;
  const daysAbsent = attendanceRows.filter((a) => a.status === 'absent').length;
  const daysLate = attendanceRows.filter((a) => a.status === 'late').length;

  const studentName = `${student.user.firstName} ${student.user.lastName}`.trim();

  return {
    studentName,
    admissionNumber: student.admissionNumber,
    className: student.classLevel,
    academicSession: session.sessionName,
    term: term.termName,
    results,
    gpa,
    overallGrade,
    position: '—',
    attendance: {
      daysPresent: daysPresent || 0,
      daysAbsent: daysAbsent || 0,
      daysLate: daysLate || 0,
    },
    conduct: 'Good',
    comments: 'Continue to work hard across all subjects.',
    principalSignature: true,
    classTeacherComment: 'Satisfactory progress this term.',
  };
}

export async function getCurrentTermAndSession(): Promise<{
  term: { id: string; termName: string; startDate: Date; endDate: Date };
  session: { id: string; sessionName: string };
} | null> {
  const session = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    orderBy: { startDate: 'desc' },
    include: {
      terms: { where: { isCurrent: true }, take: 1 },
    },
  });

  if (!session) return null;
  const term = session.terms[0];
  if (!term) return null;

  return {
    term: {
      id: term.id,
      termName: term.termName,
      startDate: term.startDate,
      endDate: term.endDate,
    },
    session: { id: session.id, sessionName: session.sessionName },
  };
}

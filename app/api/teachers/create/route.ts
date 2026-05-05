import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { isPrismaUniqueViolation } from '@/lib/prisma-errors';
import {
  generateTeacherPassword,
  isValidEmail,
  isValidPhoneNumber,
  type SubjectClassAssignment,
  type TeacherCreationData,
} from '@/lib/teacher-utils';
import { ensureSubjectByName, nextStaffSequence } from '@/lib/sequences';

function normalizeAssignment(a: SubjectClassAssignment): { subject: string; classLevel: string } {
  return { subject: a.subject.trim(), classLevel: a.classLevel.trim() };
}

function buildAssignmentsFromPayload(data: TeacherCreationData & { subjectsAssigned?: string[] }): SubjectClassAssignment[] {
  if (data.subjectClassAssignments && data.subjectClassAssignments.length > 0) {
    return data.subjectClassAssignments.map(normalizeAssignment).filter((a) => a.subject && a.classLevel);
  }
  const classLevel = (data.classAssigned || '').trim();
  const subs = (data.subjectsAssigned || []).map((s) => s.trim()).filter(Boolean);
  if (!classLevel || subs.length === 0) return [];
  const unique = [...new Set(subs)];
  return unique.map((subject) => ({ subject, classLevel }));
}

export async function POST(request: NextRequest) {
  try {
    const data: TeacherCreationData & { subjectsAssigned?: string[] } = await request.json();

    if (!data.firstName || !data.lastName || !data.email || !data.phoneNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!isValidEmail(data.email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (!isValidPhoneNumber(data.phoneNumber)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    const assignments = buildAssignmentsFromPayload(data);
    if (assignments.length === 0) {
      return NextResponse.json(
        { error: 'Add at least one subject with class (e.g. Mathematics for JSS 1A)' },
        { status: 400 },
      );
    }

    const seen = new Set<string>();
    for (const a of assignments) {
      const k = `${a.subject.toLowerCase()}|${a.classLevel}`;
      if (seen.has(k)) {
        return NextResponse.json({ error: `Duplicate subject/class: ${a.subject} — ${a.classLevel}` }, { status: 400 });
      }
      seen.add(k);
    }

    const defaultPassword = generateTeacherPassword();
    const passwordHash = await hashPassword(defaultPassword);
    const year = new Date().getFullYear();
    const staffSeq = await nextStaffSequence(year);
    const staffId = `TCH/${year}/${String(staffSeq).padStart(3, '0')}`;
    const joinDate = data.employmentDate ? new Date(data.employmentDate) : new Date();
    if (Number.isNaN(joinDate.getTime())) {
      return NextResponse.json({ error: 'Invalid employment date' }, { status: 400 });
    }

    const homeroom = (data.classAssigned || '').trim() || null;

    const subjectRecords: { id: string }[] = [];
    for (const a of assignments) {
      const rec = await ensureSubjectByName(a.subject);
      subjectRecords.push(rec);
    }

    const teacher = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email.trim().toLowerCase(),
          passwordHash,
          role: 'teacher',
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          phone: data.phoneNumber.trim(),
          passwordMustChange: true,
        },
      });

      const t = await tx.teacher.create({
        data: {
          userId: user.id,
          staffId,
          dateOfJoining: joinDate,
          homeroomClass: homeroom,
          qualification: data.qualifications?.trim() || null,
          status: 'active',
        },
      });

      for (let i = 0; i < assignments.length; i += 1) {
        const a = assignments[i]!;
        const sub = subjectRecords[i]!;
        await tx.teacherSubject.create({
          data: {
            teacherId: t.id,
            subjectId: sub.id,
            classLevel: a.classLevel,
          },
        });
      }

      return t;
    });

    const uniqueSubjects = [...new Set(assignments.map((a) => a.subject))];

    return NextResponse.json(
      {
        success: true,
        message: `Teacher ${data.firstName} ${data.lastName} created successfully`,
        teacher: {
          id: teacher.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email.trim().toLowerCase(),
          defaultPassword,
          classAssigned: homeroom ?? '',
          subjectsAssigned: uniqueSubjects,
          subjectClassAssignments: assignments,
          createdAt: new Date(),
          requiresPasswordChange: true,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (isPrismaUniqueViolation(error)) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const target = Array.isArray(error.meta?.target) ? error.meta?.target.map(String) : [];
        const asText = target.join(',');
        const hasTeacherSubjectPairColumns = target.includes('teacher_id') && target.includes('subject_id');
        const hasTeacherSubjectClassColumns =
          target.includes('teacher_id') && target.includes('subject_id') && target.includes('class_level');
        if (asText.includes('users_email_key')) {
          return NextResponse.json({ error: 'Teacher email already exists' }, { status: 409 });
        }
        if (asText.includes('teachers_staff_id_key')) {
          return NextResponse.json({ error: 'Generated staff ID already exists. Please try again.' }, { status: 409 });
        }
        if (asText.includes('teacher_subjects_teacher_id_subject_id_class_level_key') || hasTeacherSubjectClassColumns) {
          return NextResponse.json({ error: 'Duplicate subject/class assignment was submitted.' }, { status: 409 });
        }
        // NOTE: check old 2-column constraint *after* 3-column match.
        // `teacher_id` + `subject_id` is also a subset of the new 3-column target.
        if (asText.includes('teacher_subjects_teacher_id_subject_id_key') || hasTeacherSubjectPairColumns) {
          return NextResponse.json(
            {
              error:
                'Database still has old teacher-subject constraint (single class per subject). Apply latest migrations, then retry.',
            },
            { status: 409 },
          );
        }
      }
      const debugTarget =
        error instanceof Prisma.PrismaClientKnownRequestError && Array.isArray(error.meta?.target)
          ? error.meta?.target.join(', ')
          : '';
      return NextResponse.json(
        {
          error: 'A unique record already exists (email, staff ID, or assignment).',
          ...(debugTarget ? { details: `Unique target: ${debugTarget}` } : {}),
        },
        { status: 409 },
      );
    }
    console.error('Teacher creation error:', error);
    return NextResponse.json({ error: 'Failed to create teacher account' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { isPrismaUniqueViolation } from '@/lib/prisma-errors';
import {
  generateTeacherPassword,
  isValidEmail,
  isValidPhoneNumber,
  type TeacherCreationData,
} from '@/lib/teacher-utils';
import { ensureSubjectByName, nextStaffSequence } from '@/lib/sequences';

export async function POST(request: NextRequest) {
  try {
    const data: TeacherCreationData = await request.json();

    if (!data.firstName || !data.lastName || !data.email || !data.phoneNumber || !data.classAssigned) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!isValidEmail(data.email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (!isValidPhoneNumber(data.phoneNumber)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    if (!data.subjectsAssigned || data.subjectsAssigned.length === 0) {
      return NextResponse.json({ error: 'At least one subject must be assigned' }, { status: 400 });
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

    const uniqueSubjects = [...new Set(data.subjectsAssigned.map((s) => s.trim()).filter(Boolean))];
    const subjectRecords = [];
    for (const name of uniqueSubjects) {
      subjectRecords.push(await ensureSubjectByName(name));
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
          homeroomClass: data.classAssigned.trim(),
          qualification: data.qualifications?.trim() || null,
          status: 'active',
        },
      });

      for (const subject of subjectRecords) {
        await tx.teacherSubject.create({
          data: { teacherId: t.id, subjectId: subject.id },
        });
      }

      return t;
    });

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
          classAssigned: data.classAssigned,
          subjectsAssigned: data.subjectsAssigned,
          createdAt: new Date(),
          requiresPasswordChange: true,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (isPrismaUniqueViolation(error)) {
      return NextResponse.json({ error: 'Email or staff ID already exists' }, { status: 409 });
    }
    console.error('Teacher creation error:', error);
    return NextResponse.json({ error: 'Failed to create teacher account' }, { status: 500 });
  }
}

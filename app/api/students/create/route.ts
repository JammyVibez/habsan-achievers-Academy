import { NextRequest, NextResponse } from 'next/server';
import { isPrismaUniqueViolation } from '@/lib/prisma-errors';
import { createStudentAccount } from '@/lib/student-service';
import type { StudentCreationData } from '@/lib/student-utils';

export async function POST(request: NextRequest) {
  try {
    const data: StudentCreationData = await request.json();

    if (!data.firstName || !data.lastName || !data.classAssigned) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, classAssigned' },
        { status: 400 },
      );
    }

    const account = await createStudentAccount(data);

    return NextResponse.json(
      {
        success: true,
        message: `Student ${data.firstName} ${data.lastName} created successfully`,
        student: {
          admissionNumber: account.admissionNumber,
          email: account.email,
          defaultPassword: account.defaultPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          classAssigned: data.classAssigned,
          createdAt: new Date(),
          requiresPasswordChange: true,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (isPrismaUniqueViolation(error)) {
      return NextResponse.json({ error: 'Email or admission number already exists' }, { status: 409 });
    }
    if (error instanceof Error && error.message === 'Invalid date of birth') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Student creation error:', error);
    return NextResponse.json({ error: 'Failed to create student account' }, { status: 500 });
  }
}

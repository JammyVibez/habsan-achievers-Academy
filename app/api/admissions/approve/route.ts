import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isPrismaUniqueViolation } from '@/lib/prisma-errors';
import { createStudentAccount } from '@/lib/student-service';
import type { StudentCreationData } from '@/lib/student-utils';
import { requireAdminFromRequest } from '@/lib/require-admin-api';

export async function POST(request: NextRequest) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const applicationId = body.applicationId as string | undefined;
    const applicationRef = body.applicationRef as string | undefined;
    const key = applicationRef ?? applicationId;

    if (!key) {
      return NextResponse.json(
        { error: 'applicationRef or applicationId is required' },
        { status: 400 },
      );
    }

    const app = await prisma.admissionApplication.findFirst({
      where: {
        OR: [{ id: key }, { applicationRef: key }],
        status: 'pending',
      },
    });

    if (!app) {
      return NextResponse.json({ error: 'Pending application not found' }, { status: 404 });
    }

    const phone = app.parentPhone?.trim();
    if (!phone) {
      return NextResponse.json(
        { error: 'Application is missing parent phone; add it before approving.' },
        { status: 400 },
      );
    }

    const studentPayload: StudentCreationData = {
      firstName: app.firstName,
      lastName: app.lastName,
      dateOfBirth: app.dateOfBirth.toISOString().slice(0, 10),
      classAssigned: app.classLevel,
      parentEmail: app.parentEmail,
      parentPhone: phone,
      address: (app.address ?? app.parentAddress ?? '').trim() || 'Not provided',
      medicalInfo: app.medicalConditions ?? undefined,
      gender: app.gender === 'Female' ? 'Female' : app.gender === 'Male' ? 'Male' : undefined,
      parentGuardianName: app.parentName ?? undefined,
    };

    const account = await createStudentAccount(studentPayload);

    await prisma.admissionApplication.update({
      where: { id: app.id },
      data: { status: 'approved' },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Application approved. Student account created successfully.',
        admissionNumber: account.admissionNumber,
        studentEmail: account.email,
        defaultPassword: account.defaultPassword,
        accountCreated: true,
      },
      { status: 200 },
    );
  } catch (error) {
    if (isPrismaUniqueViolation(error)) {
      return NextResponse.json(
        { error: 'Could not create student: email or admission number already exists.' },
        { status: 409 },
      );
    }
    if (error instanceof Error && error.message === 'Invalid date of birth') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Error approving admission:', error);
    return NextResponse.json({ error: 'Failed to approve application' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isPrismaUniqueViolation } from '@/lib/prisma-errors';

function fileMeta(file: File | null): { name: string; size: number; type: string } | null {
  if (!file || typeof file.name !== 'string') return null;
  return { name: file.name, size: file.size, type: file.type };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const pin = formData.get('pin') as string | null;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const gender = formData.get('gender') as string | null;
    const classLevel = formData.get('classLevel') as string;
    const previousSchool = formData.get('previousSchool') as string | null;
    const address = formData.get('address') as string | null;
    const parentName = formData.get('parentName') as string | null;
    const parentPhone = formData.get('parentPhone') as string | null;
    const parentEmail = formData.get('parentEmail') as string;
    const parentAddress = formData.get('parentAddress') as string | null;
    const emergencyContact = formData.get('emergencyContact') as string | null;
    const relationship = formData.get('relationship') as string | null;
    const bloodGroup = formData.get('bloodGroup') as string | null;
    const medicalConditions = formData.get('medicalConditions') as string | null;
    const allergies = formData.get('allergies') as string | null;

    const documents = {
      birthCertificate: formData.get('documents.birthCertificate') as File | null,
      schoolReportCard: formData.get('documents.schoolReportCard') as File | null,
      passportPhotos: formData.getAll('documents.passportPhotos') as File[],
      parentID: formData.get('documents.parentID') as File | null,
      proofOfResidence: formData.get('documents.proofOfResidence') as File | null,
      medicalCertificate: formData.get('documents.medicalCertificate') as File | null,
    };

    if (!firstName || !lastName || !dateOfBirth || !classLevel || !parentEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!documents.birthCertificate || !documents.parentID || !documents.proofOfResidence || !documents.medicalCertificate) {
      return NextResponse.json({ error: 'All required documents must be uploaded' }, { status: 400 });
    }

    const dob = new Date(dateOfBirth);
    if (Number.isNaN(dob.getTime())) {
      return NextResponse.json({ error: 'Invalid date of birth' }, { status: 400 });
    }

    const pinNormalized = pin?.trim().toUpperCase();
    if (!pinNormalized) {
      return NextResponse.json({ error: 'Admission PIN is required' }, { status: 400 });
    }

    const issuedPin = await prisma.issuedPin.findFirst({
      where: {
        pinCode: pinNormalized,
        pinType: 'admission',
        status: 'active',
        expiresAt: { gt: new Date() },
      },
    });

    if (!issuedPin) {
      return NextResponse.json(
        { error: 'Invalid or expired admission PIN. Purchase a valid PIN from the PIN Shop.' },
        { status: 400 },
      );
    }

    const applicationRef = `APP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const documentMeta = {
      birthCertificate: fileMeta(documents.birthCertificate),
      schoolReportCard: fileMeta(documents.schoolReportCard),
      passportPhotos: documents.passportPhotos.map((f) => fileMeta(f)).filter(Boolean),
      parentID: fileMeta(documents.parentID),
      proofOfResidence: fileMeta(documents.proofOfResidence),
      medicalCertificate: fileMeta(documents.medicalCertificate),
    };

    await prisma.$transaction(async (tx) => {
      await tx.admissionApplication.create({
        data: {
          applicationRef,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          dateOfBirth: dob,
          gender: gender?.trim() || null,
          classLevel: classLevel.trim(),
          previousSchool: previousSchool?.trim() || null,
          address: address?.trim() || null,
          parentName: parentName?.trim() || null,
          parentPhone: parentPhone?.trim() || null,
          parentEmail: parentEmail.trim().toLowerCase(),
          parentAddress: parentAddress?.trim() || null,
          emergencyContact: emergencyContact?.trim() || null,
          relationship: relationship?.trim() || null,
          bloodGroup: bloodGroup?.trim() || null,
          medicalConditions: medicalConditions?.trim() || null,
          allergies: allergies?.trim() || null,
          admissionPin: pinNormalized,
          status: 'pending',
          documentMeta,
        },
      });

      await tx.issuedPin.update({
        where: { id: issuedPin.id },
        data: { status: 'used', usedAt: new Date() },
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Application submitted successfully. You will receive a confirmation email shortly.',
        applicationRef,
        applicationStatus: 'pending',
        nextSteps: [
          'Wait for admin review of your application',
          'You will receive an email confirming admission status',
          'Upon approval, login credentials will be sent to your email',
        ],
      },
      { status: 201 },
    );
  } catch (error) {
    if (isPrismaUniqueViolation(error)) {
      return NextResponse.json({ error: 'Duplicate application reference; please try again.' }, { status: 409 });
    }
    console.error('Admission submission error:', error);
    return NextResponse.json({ error: 'Failed to submit admission application' }, { status: 500 });
  }
}

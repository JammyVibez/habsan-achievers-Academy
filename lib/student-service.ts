import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import {
  generateAdmissionNumber,
  generateDefaultPassword,
  generateStudentEmail,
  type StudentCreationData,
} from '@/lib/student-utils';
import { nextAdmissionSequence } from '@/lib/sequences';

export type CreatedStudentAccount = {
  admissionNumber: string;
  email: string;
  defaultPassword: string;
  userId: string;
  studentId: string;
};

export async function createStudentAccount(data: StudentCreationData): Promise<CreatedStudentAccount> {
  const year = new Date().getFullYear();
  const seq = await nextAdmissionSequence(year);
  const admissionNumber = generateAdmissionNumber(year, seq);
  const defaultPassword = generateDefaultPassword();
  const gender = data.gender === 'Female' ? 'Female' : 'Male';

  let email = generateStudentEmail(data.firstName, data.lastName, admissionNumber);
  for (let i = 0; i < 5; i++) {
    const taken = await prisma.user.findUnique({ where: { email } });
    if (!taken) break;
    email = `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}.${Math.random().toString(36).slice(2, 6)}@habsan.edu.ng`;
  }

  const passwordHash = await hashPassword(defaultPassword);
  const parentName = (data.parentGuardianName ?? 'Parent / Guardian').trim() || 'Parent / Guardian';
  const dob = new Date(data.dateOfBirth);
  if (Number.isNaN(dob.getTime())) {
    throw new Error('Invalid date of birth');
  }

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        role: 'student',
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.parentPhone?.trim() || null,
        passwordMustChange: true,
      },
    });

    const student = await tx.student.create({
      data: {
        userId: user.id,
        admissionNumber,
        classLevel: data.classAssigned.trim(),
        dateOfBirth: dob,
        gender,
        address: data.address?.trim() || null,
        parentGuardianName: parentName,
        parentGuardianPhone: data.parentPhone.trim(),
        parentGuardianEmail: data.parentEmail?.trim() || null,
        medicalConditions: data.medicalInfo?.trim() || null,
        admissionDate: new Date(),
        status: 'active',
      },
    });

    return { user, student };
  });

  return {
    admissionNumber,
    email,
    defaultPassword,
    userId: result.user.id,
    studentId: result.student.id,
  };
}

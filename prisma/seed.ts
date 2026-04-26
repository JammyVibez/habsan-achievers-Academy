import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generatePINCode } from '../lib/pin-generator';
import { AVAILABLE_SUBJECTS } from '../lib/teacher-utils';
import { scoreToComment, scoreToGrade } from '../lib/grades';

const prisma = new PrismaClient();

function subjectCode(name: string, index: number): string {
  const slug = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 12);
  return `${slug || 'SUB'}-${index}`;
}

async function main() {
  await prisma.galleryItem.deleteMany();
  await prisma.siteContentBlock.deleteMany();
  await prisma.admissionApplication.deleteMany();
  await prisma.result.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.teacherSubject.deleteMany();
  await prisma.issuedPin.deleteMany();
  await prisma.pinOrder.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.user.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.term.deleteMany();
  await prisma.academicSession.deleteMany();

  const adminHash = await bcrypt.hash('Admin@123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@habsan.edu.ng',
      passwordHash: adminHash,
      role: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+2348000000001',
      passwordMustChange: false,
    },
  });

  const session = await prisma.academicSession.create({
    data: {
      sessionName: '2024/2025',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-07-31'),
      isCurrent: true,
    },
  });

  const term = await prisma.term.create({
    data: {
      sessionId: session.id,
      termName: 'First Term',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-20'),
      isCurrent: true,
    },
  });

  const subjects = await Promise.all(
    AVAILABLE_SUBJECTS.map((name, i) =>
      prisma.subject.create({
        data: {
          name,
          code: subjectCode(name, i),
          isActive: true,
        },
      }),
    ),
  );

  const teacherPass = await bcrypt.hash('Teach@1234', 10);
  const teacherUser = await prisma.user.create({
    data: {
      email: 'teacher@habsan.edu.ng',
      passwordHash: teacherPass,
      role: 'teacher',
      firstName: 'Amina',
      lastName: 'Bello',
      phone: '+2348000000002',
      passwordMustChange: false,
    },
  });

  const teacher = await prisma.teacher.create({
    data: {
      userId: teacherUser.id,
      staffId: 'TCH/2024/001',
      dateOfJoining: new Date('2024-09-01'),
      homeroomClass: 'JSS 1A',
      qualification: 'B.Ed',
      status: 'active',
    },
  });

  const pick = subjects.filter((s) =>
    ['English Language', 'Mathematics', 'Science', 'History', 'Geography'].includes(s.name),
  );
  await prisma.teacherSubject.createMany({
    data: pick.map((s) => ({ teacherId: teacher.id, subjectId: s.id })),
  });

  const studentPass = await bcrypt.hash('Student@12', 10);
  const studentUser = await prisma.user.create({
    data: {
      email: 'john.doe@habsan.edu.ng',
      passwordHash: studentPass,
      role: 'student',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+2348000000003',
      passwordMustChange: true,
    },
  });

  const student = await prisma.student.create({
    data: {
      userId: studentUser.id,
      admissionNumber: 'HAA/2024/001',
      classLevel: 'JSS 1A',
      dateOfBirth: new Date('2012-05-15'),
      gender: 'Male',
      address: 'Abuja',
      parentGuardianName: 'Jane Doe',
      parentGuardianPhone: '+2348000000999',
      parentGuardianEmail: 'parent@example.com',
      admissionDate: new Date('2024-09-10'),
      status: 'active',
    },
  });

  const demoScores: Record<string, number> = {
    'English Language': 78,
    Mathematics: 85,
    Science: 72,
    History: 68,
    Geography: 75,
  };

  for (const sub of pick) {
    const score = demoScores[sub.name];
    if (score === undefined) continue;
    const grade = scoreToGrade(score);
    await prisma.result.create({
      data: {
        studentId: student.id,
        subjectId: sub.id,
        sessionId: session.id,
        termId: term.id,
        ca1: 0,
        ca2: 0,
        exam: score,
        total: score,
        grade,
        remark: scoreToComment(grade),
        teacherId: teacher.id,
      },
    });
  }

  const far = new Date();
  far.setFullYear(far.getFullYear() + 1);

  const demoAdmissionPin = generatePINCode('admission').toUpperCase();
  const demoResultPin = generatePINCode('result').toUpperCase();
  await prisma.issuedPin.createMany({
    data: [
      {
        pinCode: demoAdmissionPin,
        pinType: 'admission',
        status: 'active',
        expiresAt: far,
        studentEmail: 'shopper@example.com',
      },
      {
        pinCode: demoResultPin,
        pinType: 'result',
        status: 'active',
        expiresAt: far,
        studentEmail: 'shopper@example.com',
      },
    ],
  });

  await prisma.galleryItem.createMany({
    data: [
      {
        type: 'image',
        mediaUrl: '/nigerian-students-in-classroom-learning.jpg',
        title: 'Students in classroom',
        category: 'classroom',
        sortOrder: 0,
      },
      {
        type: 'image',
        mediaUrl: '/school-sports-day-children-running.jpg',
        title: 'Sports day activities',
        category: 'sports',
        sortOrder: 1,
      },
      {
        type: 'image',
        mediaUrl: '/school-science-laboratory-students-experimenting.jpg',
        title: 'Science laboratory',
        category: 'facilities',
        sortOrder: 2,
      },
      {
        type: 'image',
        mediaUrl: '/school-cultural-day-celebration-nigeria.jpg',
        title: 'Cultural day celebration',
        category: 'events',
        sortOrder: 3,
      },
      {
        type: 'image',
        mediaUrl: '/graduation-ceremony-students-in-caps-and-gowns.jpg',
        title: 'Graduation ceremony',
        category: 'graduation',
        sortOrder: 4,
      },
      {
        type: 'image',
        mediaUrl: '/computer-lab-students-learning-technology.jpg',
        title: 'Computer laboratory',
        category: 'facilities',
        sortOrder: 5,
      },
    ],
  });

  // eslint-disable-next-line no-console -- seed script
  console.log('Seed complete. Admin: admin@habsan.edu.ng / Admin@123');
  // eslint-disable-next-line no-console -- seed script
  console.log('Teacher: teacher@habsan.edu.ng / Teach@1234');
  // eslint-disable-next-line no-console -- seed script
  console.log('Student: john.doe@habsan.edu.ng / Student@12 — admission HAA/2024/001');
  console.log('Demo admission PIN:', demoAdmissionPin);
  console.log('Demo result PIN (check results / student dashboard):', demoResultPin);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console -- seed script
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

import { prisma } from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import { decimalToNumber } from '@/lib/grades';

function monthStart(d = new Date()) {
  const t = new Date(d);
  t.setDate(1);
  t.setHours(0, 0, 0, 0);
  return t;
}

export async function getAdminDashboardSnapshot() {
  const start = monthStart();

  const [
    studentCount,
    teacherCount,
    subjectCount,
    paidPinsAgg,
    newStudentsThisMonth,
    newTeachersThisMonth,
    recentApps,
    recentUsers,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.subject.count({ where: { isActive: true } }),
    prisma.pinOrder.aggregate({
      where: {
        paymentStatus: 'paid',
        createdAt: { gte: start },
      },
      _sum: { amount: true },
    }),
    prisma.student.count({ where: { createdAt: { gte: start } } }),
    prisma.teacher.count({ where: { createdAt: { gte: start } } }),
    prisma.admissionApplication.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        applicationRef: true,
        firstName: true,
        lastName: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.user.findMany({
      where: { role: { not: 'guest' } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    }),
  ]);

  const revenueNgn = decimalToNumber(paidPinsAgg._sum.amount ?? 0);

  type ActivityRow = { action: string; time: string; type: string; at: number };
  const activityRows: ActivityRow[] = [];

  for (const a of recentApps) {
    activityRows.push({
      action: `Application ${a.applicationRef}: ${a.firstName} ${a.lastName} (${a.status})`,
      time: formatDistanceToNow(a.createdAt, { addSuffix: true }),
      type: 'admission',
      at: a.createdAt.getTime(),
    });
  }
  for (const u of recentUsers) {
    activityRows.push({
      action: `User: ${u.firstName} ${u.lastName} · ${u.email} (${u.role})`,
      time: formatDistanceToNow(u.createdAt, { addSuffix: true }),
      type: 'user',
      at: u.createdAt.getTime(),
    });
  }

  activityRows.sort((a, b) => b.at - a.at);
  const activities = activityRows.slice(0, 8).map(({ at: _at, ...rest }) => rest);

  return {
    studentCount,
    teacherCount,
    subjectCount,
    revenueThisMonth: revenueNgn,
    newStudentsThisMonth,
    newTeachersThisMonth,
    activities,
  };
}

export async function getAdminUsersPageData() {
  const start = monthStart();

  const [users, totalUsers, activeUsers, newThisMonth, inactiveUsers] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 150,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    }),
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { createdAt: { gte: start } } }),
    prisma.user.count({ where: { isActive: false } }),
  ]);

  return {
    users,
    totalUsers,
    activeUsers,
    newThisMonth,
    inactiveUsers,
  };
}

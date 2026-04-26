import { prisma } from '@/lib/prisma';

/** UTC midnight for consistent daily admin quotas. */
export function startOfUtcDay(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

export const ADMIN_PINS_DAILY_LIMIT_PER_TYPE = 30;

export async function countAdminPinsCreatedToday(pinType: 'admission' | 'result'): Promise<number> {
  return prisma.issuedPin.count({
    where: {
      pinOrderId: null,
      pinType,
      createdAt: { gte: startOfUtcDay() },
    },
  });
}

export type PinListRow = {
  id: string;
  pinCode: string;
  pinType: 'admission' | 'result';
  status: string;
  effectiveStatus: 'active' | 'used' | 'expired';
  expiresAt: string;
  createdAt: string;
  usedAt: string | null;
  studentEmail: string | null;
  source: 'admin' | 'shop';
};

function effectiveStatus(
  status: 'active' | 'used' | 'expired',
  expiresAt: Date,
): 'active' | 'used' | 'expired' {
  if (status === 'used') return 'used';
  if (status === 'expired') return 'expired';
  if (expiresAt.getTime() <= Date.now()) return 'expired';
  return 'active';
}

export async function listIssuedPins(params: {
  pinType: 'admission' | 'result';
  search?: string;
  limit: number;
  offset: number;
}): Promise<{ pins: PinListRow[]; total: number }> {
  const { pinType, search, limit, offset } = params;
  const norm = search?.trim().toUpperCase();

  const where = {
    pinType,
    ...(norm
      ? {
          pinCode: {
            contains: norm,
            mode: 'insensitive' as const,
          },
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.issuedPin.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        pinCode: true,
        pinType: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        usedAt: true,
        studentEmail: true,
        pinOrderId: true,
      },
    }),
    prisma.issuedPin.count({ where }),
  ]);

  const pins: PinListRow[] = rows.map((r) => ({
    id: r.id,
    pinCode: r.pinCode,
    pinType: r.pinType,
    status: r.status,
    effectiveStatus: effectiveStatus(r.status, r.expiresAt),
    expiresAt: r.expiresAt.toISOString(),
    createdAt: r.createdAt.toISOString(),
    usedAt: r.usedAt?.toISOString() ?? null,
    studentEmail: r.studentEmail,
    source: r.pinOrderId ? 'shop' : 'admin',
  }));

  return { pins, total };
}

export async function getAdminPinDashboardStats() {
  const now = new Date();
  const dayStart = startOfUtcDay();

  const [total, usedCount, expiredStatusCount, activeUsable, activeButPastExpiry] = await Promise.all([
    prisma.issuedPin.count(),
    prisma.issuedPin.count({ where: { status: 'used' } }),
    prisma.issuedPin.count({ where: { status: 'expired' } }),
    prisma.issuedPin.count({
      where: { status: 'active', expiresAt: { gt: now } },
    }),
    prisma.issuedPin.count({
      where: { status: 'active', expiresAt: { lte: now } },
    }),
  ]);

  const expiredTotal = expiredStatusCount + activeButPastExpiry;

  const [todayAdmission, todayResult, admissionTotal, resultTotal] = await Promise.all([
    countAdminPinsCreatedToday('admission'),
    countAdminPinsCreatedToday('result'),
    prisma.issuedPin.count({ where: { pinType: 'admission' } }),
    prisma.issuedPin.count({ where: { pinType: 'result' } }),
  ]);

  return {
    total,
    activeUsable,
    used: usedCount,
    expired: expiredTotal,
    byType: {
      admission: admissionTotal,
      result: resultTotal,
    },
    todayAdminGenerated: {
      admission: todayAdmission,
      result: todayResult,
    },
    dailyLimitPerType: ADMIN_PINS_DAILY_LIMIT_PER_TYPE,
    remainingToday: {
      admission: Math.max(0, ADMIN_PINS_DAILY_LIMIT_PER_TYPE - todayAdmission),
      result: Math.max(0, ADMIN_PINS_DAILY_LIMIT_PER_TYPE - todayResult),
    },
    serverTime: now.toISOString(),
  };
}

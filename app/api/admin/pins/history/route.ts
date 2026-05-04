import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdminFromRequest } from '@/lib/require-admin-api';

export const dynamic = 'force-dynamic';

/** Groups admin-issued PINs (no shop order) by minute + type for the History tab. */
export async function GET(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  const limit = Math.min(50, Math.max(1, parseInt(new URL(request.url).searchParams.get('limit') || '25', 10) || 25));

  try {
    const rows = await prisma.$queryRaw<
      Array<{
        bucket: Date;
        pin_type: string;
        cnt: bigint;
      }>
    >(Prisma.sql`
      SELECT date_trunc('minute', created_at) AS bucket,
             pin_type::text AS pin_type,
             COUNT(*)::bigint AS cnt
      FROM issued_pins
      WHERE pin_order_id IS NULL
      GROUP BY 1, 2
      ORDER BY 1 DESC
      LIMIT ${limit}
    `);

    const batches = rows.map((r) => ({
      at: r.bucket.toISOString(),
      pinType: r.pin_type === 'result' ? 'result' : 'admission',
      count: Number(r.cnt),
    }));

    return NextResponse.json({ batches });
  } catch (e) {
    console.error('Admin pins history error:', e);
    return NextResponse.json({ error: 'Failed to load generation history' }, { status: 500 });
  }
}

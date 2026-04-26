import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/require-admin-api';
import { getAdminPinDashboardStats } from '@/lib/admin-pins';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  try {
    const stats = await getAdminPinDashboardStats();
    return NextResponse.json(stats);
  } catch (e) {
    console.error('Admin pins stats error:', e);
    return NextResponse.json({ error: 'Failed to load PIN statistics' }, { status: 500 });
  }
}

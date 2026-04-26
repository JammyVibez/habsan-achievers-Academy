import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/require-admin-api';
import { listIssuedPins } from '@/lib/admin-pins';

export const dynamic = 'force-dynamic';

const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  const { searchParams } = new URL(request.url);
  const pinType = searchParams.get('type') === 'result' ? 'result' : 'admission';
  const search = searchParams.get('search') ?? undefined;
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') || '50', 10) || 50));
  const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10) || 0);

  try {
    const { pins, total } = await listIssuedPins({ pinType, search, limit, offset });
    return NextResponse.json({ pins, total, limit, offset });
  } catch (e) {
    console.error('Admin pins list error:', e);
    return NextResponse.json({ error: 'Failed to load PINs' }, { status: 500 });
  }
}

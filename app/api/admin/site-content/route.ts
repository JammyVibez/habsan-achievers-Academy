import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdminFromRequest } from '@/lib/require-admin-api';
import { SITE_CONTENT_KEYS, type SiteContentKey } from '@/lib/site-content-keys';

export const dynamic = 'force-dynamic';

const allowedKeys = new Set<string>(Object.values(SITE_CONTENT_KEYS));

export async function PUT(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  let body: { key?: string; payload?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const key = String(body.key ?? '').trim() as SiteContentKey;
  if (!allowedKeys.has(key)) {
    return NextResponse.json({ error: 'Invalid content key' }, { status: 400 });
  }
  if (body.payload === undefined || body.payload === null || typeof body.payload !== 'object' || Array.isArray(body.payload)) {
    return NextResponse.json({ error: 'payload must be a JSON object' }, { status: 400 });
  }

  await prisma.siteContentBlock.upsert({
    where: { key },
    create: { key, payload: body.payload as object },
    update: { payload: body.payload as object },
  });

  revalidatePath('/');
  revalidatePath('/about');
  revalidatePath('/gallery');

  return NextResponse.json({ success: true });
}

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdminFromRequest } from '@/lib/require-admin-api';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, ctx: { params: { id: string } }) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  const { id } = ctx.params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const existing = await prisma.galleryItem.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const data: {
    type?: string;
    mediaUrl?: string;
    thumbnailUrl?: string | null;
    title?: string;
    caption?: string | null;
    category?: string;
    sortOrder?: number;
    isActive?: boolean;
  } = {};

  if (typeof body.type === 'string') {
    const t = body.type.toLowerCase();
    if (t !== 'image' && t !== 'video') return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    data.type = t;
  }
  if (typeof body.mediaUrl === 'string') data.mediaUrl = body.mediaUrl.trim();
  if (body.thumbnailUrl === null || typeof body.thumbnailUrl === 'string') {
    data.thumbnailUrl = body.thumbnailUrl === null ? null : String(body.thumbnailUrl).trim() || null;
  }
  if (typeof body.title === 'string') data.title = body.title.trim();
  if (body.caption === null || typeof body.caption === 'string') {
    data.caption = body.caption === null ? null : String(body.caption).trim() || null;
  }
  if (typeof body.category === 'string') data.category = body.category.trim().toLowerCase();
  if (typeof body.sortOrder === 'number') data.sortOrder = body.sortOrder;
  if (typeof body.isActive === 'boolean') data.isActive = body.isActive;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const item = await prisma.galleryItem.update({
    where: { id },
    data,
  });

  revalidatePath('/gallery');
  return NextResponse.json({ item });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  const { id } = params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    await prisma.galleryItem.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  revalidatePath('/gallery');
  return NextResponse.json({ success: true });
}

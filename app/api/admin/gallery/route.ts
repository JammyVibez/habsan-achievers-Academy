import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdminFromRequest } from '@/lib/require-admin-api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  const items = await prisma.galleryItem.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  let body: {
    type?: string;
    mediaUrl?: string;
    thumbnailUrl?: string | null;
    title?: string;
    caption?: string | null;
    category?: string;
    sortOrder?: number;
    isActive?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const type = String(body.type ?? 'image').toLowerCase();
  if (type !== 'image' && type !== 'video') {
    return NextResponse.json({ error: 'type must be image or video' }, { status: 400 });
  }
  const mediaUrl = String(body.mediaUrl ?? '').trim();
  if (!mediaUrl) {
    return NextResponse.json({ error: 'mediaUrl is required' }, { status: 400 });
  }
  const title = String(body.title ?? '').trim() || 'Untitled';

  const item = await prisma.galleryItem.create({
    data: {
      type,
      mediaUrl,
      thumbnailUrl: body.thumbnailUrl?.trim() || null,
      title,
      caption: body.caption?.trim() || null,
      category: (body.category?.trim() || 'events').toLowerCase(),
      sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : 0,
      isActive: body.isActive !== false,
    },
  });

  revalidatePath('/gallery');
  return NextResponse.json({ item }, { status: 201 });
}

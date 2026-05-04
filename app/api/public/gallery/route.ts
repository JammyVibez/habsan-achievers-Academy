import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get('category')?.trim() || 'all';
    const items = await prisma.galleryItem.findMany({
      where: {
        isActive: true,
        ...(category !== 'all' ? { category } : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ items });
  } catch (e) {
    console.error('public gallery', e);
    return NextResponse.json({ error: 'Gallery unavailable' }, { status: 503 });
  }
}

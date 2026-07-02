import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdminFromRequest } from '@/lib/require-admin-api';
import type { NoticeAudience, NoticePriority } from '@prisma/client';

export const dynamic = 'force-dynamic';

const AUDIENCES: NoticeAudience[] = ['all', 'students', 'teachers', 'parents'];
const PRIORITIES: NoticePriority[] = ['low', 'medium', 'high', 'urgent'];

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  const { id } = await context.params;
  const existing = await prisma.notice.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Notice not found' }, { status: 404 });

  let body: {
    title?: string;
    content?: string;
    targetAudience?: string;
    targetClass?: string | null;
    priority?: string;
    isPublished?: boolean;
    expiresAt?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const data: {
    title?: string;
    content?: string;
    targetAudience?: NoticeAudience;
    targetClass?: string | null;
    priority?: NoticePriority;
    isPublished?: boolean;
    publishedAt?: Date | null;
    expiresAt?: Date | null;
  } = {};

  if (body.title !== undefined) {
    const title = String(body.title).trim();
    if (!title) return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
    data.title = title;
  }

  if (body.content !== undefined) {
    const content = String(body.content).trim();
    if (!content) return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 });
    data.content = content;
  }

  if (body.targetAudience !== undefined) {
    const audience = String(body.targetAudience).trim() as NoticeAudience;
    if (!AUDIENCES.includes(audience)) {
      return NextResponse.json({ error: 'Invalid target audience' }, { status: 400 });
    }
    data.targetAudience = audience;
  }

  if (body.priority !== undefined) {
    const priority = String(body.priority).trim() as NoticePriority;
    if (!PRIORITIES.includes(priority)) {
      return NextResponse.json({ error: 'Invalid priority' }, { status: 400 });
    }
    data.priority = priority;
  }

  if (body.targetClass !== undefined) {
    data.targetClass = body.targetClass?.trim() || null;
  }

  if (body.expiresAt !== undefined) {
    if (body.expiresAt === null || body.expiresAt === '') {
      data.expiresAt = null;
    } else {
      const parsed = new Date(body.expiresAt);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json({ error: 'Invalid expiry date' }, { status: 400 });
      }
      data.expiresAt = parsed;
    }
  }

  if (body.isPublished !== undefined) {
    const nextPublished = body.isPublished === true;
    data.isPublished = nextPublished;
    if (nextPublished && !existing.isPublished) {
      data.publishedAt = new Date();
    }
    if (!nextPublished) {
      data.publishedAt = null;
    }
  }

  const notice = await prisma.notice.update({
    where: { id },
    data,
    include: { createdBy: { select: { firstName: true, lastName: true } } },
  });

  revalidatePath('/noticeboard');
  revalidatePath('/');

  return NextResponse.json({
    notice: {
      id: notice.id,
      title: notice.title,
      content: notice.content,
      targetAudience: notice.targetAudience,
      targetClass: notice.targetClass,
      priority: notice.priority,
      isPublished: notice.isPublished,
      publishedAt: notice.publishedAt?.toISOString() ?? null,
      expiresAt: notice.expiresAt?.toISOString() ?? null,
      createdAt: notice.createdAt.toISOString(),
      updatedAt: notice.updatedAt.toISOString(),
      authorName: `${notice.createdBy.firstName} ${notice.createdBy.lastName}`.trim(),
    },
  });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  const { id } = await context.params;
  const existing = await prisma.notice.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Notice not found' }, { status: 404 });

  await prisma.notice.delete({ where: { id } });

  revalidatePath('/noticeboard');
  revalidatePath('/');

  return NextResponse.json({ success: true });
}

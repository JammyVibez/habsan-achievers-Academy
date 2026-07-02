import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdminFromRequest } from '@/lib/require-admin-api';
import { listAllNotices } from '@/lib/notices';
import type { NoticeAudience, NoticePriority } from '@prisma/client';

export const dynamic = 'force-dynamic';

const AUDIENCES: NoticeAudience[] = ['all', 'students', 'teachers', 'parents'];
const PRIORITIES: NoticePriority[] = ['low', 'medium', 'high', 'urgent'];

function parseAudience(value: unknown): NoticeAudience | null {
  const v = String(value ?? '').trim() as NoticeAudience;
  return AUDIENCES.includes(v) ? v : null;
}

function parsePriority(value: unknown): NoticePriority | null {
  const v = String(value ?? '').trim() as NoticePriority;
  return PRIORITIES.includes(v) ? v : null;
}

export async function GET(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  const notices = await listAllNotices();
  return NextResponse.json({ notices });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

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

  const title = String(body.title ?? '').trim();
  const content = String(body.content ?? '').trim();
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

  const targetAudience = parseAudience(body.targetAudience) ?? 'all';
  const priority = parsePriority(body.priority) ?? 'medium';
  const isPublished = body.isPublished === true;

  let expiresAt: Date | null = null;
  if (body.expiresAt) {
    const parsed = new Date(body.expiresAt);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ error: 'Invalid expiry date' }, { status: 400 });
    }
    expiresAt = parsed;
  }

  const notice = await prisma.notice.create({
    data: {
      title,
      content,
      targetAudience,
      targetClass: body.targetClass?.trim() || null,
      priority,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      expiresAt,
      createdById: admin.userId,
    },
    include: { createdBy: { select: { firstName: true, lastName: true } } },
  });

  revalidatePath('/noticeboard');
  revalidatePath('/');

  return NextResponse.json(
    {
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
    },
    { status: 201 },
  );
}

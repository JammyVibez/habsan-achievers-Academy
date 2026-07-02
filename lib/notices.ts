import { prisma } from '@/lib/prisma';
import type { NoticeAudience, NoticePriority } from '@prisma/client';

export type NoticeRow = {
  id: string;
  title: string;
  content: string;
  targetAudience: NoticeAudience;
  targetClass: string | null;
  priority: NoticePriority;
  isPublished: boolean;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  authorName: string;
};

function serializeNotice(notice: {
  id: string;
  title: string;
  content: string;
  targetAudience: NoticeAudience;
  targetClass: string | null;
  priority: NoticePriority;
  isPublished: boolean;
  publishedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: { firstName: string; lastName: string };
}): NoticeRow {
  return {
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
    authorName: `${notice.createdBy.firstName} ${notice.createdBy.lastName}`.trim() || 'Admin',
  };
}

const authorSelect = { createdBy: { select: { firstName: true, lastName: true } } } as const;

export async function listAllNotices(): Promise<NoticeRow[]> {
  const rows = await prisma.notice.findMany({
    orderBy: [{ createdAt: 'desc' }],
    include: authorSelect,
  });
  return rows.map(serializeNotice);
}

export async function listPublishedNotices(limit?: number): Promise<NoticeRow[]> {
  const now = new Date();
  const rows = await prisma.notice.findMany({
    where: {
      isPublished: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: limit,
    include: authorSelect,
  });
  return rows.map(serializeNotice);
}

export async function getNoticeById(id: string) {
  const row = await prisma.notice.findUnique({
    where: { id },
    include: authorSelect,
  });
  return row ? serializeNotice(row) : null;
}

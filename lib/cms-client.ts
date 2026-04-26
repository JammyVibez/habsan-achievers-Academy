'use client';

import { SITE_CONTENT_KEYS } from '@/lib/site-content-keys';
import type { PublicSiteContent } from '@/lib/site-content-defaults';

export async function fetchPublicSiteContent(): Promise<PublicSiteContent> {
  const res = await fetch('/api/public/site-content', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load site content');
  return res.json() as Promise<PublicSiteContent>;
}

export async function saveSiteContentBlock(key: string, payload: object): Promise<void> {
  const res = await fetch('/api/admin/site-content', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ key, payload }),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || 'Save failed');
}

export { SITE_CONTENT_KEYS };

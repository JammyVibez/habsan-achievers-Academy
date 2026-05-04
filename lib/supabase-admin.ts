import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Service-role client for server-side Storage (and other admin APIs). Never import in client components.
 * Uses `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` plus `SUPABASE_SERVICE_ROLE_KEY`.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getStorageBucketName(): string {
  return process.env.SUPABASE_STORAGE_BUCKET?.trim() || 'media';
}

function isBucketAlreadyExistsError(message: string, status?: number, statusCode?: string): boolean {
  if (status === 409 || statusCode === '409') return true;
  const m = message.toLowerCase();
  return (
    m.includes('already exists') ||
    m.includes('resource already exists') ||
    m.includes('duplicate') ||
    m.includes('name is already taken')
  );
}

/**
 * Creates the bucket if missing (service role). Public read so `getPublicUrl` works for the site gallery.
 * Safe if another request created it first (treats conflict as success).
 */
export async function ensureStorageBucket(
  client: SupabaseClient,
  bucket: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await client.storage.createBucket(bucket, {
    public: true,
  });
  if (!error) return { ok: true };

  const msg = error.message || 'Unknown storage error';
  if (isBucketAlreadyExistsError(msg, error.status, error.statusCode)) {
    return { ok: true };
  }
  return { ok: false, message: msg };
}

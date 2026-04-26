/** Allowed types and size limits for admin uploads (see `POST /api/admin/upload` → Supabase Storage). */
export const MAX_IMAGE_BYTES = 12 * 1024 * 1024; // 12 MB
export const MAX_VIDEO_BYTES = 80 * 1024 * 1024; // 80 MB

export const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
};

export function extensionForMime(mime: string): string | null {
  return MIME_TO_EXT[mime] ?? null;
}

export function maxBytesForMime(mime: string): number {
  if (ALLOWED_VIDEO_TYPES.has(mime)) return MAX_VIDEO_BYTES;
  return MAX_IMAGE_BYTES;
}

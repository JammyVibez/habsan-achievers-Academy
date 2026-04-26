import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { requireAdminFromRequest } from '@/lib/require-admin-api';
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  extensionForMime,
  maxBytesForMime,
} from '@/lib/upload-config';
import { ensureStorageBucket, getStorageBucketName, getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      {
        error:
          'Supabase Storage is not configured. Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY, and create a public bucket (see .env.example).',
      },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'Missing file field' }, { status: 400 });
  }

  const mime = (file.type || '').toLowerCase().split(';')[0].trim();
  const allowed = ALLOWED_IMAGE_TYPES.has(mime) || ALLOWED_VIDEO_TYPES.has(mime);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Unsupported file type. Use JPEG, PNG, WebP, GIF, MP4, WebM, or MOV.' },
      { status: 400 },
    );
  }

  const maxBytes = maxBytesForMime(mime);
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: `File too large (max ${Math.round(maxBytes / (1024 * 1024))} MB for this type)` },
      { status: 400 },
    );
  }

  const ext = extensionForMime(mime);
  if (!ext) {
    return NextResponse.json({ error: 'Could not determine file extension' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const bucket = getStorageBucketName();
  const objectPath = `cms/${randomUUID()}${ext}`;

  const uploadOpts = {
    contentType: mime,
    upsert: false,
    cacheControl: '3600',
  } as const;

  let { error: uploadError } = await supabase.storage.from(bucket).upload(objectPath, buffer, uploadOpts);

  if (uploadError) {
    const msg = uploadError.message || '';
    const isBucketMissing =
      /bucket not found/i.test(msg) || (uploadError as { statusCode?: string }).statusCode === '404';

    if (isBucketMissing) {
      const ensured = await ensureStorageBucket(supabase, bucket);
      if (!ensured.ok) {
        console.error('Supabase create bucket failed:', ensured.message);
        return NextResponse.json(
          {
            error: `Could not create storage bucket "${bucket}": ${ensured.message}. Check the service role key and Storage permissions in Supabase.`,
            bucket,
          },
          { status: 502 },
        );
      }
      const retry = await supabase.storage.from(bucket).upload(objectPath, buffer, uploadOpts);
      uploadError = retry.error;
    }
  }

  if (uploadError) {
    console.error('Supabase upload error:', uploadError);
    return NextResponse.json(
      {
        error: uploadError.message || 'Upload to storage failed. Check bucket policies and file path.',
        bucket,
      },
      { status: 502 },
    );
  }

  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  const url = publicData.publicUrl;

  return NextResponse.json({ url, mime, size: file.size, bucket, path: objectPath });
}

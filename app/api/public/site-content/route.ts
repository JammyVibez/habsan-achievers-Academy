import { NextResponse } from 'next/server';
import { fetchMergedPublicSiteContent } from '@/lib/site-content-merge';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const content = await fetchMergedPublicSiteContent();
    return NextResponse.json(content);
  } catch (e) {
    console.error('public site-content', e);
    return NextResponse.json({ error: 'Site content unavailable' }, { status: 503 });
  }
}

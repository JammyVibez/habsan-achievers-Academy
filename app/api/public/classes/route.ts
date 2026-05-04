import { NextResponse } from 'next/server';
import { getClassCatalog } from '@/lib/class-catalog';

export const dynamic = 'force-dynamic';

export async function GET() {
  const classes = await getClassCatalog();
  return NextResponse.json({ classes });
}


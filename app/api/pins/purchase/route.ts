import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const DISABLED_MESSAGE =
  'PIN shop is currently disabled. Please obtain a valid PIN directly from the school administration office.';

export async function POST(_request: NextRequest) {
  return NextResponse.json({ error: DISABLED_MESSAGE }, { status: 410 });
}

export async function PUT(_request: NextRequest) {
  return NextResponse.json({ error: DISABLED_MESSAGE }, { status: 410 });
}

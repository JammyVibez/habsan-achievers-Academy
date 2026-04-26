import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminFromRequest } from '@/lib/require-admin-api';
import { calculateExpiryDate, generatePINCode } from '@/lib/pin-generator';

export const dynamic = 'force-dynamic';

const MAX_BATCH = 30;

async function createUniquePin(pinType: 'admission' | 'result', expiresAt: Date): Promise<string> {
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const code = generatePINCode(pinType).toUpperCase();
    try {
      await prisma.issuedPin.create({
        data: {
          pinCode: code,
          pinType,
          status: 'active',
          expiresAt,
          studentEmail: null,
          pinOrderId: null,
        },
      });
      return code;
    } catch {
      // unique collision — retry
    }
  }
  throw new Error('Could not allocate a unique PIN after several attempts');
}

export async function POST(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  let body: { pinType?: string; quantity?: number; expiryDays?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const pinType = body.pinType === 'result' ? 'result' : 'admission';
  const quantity = Math.min(MAX_BATCH, Math.max(1, Math.floor(Number(body.quantity) || 0)));
  const expiryDays = Math.min(365, Math.max(1, Math.floor(Number(body.expiryDays) || 90)));
  const expiresAt = calculateExpiryDate(expiryDays);

  const pins: string[] = [];
  try {
    for (let i = 0; i < quantity; i += 1) {
      pins.push(await createUniquePin(pinType, expiresAt));
    }
  } catch (e) {
    console.error('PIN generation error:', e);
    return NextResponse.json({ error: 'Failed to generate unique PINs' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    pinType,
    quantity: pins.length,
    expiryDays,
    expiresAt: expiresAt.toISOString(),
    pins,
  });
}

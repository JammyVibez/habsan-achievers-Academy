import { type NextRequest, NextResponse } from 'next/server';
import { validatePINFormat, getPINType } from '@/lib/pin-generator';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { pin, pinType, studentEmail } = await request.json();

    if (!pin) {
      return NextResponse.json({ error: 'PIN code is required' }, { status: 400 });
    }

    const normalized = String(pin).trim().toUpperCase();

    if (!validatePINFormat(normalized)) {
      return NextResponse.json(
        { error: 'Invalid PIN format. Expected: XXXX-XXXX-XXXX' },
        { status: 400 },
      );
    }

    const row = await prisma.issuedPin.findFirst({
      where: {
        pinCode: normalized,
        status: 'active',
        expiresAt: { gt: new Date() },
      },
    });

    if (!row) {
      return NextResponse.json(
        {
          error: 'PIN not found, expired, or already used. Purchase a new PIN from the PIN Shop.',
          pinShopUrl: '/pin-shop',
        },
        { status: 404 },
      );
    }

    if (studentEmail && row.studentEmail && row.studentEmail.toLowerCase() !== String(studentEmail).toLowerCase()) {
      return NextResponse.json({ error: 'This PIN is registered to a different email address.' }, { status: 403 });
    }

    const inferredType = getPINType(normalized);
    const effectiveType = inferredType ?? row.pinType;

    if (pinType && effectiveType !== pinType) {
      return NextResponse.json(
        { error: `This PIN is for ${effectiveType} use, not ${pinType}` },
        { status: 400 },
      );
    }

    return NextResponse.json({
      valid: true,
      pinType: effectiveType,
      message: 'PIN validated successfully',
      pin: normalized,
    });
  } catch (error) {
    console.error('PIN validation error:', error);
    return NextResponse.json({ error: 'Failed to validate PIN' }, { status: 500 });
  }
}

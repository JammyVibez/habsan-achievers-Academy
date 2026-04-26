import { NextRequest, NextResponse } from 'next/server';
import { PIN_PRICING } from '@/lib/pin-management';
import { prisma } from '@/lib/prisma';
import { calculateExpiryDate, generatePINCode } from '@/lib/pin-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentEmail, pinType, paymentMethod } = body;

    if (!studentEmail || !pinType || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['admission', 'result'].includes(pinType)) {
      return NextResponse.json({ error: 'Invalid PIN type' }, { status: 400 });
    }

    const price = PIN_PRICING[pinType as 'admission' | 'result'].price;

    const order = await prisma.pinOrder.create({
      data: {
        studentEmail: String(studentEmail).trim().toLowerCase(),
        pinType: pinType as 'admission' | 'result',
        amount: price,
        paymentMethod: String(paymentMethod),
        paymentStatus: 'pending',
      },
    });

    const mockPaymentLink = `https://checkout.paystack.com/test?email=${encodeURIComponent(studentEmail)}&amount=${price * 100}`;

    const devComplete = process.env.PIN_PURCHASE_DEV_COMPLETE === 'true';

    if (devComplete) {
      const pin = generatePINCode(pinType as 'admission' | 'result').toUpperCase();
      const expiresAt = calculateExpiryDate(90);

      await prisma.$transaction([
        prisma.issuedPin.create({
          data: {
            pinCode: pin,
            pinType: pinType as 'admission' | 'result',
            status: 'active',
            expiresAt,
            studentEmail: String(studentEmail).trim().toLowerCase(),
            pinOrderId: order.id,
          },
        }),
        prisma.pinOrder.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'paid',
            paymentReference: `dev-${order.id}`,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: 'PIN issued (dev mode: payment skipped)',
        paymentLink: mockPaymentLink,
        amount: price,
        pinType,
        studentEmail,
        orderId: order.id,
        issuedPin: pin,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment initiated',
      paymentLink: mockPaymentLink,
      amount: price,
      pinType,
      studentEmail,
      orderId: order.id,
    });
  } catch (error) {
    console.error('PIN purchase error:', error);
    return NextResponse.json({ error: 'Failed to process PIN purchase' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference, studentEmail, pinType, orderId } = body;

    if (!reference || !studentEmail || !pinType) {
      return NextResponse.json({ error: 'reference, studentEmail, and pinType are required' }, { status: 400 });
    }

    if (!['admission', 'result'].includes(pinType)) {
      return NextResponse.json({ error: 'Invalid PIN type' }, { status: 400 });
    }

    const email = String(studentEmail).trim().toLowerCase();

    const order = orderId
      ? await prisma.pinOrder.findFirst({
          where: {
            id: orderId,
            studentEmail: email,
            pinType: pinType as 'admission' | 'result',
          },
        })
      : await prisma.pinOrder.findFirst({
          where: {
            studentEmail: email,
            pinType: pinType as 'admission' | 'result',
            paymentStatus: 'pending',
          },
          orderBy: { createdAt: 'desc' },
        });

    if (!order) {
      return NextResponse.json({ error: 'No matching pending PIN order found' }, { status: 404 });
    }

    // TODO: Verify payment with Paystack using `reference` before issuing a PIN.
    const pin = generatePINCode(pinType as 'admission' | 'result').toUpperCase();
    const expiresAt = calculateExpiryDate(90);

    await prisma.$transaction([
      prisma.issuedPin.create({
        data: {
          pinCode: pin,
          pinType: pinType as 'admission' | 'result',
          status: 'active',
          expiresAt,
          studentEmail: email,
          pinOrderId: order.id,
        },
      }),
      prisma.pinOrder.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'paid',
          paymentReference: String(reference),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'PIN activated after payment recorded',
      issuedPin: pin,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('PIN payment callback error:', error);
    return NextResponse.json({ error: 'Failed to process payment callback' }, { status: 500 });
  }
}

import { prisma } from '@/lib/prisma';
import { getPINType, validatePINFormat } from '@/lib/pin-generator';

export type IssuedPinCheckResult =
  | { ok: true }
  | { ok: false; status: number; message: string; pinShopPath?: string };

/**
 * Validates an admin-issued or shop-issued **result** PIN (IssuedPin table).
 * Result PINs stay `active` for repeated checks until expiry (not marked used here).
 */
export async function validateResultCheckingPin(pinRaw: string): Promise<IssuedPinCheckResult> {
  const pin = String(pinRaw).trim().toUpperCase();
  if (!validatePINFormat(pin)) {
    return {
      ok: false,
      status: 400,
      message: 'Invalid PIN format. Expected XXXX-XXXX-XXXX (e.g. RES1-ABCD-EFGH).',
    };
  }
  if (getPINType(pin) !== 'result') {
    return {
      ok: false,
      status: 400,
      message: 'This PIN is not a result-checking PIN. You need a Result PIN from the school or PIN Shop.',
      pinShopPath: '/pin-shop',
    };
  }

  const row = await prisma.issuedPin.findFirst({
    where: {
      pinCode: pin,
      pinType: 'result',
      status: 'active',
      expiresAt: { gt: new Date() },
    },
  });

  if (!row) {
    return {
      ok: false,
      status: 401,
      message:
        'Invalid, expired, or inactive result PIN. Purchase a valid Result PIN from the PIN Shop or obtain one from the school.',
      pinShopPath: '/pin-shop',
    };
  }

  return { ok: true };
}

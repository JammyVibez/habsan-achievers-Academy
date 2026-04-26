import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { requireAdminFromRequest } from '@/lib/require-admin-api';
import { generateDefaultPassword } from '@/lib/student-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  let body: {
    userId?: string;
    newPassword?: string;
    forceChangeOnLogin?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const userId = String(body.userId ?? '').trim();
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const raw = String(body.newPassword ?? '').trim();
  const newPassword = raw.length > 0 ? raw : generateDefaultPassword();

  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const forceChangeOnLogin = body.forceChangeOnLogin !== false;

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });

  if (!target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, passwordMustChange: forceChangeOnLogin },
  });

  return NextResponse.json({
    success: true,
    email: target.email,
    newPassword,
    passwordMustChange: forceChangeOnLogin,
  });
}

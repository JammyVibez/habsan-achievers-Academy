import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { createSessionToken, setSessionCookie } from '@/lib/auth-session';

function isAdmissionNumber(value: string): boolean {
  return /^HAA\/\d{4}\/\d{3}$/.test(value);
}

function getRedirectPath(role: 'admin' | 'teacher' | 'student', passwordMustChange: boolean): string {
  if (role === 'student' && passwordMustChange) return '/student/onboarding';
  return `/${role}`;
}

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json();
    const cleanIdentifier = String(identifier ?? '').trim();
    const cleanPassword = String(password ?? '');

    if (!cleanIdentifier || !cleanPassword) {
      return NextResponse.json({ error: 'Identifier and password are required' }, { status: 400 });
    }

    let user: {
      id: string;
      email: string;
      passwordHash: string;
      role: 'admin' | 'teacher' | 'student' | 'guest';
      firstName: string;
      lastName: string;
      passwordMustChange: boolean;
      isActive: boolean;
    } | null = null;

    if (isAdmissionNumber(cleanIdentifier)) {
      const student = await prisma.student.findUnique({
        where: { admissionNumber: cleanIdentifier },
        include: { user: true },
      });
      if (student) {
        user = {
          id: student.user.id,
          email: student.user.email,
          passwordHash: student.user.passwordHash,
          role: student.user.role,
          firstName: student.user.firstName,
          lastName: student.user.lastName,
          passwordMustChange: student.user.passwordMustChange,
          isActive: student.user.isActive,
        };
      }
    } else {
      const dbUser = await prisma.user.findUnique({
        where: { email: cleanIdentifier.toLowerCase() },
      });
      if (dbUser) {
        user = {
          id: dbUser.id,
          email: dbUser.email,
          passwordHash: dbUser.passwordHash,
          role: dbUser.role,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          passwordMustChange: dbUser.passwordMustChange,
          isActive: dbUser.isActive,
        };
      }
    }

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const ok = await verifyPassword(cleanPassword, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!['admin', 'teacher', 'student'].includes(user.role)) {
      return NextResponse.json({ error: 'User role is not allowed to access dashboard' }, { status: 403 });
    }

    const token = createSessionToken(user.id, user.role, user.passwordMustChange);
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          requiresPasswordChange: user.passwordMustChange,
        },
        redirectTo: getRedirectPath(user.role, user.passwordMustChange),
      },
      { status: 200 },
    );
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('Login error:', error);

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        {
          error:
            'Cannot connect to the database. Check DATABASE_URL, VPN/firewall, and that your Supabase project is running.',
        },
        { status: 503 },
      );
    }

    const msg = error instanceof Error ? error.message : '';
    if (msg.includes("Can't reach database server") || msg.includes('P1001')) {
      return NextResponse.json(
        {
          error:
            'Cannot reach the database server. For local dev, confirm Supabase is up and your pooled URL (port 6543) is reachable.',
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: 'Failed to sign in' }, { status: 500 });
  }
}

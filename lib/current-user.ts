import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/auth-session';

export type CurrentUser = {
  id: string;
  role: 'admin' | 'teacher' | 'student' | 'guest';
  firstName: string;
  lastName: string;
  email: string;
  passwordMustChange: boolean;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    const session = verifySessionToken(token);
    if (!session) return null;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        role: true,
        firstName: true,
        lastName: true,
        email: true,
        passwordMustChange: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) return null;
    return {
      id: user.id,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      passwordMustChange: user.passwordMustChange,
    };
  } catch {
    // DB unreachable, Prisma misconfigured, etc. — treat as logged out instead of crashing the route.
    return null;
  }
}

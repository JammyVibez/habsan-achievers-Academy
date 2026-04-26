import crypto from 'node:crypto';
import type { NextRequest, NextResponse } from 'next/server';

export const AUTH_COOKIE_NAME = 'haa_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionRole = 'admin' | 'teacher' | 'student' | 'guest';

export type AuthSession = {
  userId: string;
  role: SessionRole;
  mustChangePassword: boolean;
  exp: number;
};

function getAuthSecret(): string {
  return process.env.AUTH_SESSION_SECRET || process.env.NEXTAUTH_SECRET || 'dev-only-secret-change-me';
}

function base64Url(input: string): string {
  return Buffer.from(input).toString('base64url');
}

function decodeBase64Url(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function sign(payloadBase64: string): string {
  return crypto.createHmac('sha256', getAuthSecret()).update(payloadBase64).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function createSessionToken(userId: string, role: SessionRole, mustChangePassword: boolean): string {
  const payload: AuthSession = {
    userId,
    role,
    mustChangePassword,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const payloadBase64 = base64Url(JSON.stringify(payload));
  const signature = sign(payloadBase64);
  return `${payloadBase64}.${signature}`;
}

export function verifySessionToken(token: string): AuthSession | null {
  const [payloadBase64, signature] = token.split('.');
  if (!payloadBase64 || !signature) return null;
  const expected = sign(payloadBase64);
  if (!safeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(decodeBase64Url(payloadBase64)) as AuthSession;
    if (!payload?.userId || !payload?.role || typeof payload.exp !== 'number') return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(request: NextRequest): AuthSession | null {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
}

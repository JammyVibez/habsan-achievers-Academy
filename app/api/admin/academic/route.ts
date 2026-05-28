import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/require-admin-api';
import {
  createAcademicSession,
  createTerm,
  ensureDefaultAcademicCalendar,
  listAcademicSessions,
  setCurrentAcademicSession,
} from '@/lib/academic-calendar';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  try {
    let sessions = await listAcademicSessions();
    if (sessions.length === 0) {
      sessions = await ensureDefaultAcademicCalendar();
    }
    return NextResponse.json({ sessions });
  } catch (e) {
    console.error('Admin academic GET error:', e);
    return NextResponse.json({ error: 'Failed to load academic calendar' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  try {
    const body = (await request.json()) as { sessionId?: string; termId?: string };
    if (!body.sessionId || !body.termId) {
      return NextResponse.json({ error: 'sessionId and termId are required' }, { status: 400 });
    }
    await setCurrentAcademicSession(body.sessionId, body.termId);
    const sessions = await listAcademicSessions();
    return NextResponse.json({ success: true, sessions });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to update current session/term';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) return admin.response;

  try {
    const body = await request.json();
    const action = String(body.action ?? '');

    if (action === 'initialize') {
      const sessions = await ensureDefaultAcademicCalendar();
      return NextResponse.json({ success: true, sessions });
    }

    if (action === 'createSession') {
      await createAcademicSession({
        sessionName: String(body.sessionName ?? ''),
        startDate: String(body.startDate ?? ''),
        endDate: String(body.endDate ?? ''),
        setCurrent: Boolean(body.setCurrent),
      });
      const sessions = await listAcademicSessions();
      return NextResponse.json({ success: true, sessions });
    }

    if (action === 'createTerm') {
      await createTerm({
        sessionId: String(body.sessionId ?? ''),
        termName: String(body.termName ?? ''),
        startDate: String(body.startDate ?? ''),
        endDate: String(body.endDate ?? ''),
        setCurrent: Boolean(body.setCurrent),
      });
      const sessions = await listAcademicSessions();
      return NextResponse.json({ success: true, sessions });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to save academic calendar';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

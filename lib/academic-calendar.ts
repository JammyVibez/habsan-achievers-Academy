import { prisma } from '@/lib/prisma';
import type { AcademicSessionOption } from '@/lib/academic-calendar-types';

export type { AcademicSessionOption } from '@/lib/academic-calendar-types';

export type AcademicSessionRow = {
  id: string;
  sessionName: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  terms: Array<{
    id: string;
    termName: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
  }>;
};

export async function listAcademicSessionOptions(): Promise<AcademicSessionOption[]> {
  const rows = await prisma.academicSession.findMany({
    orderBy: { startDate: 'desc' },
    include: {
      terms: {
        orderBy: { startDate: 'asc' },
        select: { id: true, termName: true, isCurrent: true },
      },
    },
  });
  return rows.map((s) => ({
    id: s.id,
    sessionName: s.sessionName,
    isCurrent: s.isCurrent,
    terms: s.terms,
  }));
}

export async function resolveSessionAndTerm(sessionId: string, termId: string) {
  const term = await prisma.term.findFirst({
    where: { id: termId, sessionId },
    include: { session: { select: { id: true, sessionName: true } } },
  });
  if (!term) {
    throw new Error('Invalid academic session or term selected.');
  }
  return {
    session: { id: term.session.id, sessionName: term.session.sessionName },
    term: {
      id: term.id,
      termName: term.termName,
      startDate: term.startDate,
      endDate: term.endDate,
    },
  };
}

export async function listAcademicSessions(): Promise<AcademicSessionRow[]> {
  const rows = await prisma.academicSession.findMany({
    orderBy: { startDate: 'desc' },
    include: { terms: { orderBy: { startDate: 'asc' } } },
  });

  return rows.map((s) => ({
    id: s.id,
    sessionName: s.sessionName,
    startDate: s.startDate.toISOString().slice(0, 10),
    endDate: s.endDate.toISOString().slice(0, 10),
    isCurrent: s.isCurrent,
    terms: s.terms.map((t) => ({
      id: t.id,
      termName: t.termName,
      startDate: t.startDate.toISOString().slice(0, 10),
      endDate: t.endDate.toISOString().slice(0, 10),
      isCurrent: t.isCurrent,
    })),
  }));
}

export async function setCurrentAcademicSession(sessionId: string, termId: string) {
  const term = await prisma.term.findFirst({
    where: { id: termId, sessionId },
    select: { id: true },
  });
  if (!term) {
    throw new Error('Term does not belong to the selected session.');
  }

  await prisma.$transaction([
    prisma.academicSession.updateMany({ data: { isCurrent: false } }),
    prisma.term.updateMany({ data: { isCurrent: false } }),
    prisma.academicSession.update({ where: { id: sessionId }, data: { isCurrent: true } }),
    prisma.term.update({ where: { id: termId }, data: { isCurrent: true } }),
  ]);
}

export async function createAcademicSession(input: {
  sessionName: string;
  startDate: string;
  endDate: string;
  setCurrent?: boolean;
}) {
  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new Error('Invalid session dates.');
  }

  if (input.setCurrent) {
    await prisma.academicSession.updateMany({ data: { isCurrent: false } });
  }

  return prisma.academicSession.create({
    data: {
      sessionName: input.sessionName.trim(),
      startDate,
      endDate,
      isCurrent: Boolean(input.setCurrent),
    },
  });
}

export async function createTerm(input: {
  sessionId: string;
  termName: string;
  startDate: string;
  endDate: string;
  setCurrent?: boolean;
}) {
  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new Error('Invalid term dates.');
  }

  const session = await prisma.academicSession.findUnique({ where: { id: input.sessionId } });
  if (!session) throw new Error('Session not found.');

  if (input.setCurrent) {
    await prisma.academicSession.updateMany({ data: { isCurrent: false } });
    await prisma.term.updateMany({ data: { isCurrent: false } });
    await prisma.academicSession.update({ where: { id: input.sessionId }, data: { isCurrent: true } });
  }

  return prisma.term.create({
    data: {
      sessionId: input.sessionId,
      termName: input.termName.trim(),
      startDate,
      endDate,
      isCurrent: Boolean(input.setCurrent),
    },
  });
}

/** Creates a default session + first term when the database has none. */
export async function ensureDefaultAcademicCalendar() {
  const count = await prisma.academicSession.count();
  if (count > 0) return listAcademicSessions();

  const year = new Date().getFullYear();
  const session = await prisma.academicSession.create({
    data: {
      sessionName: `${year}/${year + 1}`,
      startDate: new Date(`${year}-09-01`),
      endDate: new Date(`${year + 1}-07-31`),
      isCurrent: true,
    },
  });

  await prisma.term.create({
    data: {
      sessionId: session.id,
      termName: 'First Term',
      startDate: new Date(`${year}-09-01`),
      endDate: new Date(`${year}-12-20`),
      isCurrent: true,
    },
  });

  return listAcademicSessions();
}

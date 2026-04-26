import { prisma } from '@/lib/prisma';

export async function nextAdmissionSequence(year: number): Promise<number> {
  const prefix = `HAA/${year}/`;
  const rows = await prisma.student.findMany({
    where: { admissionNumber: { startsWith: prefix } },
    select: { admissionNumber: true },
  });
  let max = 0;
  for (const row of rows) {
    const parts = row.admissionNumber.split('/');
    const n = parseInt(parts[2] ?? '', 10);
    if (!Number.isNaN(n) && n > max) max = n;
  }
  return max + 1;
}

export async function nextStaffSequence(year: number): Promise<number> {
  const prefix = `TCH/${year}/`;
  const rows = await prisma.teacher.findMany({
    where: { staffId: { startsWith: prefix } },
    select: { staffId: true },
  });
  let max = 0;
  for (const row of rows) {
    const parts = row.staffId.split('/');
    const n = parseInt(parts[2] ?? '', 10);
    if (!Number.isNaN(n) && n > max) max = n;
  }
  return max + 1;
}

function subjectCodeFromName(name: string): string {
  const base = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 16);
  return `${base || 'SUB'}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function ensureSubjectByName(name: string) {
  const existing = await prisma.subject.findUnique({ where: { name } });
  if (existing) return existing;
  return prisma.subject.create({
    data: {
      name,
      code: subjectCodeFromName(name),
      isActive: true,
    },
  });
}

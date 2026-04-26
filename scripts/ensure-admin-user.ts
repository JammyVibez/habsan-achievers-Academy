/**
 * Creates or updates the default admin user in the database.
 * Run: npm run db:admin
 *
 * Requires DATABASE_URL in .env (same as Prisma).
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

function loadDotEnv() {
  const p = resolve(process.cwd(), '.env');
  if (!existsSync(p)) return;
  const text = readFileSync(p, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

async function main() {
  loadDotEnv();
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is missing. Add it to .env first.');
    process.exit(1);
  }

  const email = 'admin@habsan.edu.ng';
  const password = 'Admin@123';
  const passwordHash = await bcrypt.hash(password, 10);

  const prisma = new PrismaClient();

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      role: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+2348000000001',
      passwordMustChange: false,
      isActive: true,
    },
    update: {
      passwordHash,
      role: 'admin',
      isActive: true,
      passwordMustChange: false,
    },
  });

  // eslint-disable-next-line no-console -- CLI script
  console.log('Admin user ready.');
  // eslint-disable-next-line no-console -- CLI script
  console.log(`  Email:    ${email}`);
  // eslint-disable-next-line no-console -- CLI script
  console.log(`  Password: ${password}`);
  // eslint-disable-next-line no-console -- CLI script
  console.log(`  User id:  ${user.id}`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});

/**
 * Development/reference seed. Idempotent: safe to run repeatedly.
 * Run from the repo root: npm run db:seed
 */
import { PrismaClient } from '@prisma/client';
import { seedRolesAndPermissions } from './seeds/roles';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Seeding roles and permissions…');
  await seedRolesAndPermissions(prisma);
  console.log('Seed complete.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

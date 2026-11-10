#!/usr/bin/env node
/**
 * Least-privilege database roles for local/self-hosted PostgreSQL.
 *
 *   ADMIN_DATABASE_URL=postgresql://<superuser>:<password>@localhost:5432/postgres npm run db:setup-roles
 *
 * - gymova (owner): owns the schema; used ONLY for migrations (MIGRATION_DATABASE_URL).
 * - gymova_app: what the running API uses (DATABASE_URL). It can read/write rows but cannot create, alter or
 *   drop tables, create roles or databases, or read the migrations table. A compromised API therefore
 *   cannot destroy the schema or escalate inside PostgreSQL.
 *
 * Both passwords are regenerated (48 random bytes) on every run and written to apps/api/.env and
 * apps/api/.env.test, which are git-ignored. They are never printed.
 */
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const apiDir = join(root, 'apps', 'api');
const adminUrl = process.env.ADMIN_DATABASE_URL;
if (!adminUrl) {
  console.error('Set ADMIN_DATABASE_URL to a superuser connection string (it is not stored anywhere).');
  process.exit(2);
}

const OWNER = 'gymova';
const APP = 'gymova_app';
const DATABASES = ['gymova', 'gymova_test'];
const secret = () => randomBytes(48).toString('base64url');
const ownerPassword = secret();
const appPassword = secret();
const lit = (s) => `'${s.replace(/'/g, "''")}'`;

const host = new URL(adminUrl);
const urlFor = (user, password, db) =>
  `postgresql://${user}:${encodeURIComponent(password)}@${host.hostname}:${host.port || 5432}/${db}?schema=public`;

const prismaCli = createRequire(join(apiDir, 'package.json')).resolve('prisma/build/index.js');
const tmp = mkdtempSync(join(tmpdir(), 'gymova-roles-'));
function execSql(url, sql) {
  const file = join(tmp, 'roles.sql');
  writeFileSync(file, sql, { mode: 0o600 });
  // Run the Prisma CLI through node directly (no shell), so the URL is never re-parsed by a shell.
  const res = spawnSync(process.execPath, [prismaCli, 'db', 'execute', '--url', url, '--file', file], { cwd: apiDir, encoding: 'utf8' });
  rmSync(file, { force: true });
  if (res.status !== 0) {
    // Prisma echoes the URL on some errors; strip credentials before showing anything.
    console.error((res.stderr || res.stdout || '').replace(/\/\/[^@\s]+@/g, '//***@'));
    rmSync(tmp, { recursive: true, force: true });
    process.exit(1);
  }
}

try {
  execSql(
    adminUrl,
    `
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${OWNER}') THEN CREATE ROLE ${OWNER} LOGIN; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${APP}') THEN CREATE ROLE ${APP} LOGIN; END IF;
END $$;
ALTER ROLE ${OWNER} WITH LOGIN PASSWORD ${lit(ownerPassword)};
ALTER ROLE ${APP} WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 50 PASSWORD ${lit(appPassword)};
${DATABASES.map((db) => `REVOKE ALL ON DATABASE ${db} FROM PUBLIC; GRANT CONNECT ON DATABASE ${db} TO ${APP};`).join('\n')}
`,
  );

  for (const db of DATABASES) {
    execSql(
      urlFor(OWNER, ownerPassword, db),
      `
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO ${APP};
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${APP};
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${APP};
ALTER DEFAULT PRIVILEGES FOR ROLE ${OWNER} IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${APP};
ALTER DEFAULT PRIVILEGES FOR ROLE ${OWNER} IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ${APP};
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = '_prisma_migrations') THEN
    REVOKE ALL ON TABLE public._prisma_migrations FROM ${APP};
  END IF;
END $$;
`,
    );
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

function upsertEnv(file, values) {
  let text = existsSync(file) ? readFileSync(file, 'utf8') : '';
  for (const [key, value] of Object.entries(values)) {
    const line = `${key}="${value}"`;
    const re = new RegExp(`^${key}=.*$`, 'm');
    text = re.test(text) ? text.replace(re, line) : `${text.trimEnd()}\n${line}\n`;
  }
  writeFileSync(file, text, { mode: 0o600 });
}

upsertEnv(join(apiDir, '.env'), {
  DATABASE_URL: urlFor(APP, appPassword, 'gymova'),
  MIGRATION_DATABASE_URL: urlFor(OWNER, ownerPassword, 'gymova'),
});
upsertEnv(join(apiDir, '.env.test'), {
  DATABASE_URL: urlFor(APP, appPassword, 'gymova_test'),
  MIGRATION_DATABASE_URL: urlFor(OWNER, ownerPassword, 'gymova_test'),
});
console.log(`Roles ready: ${OWNER} (migrations) and ${APP} (runtime). Passwords rotated and written to apps/api/.env and .env.test.`);

#!/usr/bin/env node
/**
 * Local development PostgreSQL without Docker or a Windows service.
 *
 *   npm run db:start | db:stop | db:status
 *
 * Data lives OUTSIDE the repository and outside OneDrive/Dropbox (a live database must never be synced
 * to a cloud folder), in a directory only the current user can read:
 *   Windows: %LOCALAPPDATA%\GYMOVA\postgres\{17,data}
 *   macOS/Linux: ~/.local/share/gymova/postgres/{17,data}
 * Override with GYMOVA_PG_HOME (binaries in <home>/17/bin, data in <home>/data) or GYMOVA_PG_BIN.
 *
 * The server only listens on localhost and requires scram-sha-256 passwords (see docs/security.md).
 * Production never uses this: it uses a managed PostgreSQL with TLS (infrastructure/deployment).
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const isWin = process.platform === 'win32';
const home =
  process.env.GYMOVA_PG_HOME ??
  (isWin ? join(process.env.LOCALAPPDATA ?? join(homedir(), 'AppData', 'Local'), 'GYMOVA', 'postgres') : join(homedir(), '.local', 'share', 'gymova', 'postgres'));
const bin = process.env.GYMOVA_PG_BIN ?? join(home, '17', 'bin');
const data = join(home, 'data');
const port = process.env.GYMOVA_PG_PORT ?? '5432';
const exe = (name) => join(bin, isWin ? `${name}.exe` : name);

function pgCtl(args, stdio = 'inherit') {
  if (!existsSync(exe('pg_ctl'))) {
    console.error(
      `PostgreSQL binaries not found in ${bin}.\n` +
        'Install PostgreSQL 17 (https://www.postgresql.org/download/) and set GYMOVA_PG_BIN to its bin folder,\n' +
        'or use Docker: npm run docker:up',
    );
    process.exit(1);
  }
  return spawnSync(exe('pg_ctl'), ['-D', data, ...args], { stdio, windowsHide: true });
}

const command = process.argv[2] ?? 'status';
switch (command) {
  case 'start': {
    if (!existsSync(join(data, 'PG_VERSION'))) {
      console.error(`No database cluster in ${data}. See docs/security.md → "Local database" to create one.`);
      process.exit(1);
    }
    const status = pgCtl(['status'], 'pipe');
    if (status.status === 0) {
      console.log(`PostgreSQL already running (data: ${data})`);
      break;
    }
    // stdio must be 'ignore': the server inherits pg_ctl's handles, so a pipe would never close and this would hang.
    // Server output goes to the log file instead.
    const res = pgCtl(['-l', join(home, 'postgres.log'), '-o', `-p ${port} -c listen_addresses=localhost`, '-w', 'start'], 'ignore');
    if (res.status !== 0) {
      console.error(`Failed to start. See ${join(home, 'postgres.log')}`);
      process.exit(res.status ?? 1);
    }
    console.log(`PostgreSQL running on localhost:${port} (data: ${data})`);
    break;
  }
  case 'stop':
    process.exit(pgCtl(['stop', '-m', 'fast']).status ?? 0);
    break;
  case 'status':
    process.exit(pgCtl(['status']).status ?? 0);
    break;
  default:
    console.error('Usage: local-postgres.mjs start|stop|status');
    process.exit(2);
}

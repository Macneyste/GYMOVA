#!/usr/bin/env node
/**
 * Fails (exit 1) when a secret could reach a client bundle or git:
 *  1. any tracked .env file other than *.env.example,
 *  2. a public client variable (EXPO_PUBLIC_* / NEXT_PUBLIC_*) whose name looks like a secret — everything
 *     with those prefixes is compiled into the app and readable by anyone who downloads it,
 *  3. well-known secret formats (Anthropic/OpenAI/AWS/Stripe/GitHub keys, private keys, JWTs) in tracked files,
 *  4. server-only SDKs or secret env names referenced from mobile/admin source.
 *
 * API keys belong ONLY in apps/api/.env (server). Clients call the API, which calls third parties.
 * Run: npm run check:secrets   (also runs in CI)
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const files = execFileSync('git', ['ls-files', '-co', '--exclude-standard'], { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)
  .filter((f) => !f.includes('node_modules/') && !/\.(png|jpe?g|gif|webp|ico|ttf|otf|woff2?|lock)$/i.test(f) && f !== 'package-lock.json');

const problems = [];
const add = (file, line, msg) => problems.push(`${file}${line ? `:${line}` : ''}  ${msg}`);

const SECRET_PATTERNS = [
  [/sk-ant-[A-Za-z0-9_-]{20,}/, 'Anthropic API key'],
  [/sk-(proj-)?[A-Za-z0-9]{32,}/, 'OpenAI-style API key'],
  [/AKIA[0-9A-Z]{16}/, 'AWS access key id'],
  [/(sk|rk)_live_[A-Za-z0-9]{20,}/, 'Stripe live secret key'],
  [/gh[pousr]_[A-Za-z0-9]{36,}/, 'GitHub token'],
  [/-----BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY-----/, 'private key'],
  [/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, 'JSON Web Token'],
  [/postgres(ql)?:\/\/[^:\s"']+:(?!CHANGE_ME|gymova@|\$\{)[^@\s"']{12,}@/, 'database URL with a real password'],
];
const PUBLIC_SECRET_NAME = /\b(EXPO_PUBLIC|NEXT_PUBLIC)_[A-Z0-9_]*(KEY|SECRET|TOKEN|PASSWORD|PRIVATE|CREDENTIAL)[A-Z0-9_]*/;
const CLIENT_DIRS = /^(apps\/mobile|apps\/admin|packages\/(api-client|design-tokens|shared-types|shared-validation))\//;
const SERVER_ONLY_IN_CLIENT = [
  [/@anthropic-ai\/sdk|['"]openai['"]|@aws-sdk\//, 'server-only SDK imported in client code'],
  [/process\.env\.(?!EXPO_PUBLIC_|NEXT_PUBLIC_|NODE_ENV\b)[A-Z_]+/, 'non-public env var read in client code (not available at runtime, and a sign a secret is expected)'],
];

for (const file of files) {
  const base = file.split('/').pop() ?? '';
  if (/^\.env(\..+)?$/.test(base) && !base.endsWith('.example')) add(file, 0, 'environment file must not be committed');

  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  if (file === 'scripts/check-secrets.mjs') continue;
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    for (const [re, label] of SECRET_PATTERNS) if (re.test(line)) add(file, i + 1, label);
    const pub = line.match(PUBLIC_SECRET_NAME);
    if (pub) add(file, i + 1, `${pub[0]} — public client variables are embedded in the app; keep secrets on the API`);
    if (CLIENT_DIRS.test(file) && /\.(ts|tsx|js|mjs|cjs)$/.test(file) && !/\.(test|spec)\./.test(file) && !/(next|metro|babel|postcss|app)\.config/.test(file)) {
      for (const [re, label] of SERVER_ONLY_IN_CLIENT) if (re.test(line)) add(file, i + 1, label);
    }
  });
}

if (problems.length) {
  console.error(`✖ Secret scan failed (${problems.length}):\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`✔ Secret scan passed (${files.length} files): no keys in clients, no committed env files.`);

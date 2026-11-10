# GYMOVA Security

## 1. Secrets and API keys
- **API keys live only on the server** (`apps/api/.env`, or the host's secret manager in production). The mobile app and admin dashboard never hold third-party keys: they call the GYMOVA API, which calls Anthropic, S3, email/SMS providers, etc.
- Anything named `EXPO_PUBLIC_*` or `NEXT_PUBLIC_*` is compiled into the client and readable by anyone. Only public values (the API URL) may use those prefixes.
- `npm run check:secrets` (also in CI) fails if: an `.env` file is committed, a public variable name looks like a secret, a known key format (Anthropic, OpenAI, AWS, Stripe, GitHub, private keys, JWTs, DB URLs with passwords) appears in tracked files, or client code imports a server-only SDK.
- Mobile tokens and the cached profile are stored in the device keystore (Expo SecureStore), never AsyncStorage.
- Rotate a leaked secret immediately: change it in the server env, redeploy; for JWT secrets this signs everyone out.

## 2. Local database
| | |
|---|---|
| Location | `%LOCALAPPDATA%\GYMOVA\postgres\data` (macOS/Linux: `~/.local/share/gymova/postgres/data`). Outside the repo and outside OneDrive — a live database must never sit in a cloud-synced folder. |
| File access | The data folder ACL allows only the current Windows user and SYSTEM. |
| Network | Listens on `localhost` only; `scram-sha-256` passwords for every connection. Docker dev ports are bound to `127.0.0.1`. |
| Commands | `npm run db:start` · `npm run db:stop` · `npm run db:status` |

### Roles (least privilege)
| Role | Used by | Can |
|---|---|---|
| `gymova` (owner) | `MIGRATION_DATABASE_URL` → Prisma Migrate (`directUrl`) | Create/alter tables |
| `gymova_app` | `DATABASE_URL` → the running API and seed | `SELECT/INSERT/UPDATE/DELETE` rows only. Cannot drop/alter tables, create roles/databases or read `_prisma_migrations`. |

`ADMIN_DATABASE_URL=<superuser url> npm run db:setup-roles` creates both roles, rotates both passwords (48 random bytes) and writes them to `apps/api/.env` and `.env.test` (git-ignored). Passwords are never printed.

## 3. Production database
- Managed PostgreSQL (e.g. a provider with encryption at rest, automated backups and point-in-time recovery), in a private network, not publicly reachable.
- `DATABASE_URL` **must** include `sslmode=require` or `verify-full` — the API refuses to boot otherwise.
- Separate `gymova_app` / owner roles as above; migrations run from CI/deploy with the owner role, the API uses `gymova_app`.
- Backups: see `infrastructure/deployment/backup.md`.

## 4. API protections
- Every route requires a valid access token unless explicitly `@Public()`; authorisation is by permission codes.
- Access tokens: HS256, 15 min, bound to issuer `gymova-api` and audience `gymova-clients`.
- Refresh tokens: opaque, stored hashed, rotated on each use; reuse revokes the session family. Password change/reset signs out every device.
- Passwords: argon2id; minimum 10 chars with letter + number; common/breached passwords and passwords containing the user's name or email are rejected (`password.weak`).
- Brute force: 5 failed logins lock the account for 15 min; per-IP rate limits on auth routes.
- Enumeration: identical errors for unknown email vs wrong password; forgot-password always reports success; constant-time comparison.
- Headers: strict CSP (`default-src 'none'`), HSTS, no-referrer, no `X-Powered-By`; admin dashboard sends CSP, HSTS, `X-Frame-Options: DENY`.
- Errors never expose stack traces or database/schema details; logs redact passwords, tokens and chat messages.
- Swagger (`/docs`) is off unless `NODE_ENV=development` or `ENABLE_SWAGGER=true`, and never in production.
- Production boot checks: TLS database URL, https-only CORS origins, AI key present when the real AI provider is enabled.
- Mobile release builds refuse a non-HTTPS API URL.

## 5. Known gaps (planned)
- Rate-limit state is in memory; use Redis storage before running more than one API instance.
- Email/SMS providers are console-only (codes are logged in development, not sent).
- No field-level encryption yet for health data (assessments, measurements); planned with the profile/assessment phase.
- Admin dashboard has no sign-in yet; it must not be deployed publicly until its auth phase ships.

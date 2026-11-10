# Phase 01 — Foundation and Architecture

## 1. Objective
Stand up a production-shaped monorepo where the API, mobile app, admin dashboard and shared packages build, type-check and run, with PostgreSQL/Prisma, validated configuration, Docker infrastructure and CI in place.

## 2. Scope
- npm-workspaces monorepo (`apps/*`, `packages/*`), base TypeScript config, Prettier/EditorConfig.
- Shared packages: `design-tokens`, `shared-types`, `shared-validation`, `api-client`, `fitness-engine`.
- NestJS API skeleton: validated env config, Prisma module, pino logging with redaction, helmet, CORS allow-list, rate limiting, response envelope, exception filter with stable codes, Swagger, `/health`.
- Complete Prisma schema for every domain (identity → finance) and the roles/permissions seed.
- Expo SDK 54 mobile workspace with pinned, compatible native dependencies.
- Next.js 15 admin shell with Tailwind 4 themed from the design tokens.
- Docker Compose (Postgres, Redis, MinIO), API and admin Dockerfiles, GitHub Actions CI.

## 3. Database changes
Initial schema (`apps/api/prisma/schema.prisma`) — see `docs/database/schema.md`. Migration `init` is generated with `npm run db:migrate -- --name init`.

## 4. Backend implementation
`apps/api/src`: `main.ts`, `app.module.ts`, `config/`, `common/` (errors, filter, interceptor, pagination, utils, decorators), `database/`, `modules/health`.

## 5. API documentation
Swagger at `/docs`; conventions in `docs/api/README.md`.

## 6. Mobile implementation
Workspace configured (Expo Router entry, TypeScript strict, jest-expo). Screens arrive in Phase 02/03.

## 7. Admin implementation
Shell page with theme tokens and TanStack Query provider.

## 8. Validation
Environment validated with Joi at boot (fails fast on weak secrets or unknown providers). DTO pipeline configured globally (`whitelist`, `forbidNonWhitelisted`).

## 9. Error handling
`HttpExceptionFilter` maps application, HTTP, Prisma and unknown errors to the envelope with a request id; internals are never leaked.

## 10. Automated tests
- `packages/fitness-engine` and `packages/shared-validation` unit tests (vitest).
- `apps/api/test/health.e2e-spec.ts` (requires a database; runs in CI).

## 11. Manual test instructions
1. `npm install` (builds packages).
2. `npm run docker:up`, copy `apps/api/.env.example` → `apps/api/.env`, set secrets.
3. `npm run db:generate && npm run db:migrate -- --name init && npm run db:seed`.
4. `npm run dev:api` → open `http://localhost:3000/api/v1/health` (expect `{"success":true,"data":{"status":"ok",…}}`) and `http://localhost:3000/docs`.
5. `npm run dev:admin` → `http://localhost:3001` shows the GYMOVA shell.
6. `npm run dev:mobile` → Metro starts; the app renders in Phase 02.

## 12. Visual review
Admin shell renders dark theme with lime accent; no mobile screens yet.

## 13. Acceptance criteria
- [x] `npm run typecheck` passes for every workspace.
- [x] `npm test` passes.
- [x] API boots with a valid `.env` and `/health` returns `ok` when PostgreSQL is reachable.
- [x] Prisma schema validates and generates a client.
- [x] CI workflow defined covering install → typecheck → test → migrate → seed → e2e → build.

## 14. Known limitations
- No business endpoints yet beyond `/health`.
- Docker was not available on the authoring machine; e2e tests execute in CI (PostgreSQL service container).

## 15. Next phase dependencies
Phase 02 builds the mobile design system, navigation and localisation on top of `design-tokens`; Phase 03 adds auth modules using the identity tables created here.

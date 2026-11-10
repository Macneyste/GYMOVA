# Architecture decision records

Short records of decisions that are not obvious from the code.

## ADR-001 Compiled shared packages instead of source-linking
**Decision**: shared packages build to `dist/` (CommonJS + d.ts) and `main` points there.
**Why**: Nest (tsc), Metro and Next each resolve TypeScript sources differently; shipping JS removes a class of "works in one app, breaks in another" issues and keeps Docker images simple.
**Cost**: `npm run build:packages` must run after changing a package (automated by `postinstall` and the `typecheck`/`build` scripts).

## ADR-002 Permission codes, not role names, in guards
**Decision**: guards check permission codes; roles are bundles seeded from `RolePermissionDefaults`.
**Why**: the brief requires permission-based authorization and gyms will need custom staff roles later without redeploying.

## ADR-003 Nutrition snapshotting
**Decision**: `FoodLogItem` and `MealItem` copy calories/macros at write time.
**Why**: correcting a food record must not rewrite a user's diary history; reports stay reproducible.

## ADR-004 Versioned fitness calculations
**Decision**: `FitnessTargetSnapshot` stores `formulaVersion` and every input used.
**Why**: targets are estimates; when formulas improve, old numbers remain explainable and users can be re-calculated explicitly.

## ADR-005 AI provider abstraction with a deterministic mock
**Decision**: `AIProvider` interface with `anthropic` and `mock` implementations chosen by `AI_PROVIDER`.
**Why**: tests and local development never need network or keys; the provider can change without touching coaching logic. The AI is only allowed to reference foods/exercises that exist in the database (tool-style grounding), never to emit nutrition numbers.

## ADR-006 Redis optional in development
**Decision**: BullMQ queues are registered only when `REDIS_URL` is set; otherwise `@nestjs/schedule` drives the same handlers in-process.
**Why**: lower barrier to running the project; production still gets durable queues.

## ADR-007 Money as `Decimal(12,2)` strings on the wire
**Decision**: Prisma `Decimal` columns; API serialises money as fixed 2-decimal strings.
**Why**: avoids floating-point drift in JavaScript clients.

## ADR-008 Expo SDK 54 (development build) for Android
**Decision**: pin Expo SDK 54 and ship via EAS development/preview builds rather than Expo Go.
**Why**: camera, notifications and secure store need native modules configured through config plugins; Expo Go on the Play Store only tracks the newest SDK, so a development build gives a stable, reproducible target.

## ADR-009 class-validator in the API, zod in clients
**Decision**: API DTOs use class-validator (NestJS idiom, Swagger generation); forms use zod schemas from `shared-validation` that mirror the same rules.
**Why**: best tooling on each side; parity is covered by tests that run representative payloads through both.

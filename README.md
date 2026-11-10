# GYMOVA

**Train. Eat. Track. Transform.**

AI-powered personal fitness and gym management platform: personalised workout plans, Somali and international nutrition tracking, AI diet/workout coaching, food scanning, progress analytics, and multi-tenant gym management (members, trainers, memberships, attendance, payments).

| App | Stack | Location |
| --- | --- | --- |
| Android mobile app | React Native · Expo SDK 54 · Expo Router · TypeScript | `apps/mobile` |
| REST API | NestJS 11 · Prisma 6 · PostgreSQL 16 · Redis (optional) | `apps/api` |
| Admin dashboard | Next.js 15 · Tailwind CSS 4 · TanStack Query | `apps/admin` |
| Shared packages | design tokens, domain types, zod validation, typed API client, fitness engine | `packages/*` |

## Repository layout

```
apps/
  api/        NestJS modular monolith (modules/, common/, config/, database/, prisma/)
  mobile/     Expo app (app/ routes, src/features, src/components, src/localization …)
  admin/      Next.js dashboard (src/app, src/components, src/lib)
packages/
  design-tokens/      colours, spacing, typography, radii (mobile + admin)
  shared-types/       enums, permission codes, API envelope, domain models
  shared-validation/  zod schemas used by mobile and admin forms
  api-client/         typed fetch client with refresh-token rotation
  fitness-engine/     deterministic, versioned BMI/BMR/TDEE/macro calculations
infrastructure/
  docker/             docker-compose (Postgres, Redis, MinIO) and Dockerfiles
  deployment/         environment and release guides
docs/
  architecture/  api/  database/  product/  phases/
scripts/
```

## Prerequisites

- Node.js 20+ and npm 10+
- Docker Desktop (for PostgreSQL, Redis and MinIO) **or** a local PostgreSQL 16 instance
- Android Studio emulator or a physical Android device with the Expo development build

## Quick start (development)

All commands run from the **repository root** unless stated otherwise.

```bash
# 1. Install every workspace and build the shared packages
npm install

# 2. Start infrastructure (PostgreSQL :5432, Redis :6379, MinIO :9000/:9001)
npm run docker:up

# 3. Configure the API
cp apps/api/.env.example apps/api/.env
#    → replace JWT_ACCESS_SECRET, JWT_REFRESH_SECRET and QR_TOKEN_SECRET with long random values

# 4. Create the database schema and reference data
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed

# 5. Run the API (http://localhost:3000/api/v1, Swagger at http://localhost:3000/docs)
npm run dev:api

# 6. Run the admin dashboard (http://localhost:3001) — in a second terminal
cp apps/admin/.env.example apps/admin/.env.local
npm run dev:admin

# 7. Run the mobile app — in a third terminal
npm run dev:mobile
```

The mobile app reads `EXPO_PUBLIC_API_URL` (defaults to `http://10.0.2.2:3000/api/v1`, the Android emulator alias for the host). For a physical device set it to your computer's LAN IP, e.g. `EXPO_PUBLIC_API_URL=http://192.168.1.20:3000/api/v1 npm run dev:mobile`.

## Quality checks

| Command | What it does |
| --- | --- |
| `npm run typecheck` | Builds shared packages, then type-checks every workspace |
| `npm test` | Unit tests (fitness engine, validation, API services) |
| `npm run test:e2e` | API end-to-end tests against the configured PostgreSQL database |
| `npm run build` | Production builds of packages, API and admin |
| `npm run lint` | ESLint across workspaces |

CI (`.github/workflows/ci.yml`) runs typecheck → unit tests → migrations → seed → e2e → build on every push and pull request.

## Documentation

- [Architecture overview](docs/architecture/overview.md) · [Architecture decisions](docs/architecture/decisions.md)
- [Database schema](docs/database/schema.md)
- [API conventions](docs/api/README.md) (full reference: Swagger `/docs` when the API runs)
- [Product roadmap & phase status](docs/product/roadmap.md)
- Phase reports: [docs/phases](docs/phases)

## Safety and privacy principles

- Nutrition values come only from verified database records; the AI never invents calories.
- Fitness targets are estimates with a stored formula version; no aggressive deficits; medical conditions, pregnancy or eating disorders route users to professional guidance.
- Health data and progress photos are private, access-controlled and excluded from logs.
- Passwords use Argon2id; refresh tokens are hashed and rotated; API keys never ship in the mobile app.

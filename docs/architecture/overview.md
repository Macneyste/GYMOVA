# GYMOVA architecture overview

## Shape of the system

```
┌──────────────────┐     ┌──────────────────┐
│  Mobile (Expo)   │     │  Admin (Next.js) │
│  members/trainers│     │  gym/super admin │
└────────┬─────────┘     └────────┬─────────┘
         │  HTTPS /api/v1 (JSON envelope, bearer JWT)
         └──────────────┬─────────┘
                        ▼
              ┌───────────────────┐
              │   NestJS API      │  modular monolith
              │  modules/*        │  guards: JWT → permissions → tenant
              └──┬─────┬──────┬───┘
                 │     │      │
        PostgreSQL   Redis   S3-compatible storage
        (Prisma)   (BullMQ)  (progress photos, scans, avatars)
                 │
          AI provider abstraction → Anthropic (prod) / mock (dev, tests)
```

Both clients consume the same API through `@gymova/api-client`; there is no separate admin backend. Authorization is identical whichever client calls.

## Monorepo

npm workspaces. Shared packages are compiled to `dist/` with `tsc` (`npm run build:packages`, also run on `postinstall`) so that Node (API), Metro (mobile) and Next.js consume plain JavaScript with type declarations. This avoids bundler-specific TypeScript path tricks and keeps a single source of truth for enums, permission codes and validation.

| Package | Purpose | Consumers |
| --- | --- | --- |
| `design-tokens` | palette, spacing, radii, typography | mobile theme, admin Tailwind theme |
| `shared-types` | enums mirrored from Prisma, permission codes + default role bundles, API envelope, domain models | all |
| `shared-validation` | zod schemas for forms | mobile, admin |
| `api-client` | typed endpoints, bearer auth, single-flight refresh | mobile, admin |
| `fitness-engine` | pure, versioned formulas | API (and unit tests) |

## Backend layering

```
controller (HTTP, DTO validation, Swagger)  →  service (business rules, transactions)  →  Prisma (data access)
             ▲ guards: JwtAuthGuard → PermissionsGuard → GymTenantGuard
             ▲ interceptors: response envelope, audit
             ▲ filter: HttpExceptionFilter (stable error codes)
```

- **Validation**: `class-validator` DTOs with `whitelist + forbidNonWhitelisted`; unknown fields are rejected.
- **Errors**: services throw `AppException` subclasses carrying machine-readable codes (`shared-types` → `ApiErrorCode`). Clients branch on the code, never on the message.
- **Envelope**: `{ success: true, data }` / `{ success: false, error: { code, message, details, requestId } }`.
- **Configuration**: validated once at boot (`config/env.validation.ts`); services inject `AppConfigService`, never `process.env`.
- **Logging**: pino with redaction of credentials, tokens, AI message bodies and health fields.
- **Background work**: BullMQ when `REDIS_URL` is set; otherwise an in-process scheduler (`@nestjs/schedule`) runs the same job handlers so development works without Redis.

## Multi-tenancy

Gym business models carry `gymId` (and `branchId` where a physical location matters). Personal fitness models never do: an independent user has full functionality with no gym. Tenant scoping is enforced in the `GymTenantGuard` (the caller must hold a `GymStaff` row for the `gymId` in the route, or be a super admin) **and** in every service query (`where: { gymId }`), so a bug in one layer is caught by the other.

## Authorization

Permission-based. `shared-types/permissions.ts` defines the codes and the default bundle for each role; the seed writes them to `Role`/`Permission`/`RolePermission`. Guards check codes (`@RequirePermissions('members:read')`). Roles are therefore configurable at runtime without code changes.

## Mobile

Expo Router with protected route groups (`(auth)`, `(onboarding)`, `(tabs)`), Zustand for client state (session, theme, offline queue), TanStack Query for server state with persisted cache, i18next (English + Somali), a custom theme system driven by the shared tokens, SecureStore for tokens only. Offline workout logging uses a local queue that replays idempotently (`clientId`) when connectivity returns.

## Admin

Next.js App Router, client-side data fetching through the shared API client (tokens kept in memory + `sessionStorage`), permission-aware navigation, Recharts for analytics, Tailwind theme derived from the design tokens.

# Core MVP architecture

The repository is a modular TypeScript monorepo. `apps/api` owns authentication, persistence and all calculations exposed to clients. `apps/mobile` is an Expo Router app and stores only access/refresh tokens in SecureStore. `packages/fitness-engine` is deterministic and has no database or HTTP dependency, making its estimates testable and versioned.

PostgreSQL is the source of truth. Food nutrition comes only from seeded/verified database records and every food-log item snapshots its values, preserving historical diary accuracy when a food record changes. Passwords use Argon2id and refresh tokens are stored as hashes and rotated.

Tenant-specific gym modules and AI are intentionally excluded from this personal-fitness MVP; the schema keeps gym independence by never requiring a gym identifier for users, assessments, workouts or food logs.

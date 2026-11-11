# GYMOVA — Master Development Prompt

## Product identity

Build **GYMOVA** — *Train. Eat. Track. Transform.* — as a secure Android-first personal fitness and multi-tenant gym-management platform. It must support independent fitness users as well as gym members, trainers, receptionists, gym administrators, and platform super administrators.

This is a real product, not a static UI demo or a CRUD exercise. Build usable workflows, database persistence, authenticated APIs, authorization, validation, error handling, tests, and release documentation.

## Required stack

- Mobile: React Native, Expo, Expo Router, TypeScript, Zustand, TanStack Query, React Hook Form, Zod, Expo SecureStore, Notifications, Camera, Image Picker.
- API: NestJS, REST `/api/v1`, PostgreSQL, Prisma, Redis/BullMQ, JWT access and rotating refresh tokens, Swagger, structured logs.
- Admin: Next.js, TypeScript, Tailwind, TanStack Query, React Hook Form and Zod.
- Repository: npm workspaces monorepo with `apps/mobile`, `apps/api`, `apps/admin`, and reusable packages.
- Database: Supabase PostgreSQL is suitable for free development/staging. Prisma remains the single API data-access layer; mobile clients never access protected business data directly.

## Product requirements

The member experience includes secure onboarding and assessment; fitness goals; workout plans, sessions, timers and exercise library; Somali and international food diary; verified calorie and macro data; meal planning; water, sleep, recovery and habits; progress; planner/reminders; challenges; gym membership, QR attendance and trainer bookings.

The gym experience includes gyms, branches, memberships, trainers, staff, subscriptions, attendance, invoices, payments, classes, reports, and permission-aware administration.

AI features include diet coach, workout coach, personal coach and food scanning. An AI must never invent nutrition facts, override allergies, diagnose a medical condition, recommend dangerous training/diets, or expose provider credentials. Food scans must show uncertainty, use verified food records, and require member confirmation before logging.

## Design direction

Use a premium dark fitness system: background `#101418`, surface `#151C22`, cards `#1B2229`, elevated surfaces `#232D35`, lime accent `#C5F36B`, primary text white, and restrained animation. Dark is default, with light and system options. Use Inter or a similarly readable font, a 4-point spacing scale, accessible hit targets and clear loading, empty, error and success states.

The mobile home screen should focus on one clear daily plan: today’s workout, nutrition target, hydration, upcoming action, progress and quick access to Coach/Scanner. Avoid fabricated metrics. English and Somali are first-class localization files; do not hard-code display text in components.

## Roles and access

Implement permissions rather than trusting role names alone. Members may only access their own private data. Trainers see only assigned clients. Receptionists may manage permitted membership and check-in operations but not private health/AI information. Gym admins are limited to their own gym/branches. Super admins manage platform-level settings and globally curated data. Never trust role, gym, branch or user IDs supplied by a client.

## Security and privacy non-negotiables

- No secret, service key, database URL, payment secret, or AI provider key may enter the mobile bundle, admin bundle, client logs, commits, screenshots or test fixtures.
- Hash passwords with Argon2id; keep short-lived access tokens in memory and refresh tokens in Expo SecureStore; rotate and revoke refresh tokens.
- Validate every input; enforce request/file size limits, rate limits, secure headers, CORS allowlists, MIME/content checks, and signed/private media access.
- Encrypt transport with HTTPS in production. Store health information and progress photos privately and do not log sensitive health values, conversations, passwords or tokens.
- Enforce tenant isolation in API services and queries. Financial writes use database transactions and idempotency protection. Record meaningful audit events.
- Provide consent, account deletion and user-data export. Store times in UTC and render in user local time.

## Deterministic fitness and nutrition rules

Fitness calculations (BMI informational only, BMR, TDEE, macro/water targets and progress) must be deterministic, versioned, and persist their inputs. Label estimates. Do not issue aggressive calorie targets; route pregnancy, medical conditions, eating disorders and other specialist needs to qualified care.

Nutrition totals come from food records, serving sizes, quantities and provenance—not LLM guesses. Seed Somali foods such as canjeero, bariis, suqaar, muufo, baasto, sambuus, malawax, kalluun, hilib ari/geel, digir, caano geel and muus alongside international foods.

## Delivery phases

1. Foundation: monorepo, environments, Prisma/Postgres, Docker, shared packages, CI and docs.
2. Design system, localization and protected navigation.
3. Authentication, verification, token rotation and permissions.
4. Profile, consent, assessment, body data and goals.
5. Versioned fitness engine.
6. Exercise reference database.
7. Workout plans, sessions, timers, history and offline recovery.
8. Verified food reference database and provenance.
9. Food diary, meal plans, hydration and nutrition summaries.
10. Safe, grounded AI Diet Coach.
11. Safe, grounded AI Workout Coach.
12. Secure food scanner, database matching and user confirmation.
13. Planner, habits and notifications.
14. Progress, reports, charts, challenges and achievements.
15. Gym, branch, membership, QR attendance, payment and invoice management.
16. Trainer clients, plans, availability and bookings.
17. Admin dashboard and reporting.
18. Production readiness: security review, backups, monitoring, performance, EAS release build and release documentation.

Do not mark a phase complete until its API, database changes, mobile/admin UI where relevant, states, authorization, tests, manual test instructions, limitations and dependencies are documented in `docs/phases/`.

## Working rules

1. Inspect the current repository before changing it. Preserve existing working features.
2. Work in small, independently verifiable slices. Never dump an uncontrolled whole application.
3. Maintain strict TypeScript. Prefer reusable components and explicit domain types.
4. Every feature has loading, empty, success, retry and error states as appropriate.
5. Keep mobile essential workouts functional offline; queue/retry synchronization. Clearly label online-only AI, image recognition and remote-payment behavior.
6. Add or update automated tests with each behavior change. Run focused checks before committing.
7. Update relevant API, database, architecture and phase documentation in the same change.
8. Use conventional commits. A logical change is committed and pushed to GitHub after it passes its checks. Do not create empty/noise commits solely to inflate contribution counts.
9. Use branches and pull requests for risky or multi-part changes. `main` must remain buildable.

## Definition of done

A completed feature is implemented end-to-end, permission-safe, localized, accessible, tested, documented, and committed/pushed. A completed release additionally has migration/rollback notes, environment variables documented, backups/monitoring configured, an Android AAB build, Play Store listing assets, privacy policy, security review and final owner approval.

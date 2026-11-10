# Roadmap and phase status

| Phase | Scope | Status |
| --- | --- | --- |
| 01 | Foundation & architecture: monorepo, Expo, NestJS, Next.js, PostgreSQL/Prisma schema, env config, shared packages, Docker, CI | ✅ complete |
| 02 | Design system & navigation: tokens, components, dark/light/system theme, EN/SO localisation, protected route groups | ⏳ |
| 03 | Authentication & authorization: register/login/verify/OTP/reset, refresh rotation, permissions, guards, admin login | ⏳ |
| 04 | Profile & onboarding: assessment wizard, measurements, health & diet preferences, consent, goals | ⏳ |
| 05 | Fitness engine: BMI/BMR/TDEE, calorie & macro targets, hydration, progress maths, versioning | ⏳ |
| 06 | Exercise database: categories, muscles, equipment, media, search & filters, seed | ⏳ |
| 07 | Workout system: plan generation, weekly schedule, session tracking, timers, history, PRs, offline recovery | ⏳ |
| 08 | Food database: Somali & international foods, ingredients, servings, provenance, seed | ⏳ |
| 09 | Nutrition tracking: diary, macros, meal planner, hydration, weekly reports | ⏳ |
| 10 | AI Diet Coach: provider abstraction, grounding, safety, quotas | ⏳ |
| 11 | AI Workout Coach | ⏳ |
| 12 | AI Food Scanner: camera, upload, vision, DB matching, confirmation | ⏳ |
| 13 | Daily planner, reminders, habits, notification preferences, push | ⏳ |
| 14 | Progress & analytics: weight, measurements, photos, charts, reports, challenges, achievements | ⏳ |
| 15 | Gym management: gyms, branches, members, plans, subscriptions, attendance (QR), payments, invoices | ⏳ |
| 16 | Trainer management: profiles, clients, assigned plans, bookings | ⏳ |
| 17 | Admin dashboard: all management screens, reports, permissions | ⏳ |
| 18 | Production readiness: security review, tests, performance, backups, monitoring, EAS build, release docs | ⏳ |

Each phase has a report in `docs/phases/` following the acceptance template (objective, scope, DB changes, backend, API, mobile, admin, validation, errors, tests, manual test, acceptance criteria, limitations, dependencies).

# Phase 03 — Authentication, Authorization and Account Security

## 1. Objective
Members can create an account, sign in, stay signed in securely, verify their email, and recover or change their password. Every API route is protected by default and authorised by permission codes.

## 2. Scope
- API: `auth` module (register, login, refresh, logout, verify, resend, forgot/reset/change password), `users/me` (read/update), global `JwtAuthGuard` + `PermissionsGuard`, console messaging provider.
- Mobile: login, register, forgot password, reset password and verify-email screens; auth gate routes unverified sign-ups to verification.
- Shared: new error codes (`INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, `ACCOUNT_DISABLED`, `OTP_INVALID`, `OTP_EXPIRED`); `resetPasswordSchema` now `{ email, code, password, confirmPassword }` to match the API.

## 3. Database changes
None to the schema. First migration `20261110130654_init` was generated from the Phase 01 schema. Uses `User`, `UserRole`, `RefreshToken`, `VerificationToken`, `AuditLog`, `UserProfile`.

## 4. Backend implementation
| Concern | Implementation |
|---|---|
| Passwords | argon2id (19 MiB, t=2). Unknown emails are verified against a dummy hash so timing does not reveal accounts. |
| Access tokens | HS256 JWT, `typ: access`, TTL `JWT_ACCESS_TTL` (default 15 min). User is reloaded each request, so disabling or role changes apply immediately. |
| Refresh tokens | Opaque 48-byte tokens, stored as HMAC-SHA256 (keyed with `JWT_REFRESH_SECRET`). Rotated on every use; reuse of a rotated token revokes the whole family. Conditional update prevents double-spend races. |
| Lockout | 5 failed logins → locked 15 min (`ACCOUNT_LOCKED`, 429). |
| Rate limits | Global 120/min; login/register/reset 10/min; forgot-password and resend 5/min. |
| OTP | 6-digit codes, HMAC-hashed, 10-minute expiry, 5 attempts, 60 s resend cooldown, previous codes invalidated. |
| Enumeration | `forgot-password` always returns `{ sent: true }`. |
| Session revocation | Password reset and password change revoke every refresh token. |
| Audit | register, login, failed login, lockout, reset request, reset, change. |
| Bootstrap admin | Emails in `BOOTSTRAP_SUPER_ADMIN_EMAILS` also get `SUPER_ADMIN` at registration. |

## 5. API
`POST /auth/register · /auth/login · /auth/refresh · /auth/logout · /auth/verify · /auth/verify/resend · /auth/forgot-password · /auth/reset-password · /auth/change-password`, `GET|PATCH /users/me`. Full schemas in Swagger at `/docs`.

## 6. Mobile implementation
`app/(auth)/login.tsx`, `register.tsx`, `forgot-password.tsx`, `reset-password.tsx`, `app/(app)/verify-email.tsx`; `src/components/form/FormInput.tsx` (react-hook-form + zod from `@gymova/shared-validation`, messages translated), `AuthHeader.tsx`, `useResendCountdown`. Error codes are mapped to English/Somali copy in `useApiErrorMessage`.

Also fixed while bringing the app up on Android: Metro could not resolve npm-nested Expo packages (`disableHierarchicalLookup` removed); missing app icons generated; splash screen now hides from an effect (the `onLayout` callback never fired on Android, leaving the splash covering the app); `babel-preset-expo` and `@expo-google-fonts/inter` added.

## 7. Admin implementation
None in this phase (admin user management uses these guards in a later phase).

## 8–9. Validation and error handling
DTOs mirror the zod rules and return i18n keys (`password.min`, `email.invalid`, …) so mobile shows the same localised message for client- and server-side failures.

## 10. Automated tests
- API unit: `permissions.guard.spec.ts`, `principal.service.spec.ts` (6 tests).
- API e2e: `test/auth.e2e-spec.ts` (12 scenarios: validation, register, duplicate, protected route, OTP wrong/right, refresh rotation + reuse detection, logout, identical errors, reset flow, profile update, lockout, rate limit) + health. 13/13 pass against PostgreSQL 17.
- Mobile: `useApiError.test.ts` (4 tests).

## 11. Manual test instructions
1. Start PostgreSQL, then in `apps/api`: `npx prisma migrate deploy && npm run db:seed`.
2. `npm run dev:api`. The OTP codes are printed in the API log (console provider).
3. `npm run dev:mobile`, open on the Android emulator (API URL `http://10.0.2.2:3000/api/v1`).
4. Get started → fill the form → accept terms → Create account → enter the code from the API log → Home.
5. Sign out/in, wrong password ×5 → lockout message, Forgot password → code → new password.

## 12. Visual review
Verified on Android emulator (Expo Go, SDK 54): register form, verify-email screen and tab shell render correctly in light theme.

## 13. Acceptance criteria
- [x] Register, login, refresh, logout, verify, reset, change password work end to end.
- [x] All routes protected unless `@Public()`; permission guard enforced.
- [x] Refresh-token reuse detection, lockout and rate limiting covered by tests.
- [x] Typecheck, unit, e2e and production builds pass.

## 14. Known limitations
- Email/SMS use the console provider; SMTP/SMS providers are not implemented (production logs a warning instead of sending).
- Avatar upload (`POST /users/me/avatar`) and account deletion arrive with the profile phase.
- Phone verification endpoint exists; there is no mobile screen for it yet.
- Throttling is in-memory (per instance); move to Redis storage before running multiple API instances.

## 15. Next phase dependencies
Phase 04 (onboarding assessment & profile) uses `onboardingCompletedAt`, `UserProfile` and the authenticated `api` client from this phase.

# Contributing to GYMOVA

## Source-of-truth workflow

GitHub is the source of truth. Every intentional, verified change must be committed and pushed; local-only feature work is not considered delivered.

1. Inspect `git status` and read the relevant phase document.
2. Make one coherent change. Include code, tests and documentation required by that change.
3. Run the smallest relevant checks, then `npm run check:secrets` for any environment/auth/upload/API change.
4. Commit with Conventional Commits, for example `feat(workouts): add session completion` or `fix(auth): reject expired refresh tokens`.
5. Push the branch promptly. Use a pull request for changes that need review; keep `main` releasable.

Do not publish credentials, `.env` files, API keys, real health data, private media, generated build artifacts, or empty commits. Contribution history must describe real product progress, not artificial activity.

## Required change record

For every feature or bug fix, update the relevant phase report or create one in `docs/phases/` with: objective, scope, database/API effects, validation/authorization, tests run, manual test steps, known limitations, and next dependencies.

## Quality gate

Run applicable commands from the repository root:

```bash
npm run check:secrets
npm run typecheck
npm test
npm run build
```

Run `npm run test:e2e` when API/database behavior changes and a test database is available.

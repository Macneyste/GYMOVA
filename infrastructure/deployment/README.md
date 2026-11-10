# Deployment

## Environments

| Environment | Purpose | Database | Notes |
| --- | --- | --- | --- |
| development | local laptops | Docker Postgres | `AI_PROVIDER=mock`, `STORAGE_DRIVER=local`, console email/SMS |
| staging | pre-release QA, Maestro runs | managed Postgres | real AI provider with low quotas, S3 bucket `gymova-staging` |
| production | live | managed Postgres with PITR | secrets from the platform secret manager, Redis required |

Each environment has its own `apps/api/.env.<env>` created from `.env.example`. Secrets are never committed.

## API

1. Build image: `docker build -f infrastructure/docker/api.Dockerfile -t gymova-api:<sha> .`
2. Run migrations as part of start-up (`prisma migrate deploy` in the image CMD) or as a release step.
3. Health probe: `GET /api/v1/health` (returns 503 when the database is unreachable).
4. Required env: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `QR_TOKEN_SECRET`, `CORS_ORIGINS`, `REDIS_URL`, S3 settings, `AI_PROVIDER=anthropic` + `ANTHROPIC_API_KEY`.

## Admin

`docker build -f infrastructure/docker/admin.Dockerfile --build-arg NEXT_PUBLIC_API_URL=https://api.<domain>/api/v1 -t gymova-admin:<sha> .`

## Mobile (Android)

See `apps/mobile/README.md` for EAS build profiles (`preview` APK for testers, `production` AAB for Play Store).

## Backups

See `backup.md`.

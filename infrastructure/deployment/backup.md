# Database backup and recovery

## Strategy

- **Managed PostgreSQL** (recommended): enable automated daily snapshots with 30-day retention and point-in-time recovery (WAL archiving).
- **Self-hosted**: nightly logical dump plus hourly WAL shipping.

```bash
# nightly logical backup (cron, UTC 02:00)
pg_dump "$DATABASE_URL" --format=custom --no-owner --file="gymova-$(date -u +%F).dump"
# upload to object storage with server-side encryption and a 30-day lifecycle rule
aws s3 cp "gymova-$(date -u +%F).dump" "s3://gymova-backups/postgres/" --sse AES256
```

## Object storage

Progress photos and scan images live in the `gymova` bucket under `users/<userId>/…`. Enable bucket versioning and cross-region replication for production.

## Restore drill (quarterly)

1. Provision an empty database.
2. `pg_restore --clean --if-exists --no-owner -d "$RESTORE_URL" gymova-<date>.dump`
3. Run `npm run db:deploy` to confirm migrations are in sync.
4. Start the API against the restored database and run `npm run test:e2e`.
5. Record the duration and any gaps in `docs/phases/phase-18-production-readiness.md`.

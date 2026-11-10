#!/usr/bin/env bash
# One-shot development bootstrap. Run from the repository root: bash scripts/dev-setup.sh
set -euo pipefail

cd "$(dirname "$0")/.."

echo "▶ Installing workspaces"
npm install

if [ ! -f apps/api/.env ]; then
  echo "▶ Creating apps/api/.env with random secrets"
  cp apps/api/.env.example apps/api/.env
  gen() { node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"; }
  sed -i.bak "s#^JWT_ACCESS_SECRET=.*#JWT_ACCESS_SECRET=\"$(gen)\"#" apps/api/.env
  sed -i.bak "s#^JWT_REFRESH_SECRET=.*#JWT_REFRESH_SECRET=\"$(gen)\"#" apps/api/.env
  sed -i.bak "s#^QR_TOKEN_SECRET=.*#QR_TOKEN_SECRET=\"$(gen)\"#" apps/api/.env
  rm -f apps/api/.env.bak
fi

[ -f apps/admin/.env.local ] || cp apps/admin/.env.example apps/admin/.env.local

if command -v docker >/dev/null 2>&1; then
  echo "▶ Starting PostgreSQL, Redis and MinIO"
  npm run docker:up
  echo "▶ Waiting for PostgreSQL"
  for i in $(seq 1 30); do
    docker exec gymova-postgres pg_isready -U gymova -d gymova >/dev/null 2>&1 && break
    sleep 1
  done
else
  echo "⚠ Docker not found — make sure DATABASE_URL in apps/api/.env points to a running PostgreSQL 16."
fi

echo "▶ Prisma generate + migrate + seed"
npm run db:generate
npm run db:migrate -- --name init || npm run db:deploy
npm run db:seed

echo "✓ Done. Start the API with: npm run dev:api"

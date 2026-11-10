# Multi-stage build for the GYMOVA API. Build from the repository root:
#   docker build -f infrastructure/docker/api.Dockerfile -t gymova-api .
FROM node:20-alpine AS deps
WORKDIR /repo
RUN apk add --no-cache python3 make g++ openssl
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/
COPY packages/design-tokens/package.json packages/design-tokens/
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/shared-validation/package.json packages/shared-validation/
COPY packages/fitness-engine/package.json packages/fitness-engine/
COPY packages/api-client/package.json packages/api-client/
RUN npm ci --ignore-scripts --workspace @gymova/api --workspace @gymova/shared-types --workspace @gymova/fitness-engine --workspace @gymova/design-tokens --workspace @gymova/shared-validation --workspace @gymova/api-client

FROM deps AS build
COPY tsconfig.base.json ./
COPY packages ./packages
COPY apps/api ./apps/api
RUN npm run build -w @gymova/design-tokens -w @gymova/shared-types -w @gymova/shared-validation -w @gymova/fitness-engine -w @gymova/api-client \
 && npx prisma generate --schema apps/api/prisma/schema.prisma \
 && npm run build -w @gymova/api

FROM node:20-alpine AS runtime
WORKDIR /repo
ENV NODE_ENV=production
RUN apk add --no-cache openssl
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages ./packages
COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY --from=build /repo/apps/api/prisma ./apps/api/prisma
COPY --from=build /repo/apps/api/package.json ./apps/api/package.json
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:3000/api/v1/health || exit 1
CMD ["sh", "-c", "npx prisma migrate deploy --schema apps/api/prisma/schema.prisma && node apps/api/dist/main.js"]

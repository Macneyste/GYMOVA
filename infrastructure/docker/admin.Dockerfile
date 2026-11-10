# Build from the repository root:
#   docker build -f infrastructure/docker/admin.Dockerfile --build-arg NEXT_PUBLIC_API_URL=https://api.example.com/api/v1 -t gymova-admin .
FROM node:20-alpine AS build
WORKDIR /repo
ARG NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY package.json package-lock.json* tsconfig.base.json ./
COPY packages ./packages
COPY apps/admin ./apps/admin
RUN npm ci --ignore-scripts --workspace @gymova/admin --workspace @gymova/shared-types --workspace @gymova/design-tokens --workspace @gymova/shared-validation --workspace @gymova/api-client --workspace @gymova/fitness-engine \
 && npm run build:packages \
 && npm run build -w @gymova/admin

FROM node:20-alpine AS runtime
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages ./packages
COPY --from=build /repo/apps/admin/.next ./apps/admin/.next
COPY --from=build /repo/apps/admin/public ./apps/admin/public
COPY --from=build /repo/apps/admin/package.json ./apps/admin/package.json
COPY --from=build /repo/apps/admin/next.config.ts ./apps/admin/next.config.ts
EXPOSE 3001
CMD ["npm", "run", "start", "-w", "@gymova/admin"]

FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Install dependencies
FROM base AS deps
COPY package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN npm install --workspace=apps/api --workspace=packages/shared

# Build shared
FROM deps AS builder
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
COPY prisma ./prisma
RUN npm run build --workspace=packages/shared
RUN cd apps/api && npx tsc

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 apiuser

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/prisma ./prisma
COPY apps/api/package.json ./

RUN mkdir -p logs && chown -R apiuser:nodejs logs

USER apiuser
EXPOSE 4000

CMD ["node", "dist/index.js"]

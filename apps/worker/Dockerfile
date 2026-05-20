FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS deps
COPY package.json ./
COPY apps/worker/package.json ./apps/worker/
RUN npm install --workspace=apps/worker

FROM deps AS builder
COPY apps/worker ./apps/worker
COPY prisma ./prisma
RUN cd apps/worker && npx tsc

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 workeruser

COPY --from=builder /app/apps/worker/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/worker/node_modules ./apps/worker/node_modules
COPY --from=builder /app/prisma ./prisma
COPY apps/worker/package.json ./

USER workeruser
CMD ["node", "dist/index.js"]

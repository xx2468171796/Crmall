# ============================================
# TWCRM — Multi-stage Docker Build
# ============================================

# --- Base ---
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.30.2 --activate
WORKDIR /app

# --- Install & Build ---
FROM base AS builder
COPY . .
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @twcrm/db generate

ENV NEXT_TELEMETRY_DISABLED=1
# Dummy DATABASE_URL for build-time page data collection (not used at runtime)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public"
ENV AUTH_SECRET="build-time-placeholder"
RUN pnpm --filter portal build

# --- Runner ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder /app/apps/portal/.next/standalone ./
COPY --from=builder /app/apps/portal/.next/static ./apps/portal/.next/static
COPY --from=builder /app/apps/portal/public ./apps/portal/public

USER nextjs
EXPOSE 3000
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

CMD ["node", "apps/portal/server.js"]

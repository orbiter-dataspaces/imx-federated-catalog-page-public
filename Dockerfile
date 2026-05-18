# Use Node.js 22 LTS as base image
FROM node:22-alpine AS base
RUN corepack enable

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package and lock files (pnpm)
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm (lockfile currently out of sync, allow update)
RUN pnpm install --no-frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
# Copy application source first, then overlay dependency tree to avoid symlink/directory conflicts
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Build the Next.js application
RUN pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

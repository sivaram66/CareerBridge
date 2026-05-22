# ── Runtime base ────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app

# ── Production deps only ─────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
# Use npm install if no lockfile, npm ci if lockfile exists
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# ── Full install + TypeScript build ──────────────────────
FROM base AS builder
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY . .
RUN npm run build

# ── Lean production image ─────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 5000

CMD ["node", "dist/server.js"]

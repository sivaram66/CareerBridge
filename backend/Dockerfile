# ── Runtime ─────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app

# ── Dependencies ─────────────────────────────────────────
FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev

# ── Builder (compile TypeScript → JS) ────────────────────
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Production image ──────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production

# Copy compiled JS + production node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 5000

CMD ["node", "dist/server.js"]

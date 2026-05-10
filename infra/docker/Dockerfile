# ── Stage 1: Build Angular ───────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /build

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build:prod

# ── Stage 2: Nginx ───────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Copiar configuración nginx custom
COPY infra/docker/nginx.conf /etc/nginx/nginx.conf

# Copiar build Angular
COPY --from=builder /build/dist/fintra-financiero-frontend/browser /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

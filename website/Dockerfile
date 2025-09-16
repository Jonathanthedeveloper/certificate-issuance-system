# -----------------------------
# Build stage
# -----------------------------
FROM oven/bun:1.2.9 AS builder
WORKDIR /app

# Install OS dependencies needed by Prisma
RUN apt-get update -y && apt-get install -y openssl ca-certificates --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Copy manifest files for better caching
COPY package.json bun.lock ./

# Install dependencies (allow bun to update lockfile if necessary inside container)
RUN bun install

# Copy source code
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Set build-time database URL (will be overridden at runtime)
ENV DATABASE_URL="mysql://root:example@db:3306/certdb"

# Build Next.js app
RUN bun run build

# -----------------------------
# Runtime stage
# -----------------------------
FROM oven/bun:1.2.9-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV DATABASE_URL="mysql://root:example@db:3306/certdb"

# Create non-root user for security
RUN addgroup --gid 1001 appgroup && adduser --uid 1001 --gid 1001 --disabled-password --gecos "" appuser

# Install runtime dependencies
RUN apt-get update -y && apt-get install -y openssl ca-certificates curl netcat-openbsd --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Copy necessary files from builder
COPY --from=builder --chown=appuser:appgroup /app/.next ./.next
COPY --from=builder --chown=appuser:appgroup /app/public ./public
COPY --from=builder --chown=appuser:appgroup /app/package.json ./package.json
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/prisma ./prisma
COPY --from=builder --chown=appuser:appgroup /app/lib ./lib

# Copy entrypoint script and make executable
COPY --from=builder /app/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set proper permissions
RUN chown -R appuser:appgroup /app && chmod -R 750 /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Healthcheck endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["bun", "run", "start"]
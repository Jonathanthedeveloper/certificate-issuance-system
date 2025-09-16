#!/usr/bin/env bash
set -euo pipefail

# Wait for MySQL to become available
host="db"
port=3306

echo "Waiting for MySQL at ${host}:${port}..."
retries=30
until nc -z ${host} ${port}; do
  retries=$((retries-1))
  if [ $retries -le 0 ]; then
    echo "MySQL did not become available in time"
    exit 1
  fi
  sleep 1
done

echo "MySQL is available - running prisma db push and generate"

# Push Prisma schema to the database (suitable for dev or provider changes)
# Use --accept-data-loss if you understand potential data loss when altering schema
bunx prisma db push --schema=./prisma/schema.prisma

# Generate Prisma client
bunx prisma generate --schema=./prisma/schema.prisma

# Start the app (passed as CMD)
exec "$@"

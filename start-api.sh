#!/bin/bash
# start-api.sh
set -e

echo "🚀 Starting Veltrix API Server..."

# Remove any build-time placeholder .env
rm -f .env

# Check if DATABASE_URL is present in the environment
if [ -z "$DATABASE_URL" ] || [ "$DATABASE_URL" = "postgresql://placeholder:placeholder@localhost:5432/placeholder" ]; then
  echo "⚠️ WARNING: DATABASE_URL is not set or contains the placeholder. Skipping database migrations."
else
  echo "📦 Database URL is present. Running Prisma migrations..."
  npx prisma migrate deploy --schema=prisma/schema.prisma || echo "⚠️ Prisma migration failed, starting API server anyway."
fi

echo "🟢 Booting API process..."
node apps/api/dist/index.js

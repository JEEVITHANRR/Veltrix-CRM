#!/bin/bash
# start-api.sh
set -e

echo "🚀 Starting Veltrix API Server..."

# Remove any build-time placeholder .env
rm -f .env

# Use DIRECT_URL for migrations if available (pooler URLs don't support DDL/migrations)
MIGRATION_URL="${DIRECT_URL:-$DATABASE_URL}"

# Check if DATABASE_URL is present in the environment
if [ -z "$MIGRATION_URL" ] || [ "$MIGRATION_URL" = "postgresql://placeholder:placeholder@localhost:5432/placeholder" ]; then
  echo "⚠️ WARNING: DATABASE_URL is not set or contains the placeholder. Skipping database migrations."
else
  echo "📦 Database URL is present. Running Prisma migrations..."
  
  MAX_RETRIES=3
  RETRY_COUNT=0
  MIGRATION_SUCCESS=false

  while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if DATABASE_URL="$MIGRATION_URL" npx prisma migrate deploy --schema=prisma/schema.prisma; then
      MIGRATION_SUCCESS=true
      echo "✅ Prisma migrations applied successfully!"
      break
    else
      RETRY_COUNT=$((RETRY_COUNT+1))
      echo "⚠️ Migration attempt $RETRY_COUNT failed. Retrying in 5 seconds..."
      sleep 5
    fi
  done

  if [ "$MIGRATION_SUCCESS" = "false" ]; then
    echo "⚠️ WARNING: Prisma migration failed after $MAX_RETRIES attempts. Starting API anyway (tables may already exist)."
  fi
fi

echo "🟢 Booting API process..."
node apps/api/dist/index.js

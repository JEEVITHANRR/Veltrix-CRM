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
  
  MAX_RETRIES=6
  RETRY_COUNT=0
  MIGRATION_SUCCESS=false

  while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if npx prisma migrate deploy --schema=prisma/schema.prisma; then
      MIGRATION_SUCCESS=true
      echo "✅ Prisma migrations applied successfully!"
      break
    else
      RETRY_COUNT=$((RETRY_COUNT+1))
      echo "⚠️ Migration attempt $RETRY_COUNT failed. Database might still be booting. Retrying in 10 seconds..."
      sleep 10
    fi
  done

  if [ "$MIGRATION_SUCCESS" = "false" ]; then
    echo "❌ ERROR: Prisma migration failed after $MAX_RETRIES attempts. Exiting so container restarts."
    exit 1
  fi
fi

echo "🟢 Booting API process..."
node apps/api/dist/index.js

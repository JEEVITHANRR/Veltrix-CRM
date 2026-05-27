#!/bin/bash
# start-api.sh — Production startup script for Veltrix API
set -e

echo "🚀 Starting Veltrix API Server..."
echo "📋 Node version: $(node --version)"
echo "📋 Environment: ${NODE_ENV:-development}"

# Remove any build-time placeholder .env
rm -f .env

# ─── Set DIRECT_URL if not already set ──────────────────────
# Prisma schema uses directUrl = env("DIRECT_URL") for migrations.
# If DIRECT_URL is not set, default to DATABASE_URL.
export DIRECT_URL="${DIRECT_URL:-$DATABASE_URL}"

# ─── Database Schema Sync ──────────────────────────────────
# Use DIRECT_URL for schema operations (direct connection, not pooler)
SCHEMA_URL="$DIRECT_URL"

if [ -z "$DATABASE_URL" ] || echo "$DATABASE_URL" | grep -q "placeholder"; then
  echo "⚠️ WARNING: DATABASE_URL not set. Skipping database setup."
else
  echo "📦 Syncing database schema..."
  
  # Use prisma db push — idempotent, compares schema.prisma to actual DB
  MAX_RETRIES=3
  RETRY=0
  SUCCESS=false

  while [ $RETRY -lt $MAX_RETRIES ]; do
    if DATABASE_URL="$SCHEMA_URL" DIRECT_URL="$SCHEMA_URL" npx prisma db push --schema=prisma/schema.prisma --accept-data-loss 2>&1; then
      SUCCESS=true
      echo "✅ Database schema synced successfully!"
      break
    else
      RETRY=$((RETRY+1))
      echo "⚠️ Schema sync attempt $RETRY/$MAX_RETRIES failed. Retrying in 5s..."
      sleep 5
    fi
  done

  if [ "$SUCCESS" = "false" ]; then
    echo "❌ Database schema sync failed after $MAX_RETRIES attempts."
    echo "⚠️ Starting API anyway — tables should already exist."
  fi
  
  # Regenerate Prisma client
  npx prisma generate --schema=prisma/schema.prisma 2>&1 || true
fi

# ─── Print diagnostic info ──────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Veltrix API — Startup Diagnostics"
echo "═══════════════════════════════════════════════════════"
DB_SAFE=$(echo "$DATABASE_URL" | sed 's/:[^@]*@/:***@/g' | head -c 80)
echo "  DATABASE_URL: ${DB_SAFE}..."
echo "  DIRECT_URL:   ${DIRECT_URL:+SET}${DIRECT_URL:-NOT SET}"
echo "  REDIS_URL:    ${REDIS_URL:-NOT SET (AI queue disabled)}"
echo "  PORT:         ${PORT:-4000}"
echo "  CORS_ORIGIN:  ${CORS_ORIGIN:-http://localhost:3000}"
echo "  JWT_SECRET:   ${JWT_SECRET:+SET}${JWT_SECRET:-NOT SET ⚠️}"
echo "═══════════════════════════════════════════════════════"
echo ""

echo "🟢 Booting API process..."
node apps/api/dist/index.js

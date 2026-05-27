#!/bin/bash
# start-api.sh — Production startup script for Veltrix API
set -e

echo "🚀 Starting Veltrix API Server..."
echo "📋 Node version: $(node --version)"
echo "📋 Environment: ${NODE_ENV:-development}"

# Remove any build-time placeholder .env
rm -f .env

# ─── Fix Supabase Pooler URL ────────────────────────────────
# Pooler URLs (port 6543) don't support DDL and cause "Tenant or user not found" errors.
# Convert them to direct connections (port 5432).

fix_supabase_url() {
  local url="$1"
  
  if echo "$url" | grep -q "pooler.supabase.com:6543"; then
    # Extract project ref from username (format: postgres.PROJECT_REF)
    local PROJECT_REF=$(echo "$url" | sed -n 's|.*postgresql://postgres\.\([^:]*\):.*|\1|p')
    local PASSWORD=$(echo "$url" | sed -n 's|.*postgresql://[^:]*:\([^@]*\)@.*|\1|p')
    local DATABASE=$(echo "$url" | sed -n 's|.*/\([^?]*\).*|\1|p')
    
    if [ -n "$PROJECT_REF" ] && [ -n "$PASSWORD" ]; then
      echo "postgresql://postgres:${PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/${DATABASE}"
      return 0
    fi
  fi
  
  echo "$url"
}

if echo "$DATABASE_URL" | grep -q "pooler.supabase.com"; then
  FIXED_URL=$(fix_supabase_url "$DATABASE_URL")
  export DATABASE_URL="$FIXED_URL"
  echo "✅ Converted pooler URL to direct connection"
fi

# Use DIRECT_URL for schema operations if available
SCHEMA_URL="${DIRECT_URL:-$DATABASE_URL}"
if echo "$SCHEMA_URL" | grep -q "pooler.supabase.com"; then
  SCHEMA_URL=$(fix_supabase_url "$SCHEMA_URL")
fi

# ─── Database Schema Sync ──────────────────────────────────
if [ -z "$DATABASE_URL" ] || echo "$DATABASE_URL" | grep -q "placeholder"; then
  echo "⚠️ WARNING: DATABASE_URL not set. Skipping database setup."
else
  echo "📦 Syncing database schema..."
  
  # Use prisma db push — it's idempotent and doesn't need migration files.
  # It compares the schema.prisma to the actual DB and applies changes.
  MAX_RETRIES=3
  RETRY=0
  SUCCESS=false

  while [ $RETRY -lt $MAX_RETRIES ]; do
    if DATABASE_URL="$SCHEMA_URL" npx prisma db push --schema=prisma/schema.prisma --accept-data-loss 2>&1; then
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
    echo "⚠️ Starting API anyway — endpoints may fail if tables don't exist."
  fi
  
  # Also generate the Prisma client (in case it's stale)
  DATABASE_URL="$SCHEMA_URL" npx prisma generate --schema=prisma/schema.prisma 2>&1 || true
fi

# ─── Print diagnostic info ──────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Veltrix API — Startup Diagnostics"
echo "═══════════════════════════════════════════════════════"
echo "  DATABASE_URL: ${DATABASE_URL:0:50}..."
echo "  REDIS_URL:    ${REDIS_URL:-NOT SET (AI queue disabled)}"
echo "  PORT:         ${PORT:-4000}"
echo "  CORS_ORIGIN:  ${CORS_ORIGIN:-http://localhost:3000}"
echo "  JWT_SECRET:   ${JWT_SECRET:+SET}${JWT_SECRET:-NOT SET ⚠️}"
echo "═══════════════════════════════════════════════════════"
echo ""

echo "🟢 Booting API process..."
node apps/api/dist/index.js

#!/bin/bash
set -e

echo "🚀 Deploying Sprint 2 Migrations..."

# Extract credentials from .env.local
PGPASSWORD=$(grep "^PGPASSWORD=" .env.local | cut -d'=' -f2 | tr -d '"' | tr -d "'")
PGHOST=$(grep "^PGHOST=" .env.local | cut -d'=' -f2 | tr -d '"' | tr -d "'")
PGPORT=$(grep "^PGPORT=" .env.local | cut -d'=' -f2 | tr -d '"' | tr -d "'")
PGUSER=$(grep "^PGUSER=" .env.local | cut -d'=' -f2 | tr -d '"' | tr -d "'")
PGDATABASE=$(grep "^PGDATABASE=" .env.local | cut -d'=' -f2 | tr -d '"' | tr -d "'")

echo "📦 Database: $PGDATABASE"
echo "🖥️  Host: $PGHOST"
echo "🔑 Password loaded: ${#PGPASSWORD} characters"

# Deploy using psql
export PGPASSWORD

echo "🔄 Executing migrations..."
psql \
  -h "$PGHOST" \
  -p "$PGPORT" \
  -U "$PGUSER" \
  -d "$PGDATABASE" \
  -f deploy_sprint2_direct.sql

echo "✅ Migrations deployed successfully!"

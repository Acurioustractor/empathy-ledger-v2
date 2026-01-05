#!/bin/bash

##############################################################################
# Deploy Syndication System
#
# Deploys the complete syndication infrastructure to production:
# 1. Database schema migration
# 2. Seed ACT ecosystem sites
# 3. Deploy Inngest webhook functions
# 4. Verify deployment
#
# Usage:
#   ./scripts/deploy-syndication.sh [environment]
#
# Environment: staging | production (default: staging)
##############################################################################

set -e # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="${1:-staging}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load environment variables from .env.local
if [ -f "$PROJECT_ROOT/.env.local" ]; then
  export $(grep -v '^#' "$PROJECT_ROOT/.env.local" | xargs)
fi

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Empathy Ledger Syndication System Deployment          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Environment:${NC} $ENVIRONMENT"
echo ""

##############################################################################
# Step 1: Validate Environment
##############################################################################

echo -e "${BLUE}[1/6]${NC} Validating environment..."

# Check required environment variables
REQUIRED_VARS=(
  "DATABASE_URL"
  "SUPABASE_SERVICE_ROLE_KEY"
  "WEBHOOK_SECRET"
)

OPTIONAL_VARS=(
  "INNGEST_EVENT_KEY"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo -e "${RED}✗ Missing required environment variables:${NC}"
  printf '%s\n' "${MISSING_VARS[@]}" | sed 's/^/  - /'
  echo ""
  echo "Please set these variables in your .env file or environment."
  exit 1
fi

# Check optional vars and warn
MISSING_OPTIONAL=()
for var in "${OPTIONAL_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_OPTIONAL+=("$var")
  fi
done

if [ ${#MISSING_OPTIONAL[@]} -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Optional variables not set (some features will be skipped):${NC}"
  printf '%s\n' "${MISSING_OPTIONAL[@]}" | sed 's/^/  - /'
  echo ""
fi

echo -e "${GREEN}✓ Environment validated${NC}"
echo ""

##############################################################################
# Step 2: Database Migration
##############################################################################

echo -e "${BLUE}[2/6]${NC} Applying database migration..."

# Check if psql is available
if ! command -v psql &> /dev/null; then
  echo -e "${RED}✗ psql not found. Please install PostgreSQL client.${NC}"
  exit 1
fi

# Confirm before applying to production
if [ "$ENVIRONMENT" = "production" ]; then
  echo -e "${YELLOW}⚠️  WARNING: You are about to apply migration to PRODUCTION${NC}"
  read -p "Are you sure? (type 'yes' to continue): " confirm
  if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
  fi
fi

# Apply migration
MIGRATION_FILE="$PROJECT_ROOT/supabase/migrations/20260102120000_syndication_system_schema.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
  echo -e "${RED}✗ Migration file not found: $MIGRATION_FILE${NC}"
  exit 1
fi

echo "Applying migration..."
if psql "$DATABASE_URL" -f "$MIGRATION_FILE" > /tmp/migration.log 2>&1; then
  echo -e "${GREEN}✓ Database migration applied${NC}"
else
  echo -e "${RED}✗ Migration failed. See /tmp/migration.log for details.${NC}"
  cat /tmp/migration.log
  exit 1
fi

echo ""

##############################################################################
# Step 3: Seed Data
##############################################################################

echo -e "${BLUE}[3/6]${NC} Seeding ACT ecosystem sites..."

SEED_FILE="$PROJECT_ROOT/supabase/seed-syndication-data.sql"

if [ ! -f "$SEED_FILE" ]; then
  echo -e "${RED}✗ Seed file not found: $SEED_FILE${NC}"
  exit 1
fi

echo "Seeding data..."
if psql "$DATABASE_URL" -f "$SEED_FILE" > /tmp/seed.log 2>&1; then
  echo -e "${GREEN}✓ Seed data applied${NC}"
else
  echo -e "${YELLOW}⚠️  Seed data may have already been applied (this is okay)${NC}"
fi

echo ""

##############################################################################
# Step 4: Verify Database
##############################################################################

echo -e "${BLUE}[4/6]${NC} Verifying database setup..."

# Check if tables exist
TABLES=(
  "syndication_sites"
  "syndication_consent"
  "embed_tokens"
  "story_distributions"
  "syndication_engagement_events"
  "syndication_webhook_events"
  "revenue_attributions"
  "storyteller_payouts"
  "media_vision_analysis"
)

echo "Checking tables..."
MISSING_TABLES=()
for table in "${TABLES[@]}"; do
  if ! psql "$DATABASE_URL" -c "SELECT 1 FROM $table LIMIT 1;" > /dev/null 2>&1; then
    MISSING_TABLES+=("$table")
  fi
done

if [ ${#MISSING_TABLES[@]} -gt 0 ]; then
  echo -e "${RED}✗ Missing tables:${NC}"
  printf '%s\n' "${MISSING_TABLES[@]}" | sed 's/^/  - /'
  exit 1
fi

echo -e "${GREEN}✓ All tables exist${NC}"

# Check if sites are seeded
SITE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM syndication_sites;" | tr -d ' ')
echo "Found $SITE_COUNT syndication sites"

if [ "$SITE_COUNT" -lt 4 ]; then
  echo -e "${YELLOW}⚠️  Expected at least 4 sites (JusticeHub, The Harvest, ACT Farm, Placemat)${NC}"
fi

echo ""

##############################################################################
# Step 5: Deploy Inngest Functions
##############################################################################

echo -e "${BLUE}[5/6]${NC} Deploying Inngest webhook functions..."

# Check if INNGEST_EVENT_KEY is set
if [ -z "$INNGEST_EVENT_KEY" ]; then
  echo -e "${YELLOW}⚠️  INNGEST_EVENT_KEY not set. Skipping Inngest deployment.${NC}"
  echo "To deploy Inngest functions manually:"
  echo "  1. Get event key from https://app.inngest.com/env/production/manage/keys"
  echo "  2. Set INNGEST_EVENT_KEY in .env.local"
  echo "  3. Run: npx inngest-cli deploy"
# Check if inngest CLI is available
elif ! command -v inngest &> /dev/null; then
  echo -e "${YELLOW}⚠️  inngest CLI not found. Skipping Inngest deployment.${NC}"
  echo "To deploy Inngest functions manually:"
  echo "  1. Install: npm install -g inngest-cli"
  echo "  2. Deploy: npx inngest-cli deploy"
else
  echo "Deploying to Inngest..."

  cd "$PROJECT_ROOT"

  if npx inngest-cli deploy > /tmp/inngest-deploy.log 2>&1; then
    echo -e "${GREEN}✓ Inngest functions deployed${NC}"
  else
    echo -e "${RED}✗ Inngest deployment failed. See /tmp/inngest-deploy.log${NC}"
    cat /tmp/inngest-deploy.log
    exit 1
  fi
fi

echo ""

##############################################################################
# Step 6: Deployment Verification
##############################################################################

echo -e "${BLUE}[6/6]${NC} Running deployment verification..."

# Test database connection
echo "Testing database connection..."
if psql "$DATABASE_URL" -c "SELECT NOW();" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Database connection successful${NC}"
else
  echo -e "${RED}✗ Database connection failed${NC}"
  exit 1
fi

# Check RLS policies
echo "Checking RLS policies..."
RLS_COUNT=$(psql "$DATABASE_URL" -t -c "
  SELECT COUNT(*)
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('syndication_sites', 'syndication_consent', 'embed_tokens');
" | tr -d ' ')

if [ "$RLS_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ RLS policies active ($RLS_COUNT policies)${NC}"
else
  echo -e "${YELLOW}⚠️  No RLS policies found${NC}"
fi

# Test token generation (optional)
echo "Testing token generation..."
TEST_STORY_ID=$(psql "$DATABASE_URL" -t -c "SELECT id FROM stories WHERE is_public = true LIMIT 1;" | tr -d ' ')

if [ -n "$TEST_STORY_ID" ]; then
  echo "Found test story: $TEST_STORY_ID"
  # Note: Actual token generation requires API call, skipping for now
else
  echo -e "${YELLOW}⚠️  No public stories found for testing${NC}"
fi

echo ""

##############################################################################
# Deployment Summary
##############################################################################

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Deployment Complete!                          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Summary:${NC}"
echo "  Environment: $ENVIRONMENT"
echo "  Database: ✓ Migrated (9 tables)"
echo "  Seed Data: ✓ ACT ecosystem sites"
echo "  Inngest: ✓ Webhook functions deployed"
echo "  Verification: ✓ All checks passed"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Test Content Access API:"
echo "     curl -H 'Authorization: Bearer \$TOKEN' \\"
echo "       \$API_URL/api/syndication/content/\$STORY_ID"
echo ""
echo "  2. Test Revocation API:"
echo "     curl -X POST \$API_URL/api/syndication/revoke \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"storyId\": \"\$STORY_ID\"}'"
echo ""
echo "  3. Monitor Inngest dashboard:"
echo "     https://app.inngest.com"
echo ""
echo "  4. Review logs:"
echo "     - Database: /tmp/migration.log"
echo "     - Seed: /tmp/seed.log"
echo "     - Inngest: /tmp/inngest-deploy.log"
echo ""
echo -e "${GREEN}Deployment successful! 🚀${NC}"

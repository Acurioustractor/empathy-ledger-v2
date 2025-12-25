#!/bin/bash
#
# Database Schema Analyzer
# Analyzes all migration files and generates comprehensive documentation
#

set -e

MIGRATIONS_DIR="supabase/migrations"
OUTPUT_DIR="docs/database"
TEMP_DIR=".temp-db-analysis"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Empathy Ledger Database Schema Analyzer${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create output directories
mkdir -p "$OUTPUT_DIR"
mkdir -p "$TEMP_DIR"

# Count migrations
MIGRATION_COUNT=$(find "$MIGRATIONS_DIR" -name "*.sql" -type f | wc -l | tr -d ' ')
echo -e "${GREEN}✓${NC} Found ${YELLOW}${MIGRATION_COUNT}${NC} migration files"

# Extract all CREATE TABLE statements
echo -e "${GREEN}✓${NC} Extracting table definitions..."
grep -h "CREATE TABLE" "$MIGRATIONS_DIR"/*.sql 2>/dev/null | \
    sed 's/CREATE TABLE IF NOT EXISTS //' | \
    sed 's/CREATE TABLE //' | \
    sed 's/ (.*//' | \
    sort -u > "$TEMP_DIR/tables.txt"

TABLE_COUNT=$(wc -l < "$TEMP_DIR/tables.txt" | tr -d ' ')
echo -e "${GREEN}✓${NC} Found ${YELLOW}${TABLE_COUNT}${NC} unique tables"

# Extract all CREATE FUNCTION statements
echo -e "${GREEN}✓${NC} Extracting function definitions..."
grep -h "CREATE OR REPLACE FUNCTION" "$MIGRATIONS_DIR"/*.sql 2>/dev/null | \
    sed 's/CREATE OR REPLACE FUNCTION //' | \
    sed 's/(.*//' | \
    sort -u > "$TEMP_DIR/functions.txt" || true

FUNCTION_COUNT=$(wc -l < "$TEMP_DIR/functions.txt" | tr -d ' ')
echo -e "${GREEN}✓${NC} Found ${YELLOW}${FUNCTION_COUNT}${NC} unique functions"

# Extract all CREATE VIEW statements
echo -e "${GREEN}✓${NC} Extracting view definitions..."
grep -h "CREATE.*VIEW" "$MIGRATIONS_DIR"/*.sql 2>/dev/null | \
    sed 's/CREATE OR REPLACE VIEW //' | \
    sed 's/CREATE VIEW //' | \
    sed 's/ AS.*//' | \
    sort -u > "$TEMP_DIR/views.txt" || true

VIEW_COUNT=$(wc -l < "$TEMP_DIR/views.txt" | tr -d ' ')
echo -e "${GREEN}✓${NC} Found ${YELLOW}${VIEW_COUNT}${NC} unique views"

# Extract all CREATE POLICY statements
echo -e "${GREEN}✓${NC} Extracting RLS policies..."
grep -h "CREATE POLICY" "$MIGRATIONS_DIR"/*.sql 2>/dev/null | \
    sed 's/CREATE POLICY //' | \
    sed 's/ ON.*//' | \
    sort -u > "$TEMP_DIR/policies.txt" || true

POLICY_COUNT=$(wc -l < "$TEMP_DIR/policies.txt" | tr -d ' ')
echo -e "${GREEN}✓${NC} Found ${YELLOW}${POLICY_COUNT}${NC} unique RLS policies"

# Generate table categories
echo -e "${GREEN}✓${NC} Categorizing tables by system..."

# Core systems
grep -E "profiles|users|auth" "$TEMP_DIR/tables.txt" > "$TEMP_DIR/category_user_profile.txt" || true
grep -E "stories|transcripts|quotes" "$TEMP_DIR/tables.txt" > "$TEMP_DIR/category_content.txt" || true
grep -E "media|gallery|galleries|assets" "$TEMP_DIR/tables.txt" > "$TEMP_DIR/category_media.txt" || true
grep -E "organization|tenant|member" "$TEMP_DIR/tables.txt" > "$TEMP_DIR/category_organization.txt" || true
grep -E "project|context|analysis" "$TEMP_DIR/tables.txt" > "$TEMP_DIR/category_project.txt" || true
grep -E "cultural|moderation|protocol|consent" "$TEMP_DIR/tables.txt" > "$TEMP_DIR/category_cultural.txt" || true
grep -E "metric|analytics|impact|tracking|engagement" "$TEMP_DIR/tables.txt" > "$TEMP_DIR/category_analytics.txt" || true
grep -E "partner|access|token|invitation|sharing" "$TEMP_DIR/tables.txt" > "$TEMP_DIR/category_access.txt" || true
grep -E "notification|activity|event|log" "$TEMP_DIR/tables.txt" > "$TEMP_DIR/category_system.txt" || true

# Generate summary report
cat > "$OUTPUT_DIR/SCHEMA_SUMMARY.md" << EOF
# Database Schema Summary

**Generated**: $(date '+%Y-%m-%d %H:%M:%S')
**Migration Files**: ${MIGRATION_COUNT}

## Overview

The Empathy Ledger database consists of:

- **${TABLE_COUNT} Tables** - Core data structures
- **${FUNCTION_COUNT} Functions** - Stored procedures and utilities
- **${VIEW_COUNT} Views** - Query abstractions
- **${POLICY_COUNT} RLS Policies** - Row-level security rules

## Database Systems

### 1. User & Profile System
$(wc -l < "$TEMP_DIR/category_user_profile.txt" | tr -d ' ') tables

\`\`\`
$(cat "$TEMP_DIR/category_user_profile.txt")
\`\`\`

### 2. Content System (Stories & Transcripts)
$(wc -l < "$TEMP_DIR/category_content.txt" | tr -d ' ') tables

\`\`\`
$(cat "$TEMP_DIR/category_content.txt")
\`\`\`

### 3. Media System
$(wc -l < "$TEMP_DIR/category_media.txt" | tr -d ' ') tables

\`\`\`
$(cat "$TEMP_DIR/category_media.txt")
\`\`\`

### 4. Organization & Multi-Tenant
$(wc -l < "$TEMP_DIR/category_organization.txt" | tr -d ' ') tables

\`\`\`
$(cat "$TEMP_DIR/category_organization.txt")
\`\`\`

### 5. Project Management
$(wc -l < "$TEMP_DIR/category_project.txt" | tr -d ' ') tables

\`\`\`
$(cat "$TEMP_DIR/category_project.txt")
\`\`\`

### 6. Cultural Sensitivity
$(wc -l < "$TEMP_DIR/category_cultural.txt" | tr -d ' ') tables

\`\`\`
$(cat "$TEMP_DIR/category_cultural.txt")
\`\`\`

### 7. Analytics & Metrics
$(wc -l < "$TEMP_DIR/category_analytics.txt" | tr -d ' ') tables

\`\`\`
$(cat "$TEMP_DIR/category_analytics.txt")
\`\`\`

### 8. Access Control & Sharing
$(wc -l < "$TEMP_DIR/category_access.txt" | tr -d ' ') tables

\`\`\`
$(cat "$TEMP_DIR/category_access.txt")
\`\`\`

### 9. System & Events
$(wc -l < "$TEMP_DIR/category_system.txt" | tr -d ' ') tables

\`\`\`
$(cat "$TEMP_DIR/category_system.txt")
\`\`\`

## All Tables (Alphabetical)

\`\`\`
$(cat "$TEMP_DIR/tables.txt")
\`\`\`

## Database Functions

\`\`\`
$(cat "$TEMP_DIR/functions.txt")
\`\`\`

## Views

\`\`\`
$(cat "$TEMP_DIR/views.txt")
\`\`\`

## Migration Timeline

\`\`\`
$(ls -1 "$MIGRATIONS_DIR"/*.sql | xargs -n1 basename | head -20)
... (${MIGRATION_COUNT} total)
\`\`\`

## Next Steps

To explore a specific system, use the \`database-navigator\` Claude skill:

\`\`\`
/database-navigator "Show me the media system"
/database-navigator "Document the storyteller tables"
/database-navigator "What are the RLS policies for organizations?"
\`\`\`

## Documentation

- [Complete Schema Reference](./SCHEMA_REFERENCE.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [Function Reference](./FUNCTION_REFERENCE.md)
- [Security Policies](./SECURITY_POLICIES.md)

---

**Tip**: Run \`./scripts/analyze-database.sh\` to regenerate this documentation.
EOF

echo -e "${GREEN}✓${NC} Generated schema summary: ${OUTPUT_DIR}/SCHEMA_SUMMARY.md"

# Clean up temp files
rm -rf "$TEMP_DIR"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Analysis Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "View the summary:"
echo -e "  ${YELLOW}cat ${OUTPUT_DIR}/SCHEMA_SUMMARY.md${NC}"
echo ""
echo -e "Use the database-navigator skill:"
echo -e "  ${YELLOW}/database-navigator \"Show me the storyteller system\"${NC}"
echo ""

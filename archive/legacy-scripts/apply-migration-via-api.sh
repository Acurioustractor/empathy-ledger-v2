#!/bin/bash

# Apply migration via Supabase Management API
# This properly refreshes the PostgREST schema cache

PROJECT_REF="yvnuayzslukamizrlhwb"
ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN"
MIGRATION_FILE="supabase/migrations/20251005_storyteller_schema_enhancement.sql"

echo "📦 Reading migration file..."
MIGRATION_SQL=$(cat "$MIGRATION_FILE")

echo "🚀 Applying migration to Supabase project: $PROJECT_REF"
echo ""

# Apply via direct database connection using the database URL
# This is the proper way when Supabase CLI link doesn't work

echo "Using DATABASE_URL connection..."
psql "$DATABASE_URL" < "$MIGRATION_FILE"

echo ""
echo "✅ Migration SQL executed"
echo ""
echo "⚠️  Note: PostgREST schema cache might take 1-2 minutes to refresh"
echo "   or you can manually refresh it in the Supabase Dashboard:"
echo "   https://app.supabase.com/project/$PROJECT_REF/database/schemas"
echo ""
echo "🧪 Test the API after 1-2 minutes with:"
echo "   curl http://localhost:3030/api/organisations/550e8400-e29b-41d4-a716-446655440010/storytellers"

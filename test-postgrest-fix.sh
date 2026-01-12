#!/bin/bash

# Test PostgREST Schema Cache Fix
# Run this after implementing one of the solutions in POSTGREST_SCHEMA_CACHE_SOLUTION.md

echo "🧪 Testing PostgREST Schema Cache Fix..."
echo ""

# Test 1: Direct API call with new columns
echo "📝 Test 1: Creating test story with new columns..."
RESPONSE=$(curl -s -X POST http://localhost:3030/api/stories \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "PostgREST Cache Test Story",
    "content": "Testing new columns after cache fix",
    "article_type": "story_feature",
    "slug": "postgrest-cache-test-'$(date +%s)'",
    "meta_title": "SEO Title Test",
    "meta_description": "SEO Description Test",
    "tags": ["test", "postgrest", "cache"],
    "themes": ["Resilience", "Hope"],
    "status": "draft",
    "visibility": "private",
    "syndication_destinations": ["empathy-ledger"],
    "story_type": "personal",
    "audience": "community"
  }')

echo "$RESPONSE" | jq .

# Check for error
if echo "$RESPONSE" | grep -q "PGRST204"; then
  echo "❌ FAILED: Schema cache still not updated"
  echo "   Error: PGRST204 - Column not found in schema cache"
  echo ""
  echo "Next steps:"
  echo "1. Try Solution 1: Restart Postgres instance in Supabase Dashboard"
  echo "2. Try Solution 2: Run delayed NOTIFY command"
  echo "3. See POSTGREST_SCHEMA_CACHE_SOLUTION.md for details"
  exit 1
elif echo "$RESPONSE" | grep -q "error"; then
  echo "⚠️  PARTIAL: Schema cache updated but other error occurred"
  echo "$RESPONSE" | jq .error
  exit 1
else
  echo "✅ SUCCESS: Story created with new columns!"
  STORY_ID=$(echo "$RESPONSE" | jq -r '.id // .story.id // empty')
  if [ -n "$STORY_ID" ]; then
    echo "   Story ID: $STORY_ID"

    # Test 2: Verify columns in database
    echo ""
    echo "📊 Test 2: Verifying columns in database..."
    echo "   (Check Supabase Dashboard → Table Editor → stories)"
    echo "   (Row ID: $STORY_ID should have article_type, slug, meta_title, etc.)"
  fi
  exit 0
fi

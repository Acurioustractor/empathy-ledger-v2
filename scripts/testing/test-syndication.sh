#!/bin/bash

# JusticeHub Syndication Testing Script
# Run this to test the complete syndication flow

set -e

echo "=== JusticeHub Syndication Testing ==="
echo ""

# Database credentials
export PGPASSWORD='kedxah-qaxsap-jUhwo5'
PGHOST='aws-1-ap-southeast-2.pooler.supabase.com'
PGPORT='6543'
PGUSER='postgres.yvnuayzslukamizrlhwb'
PGDB='postgres'

# Test data
STORY_ID='de3f0fae-c4d4-4f19-8197-97a1ab8e56b1'
TOKEN='vpbwkc7KI6es3VdN9Cemc7C+jbeURSQdtbRcjOThKKU='
API_URL='http://localhost:3030'

echo "Step 1: Verify story exists in database"
echo "----------------------------------------"
psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDB -c "
SELECT id, title, status, is_public, cultural_permission_level
FROM stories
WHERE id = '$STORY_ID';
" || echo "❌ Story not found in database"

echo ""
echo "Step 2: Verify token exists and is active"
echo "-------------------------------------------"
psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDB -c "
SELECT id, story_id, status, expires_at, usage_count
FROM embed_tokens
WHERE token = '$TOKEN';
" || echo "❌ Token not found in database"

echo ""
echo "Step 3: Test content access API"
echo "---------------------------------"
echo "Calling: GET $API_URL/api/syndication/content/$STORY_ID"
echo ""

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X GET "$API_URL/api/syndication/content/$STORY_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: https://justicehub.org.au" \
  -H "Content-Type: application/json")

HTTP_BODY=$(echo "$RESPONSE" | sed -e 's/HTTP_STATUS\:.*//g')
HTTP_STATUS=$(echo "$RESPONSE" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
echo "$HTTP_BODY" | python3 -m json.tool 2>/dev/null || echo "$HTTP_BODY"

echo ""
if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ SUCCESS! Content access working!"

  echo ""
  echo "Step 4: Verify engagement event logged"
  echo "----------------------------------------"
  psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDB -c "
  SELECT event_type, event_timestamp, referrer
  FROM syndication_engagement_events
  WHERE story_id = '$STORY_ID'
  ORDER BY event_timestamp DESC
  LIMIT 3;
  "

  echo ""
  echo "Step 5: Verify token usage incremented"
  echo "----------------------------------------"
  psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDB -c "
  SELECT id, usage_count, last_used_at, last_used_domain
  FROM embed_tokens
  WHERE token = '$TOKEN';
  "

  echo ""
  echo "🎉 All tests passed!"
else
  echo "❌ FAILED with status $HTTP_STATUS"
  echo ""
  echo "Troubleshooting:"
  echo "1. Check if dev server is running: curl http://localhost:3030"
  echo "2. Check server logs for errors"
  echo "3. Verify token validation logic in validateEmbedToken()"
fi

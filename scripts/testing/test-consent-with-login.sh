#!/bin/bash

# Test Consent API with automatic login
# This script signs in programmatically to get a token

SUPABASE_URL="https://yvnuayzslukamizrlhwb.supabase.co"
SUPABASE_ANON_KEY="sb_publishable_ojDyC8v18uE9xcWHy9ygng_2n18ioHi"

EMAIL="benjamin@act.place"
PASSWORD=""

echo "======================================"
echo "Syndication Consent API Test"
echo "======================================"
echo ""

# Prompt for password
read -s -p "Enter password for $EMAIL: " PASSWORD
echo ""
echo ""

# Step 1: Sign in to get access token
echo "Step 1: Signing in..."
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "Content-Type: application/json" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

# Extract access token
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Login failed!"
  echo "Response:"
  echo $LOGIN_RESPONSE | jq '.'
  exit 1
fi

echo "✅ Login successful!"
echo "Token: ${ACCESS_TOKEN:0:50}..."
echo ""

# Step 2: Create consent
echo "======================================"
echo "Step 2: Creating Consent"
echo "======================================"
echo ""

CONSENT_RESPONSE=$(curl -s -X POST http://localhost:3030/api/syndication/consent \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=${ACCESS_TOKEN}; sb-refresh-token=dummy" \
  -d '{
    "storyId": "de3f0fae-c4d4-4f19-8197-97a1ab8e56b1",
    "siteSlug": "justicehub",
    "culturalPermissionLevel": "public",
    "requestReason": "Testing consent API with auto-login"
  }')

echo "Response:"
echo $CONSENT_RESPONSE | jq '.'
echo ""

# Check if successful
SUCCESS=$(echo $CONSENT_RESPONSE | jq -r '.success')
if [ "$SUCCESS" == "true" ]; then
  echo "✅ Consent created successfully!"

  CONSENT_ID=$(echo $CONSENT_RESPONSE | jq -r '.consent.id')
  EMBED_TOKEN=$(echo $CONSENT_RESPONSE | jq -r '.embedToken.token')

  echo "Consent ID: $CONSENT_ID"
  echo "Embed Token: $EMBED_TOKEN"
  echo ""

  # Step 3: Check consent status
  echo "======================================"
  echo "Step 3: Checking Consent Status"
  echo "======================================"
  echo ""

  STATUS_RESPONSE=$(curl -s "http://localhost:3030/api/syndication/consent?storyId=de3f0fae-c4d4-4f19-8197-97a1ab8e56b1&siteSlug=justicehub" \
    -H "Cookie: sb-access-token=${ACCESS_TOKEN}; sb-refresh-token=dummy")

  echo "Response:"
  echo $STATUS_RESPONSE | jq '.'
  echo ""

  # Step 4: Revoke consent (optional - uncomment to test)
  # echo "======================================"
  # echo "Step 4: Revoking Consent"
  # echo "======================================"
  # echo ""
  #
  # REVOKE_RESPONSE=$(curl -s -X POST "http://localhost:3030/api/syndication/consent/${CONSENT_ID}/revoke" \
  #   -H "Content-Type: application/json" \
  #   -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  #   -d '{"reason":"Testing revocation"}')
  #
  # echo "Response:"
  # echo $REVOKE_RESPONSE | jq '.'
  # echo ""

  echo "======================================"
  echo "✅ All Tests Passed!"
  echo "======================================"
  echo ""
  echo "Next steps:"
  echo "1. Check the dashboard at http://localhost:3030/syndication/dashboard"
  echo "2. Verify consent in database"
  echo "3. Test revocation by uncommenting Step 4"
else
  echo "❌ Consent creation failed!"
fi

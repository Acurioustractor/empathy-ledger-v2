#!/bin/bash

# Test script for Syndication Consent API
# Tests: Create consent, Check consent, Revoke consent

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3030"

# Uncle Dale's story ID (already syndicating to JusticeHub)
STORY_ID="de3f0fae-c4d4-4f19-8197-97a1ab8e56b1"
SITE_SLUG="justicehub"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Syndication Consent API Test${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ============================================================================
# Step 1: Check if consent already exists
# ============================================================================
echo -e "${BLUE}[1] Checking existing consent...${NC}"
echo "GET $BASE_URL/api/syndication/consent?storyId=$STORY_ID&siteSlug=$SITE_SLUG"
echo ""

CONSENT_CHECK=$(curl -s \
  "$BASE_URL/api/syndication/consent?storyId=$STORY_ID&siteSlug=$SITE_SLUG" \
  -H "Content-Type: application/json")

echo "$CONSENT_CHECK" | jq '.'
echo ""

# Check if consent exists
EXISTS=$(echo "$CONSENT_CHECK" | jq -r '.exists')

if [ "$EXISTS" = "true" ]; then
  echo -e "${GREEN}✓ Consent already exists${NC}"
  CONSENT_ID=$(echo "$CONSENT_CHECK" | jq -r '.consent.id')
  echo "Consent ID: $CONSENT_ID"
  echo ""

  # Ask if user wants to revoke and recreate
  echo -e "${BLUE}Do you want to revoke and recreate? (y/n)${NC}"
  read -r REVOKE_CHOICE

  if [ "$REVOKE_CHOICE" = "y" ]; then
    echo ""
    echo -e "${BLUE}[2] Revoking existing consent...${NC}"
    echo "POST $BASE_URL/api/syndication/consent/$CONSENT_ID/revoke"
    echo ""

    REVOKE_RESPONSE=$(curl -s -X POST \
      "$BASE_URL/api/syndication/consent/$CONSENT_ID/revoke" \
      -H "Content-Type: application/json" \
      -d '{
        "reason": "Testing consent revocation flow"
      }')

    echo "$REVOKE_RESPONSE" | jq '.'
    echo ""

    if echo "$REVOKE_RESPONSE" | jq -e '.success' > /dev/null; then
      echo -e "${GREEN}✓ Consent revoked successfully${NC}"
      echo ""
    else
      echo -e "${RED}✗ Failed to revoke consent${NC}"
      exit 1
    fi
  else
    echo ""
    echo -e "${GREEN}✓ Test complete - consent already exists${NC}"
    exit 0
  fi
fi

# ============================================================================
# Step 2: Create new consent
# ============================================================================
echo -e "${BLUE}[3] Creating new consent...${NC}"
echo "POST $BASE_URL/api/syndication/consent"
echo ""

CREATE_RESPONSE=$(curl -s -X POST \
  "$BASE_URL/api/syndication/consent" \
  -H "Content-Type: application/json" \
  -d "{
    \"storyId\": \"$STORY_ID\",
    \"siteSlug\": \"$SITE_SLUG\",
    \"permissions\": {
      \"allowFullContent\": true,
      \"allowMediaAssets\": true,
      \"allowAnalytics\": true,
      \"allowComments\": false
    },
    \"culturalPermissionLevel\": \"public\",
    \"requestReason\": \"Testing consent API - Uncle Dale story for JusticeHub\",
    \"requiresElderApproval\": false
  }")

echo "$CREATE_RESPONSE" | jq '.'
echo ""

# Check if consent was created
if echo "$CREATE_RESPONSE" | jq -e '.success' > /dev/null; then
  echo -e "${GREEN}✓ Consent created successfully${NC}"

  CONSENT_ID=$(echo "$CREATE_RESPONSE" | jq -r '.consent.id')
  EMBED_TOKEN=$(echo "$CREATE_RESPONSE" | jq -r '.embedToken.token')

  echo "Consent ID: $CONSENT_ID"
  echo "Embed Token: $EMBED_TOKEN"
  echo ""
else
  echo -e "${RED}✗ Failed to create consent${NC}"
  ERROR=$(echo "$CREATE_RESPONSE" | jq -r '.error')
  echo "Error: $ERROR"
  exit 1
fi

# ============================================================================
# Step 3: Verify consent exists
# ============================================================================
echo -e "${BLUE}[4] Verifying consent was created...${NC}"
echo "GET $BASE_URL/api/syndication/consent?storyId=$STORY_ID&siteSlug=$SITE_SLUG"
echo ""

VERIFY_RESPONSE=$(curl -s \
  "$BASE_URL/api/syndication/consent?storyId=$STORY_ID&siteSlug=$SITE_SLUG" \
  -H "Content-Type: application/json")

echo "$VERIFY_RESPONSE" | jq '.'
echo ""

if echo "$VERIFY_RESPONSE" | jq -e '.exists' | grep -q 'true'; then
  echo -e "${GREEN}✓ Consent verified${NC}"
  echo ""
else
  echo -e "${RED}✗ Consent not found after creation${NC}"
  exit 1
fi

# ============================================================================
# Step 4: Test content access with new token
# ============================================================================
echo -e "${BLUE}[5] Testing content access with new embed token...${NC}"
echo "GET $BASE_URL/api/syndication/content/$STORY_ID"
echo ""

CONTENT_RESPONSE=$(curl -s \
  "$BASE_URL/api/syndication/content/$STORY_ID" \
  -H "Authorization: Bearer $EMBED_TOKEN" \
  -H "Content-Type: application/json")

echo "$CONTENT_RESPONSE" | jq '.'
echo ""

if echo "$CONTENT_RESPONSE" | jq -e '.story' > /dev/null; then
  echo -e "${GREEN}✓ Content access working with new token${NC}"
  echo ""
else
  echo -e "${RED}✗ Content access failed${NC}"
  exit 1
fi

# ============================================================================
# Step 5: Summary
# ============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ All consent API tests passed!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Summary:"
echo "  - Consent created for story: $STORY_ID"
echo "  - Site: $SITE_SLUG"
echo "  - Status: approved"
echo "  - Embed token generated: $EMBED_TOKEN"
echo "  - Content access: ✓ Working"
echo ""
echo "Next steps:"
echo "  1. View consent in database: psql and query syndication_consent"
echo "  2. Test revocation: Run this script again and choose 'y' to revoke"
echo "  3. Build Syndication Dashboard to display this consent to storyteller"
echo ""

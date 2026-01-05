#!/bin/bash

# REPLACE THIS WITH YOUR ACTUAL TOKEN FROM BROWSER
AUTH_TOKEN="YOUR_TOKEN_HERE"

echo "======================================"
echo "Test 1: Create Consent"
echo "======================================"

curl -X POST http://localhost:3030/api/syndication/consent \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=$AUTH_TOKEN" \
  -d '{
    "storyId": "de3f0fae-c4d4-4f19-8197-97a1ab8e56b1",
    "siteSlug": "justicehub",
    "culturalPermissionLevel": "public",
    "requestReason": "Manual testing - Step by step walkthrough"
  }' | jq '.'

echo ""
echo "Expected: Should see {\"success\":true,...} with consent and embedToken"
echo ""

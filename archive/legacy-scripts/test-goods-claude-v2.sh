#!/bin/bash

# Test GOODS Project with Claude V2 Integration
# This script will regenerate the GOODS analysis using Claude 3.5 Sonnet with quality filtering

echo "🧪 Testing GOODS Project with Claude V2 Integration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# GOODS Project ID
PROJECT_ID="6bd47c8a-e676-456f-aa25-ddcbb5a31047"
API_URL="http://localhost:3030/api/projects/${PROJECT_ID}/analysis"

echo "📋 Project: GOODS (Creating better white goods and beds)"
echo "🔬 Model: Claude 3.5 Sonnet with V2 quality filtering"
echo "🔄 Regenerating analysis (clearing cache)..."
echo ""

# Make the API request
echo "🚀 Making API request..."
curl -s "${API_URL}?intelligent=true&model=claude&regenerate=true" \
  -H "Content-Type: application/json" \
  -o /tmp/goods-claude-v2-result.json

# Check if successful
if [ $? -eq 0 ]; then
  echo "✅ API request successful"
  echo ""

  # Extract key metrics
  echo "📊 RESULTS:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # Check if analysis was cached or regenerated
  CACHED=$(cat /tmp/goods-claude-v2-result.json | grep -o '"cached":[^,]*' | cut -d: -f2)
  if [ "$CACHED" = "true" ]; then
    echo "⚠️  Analysis was cached (not regenerated)"
    echo "   Try again with ?regenerate=true to force regeneration"
  else
    echo "✓ Analysis regenerated successfully"
  fi

  # Extract quote count
  QUOTE_COUNT=$(cat /tmp/goods-claude-v2-result.json | grep -o '"all_quotes":\[[^]]*\]' | grep -o '"text"' | wc -l | xargs)
  echo "✓ Total quotes extracted: ${QUOTE_COUNT}"

  # Extract average quality
  AVG_QUALITY=$(cat /tmp/goods-claude-v2-result.json | grep -o '"average_quote_quality":[0-9.]*' | cut -d: -f2)
  if [ ! -z "$AVG_QUALITY" ]; then
    echo "✓ Average quote quality: ${AVG_QUALITY}/100"
  fi

  echo ""
  echo "📁 Full results saved to: /tmp/goods-claude-v2-result.json"
  echo ""
  echo "🔍 TO VIEW RESULTS:"
  echo "   cat /tmp/goods-claude-v2-result.json | jq '.intelligentAnalysis.all_quotes[] | {text: .text, speaker: .storyteller, confidence: .confidence_score}'"
  echo ""
  echo "🔍 TO CHECK SERVER LOGS:"
  echo "   Look for lines containing:"
  echo "   - 🔬 Using Claude V2 with project-aligned quality filtering"
  echo "   - ⚠️  Rejected X low-quality quotes"
  echo "   - ✅ Extracted X high-quality quotes"
  echo "   - 📊 Quality: X/100"

else
  echo "❌ API request failed"
  echo "   Make sure the dev server is running on http://localhost:3030"
  echo "   Run: npm run dev"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

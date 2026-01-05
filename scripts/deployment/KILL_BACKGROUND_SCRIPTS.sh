#!/bin/bash

echo "🔪 Killing all background API-consuming scripts..."

# Kill by process name
pkill -9 -f "direct-analyze-goods"
pkill -9 -f "extract-goods-insights"
pkill -9 -f "test-quote-extraction"
pkill -9 -f "analyze-with-intelligent"

# Kill all tsx processes running scripts
ps aux | grep "tsx scripts" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null

# Delete the script files so they can't restart
rm -f scripts/direct-analyze-goods.ts
rm -f scripts/extract-goods-insights.ts
rm -f scripts/test-quote-extraction-comparison.ts
rm -f scripts/analyze-with-intelligent-ai.ts

echo "✅ All background scripts killed and files deleted!"
echo ""
echo "Remaining safe scripts:"
ls -la scripts/*.ts 2>/dev/null || echo "  (none)"

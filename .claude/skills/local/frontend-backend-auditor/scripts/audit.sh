#!/bin/bash
# Frontend-Backend Alignment Audit Script
# Scans codebase for deprecated patterns and misaligned data access

set -e

PROJECT_ROOT="/Users/benknight/Code/empathy-ledger-v2"
REPORT_FILE="frontend-backend-audit-$(date +%Y%m%d-%H%M%S).md"

cd "$PROJECT_ROOT"

echo "=== FRONTEND-BACKEND ALIGNMENT AUDIT ===" | tee "$REPORT_FILE"
echo "Generated: $(date)" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# 1. COMPONENT INVENTORY
echo "## 1. Component Inventory" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

TOTAL_COMPONENTS=$(find src/ -name "*.tsx" -type f | wc -l | tr -d ' ')
TOTAL_TS_FILES=$(find src/ -name "*.ts" -type f | wc -l | tr -d ' ')

echo "- Total React Components (.tsx): $TOTAL_COMPONENTS" | tee -a "$REPORT_FILE"
echo "- Total TypeScript Files (.ts): $TOTAL_TS_FILES" | tee -a "$REPORT_FILE"
echo "- Total API Routes: $(find src/app/api -name "route.ts" | wc -l | tr -d ' ')" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# 2. DEPRECATED TABLE USAGE
echo "## 2. Deprecated Table Usage" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

echo "### ⚠️ Direct Profiles Table Queries (Should use storytellers)" | tee -a "$REPORT_FILE"
PROFILES_COUNT=$(grep -r "from('profiles')" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "- Found: **$PROFILES_COUNT references**" | tee -a "$REPORT_FILE"

if [ "$PROFILES_COUNT" -gt 0 ]; then
  echo "\`\`\`" | tee -a "$REPORT_FILE"
  grep -rn "from('profiles')" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | head -10 | tee -a "$REPORT_FILE"
  echo "\`\`\`" | tee -a "$REPORT_FILE"
fi
echo "" | tee -a "$REPORT_FILE"

echo "### ⚠️ Old Analysis Jobs (Should use transcript_analysis_results)" | tee -a "$REPORT_FILE"
ANALYSIS_COUNT=$(grep -r "from('analysis_jobs')" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "- Found: **$ANALYSIS_COUNT references**" | tee -a "$REPORT_FILE"

if [ "$ANALYSIS_COUNT" -gt 0 ]; then
  echo "\`\`\`" | tee -a "$REPORT_FILE"
  grep -rn "from('analysis_jobs')" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | tee -a "$REPORT_FILE"
  echo "\`\`\`" | tee -a "$REPORT_FILE"
fi
echo "" | tee -a "$REPORT_FILE"

echo "### ⚠️ Old AI Analysis Jobs" | tee -a "$REPORT_FILE"
AI_ANALYSIS_COUNT=$(grep -r "from('ai_analysis_jobs')" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "- Found: **$AI_ANALYSIS_COUNT references**" | tee -a "$REPORT_FILE"

if [ "$AI_ANALYSIS_COUNT" -gt 0 ]; then
  echo "\`\`\`" | tee -a "$REPORT_FILE"
  grep -rn "from('ai_analysis_jobs')" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | tee -a "$REPORT_FILE"
  echo "\`\`\`" | tee -a "$REPORT_FILE"
fi
echo "" | tee -a "$REPORT_FILE"

# 3. DEPRECATED COLUMNS
echo "## 3. Deprecated Column Usage" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

LEGACY_COUNT=$(grep -r "legacy_" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "- Legacy columns: **$LEGACY_COUNT references**" | tee -a "$REPORT_FILE"

if [ "$LEGACY_COUNT" -gt 0 ]; then
  echo "\`\`\`" | tee -a "$REPORT_FILE"
  grep -rn "legacy_" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | head -10 | tee -a "$REPORT_FILE"
  echo "\`\`\`" | tee -a "$REPORT_FILE"
fi
echo "" | tee -a "$REPORT_FILE"

AIRTABLE_COUNT=$(grep -r "airtable" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "- Airtable references: **$AIRTABLE_COUNT**" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# 4. CURRENT TABLE USAGE (Good patterns)
echo "## 4. Current Table Usage ✅" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

STORYTELLERS_COUNT=$(grep -r "from('storytellers')" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "- Storytellers table: **$STORYTELLERS_COUNT references** ✅" | tee -a "$REPORT_FILE"

STORIES_COUNT=$(grep -r "from('stories')" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "- Stories table: **$STORIES_COUNT references** ✅" | tee -a "$REPORT_FILE"

TRANSCRIPT_ANALYSIS_COUNT=$(grep -r "from('transcript_analysis_results')" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "- Transcript Analysis Results: **$TRANSCRIPT_ANALYSIS_COUNT references** ✅" | tee -a "$REPORT_FILE"

NARRATIVE_THEMES_COUNT=$(grep -r "from('narrative_themes')" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "- Narrative Themes: **$NARRATIVE_THEMES_COUNT references** ✅" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# 5. API ENDPOINT ANALYSIS
echo "## 5. API Endpoint Analysis" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

echo "### API Routes by Category" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

for dir in $(find src/app/api -type d -depth 1 | sort); do
  ROUTE_COUNT=$(find "$dir" -name "route.ts" | wc -l | tr -d ' ')
  if [ "$ROUTE_COUNT" -gt 0 ]; then
    DIR_NAME=$(basename "$dir")
    echo "- \`/api/$DIR_NAME\`: $ROUTE_COUNT endpoints" | tee -a "$REPORT_FILE"
  fi
done
echo "" | tee -a "$REPORT_FILE"

# 6. TYPESCRIPT TYPE ALIGNMENT
echo "## 6. TypeScript Type Alignment" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

if git diff --quiet src/types/database/ 2>/dev/null; then
  echo "✅ **Types are in sync with schema**" | tee -a "$REPORT_FILE"
else
  echo "⚠️ **Types may be out of sync** - run \`npm run types:generate\`" | tee -a "$REPORT_FILE"
fi
echo "" | tee -a "$REPORT_FILE"

# 7. THEME SYSTEM USAGE
echo "## 7. Theme System Usage" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

CULTURAL_THEMES_COUNT=$(grep -r "cultural_themes" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "- cultural_themes[] usage: **$CULTURAL_THEMES_COUNT** ✅" | tee -a "$REPORT_FILE"

OLD_THEMES_COUNT=$(grep -r "\.themes" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "cultural_themes" | grep -v "narrative_themes" | wc -l | tr -d ' ')
echo "- Potential old .themes usage: **$OLD_THEMES_COUNT**" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# 8. COMPONENT FILE ANALYSIS
echo "## 8. High-Risk Components" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

echo "### Components with Deprecated Patterns" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# Find components using profiles directly
for file in $(grep -rl "from('profiles')" src/ --include="*.tsx" 2>/dev/null); do
  echo "- \`$file\` - Uses profiles table" | tee -a "$REPORT_FILE"
done

# Find components using old analysis
for file in $(grep -rl "from('analysis_jobs')" src/ --include="*.tsx" 2>/dev/null); do
  echo "- \`$file\` - Uses old analysis_jobs" | tee -a "$REPORT_FILE"
done

if [ "$PROFILES_COUNT" -eq 0 ] && [ "$ANALYSIS_COUNT" -eq 0 ]; then
  echo "✅ **No high-risk components found**" | tee -a "$REPORT_FILE"
fi
echo "" | tee -a "$REPORT_FILE"

# 9. ALIGNMENT SCORE
echo "## 9. Alignment Score" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

TOTAL_ISSUES=$((PROFILES_COUNT + ANALYSIS_COUNT + AI_ANALYSIS_COUNT + LEGACY_COUNT))
TOTAL_GOOD=$((STORYTELLERS_COUNT + TRANSCRIPT_ANALYSIS_COUNT + NARRATIVE_THEMES_COUNT))
TOTAL_REFS=$((TOTAL_ISSUES + TOTAL_GOOD))

if [ "$TOTAL_REFS" -gt 0 ]; then
  SCORE=$(echo "scale=1; ($TOTAL_GOOD * 100) / $TOTAL_REFS" | bc)
  echo "**Alignment Score: ${SCORE}%**" | tee -a "$REPORT_FILE"
else
  SCORE=0
  echo "**Alignment Score: N/A** (no database queries found)" | tee -a "$REPORT_FILE"
fi
echo "" | tee -a "$REPORT_FILE"

echo "- Total Issues: **$TOTAL_ISSUES**" | tee -a "$REPORT_FILE"
echo "- Current Patterns: **$TOTAL_GOOD**" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# 10. RECOMMENDATIONS
echo "## 10. Recommendations" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

if [ "$PROFILES_COUNT" -gt 0 ]; then
  echo "### HIGH PRIORITY: Migrate Profile Queries" | tee -a "$REPORT_FILE"
  echo "- Replace \`from('profiles')\` with \`from('storytellers')\` for storyteller data" | tee -a "$REPORT_FILE"
  echo "- Keep profiles table only for authentication and general user data" | tee -a "$REPORT_FILE"
  echo "" | tee -a "$REPORT_FILE"
fi

if [ "$ANALYSIS_COUNT" -gt 0 ] || [ "$AI_ANALYSIS_COUNT" -gt 0 ]; then
  echo "### HIGH PRIORITY: Update AI Analysis Queries" | tee -a "$REPORT_FILE"
  echo "- Replace old analysis tables with \`transcript_analysis_results\`" | tee -a "$REPORT_FILE"
  echo "- Use \`analysis_version = 'v2'\` to get current results" | tee -a "$REPORT_FILE"
  echo "- Archive old analysis data (see data-integrity-guardian skill)" | tee -a "$REPORT_FILE"
  echo "" | tee -a "$REPORT_FILE"
fi

if [ "$LEGACY_COUNT" -gt 0 ]; then
  echo "### MEDIUM PRIORITY: Remove Legacy Column References" | tee -a "$REPORT_FILE"
  echo "- Clean up references to legacy_* columns" | tee -a "$REPORT_FILE"
  echo "- These are migration artifacts and should not be used" | tee -a "$REPORT_FILE"
  echo "" | tee -a "$REPORT_FILE"
fi

if [ "$TOTAL_ISSUES" -eq 0 ]; then
  echo "### ✅ No Critical Issues Found" | tee -a "$REPORT_FILE"
  echo "Frontend is well-aligned with current database schema!" | tee -a "$REPORT_FILE"
  echo "" | tee -a "$REPORT_FILE"
fi

# 11. NEXT STEPS
echo "## 11. Next Steps" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"
echo "1. Review high-risk components listed above" | tee -a "$REPORT_FILE"
echo "2. Update deprecated patterns to current schema" | tee -a "$REPORT_FILE"
echo "3. Run \`npm run types:generate\` to sync TypeScript types" | tee -a "$REPORT_FILE"
echo "4. Test updated components thoroughly" | tee -a "$REPORT_FILE"
echo "5. Re-run this audit to verify fixes" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

echo "---" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"
echo "**Report saved to:** \`$REPORT_FILE\`" | tee -a "$REPORT_FILE"

# Print summary to console
echo ""
echo "======================================"
echo "AUDIT COMPLETE"
echo "======================================"
echo "Alignment Score: ${SCORE}%"
echo "Total Issues: $TOTAL_ISSUES"
echo "Report: $REPORT_FILE"
echo ""

if [ "$TOTAL_ISSUES" -gt 0 ]; then
  echo "⚠️  Issues found - review $REPORT_FILE for details"
  exit 1
else
  echo "✅ No critical issues - frontend is well-aligned!"
  exit 0
fi

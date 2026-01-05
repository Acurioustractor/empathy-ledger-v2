#!/bin/bash
#
# Documentation Reorganization Script - PHASE 2
# Moves ALL remaining loose documentation files into organized structure
#
# This handles:
# - 74 loose .md files in /docs/ root
# - 38 loose .md files in project root
#
# Usage: ./scripts/reorganize-documentation-phase2.sh
#

set -e  # Exit on error

PROJECT_ROOT="/Users/benknight/Code/empathy-ledger-v2"
DOCS_DIR="$PROJECT_ROOT/docs"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 Documentation Reorganization - PHASE 2"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This script will organize ALL remaining loose documentation files:"
echo "  - 74 files in /docs/ root"
echo "  - 38 files in project root"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$PROJECT_ROOT"

# ============================================================================
# DOCS ROOT: AI & Analysis Reports → /docs/15-reports/analysis/
# ============================================================================

echo "📦 Phase 2.1: Moving AI & analysis reports from /docs/..."
echo ""

declare -a ai_analysis_files=(
  "AI_ANALYZER_UPGRADE_SUMMARY.md"
  "AI_ARCHITECTURE_DEEP_REVIEW.md"
  "AI_QUALITY_IMPROVEMENT.md"
  "CLAUDE_SONNET_4.5_UPGRADE_SUMMARY.md"
  "COMPREHENSIVE_ANALYSIS_REPORT.md"
  "COMPREHENSIVE_DATABASE_STATUS_2025.md"
  "COMPREHENSIVE_SUPABASE_DATABASE_ANALYSIS_REPORT.md"
  "CRITICAL_ISSUES_REPORT.md"
  "CURRENT_STATE_REVIEW.md"
  "LIVE_DATABASE_STATUS_DIRECT_2025.md"
  "LIVE_DATABASE_STATUS_REPORT.md"
  "PROFILES_AUDIT_FINDINGS.md"
  "PROFILES_CLEANUP_SUMMARY.md"
  "PROFILE_PROPERTIES_AUDIT.md"
  "STORY_REVIEW_ANALYSIS_PREVIEW.md"
  "comprehensive-database-analysis-2025-09-05T10-11-09-664Z-SUMMARY.md"
  "comprehensive-database-analysis-2025-09-05T19-40-10-667Z-SUMMARY.md"
)

for file in "${ai_analysis_files[@]}"; do
  if [ -f "$DOCS_DIR/$file" ]; then
    echo "  → docs/$file → docs/15-reports/analysis/"
    mv "$DOCS_DIR/$file" "$DOCS_DIR/15-reports/analysis/"
  fi
done

echo "✅ AI & analysis reports moved"
echo ""

# ============================================================================
# DOCS ROOT: Session Summaries → /docs/15-reports/sessions/
# ============================================================================

echo "📦 Phase 2.2: Moving session reports from /docs/..."
echo ""

declare -a session_files=(
  "SESSION_SUMMARY.md"
  "SESSION_SUMMARY_SUPER_ADMIN_IMPLEMENTATION.md"
)

for file in "${session_files[@]}"; do
  if [ -f "$DOCS_DIR/$file" ]; then
    echo "  → docs/$file → docs/15-reports/sessions/"
    mv "$DOCS_DIR/$file" "$DOCS_DIR/15-reports/sessions/"
  fi
done

echo "✅ Session reports moved"
echo ""

# ============================================================================
# DOCS ROOT: Implementation Reports → /docs/15-reports/implementation/
# ============================================================================

echo "📦 Phase 2.3: Moving implementation reports from /docs/..."
echo ""

declare -a impl_files=(
  "DEPLOYMENT_SETUP_COMPLETE.md"
  "IMPLEMENTATION_COMPLETE_MULTI_TENANT.md"
  "SUPER_ADMIN_IMPLEMENTATION_SUMMARY.md"
  "SUPER_ADMIN_TESTING_RESULTS.md"
)

for file in "${impl_files[@]}"; do
  if [ -f "$DOCS_DIR/$file" ]; then
    echo "  → docs/$file → docs/15-reports/implementation/"
    mv "$DOCS_DIR/$file" "$DOCS_DIR/15-reports/implementation/"
  fi
done

echo "✅ Implementation reports moved"
echo ""

# ============================================================================
# DOCS ROOT: Super Admin Feature → /docs/05-features/super-admin/
# ============================================================================

echo "📦 Phase 2.4: Moving Super Admin feature docs..."
echo ""

mkdir -p "$DOCS_DIR/05-features/super-admin"

declare -a super_admin_files=(
  "SUPER_ADMIN_ARCHITECTURE_DIAGRAM.md"
  "SUPER_ADMIN_FRONTEND_USER_GUIDE.md"
  "SUPER_ADMIN_REFACTOR_PLAN.md"
)

for file in "${super_admin_files[@]}"; do
  if [ -f "$DOCS_DIR/$file" ]; then
    echo "  → docs/$file → docs/05-features/super-admin/"
    mv "$DOCS_DIR/$file" "$DOCS_DIR/05-features/super-admin/"
  fi
done

echo "✅ Super Admin docs organized"
echo ""

# ============================================================================
# DOCS ROOT: Transcript Feature → /docs/05-features/transcript-system/
# ============================================================================

echo "📦 Phase 2.5: Moving Transcript feature docs..."
echo ""

mkdir -p "$DOCS_DIR/05-features/transcript-system"

declare -a transcript_files=(
  "TRANSCRIPT_ANALYSIS_WORKFLOW.md"
  "TRANSCRIPT_THEMES_SUMMARY.md"
  "TRANSCRIPT_TO_STORY_WORKFLOW.md"
  "TRANSCRIPT_UI_MOCKUP.md"
  "TRANSCRIPT_UPLOAD_GUIDE.md"
  "THEMES_AND_QUOTES_STRUCTURE.md"
)

for file in "${transcript_files[@]}"; do
  if [ -f "$DOCS_DIR/$file" ]; then
    echo "  → docs/$file → docs/05-features/transcript-system/"
    mv "$DOCS_DIR/$file" "$DOCS_DIR/05-features/transcript-system/"
  fi
done

echo "✅ Transcript system docs organized"
echo ""

# ============================================================================
# DOCS ROOT: Project Context Feature → /docs/05-features/project-context/
# ============================================================================

echo "📦 Phase 2.6: Moving Project Context feature docs..."
echo ""

mkdir -p "$DOCS_DIR/05-features/project-context"

declare -a project_context_files=(
  "ORG_PROJECT_CONTEXT_SYSTEM.md"
  "PROJECT_CONTEXT_IMPLEMENTATION_GUIDE.md"
  "PROJECT_CONTEXT_SEEDING_PROPOSAL.md"
)

for file in "${project_context_files[@]}"; do
  if [ -f "$DOCS_DIR/$file" ]; then
    echo "  → docs/$file → docs/05-features/project-context/"
    mv "$DOCS_DIR/$file" "$DOCS_DIR/05-features/project-context/"
  fi
done

echo "✅ Project context docs organized"
echo ""

# ============================================================================
# DOCS ROOT: Location Feature → /docs/05-features/location-management/
# ============================================================================

echo "📦 Phase 2.7: Moving Location feature docs..."
echo ""

mkdir -p "$DOCS_DIR/05-features/location-management"

declare -a location_files=(
  "LOCATION_MANAGEMENT_STRATEGY.md"
  "LOCATION_RELATIONSHIPS_AUDIT.md"
  "BACKFILL_LOCATIONS_GUIDE.md"
)

for file in "${location_files[@]}"; do
  if [ -f "$DOCS_DIR/$file" ]; then
    echo "  → docs/$file → docs/05-features/location-management/"
    mv "$DOCS_DIR/$file" "$DOCS_DIR/05-features/location-management/"
  fi
done

echo "✅ Location management docs organized"
echo ""

# ============================================================================
# DOCS ROOT: Quick Add Feature → /docs/05-features/quick-add/
# ============================================================================

echo "📦 Phase 2.8: Moving Quick Add feature docs..."
echo ""

mkdir -p "$DOCS_DIR/05-features/quick-add"

declare -a quick_add_files=(
  "QUICK_ADD_USER_GUIDE.md"
  "QUICK_ADD_WORKFLOW.md"
)

for file in "${quick_add_files[@]}"; do
  if [ -f "$DOCS_DIR/$file" ]; then
    echo "  → docs/$file → docs/05-features/quick-add/"
    mv "$DOCS_DIR/$file" "$DOCS_DIR/05-features/quick-add/"
  fi
done

echo "✅ Quick add docs organized"
echo ""

# ============================================================================
# DOCS ROOT: Analytics Feature → /docs/10-analytics/
# ============================================================================

echo "📦 Phase 2.9: Moving analytics docs to /docs/10-analytics/..."
echo ""

declare -a analytics_files=(
  "INDIVIDUAL_ANALYTICS_DEPLOYMENT_GUIDE.md"
)

for file in "${analytics_files[@]}"; do
  if [ -f "$DOCS_DIR/$file" ]; then
    echo "  → docs/$file → docs/10-analytics/"
    mv "$DOCS_DIR/$file" "$DOCS_DIR/10-analytics/"
  fi
done

echo "✅ Analytics docs organized"
echo ""

# ============================================================================
# DOCS ROOT: Database Documentation → /docs/04-database/
# ============================================================================

echo "📦 Phase 2.10: Moving database docs to /docs/04-database/..."
echo ""

declare -a database_files=(
  "DATABASE_ACCESS_GUIDE.md"
  "DATABASE_ACCESS_POLICY.md"
  "DATABASE_SETUP_EXPLANATION.md"
  "HOW_TO_REFRESH_POSTGREST.md"
  "MIGRATION_PLAN_FLATTEN_TENANTS.md"
  "SUPABASE_TYPE_GENERATION_GUIDE.md"
)

for file in "${database_files[@]}"; do
  if [ -f "$DOCS_DIR/$file" ]; then
    echo "  → docs/$file → docs/04-database/"
    mv "$DOCS_DIR/$file" "$DOCS_DIR/04-database/"
  fi
done

echo "✅ Database docs organized"
echo ""

# ============================================================================
# DOCS ROOT: Development Guides → /docs/06-development/
# ============================================================================

echo "📦 Phase 2.11: Moving development guides..."
echo ""

declare -a dev_files=(
  "ADMIN_VS_PUBLIC_SETUP.md"
  "BULK_UPLOAD_GUIDE.md"
  "EMAIL_FIELD_POLICY.md"
  "FILE_ORGANIZATION.md"
  "ORGANIZATION_MEMBERSHIP_SYSTEM.md"
  "PUBLIC_VS_ADMIN_VIEWS.md"
  "SETUP_SSH_GITHUB.md"
  "README-DEVELOP.md"
)

for file in "${dev_files[@]}"; do
  if [ -f "$DOCS_DIR/$file" ]; then
    echo "  → docs/$file → docs/06-development/"
    mv "$DOCS_DIR/$file" "$DOCS_DIR/06-development/"
  fi
done

echo "✅ Development guides organized"
echo ""

# ============================================================================
# DOCS ROOT: Deployment Guides → /docs/07-deployment/
# ============================================================================

echo "📦 Phase 2.12: Moving deployment guides..."
echo ""

declare -a deployment_files=(
  "INNGEST_TIMEOUT_SOLUTION.md"
)

for file in "${deployment_files[@]}"; do
  if [ -f "$DOCS_DIR/$file" ]; then
    echo "  → docs/$file → docs/07-deployment/"
    mv "$DOCS_DIR/$file" "$DOCS_DIR/07-deployment/"
  fi
done

echo "✅ Deployment guides organized"
echo ""

# ============================================================================
# DOCS ROOT: ACT Farmhand Integration → /docs/08-integrations/act-farmhand/
# ============================================================================

echo "📦 Phase 2.13: Moving ACT Farmhand integration docs..."
echo ""

mkdir -p "$DOCS_DIR/08-integrations/act-farmhand"

declare -a farmhand_files=(
  "ACT_FARMHAND_INTEGRATION_SUMMARY.md"
  "FARMHAND_QUICK_START.md"
)

for file in "${farmhand_files[@]}"; do
  if [ -f "$DOCS_DIR/$file" ]; then
    echo "  → docs/$file → docs/08-integrations/act-farmhand/"
    mv "$DOCS_DIR/$file" "$DOCS_DIR/08-integrations/act-farmhand/"
  fi
done

echo "✅ ACT Farmhand integration docs organized"
echo ""

# ============================================================================
# DOCS ROOT: Oonchiumpa Project → /docs/11-projects/oonchiumpa/
# ============================================================================

echo "📦 Phase 2.14: Moving Oonchiumpa project docs..."
echo ""

mkdir -p "$DOCS_DIR/11-projects/oonchiumpa"

declare -a oonchiumpa_files=(
  "OONCHIUMPA_COMPLETE_ANALYSIS.md"
  "OONCHIUMPA_INSIGHTS_REPORT.md"
  "OONCHIUMPA_STORYTELLER_STATUS.md"
)

for file in "${oonchiumpa_files[@]}"; do
  if [ -f "$DOCS_DIR/$file" ]; then
    echo "  → docs/$file → docs/11-projects/oonchiumpa/"
    mv "$DOCS_DIR/$file" "$DOCS_DIR/11-projects/oonchiumpa/"
  fi
done

echo "✅ Oonchiumpa project docs organized"
echo ""

# ============================================================================
# DOCS ROOT: GOODS Project → /docs/11-projects/goods/
# ============================================================================

echo "📦 Phase 2.15: Moving GOODS project docs..."
echo ""

declare -a goods_files=(
  "GOODS_STORYTELLERS_FOUND.md"
)

for file in "${goods_files[@]}"; do
  if [ -f "$DOCS_DIR/$file" ]; then
    echo "  → docs/$file → docs/11-projects/goods/"
    mv "$DOCS_DIR/$file" "$DOCS_DIR/11-projects/goods/"
  fi
done

echo "✅ GOODS project docs organized"
echo ""

# ============================================================================
# DOCS ROOT: Kristy Account Project → /docs/11-projects/kristy-account/
# ============================================================================

echo "📦 Phase 2.16: Moving Kristy account project docs..."
echo ""

mkdir -p "$DOCS_DIR/11-projects/kristy-account"

declare -a kristy_files=(
  "KRISTY_ACCOUNT_WALKTHROUGH.md"
)

for file in "${kristy_files[@]}"; do
  if [ -f "$DOCS_DIR/$file" ]; then
    echo "  → docs/$file → docs/11-projects/kristy-account/"
    mv "$DOCS_DIR/$file" "$DOCS_DIR/11-projects/kristy-account/"
  fi
done

echo "✅ Kristy account docs organized"
echo ""

# ============================================================================
# DOCS ROOT: Platform Architecture → /docs/03-architecture/
# ============================================================================

echo "📦 Phase 2.17: Moving architecture docs..."
echo ""

declare -a arch_files=(
  "MULTI_TENANT_PROJECT_DESIGN.md"
  "MULTI_TENANT_WEBSITE_BACKEND_STRATEGY.md"
  "PLATFORM_ARCHITECTURE.md"
)

for file in "${arch_files[@]}"; do
  if [ -f "$DOCS_DIR/$file" ]; then
    echo "  → docs/$file → docs/03-architecture/"
    mv "$DOCS_DIR/$file" "$DOCS_DIR/03-architecture/"
  fi
done

echo "✅ Architecture docs organized"
echo ""

# ============================================================================
# DOCS ROOT: Platform Strategy → /docs/13-platform/
# ============================================================================

echo "📦 Phase 2.18: Moving platform strategy docs..."
echo ""

declare -a platform_files=(
  "RECOVERY_AND_REBUILD_PLAN.md"
  "SPRINT_PLAN_DETAILED.md"
  "STEP_BY_STEP_RESTORATION.md"
  "PAGE_REVIEW_AGENT_GUIDE.md"
  "NEXT_STEPS_CHECKLIST.md"
  "PHASE_3_STORIES_IMPLEMENTATION.md"
)

for file in "${platform_files[@]}"; do
  if [ -f "$DOCS_DIR/$file" ]; then
    echo "  → docs/$file → docs/13-platform/"
    mv "$DOCS_DIR/$file" "$DOCS_DIR/13-platform/"
  fi
done

echo "✅ Platform strategy docs organized"
echo ""

# ============================================================================
# PROJECT ROOT: AI & Analysis Reports → /docs/15-reports/analysis/
# ============================================================================

echo "📦 Phase 2.19: Moving AI & analysis reports from project root..."
echo ""

cd "$PROJECT_ROOT"

declare -a root_ai_analysis=(
  "AI_ALTERNATIVES_RESEARCH.md"
  "AI_QUOTE_QUALITY_COMPARISON.md"
  "AI_TOOLS_EVALUATION_AND_RECOMMENDATION.md"
  "ANALYSIS_CACHING_IMPLEMENTED.md"
  "GOODS_PROJECT_ANALYSIS_STATUS.md"
  "INDIGENOUS_FRAMEWORK_SCORING_REVIEW.md"
  "INTELLIGENT_AI_STATUS.md"
  "OONCHIUMPA_STORYTELLER_ANALYSIS.md"
  "WORLD_CLASS_ANALYSIS_SYSTEM_PLAN.md"
)

for file in "${root_ai_analysis[@]}"; do
  if [ -f "$file" ]; then
    echo "  → $file → docs/15-reports/analysis/"
    mv "$file" "$DOCS_DIR/15-reports/analysis/"
  fi
done

echo "✅ AI & analysis reports from root moved"
echo ""

# ============================================================================
# PROJECT ROOT: Implementation Reports → /docs/15-reports/implementation/
# ============================================================================

echo "📦 Phase 2.20: Moving implementation reports from project root..."
echo ""

declare -a root_impl=(
  "CONTEXT_SYSTEM_API_IMPLEMENTATION.md"
  "FINISH_OUTCOMES_INTEGRATION.md"
  "FRONTEND_CLAUDE_V2_TEST.md"
  "FRONTEND_NOW_USES_INTELLIGENT_AI.md"
  "GOODS_CLAUDE_V2_INTEGRATION_FIX.md"
  "GOODS_SUCCESS_CRITERIA_BEFORE_AFTER.md"
  "QUICK_ADD_COMPLETE_FIX.md"
  "QUICK_ADD_IMPROVEMENTS.md"
  "READY_TO_TEST.md"
  "READY_TO_TEST_FIXED_ANALYSIS.md"
  "VERCEL_SETUP_NOW.md"
)

for file in "${root_impl[@]}"; do
  if [ -f "$file" ]; then
    echo "  → $file → docs/15-reports/implementation/"
    mv "$file" "$DOCS_DIR/15-reports/implementation/"
  fi
done

echo "✅ Implementation reports from root moved"
echo ""

# ============================================================================
# PROJECT ROOT: Development Guides → /docs/06-development/
# ============================================================================

echo "📦 Phase 2.21: Moving development guides from project root..."
echo ""

declare -a root_dev=(
  "ACCESSING_PROJECT_CONTEXT_UI.md"
  "BACKEND_INTEGRATION_PLAN.md"
  "HOW_TO_ADD_PROJECT_CONTEXT.md"
  "OLLAMA_ANALYSIS_GUIDE.md"
  "OLLAMA_INTEGRATION_STATUS.md"
  "OLLAMA_SETUP_GUIDE.md"
  "PLATFORM_DEVELOPMENT_GUIDE.md"
  "QUICK_START_CLAUDE_V2.md"
  "RUN_CLAUDE_V2_TEST.md"
)

for file in "${root_dev[@]}"; do
  if [ -f "$file" ]; then
    echo "  → $file → docs/06-development/"
    mv "$file" "$DOCS_DIR/06-development/"
  fi
done

echo "✅ Development guides from root moved"
echo ""

# ============================================================================
# PROJECT ROOT: Testing Guides → /docs/09-testing/
# ============================================================================

echo "📦 Phase 2.22: Moving testing guides from project root..."
echo ""

declare -a root_testing=(
  "ORGANIZATION_E2E_TEST_GUIDE.md"
  "SEED_INTERVIEW_TESTING_GUIDE.md"
  "SEED_INTERVIEW_USER_GUIDE.md"
  "PR_138_SAFETY_REPORT.md"
)

for file in "${root_testing[@]}"; do
  if [ -f "$file" ]; then
    echo "  → $file → docs/09-testing/"
    mv "$file" "$DOCS_DIR/09-testing/"
  fi
done

echo "✅ Testing guides from root moved"
echo ""

# ============================================================================
# PROJECT ROOT: Projects → /docs/11-projects/
# ============================================================================

echo "📦 Phase 2.23: Moving project docs from project root..."
echo ""

# Deadly Hearts Trek project
mkdir -p "$DOCS_DIR/11-projects/deadly-hearts-trek"

if [ -f "DEADLY_HEARTS_TREK_OUTCOMES_SETUP.md" ]; then
  echo "  → DEADLY_HEARTS_TREK_OUTCOMES_SETUP.md → docs/11-projects/deadly-hearts-trek/"
  mv "DEADLY_HEARTS_TREK_OUTCOMES_SETUP.md" "$DOCS_DIR/11-projects/deadly-hearts-trek/"
fi

# Project Outcomes Tracker (general)
mkdir -p "$DOCS_DIR/11-projects/outcomes-tracker"

if [ -f "PROJECT_OUTCOMES_TRACKER.md" ]; then
  echo "  → PROJECT_OUTCOMES_TRACKER.md → docs/11-projects/outcomes-tracker/"
  mv "PROJECT_OUTCOMES_TRACKER.md" "$DOCS_DIR/11-projects/outcomes-tracker/"
fi

echo "✅ Project docs from root moved"
echo ""

# ============================================================================
# PROJECT ROOT: Platform Strategy → /docs/13-platform/
# ============================================================================

echo "📦 Phase 2.24: Moving platform/sprint docs from project root..."
echo ""

declare -a root_platform=(
  "ORGANIZATION_TYPES.md"
  "SPRINT_STATUS.md"
  "STORYTELLER_MANAGEMENT_REVIEW.md"
  "NEXT_STEPS_READY_TO_INTEGRATE.md"
)

for file in "${root_platform[@]}"; do
  if [ -f "$file" ]; then
    echo "  → $file → docs/13-platform/"
    mv "$file" "$DOCS_DIR/13-platform/"
  fi
done

echo "✅ Platform/sprint docs from root moved"
echo ""

# ============================================================================
# SUMMARY
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Phase 2 Complete - ALL Loose Documentation Organized!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "  ✓ AI & analysis reports organized"
echo "  ✓ Session reports consolidated"
echo "  ✓ Implementation reports consolidated"
echo "  ✓ Feature docs organized into /docs/05-features/"
echo "  ✓ Database docs consolidated in /docs/04-database/"
echo "  ✓ Development guides in /docs/06-development/"
echo "  ✓ Deployment guides in /docs/07-deployment/"
echo "  ✓ Integration docs in /docs/08-integrations/"
echo "  ✓ Testing guides in /docs/09-testing/"
echo "  ✓ Analytics docs in /docs/10-analytics/"
echo "  ✓ Project docs in /docs/11-projects/"
echo "  ✓ Architecture docs in /docs/03-architecture/"
echo "  ✓ Platform strategy in /docs/13-platform/"
echo ""
echo "📁 Check remaining files:"
echo "  ls /Users/benknight/Code/empathy-ledger-v2/docs/*.md"
echo "  ls /Users/benknight/Code/empathy-ledger-v2/*.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

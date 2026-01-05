#!/bin/bash
#
# Documentation Reorganization Script
# Moves 250+ documentation files into AI-agent friendly structure
# Based on ACT Farmhand PMPP framework (Principles, Methods, Practices, Procedures)
#
# Usage: ./scripts/reorganize-documentation.sh
#

set -e  # Exit on error

PROJECT_ROOT="/Users/benknight/Code/empathy-ledger-v2"
DOCS_DIR="$PROJECT_ROOT/docs"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 Empathy Ledger Documentation Reorganization"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This script will reorganize 250+ documentation files into:"
echo "  - PMPP Framework (Principles, Methods, Practices, Procedures)"
echo "  - AI-agent friendly navigation"
echo "  - Clear directory structure with READMEs"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$PROJECT_ROOT"

# ============================================================================
# PHASE 1: Move Session Reports to /docs/15-reports/sessions/
# ============================================================================

echo "📦 PHASE 1: Moving session reports..."
echo ""

mkdir -p "$DOCS_DIR/15-reports/sessions"

# Move SESSION_* files
for file in SESSION_*.md; do
  if [ -f "$file" ]; then
    echo "  → $file → docs/15-reports/sessions/"
    mv "$file" "$DOCS_DIR/15-reports/sessions/"
  fi
done

echo "✅ Session reports moved"
echo ""

# ============================================================================
# PHASE 2: Move Implementation Reports to /docs/15-reports/implementation/
# ============================================================================

echo "📦 PHASE 2: Moving implementation reports..."
echo ""

mkdir -p "$DOCS_DIR/15-reports/implementation"

# Move IMPLEMENTATION_* files
for file in IMPLEMENTATION_*.md; do
  if [ -f "$file" ]; then
    echo "  → $file → docs/15-reports/implementation/"
    mv "$file" "$DOCS_DIR/15-reports/implementation/"
  fi
done

# Move *_COMPLETE.md files
for file in *_COMPLETE.md; do
  if [ -f "$file" ]; then
    echo "  → $file → docs/15-reports/implementation/"
    mv "$file" "$DOCS_DIR/15-reports/implementation/"
  fi
done

# Move WEEK_*.md files
for file in WEEK_*.md; do
  if [ -f "$file" ]; then
    echo "  → $file → docs/15-reports/implementation/"
    mv "$file" "$DOCS_DIR/15-reports/implementation/"
  fi
done

echo "✅ Implementation reports moved"
echo ""

# ============================================================================
# PHASE 3: Move Analysis Reports to /docs/15-reports/analysis/
# ============================================================================

echo "📦 PHASE 3: Moving analysis reports..."
echo ""

mkdir -p "$DOCS_DIR/15-reports/analysis"

# Move analysis and summary files
declare -a analysis_files=(
  "COMPREHENSIVE_DATABASE_STATUS_2025.md"
  "COMPREHENSIVE_SUPABASE_DATABASE_ANALYSIS_REPORT.md"
  "COMPREHENSIVE_ANALYSIS_REPORT.md"
  "GOODS_ANALYSIS_FIX_SUMMARY.md"
  "AI_QUALITY_IMPROVEMENT_SUMMARY.md"
  "CLAUDE_TOOLS_AUDIT_REPORT.md"
  "RESEARCH_ANALYSIS_FRAMEWORK_RECOMMENDATION.md"
)

for file in "${analysis_files[@]}"; do
  if [ -f "$file" ]; then
    echo "  → $file → docs/15-reports/analysis/"
    mv "$file" "$DOCS_DIR/15-reports/analysis/"
  fi
done

echo "✅ Analysis reports moved"
echo ""

# ============================================================================
# PHASE 4: Move Strategic Docs to /docs/13-platform/ (if not already there)
# ============================================================================

echo "📦 PHASE 4: Organizing strategic platform docs..."
echo ""

# These should already be in docs/, but let's verify and move if needed
declare -a strategic_files=(
  "EMPATHY_LEDGER_WIKI.md"
  "EMPATHY_LEDGER_STRATEGIC_FOUNDATION.md"
  "EMPATHY_LEDGER_IMPLEMENTATION_PLAN.md"
  "EMPATHY_LEDGER_TECHNICAL_ARCHITECTURE.md"
  "EMPATHY_LEDGER_COMPLETE_STRATEGIC_PLAN.md"
  "EMPATHY_LEDGER_MESSAGING_REVIEW.md"
)

for file in "${strategic_files[@]}"; do
  if [ -f "$file" ]; then
    echo "  → $file → docs/13-platform/"
    mv "$file" "$DOCS_DIR/13-platform/"
  elif [ -f "$DOCS_DIR/$file" ]; then
    echo "  → docs/$file → docs/13-platform/"
    mv "$DOCS_DIR/$file" "$DOCS_DIR/13-platform/"
  fi
done

echo "✅ Strategic docs organized"
echo ""

# ============================================================================
# PHASE 5: Move GOODS Project Docs to /docs/11-projects/goods/
# ============================================================================

echo "📦 PHASE 5: Organizing GOODS project docs..."
echo ""

mkdir -p "$DOCS_DIR/11-projects/goods"

declare -a goods_files=(
  "GOODS_PROJECT_SETUP.md"
  "GOODS_STRATEGIC_PATH_FORWARD.md"
  "GOODS_AI_QUOTE_FABRICATION_ISSUE.md"
  "GOODS_OUTCOMES_TRACKER_PROBLEM.md"
)

for file in "${goods_files[@]}"; do
  if [ -f "$file" ]; then
    echo "  → $file → docs/11-projects/goods/"
    mv "$file" "$DOCS_DIR/11-projects/goods/"
  fi
done

# Move from docs/ root if there
if [ -f "$DOCS_DIR/GOODS_PROJECT_SETUP.md" ]; then
  mv "$DOCS_DIR/GOODS_PROJECT_SETUP.md" "$DOCS_DIR/11-projects/goods/"
fi

echo "✅ GOODS project docs organized"
echo ""

# ============================================================================
# PHASE 6: Move Design Docs to /docs/12-design/
# ============================================================================

echo "📦 PHASE 6: Organizing design system docs..."
echo ""

mkdir -p "$DOCS_DIR/12-design"

declare -a design_files=(
  "BRAND_AND_UI_STYLE_GUIDE.md"
  "SMART_GALLERY_QUICK_REFERENCE.md"
)

for file in "${design_files[@]}"; do
  if [ -f "$DOCS_DIR/$file" ]; then
    echo "  → docs/$file → docs/12-design/"
    mv "$DOCS_DIR/$file" "$DOCS_DIR/12-design/"
  fi
done

echo "✅ Design docs organized"
echo ""

# ============================================================================
# PHASE 7: Move Architecture Docs to /docs/03-architecture/
# ============================================================================

echo "📦 PHASE 7: Organizing architecture docs..."
echo ""

mkdir -p "$DOCS_DIR/03-architecture"

declare -a arch_files=(
  "EMPATHY_LEDGER_TECHNICAL_ARCHITECTURE.md"
  "COMPLETE_PAGE_ARCHITECTURE_WITH_MEDIA.md"
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
# PHASE 8: Move Principles Docs to /docs/01-principles/
# ============================================================================

echo "📦 PHASE 8: Organizing principles docs..."
echo ""

mkdir -p "$DOCS_DIR/01-principles"

declare -a principle_files=(
  "EMPATHY_LEDGER_MESSAGING_REVIEW.md"
  "MULTI_TENANT_BEST_PRACTICES.md"
  "OPERATIONAL_PRINCIPLES_MULTI_TENANT.md"
)

for file in "${principle_files[@]}"; do
  if [ -f "$DOCS_DIR/$file" ]; then
    echo "  → docs/$file → docs/01-principles/"
    mv "$DOCS_DIR/$file" "$DOCS_DIR/01-principles/"
  fi
done

echo "✅ Principles docs organized"
echo ""

# ============================================================================
# PHASE 9: Move Methods Docs to /docs/02-methods/
# ============================================================================

echo "📦 PHASE 9: Organizing methods/framework docs..."
echo ""

mkdir -p "$DOCS_DIR/02-methods"

declare -a method_files=(
  "ai-enhancement-system-implementation-plan.md"
  "ai-enhancement-system-implementation.md"
  "individual-transcript-analysis-system-implementation-plan.md"
  "individual-transcript-analysis-system-implementation.md"
  "STORY_CREATION_FRAMEWORK.md"
)

for file in "${method_files[@]}"; do
  if [ -f "$DOCS_DIR/$file" ]; then
    echo "  → docs/$file → docs/02-methods/"
    mv "$DOCS_DIR/$file" "$DOCS_DIR/02-methods/"
  fi
done

echo "✅ Methods docs organized"
echo ""

# ============================================================================
# PHASE 10: Create README files for each directory
# ============================================================================

echo "📝 PHASE 10: Creating directory READMEs..."
echo ""

# Reports sessions README
cat > "$DOCS_DIR/15-reports/sessions/README.md" << 'EOF'
# Session Completion Reports

**Purpose**: Historical session completion summaries

**What This Is**: Reports documenting major development sessions, feature completions, and milestones achieved throughout the Empathy Ledger development process.

**Sacred Boundaries** (NEVER):
- ❌ Never delete these reports without archiving (they show development history)
- ❌ Never use outdated session reports as current guidance (check dates)

## Quick Navigation

- **Most Recent Sessions** - Sort by date to find latest work
- **Feature-Specific Sessions** - Look for session names matching feature

## Time Frame

Most reports from: October 2025 - January 2026

---

**Time Saved**: These reports help agents understand what was already completed, avoiding duplicate work.
EOF

echo "  ✓ Created 15-reports/sessions/README.md"

# Reports implementation README
cat > "$DOCS_DIR/15-reports/implementation/README.md" << 'EOF'
# Implementation Completion Reports

**Purpose**: Implementation summaries and completion confirmations

**What This Is**: Reports confirming successful implementation of features, integrations, upgrades, and system components.

**Sacred Boundaries** (NEVER):
- ❌ Never assume implementation is current (check dates and verify in codebase)
- ❌ Never use completion reports as implementation guides (see /docs/05-features/ instead)

## Quick Navigation

- **Week-Based Reports** - WEEK_*.md files tracking weekly progress
- **Feature Completions** - *_COMPLETE.md files for feature confirmations
- **Integration Reports** - *_INTEGRATION_COMPLETE.md for external integrations

## Categories

- Database implementations
- AI system upgrades
- Storyteller management features
- JusticeHub integration
- Claude AI integrations

---

**Time Saved**: Quickly verify what is already implemented before planning new work.
EOF

echo "  ✓ Created 15-reports/implementation/README.md"

# Reports analysis README
cat > "$DOCS_DIR/15-reports/analysis/README.md" << 'EOF'
# Analysis Reports

**Purpose**: Comprehensive analysis reports on database, codebase, and systems

**What This Is**: Detailed analysis reports covering database health, schema analysis, code quality, and system audits.

**Sacred Boundaries** (NEVER):
- ❌ Never use outdated analysis without verifying current state
- ❌ Never skip database analysis before making schema changes

## Key Reports

- **COMPREHENSIVE_DATABASE_STATUS_2025.md** - Database health and structure
- **COMPREHENSIVE_SUPABASE_DATABASE_ANALYSIS_REPORT.md** - Supabase-specific analysis
- **CLAUDE_TOOLS_AUDIT_REPORT.md** - AI tools audit

---

**Time Saved**: Understand system state before making changes.
EOF

echo "  ✓ Created 15-reports/analysis/README.md"

# Platform README
cat > "$DOCS_DIR/13-platform/README.md" << 'EOF'
# Platform Overview and Strategy

**Purpose**: Strategic foundation, vision, and platform-level documentation

**What This Is**: High-level strategic documents defining Empathy Ledger's mission, vision, technical architecture, and implementation roadmap.

**Sacred Boundaries** (NEVER):
- ❌ Never deviate from OCAP principles documented here
- ❌ Never change messaging without reviewing MESSAGING_REVIEW.md

## Key Documents

- **EMPATHY_LEDGER_WIKI.md** - Platform wiki and overview
- **EMPATHY_LEDGER_STRATEGIC_FOUNDATION.md** - Strategic foundation and mission
- **EMPATHY_LEDGER_TECHNICAL_ARCHITECTURE.md** - Technical architecture overview
- **EMPATHY_LEDGER_MESSAGING_REVIEW.md** - Partnership-focused messaging guidelines

---

**Time Saved**: Understand the "why" before building the "how".
EOF

echo "  ✓ Created 13-platform/README.md"

# GOODS project README
cat > "$DOCS_DIR/11-projects/goods/README.md" << 'EOF'
# GOODS Project Documentation

**Purpose**: Project-specific documentation for the GOODS (Goods Outcomes Outcomes Design System) project

**What This Is**: Setup guides, strategic plans, and issue documentation specific to the GOODS project integration with Empathy Ledger.

**Sacred Boundaries** (NEVER):
- ❌ Never apply GOODS-specific solutions to other projects without validation
- ❌ Never ignore known issues documented here

## Key Documents

- **GOODS_PROJECT_SETUP.md** - Project setup and configuration
- **GOODS_STRATEGIC_PATH_FORWARD.md** - Strategic direction
- **GOODS_AI_QUOTE_FABRICATION_ISSUE.md** - Known AI quote fabrication issue
- **GOODS_OUTCOMES_TRACKER_PROBLEM.md** - Outcomes tracker issues

---

**Time Saved**: Avoid rediscovering known issues and solutions.
EOF

echo "  ✓ Created 11-projects/goods/README.md"

# Design README
cat > "$DOCS_DIR/12-design/README.md" << 'EOF'
# Design System Documentation

**Purpose**: Brand guidelines, UI/UX standards, and design system documentation

**What This Is**: Design principles, brand guidelines, component documentation, and visual style guides for Empathy Ledger.

**Sacred Boundaries** (NEVER):
- ❌ Never use colors outside the ochre/terracotta palette without justification
- ❌ Never skip trauma-informed design principles

## Key Documents

- **BRAND_AND_UI_STYLE_GUIDE.md** - Complete brand and UI guidelines
- **SMART_GALLERY_QUICK_REFERENCE.md** - Gallery component reference

---

**Time Saved**: Maintain consistent design without reinventing patterns.
EOF

echo "  ✓ Created 12-design/README.md"

# Architecture README
cat > "$DOCS_DIR/03-architecture/README.md" << 'EOF'
# Technical Architecture Documentation

**Purpose**: System architecture, technical design, and structural documentation

**What This Is**: High-level technical architecture documents explaining how Empathy Ledger is structured, page architecture, and system design patterns.

**Sacred Boundaries** (NEVER):
- ❌ Never add new pages without reviewing page architecture
- ❌ Never change multi-tenant architecture without careful RLS policy review

## Key Documents

- **EMPATHY_LEDGER_TECHNICAL_ARCHITECTURE.md** - Overall technical architecture
- **COMPLETE_PAGE_ARCHITECTURE_WITH_MEDIA.md** - Complete page structure and routing

---

**Time Saved**: Understand system design before adding new components.
EOF

echo "  ✓ Created 03-architecture/README.md"

# Principles README
cat > "$DOCS_DIR/01-principles/README.md" << 'EOF'
# Principles: Why We Do Things

**Purpose**: Core values, philosophy, and guiding principles

**What This Is**: Foundational documents explaining WHY Empathy Ledger operates the way it does - cultural protocols, messaging guidelines, and multi-tenant philosophy.

**Sacred Boundaries** (NEVER):
- ❌ Never violate OCAP principles (Ownership, Control, Access, Possession)
- ❌ Never use savior-complex language (see messaging guidelines)
- ❌ Never prioritize platform control over storyteller sovereignty

## Key Documents

- **EMPATHY_LEDGER_MESSAGING_REVIEW.md** - Partnership-focused messaging (not "empower")
- **MULTI_TENANT_BEST_PRACTICES.md** - Multi-tenant principles
- **OPERATIONAL_PRINCIPLES_MULTI_TENANT.md** - Operational philosophy

---

**Time Saved**: Make decisions aligned with core values without constant consultation.
EOF

echo "  ✓ Created 01-principles/README.md"

# Methods README
cat > "$DOCS_DIR/02-methods/README.md" << 'EOF'
# Methods: Frameworks and Approaches

**Purpose**: Methodologies, frameworks, and systematic approaches

**What This Is**: Documentation of how Empathy Ledger implements complex systems like AI enhancement, transcript analysis, and story creation.

**Sacred Boundaries** (NEVER):
- ❌ Never modify AI analysis pipelines without understanding the full framework
- ❌ Never skip story creation framework guidelines

## Key Documents

- **ai-enhancement-system-implementation-plan.md** - AI enhancement methodology
- **individual-transcript-analysis-system-implementation-plan.md** - Transcript analysis framework
- **STORY_CREATION_FRAMEWORK.md** - Story creation methodology

---

**Time Saved**: Follow proven frameworks instead of inventing from scratch.
EOF

echo "  ✓ Created 02-methods/README.md"

echo "✅ Directory READMEs created"
echo ""

# ============================================================================
# SUMMARY
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Documentation Reorganization Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "  ✓ Session reports → docs/15-reports/sessions/"
echo "  ✓ Implementation reports → docs/15-reports/implementation/"
echo "  ✓ Analysis reports → docs/15-reports/analysis/"
echo "  ✓ Strategic docs → docs/13-platform/"
echo "  ✓ GOODS project → docs/11-projects/goods/"
echo "  ✓ Design docs → docs/12-design/"
echo "  ✓ Architecture docs → docs/03-architecture/"
echo "  ✓ Principles docs → docs/01-principles/"
echo "  ✓ Methods docs → docs/02-methods/"
echo "  ✓ Directory READMEs created"
echo ""
echo "📁 New Structure:"
echo "  /docs/"
echo "    ├── 01-principles/      (Why we do things)"
echo "    ├── 02-methods/         (Frameworks)"
echo "    ├── 03-architecture/    (Technical design)"
echo "    ├── 04-database/        (Database docs)"
echo "    ├── 05-features/        (Feature specs)"
echo "    ├── 06-development/     (Dev guides)"
echo "    ├── 07-deployment/      (Deployment)"
echo "    ├── 08-integrations/    (External integrations)"
echo "    ├── 09-testing/         (Testing guides)"
echo "    ├── 10-analytics/       (Analytics system)"
echo "    ├── 11-projects/        (Project-specific)"
echo "    ├── 12-design/          (Design system)"
echo "    ├── 13-platform/        (Platform strategy)"
echo "    ├── 14-poc/             (Proof of concepts)"
echo "    └── 15-reports/         (Status reports)"
echo ""
echo "🎯 Next Steps:"
echo "  1. Review docs/README.md for navigation"
echo "  2. Update CLAUDE.md with new structure"
echo "  3. Test agent navigation"
echo "  4. Create CONTRIBUTING.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

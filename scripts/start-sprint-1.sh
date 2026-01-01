#!/bin/bash

# Sprint 1 Startup Script
# Empathy Ledger v2 - Jan 6-17, 2026

set -e

echo "🚀 Starting Sprint 1: Profile Pages & Privacy Controls"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "feat/sprint-1-profile-pages" ]; then
  echo -e "${YELLOW}⚠️  Creating new feature branch for Sprint 1${NC}"

  # Ensure develop is up to date
  git fetch origin develop

  # Create new branch from develop
  git checkout -b feat/sprint-1-profile-pages origin/develop
  echo -e "${GREEN}✓ Created feat/sprint-1-profile-pages branch${NC}"
fi

# Install dependencies
echo ""
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo ""
  echo -e "${YELLOW}⚠️  .env.local not found, copying from .env.example${NC}"
  cp .env.example .env.local
  echo -e "${YELLOW}⚠️  Please configure your .env.local with Supabase credentials${NC}"
  echo ""
fi

# Start Supabase (if using local)
echo ""
echo -e "${BLUE}🗄️  Starting Supabase...${NC}"
npx supabase start || echo "Supabase already running or using remote instance"

# Generate database types
echo ""
echo -e "${BLUE}📝 Generating database types...${NC}"
npm run db:types || echo "Using existing types"

# Run type check
echo ""
echo -e "${BLUE}🔍 Running type check...${NC}"
npm run type-check

# Start development server
echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo "Sprint 1 Deliverables:"
echo "  - Avatar component with fallback chain"
echo "  - ProfilePage component"
echo "  - PrivacySettingsPanel"
echo "  - ALMA settings panel"
echo "  - Profile edit functionality"
echo ""
echo "📚 Documentation:"
echo "  - Sprint Plan: docs/SPRINT_PLAN_DETAILED.md"
echo "  - Brand Guide: docs/BRAND_AND_UI_STYLE_GUIDE.md"
echo "  - Page Architecture: docs/COMPLETE_PAGE_ARCHITECTURE_WITH_MEDIA.md"
echo "  - Dev Workflow: .github/DEVELOPMENT_WORKFLOW.md"
echo ""
echo -e "${BLUE}🎨 Starting development server...${NC}"
echo ""

npm run dev

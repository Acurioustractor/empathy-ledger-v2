#!/bin/bash

# Pre-Deployment Verification Checklist
# Validates environment and setup before deploying to production

set -e

echo "🔍 Empathy Ledger v2 - Pre-Deployment Checklist"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASS=0
FAIL=0
WARN=0

# Helper functions
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASS++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAIL++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARN++))
}

# 1. Environment Variables
echo "1️⃣  Checking Environment Variables..."
echo "──────────────────────────────────────"

if [ -f .env.local ]; then
    check_pass ".env.local exists"

    # Check required variables
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        check_pass "NEXT_PUBLIC_SUPABASE_URL found"
    else
        check_fail "NEXT_PUBLIC_SUPABASE_URL missing"
    fi

    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        check_pass "NEXT_PUBLIC_SUPABASE_ANON_KEY found"
    else
        check_fail "NEXT_PUBLIC_SUPABASE_ANON_KEY missing"
    fi

    if grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local; then
        check_pass "SUPABASE_SERVICE_ROLE_KEY found"
    else
        check_fail "SUPABASE_SERVICE_ROLE_KEY missing"
    fi

    if grep -q "OPENAI_API_KEY" .env.local; then
        check_pass "OPENAI_API_KEY found"
    else
        check_warn "OPENAI_API_KEY missing (optional for AI features)"
    fi
else
    check_fail ".env.local not found"
    echo -e "${YELLOW}   Copy .env.production.example to .env.local${NC}"
fi
echo ""

# 2. Dependencies
echo "2️⃣  Checking Dependencies..."
echo "──────────────────────────────────────"

if [ -d node_modules ]; then
    check_pass "node_modules directory exists"
else
    check_fail "node_modules not found - run 'npm install'"
fi

if [ -f package-lock.json ]; then
    check_pass "package-lock.json exists"
else
    check_warn "package-lock.json missing"
fi
echo ""

# 3. TypeScript
echo "3️⃣  Checking TypeScript..."
echo "──────────────────────────────────────"

if npm run type-check > /dev/null 2>&1; then
    check_pass "TypeScript compilation successful"
else
    check_fail "TypeScript errors found - run 'npm run type-check'"
fi
echo ""

# 4. Build Test
echo "4️⃣  Testing Build..."
echo "──────────────────────────────────────"

if [ -d .next ]; then
    check_pass ".next build directory exists"
    echo -e "${YELLOW}   Note: Run 'npm run build' to ensure fresh build${NC}"
else
    check_warn ".next directory not found - run 'npm run build' to test"
fi
echo ""

# 5. Database Connection
echo "5️⃣  Checking Database..."
echo "──────────────────────────────────────"

if [ -d supabase ]; then
    check_pass "Supabase directory exists"

    if [ -f supabase/config.toml ]; then
        check_pass "Supabase config found"
    else
        check_warn "Supabase config.toml missing"
    fi

    if [ -d supabase/migrations ]; then
        MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
        if [ "$MIGRATION_COUNT" -gt 0 ]; then
            check_pass "$MIGRATION_COUNT database migrations found"
        else
            check_warn "No migration files found"
        fi
    else
        check_warn "No migrations directory"
    fi
else
    check_warn "Supabase directory not found"
fi
echo ""

# 6. Deployment Scripts
echo "6️⃣  Checking Deployment Scripts..."
echo "──────────────────────────────────────"

if [ -x scripts/deploy-to-vercel.sh ]; then
    check_pass "deploy-to-vercel.sh is executable"
else
    if [ -f scripts/deploy-to-vercel.sh ]; then
        check_warn "deploy-to-vercel.sh exists but not executable"
        echo -e "${YELLOW}   Run: chmod +x scripts/deploy-to-vercel.sh${NC}"
    else
        check_fail "deploy-to-vercel.sh not found"
    fi
fi

if [ -f scripts/seed-uat-demo-data.ts ]; then
    check_pass "UAT seeding script exists"
else
    check_warn "UAT seeding script not found"
fi
echo ""

# 7. Documentation
echo "7️⃣  Checking Documentation..."
echo "──────────────────────────────────────"

if [ -f DEPLOYMENT_GUIDE.md ]; then
    check_pass "DEPLOYMENT_GUIDE.md exists"
else
    check_warn "DEPLOYMENT_GUIDE.md missing"
fi

if [ -f QUICK_DEPLOY.md ]; then
    check_pass "QUICK_DEPLOY.md exists"
else
    check_warn "QUICK_DEPLOY.md missing"
fi

if [ -f UAT_TESTING_GUIDE.md ]; then
    check_pass "UAT_TESTING_GUIDE.md exists"
else
    check_warn "UAT_TESTING_GUIDE.md missing"
fi
echo ""

# 8. Git Status
echo "8️⃣  Checking Git Repository..."
echo "──────────────────────────────────────"

if git rev-parse --git-dir > /dev/null 2>&1; then
    check_pass "Git repository initialized"

    BRANCH=$(git branch --show-current)
    echo -e "   Current branch: ${BLUE}$BRANCH${NC}"

    if [ -n "$(git status --porcelain)" ]; then
        check_warn "Uncommitted changes detected"
        echo -e "${YELLOW}   Consider committing before deployment${NC}"
    else
        check_pass "Working directory clean"
    fi
else
    check_warn "Not a git repository"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 CHECKLIST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✓ Passed:${NC}  $PASS"
echo -e "${YELLOW}⚠ Warnings:${NC} $WARN"
echo -e "${RED}✗ Failed:${NC}  $FAIL"
echo ""

# Final recommendation
if [ $FAIL -eq 0 ] && [ $WARN -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL CHECKS PASSED!${NC}"
    echo "You're ready to deploy to production."
    echo ""
    echo "Next steps:"
    echo "  1. Run: ./scripts/deploy-to-vercel.sh"
    echo "  2. Or follow: QUICK_DEPLOY.md"
    exit 0
elif [ $FAIL -eq 0 ]; then
    echo -e "${YELLOW}⚠️  READY WITH WARNINGS${NC}"
    echo "You can proceed, but review warnings above."
    echo ""
    echo "Next steps:"
    echo "  1. Fix warnings (optional)"
    echo "  2. Run: ./scripts/deploy-to-vercel.sh"
    echo "  3. Or follow: QUICK_DEPLOY.md"
    exit 0
else
    echo -e "${RED}❌ NOT READY FOR DEPLOYMENT${NC}"
    echo "Please fix the failed checks above before deploying."
    echo ""
    echo "Common fixes:"
    echo "  • Run: npm install"
    echo "  • Create: .env.local from .env.production.example"
    echo "  • Run: npm run type-check"
    exit 1
fi

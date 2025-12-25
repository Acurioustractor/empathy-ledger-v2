#!/bin/bash

# Empathy Ledger Deployment Script
# Ensures proper GitHub commit, Vercel deployment, and version sync

set -e  # Exit on error

echo "🚀 Empathy Ledger Deployment Workflow"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_step() {
    echo -e "\n${YELLOW}➡️  $1${NC}\n"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Not in project root directory. Please run from /empathy-ledger-v2/"
    exit 1
fi

# ==========================================
# STEP 1: PRE-DEPLOYMENT CHECKS
# ==========================================

print_step "Step 1: Running Pre-Deployment Checks"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Please commit or stash them first."
    git status --short
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# Type checking
print_step "Running TypeScript type check..."
if npm run build > /tmp/build.log 2>&1; then
    print_success "TypeScript type check passed"
else
    print_error "Build failed. Check /tmp/build.log for details"
    tail -20 /tmp/build.log
    exit 1
fi

# Linting
print_step "Running linter..."
if npm run lint > /tmp/lint.log 2>&1; then
    print_success "Lint check passed"
else
    print_warning "Lint warnings found. Check /tmp/lint.log"
    # Don't exit - warnings are okay
fi

# Check PWA files exist
print_step "Verifying PWA configuration..."

if [ ! -f "public/manifest.json" ]; then
    print_error "Missing public/manifest.json"
    exit 1
fi

ICON_COUNT=$(ls public/icon-*.png 2>/dev/null | wc -l)
if [ "$ICON_COUNT" -lt 8 ]; then
    print_error "Missing app icons. Expected at least 8, found $ICON_COUNT"
    echo "Run: ./scripts/create-icons.sh"
    exit 1
fi

print_success "PWA files verified ($ICON_COUNT icons found)"

# Check vercel.json exists
if [ ! -f "vercel.json" ]; then
    print_warning "Missing vercel.json - Vercel will use defaults"
fi

# ==========================================
# STEP 2: DATABASE MIGRATION CHECK
# ==========================================

print_step "Step 2: Checking Database Migrations"

# Check if there are pending migrations
if command -v supabase &> /dev/null; then
    if supabase db diff 2>&1 | grep -q "No changes detected"; then
        print_success "Database schema in sync"
    else
        print_warning "Pending database migrations detected"
        echo ""
        supabase db diff
        echo ""
        read -p "Apply migrations now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            supabase db push
            print_success "Migrations applied"
        else
            print_error "Please apply migrations before deploying"
            exit 1
        fi
    fi
else
    print_warning "Supabase CLI not installed - skipping migration check"
fi

# ==========================================
# STEP 3: VERSION BUMP
# ==========================================

print_step "Step 3: Version Bump"

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Current version: $CURRENT_VERSION"
echo ""
echo "Select version bump type:"
echo "  1) patch (bug fixes)      - $CURRENT_VERSION → $(npm version --no-git-tag-version patch | sed 's/v//')"
echo "  2) minor (new features)   - $CURRENT_VERSION → $(npm version --no-git-tag-version minor | sed 's/v//')"
echo "  3) major (breaking changes) - $CURRENT_VERSION → $(npm version --no-git-tag-version major | sed 's/v//')"
echo "  4) skip (keep current version)"
echo ""

# Reset version after showing preview
git checkout package.json package-lock.json 2>/dev/null || true

read -p "Enter choice (1-4): " VERSION_CHOICE

case $VERSION_CHOICE in
    1)
        npm version patch
        print_success "Version bumped to patch"
        ;;
    2)
        npm version minor
        print_success "Version bumped to minor"
        ;;
    3)
        npm version major
        print_success "Version bumped to major"
        ;;
    4)
        print_warning "Skipping version bump"
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

NEW_VERSION=$(node -p "require('./package.json').version")
echo "Version: $NEW_VERSION"

# ==========================================
# STEP 4: COMMIT & PUSH TO GITHUB
# ==========================================

print_step "Step 4: Commit & Push to GitHub"

# Check if there are changes to commit (from version bump)
if [ -n "$(git status --porcelain)" ]; then
    echo "Detected changes from version bump. Creating commit..."

    # Show what will be committed
    git status --short

    # Default commit message
    DEFAULT_MSG="chore: bump version to $NEW_VERSION for deployment"

    read -p "Enter commit message (or press Enter for default): " COMMIT_MSG
    COMMIT_MSG=${COMMIT_MSG:-$DEFAULT_MSG}

    git add package.json package-lock.json
    git commit -m "$COMMIT_MSG

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

    print_success "Changes committed"
fi

# Push to GitHub
echo ""
read -p "Push to GitHub branch '$CURRENT_BRANCH'? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin "$CURRENT_BRANCH"
    print_success "Pushed to GitHub"

    # If not on main, suggest creating PR
    if [ "$CURRENT_BRANCH" != "main" ]; then
        print_warning "You're on branch '$CURRENT_BRANCH', not 'main'"
        echo ""
        read -p "Create Pull Request? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if command -v gh &> /dev/null; then
                gh pr create --title "Release v$NEW_VERSION" --body "Deployment PR for version $NEW_VERSION"
                print_success "Pull Request created"
            else
                print_warning "GitHub CLI not installed. Create PR manually at:"
                echo "https://github.com/$(git config --get remote.origin.url | sed 's/.*://;s/.git$//')/compare/$CURRENT_BRANCH"
            fi
        fi
    fi
else
    print_warning "Skipped GitHub push"
fi

# ==========================================
# STEP 5: VERCEL DEPLOYMENT
# ==========================================

print_step "Step 5: Vercel Deployment"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not installed"
    echo ""
    echo "Install with: npm install -g vercel"
    echo "Then run: vercel --prod"
    echo ""
    read -p "Continue without deploying to Vercel? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "Deployment options:"
    echo "  1) Deploy to preview (test deployment)"
    echo "  2) Deploy to production"
    echo "  3) Skip Vercel deployment (auto-deploy via GitHub)"
    echo ""
    read -p "Enter choice (1-3): " DEPLOY_CHOICE

    case $DEPLOY_CHOICE in
        1)
            print_step "Deploying to preview..."
            vercel
            print_success "Preview deployment complete"
            echo ""
            echo "Test the preview URL before promoting to production"
            ;;
        2)
            print_step "Deploying to production..."
            vercel --prod
            print_success "Production deployment complete"
            ;;
        3)
            print_warning "Skipped Vercel deployment"
            echo "If GitHub integration is configured, Vercel will auto-deploy"
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
fi

# ==========================================
# STEP 6: POST-DEPLOYMENT VERIFICATION
# ==========================================

print_step "Step 6: Post-Deployment Verification"

echo "Manual verification checklist:"
echo ""
echo "Desktop Testing:"
echo "  [ ] Visit production URL"
echo "  [ ] Homepage loads without errors"
echo "  [ ] Check console for errors (F12)"
echo "  [ ] Test signup flow"
echo "  [ ] Verify database connections work"
echo "  [ ] Check manifest.json: curl https://yoursite.com/manifest.json"
echo ""
echo "Mobile Testing (iPhone):"
echo "  [ ] Visit site in Safari"
echo "  [ ] Tap Share → 'Add to Home Screen'"
echo "  [ ] Open app from home screen"
echo "  [ ] Verify full-screen mode (no Safari UI)"
echo "  [ ] Test camera access"
echo "  [ ] Test all core features"
echo ""
echo "Mobile Testing (Android):"
echo "  [ ] Visit site in Chrome"
echo "  [ ] Tap 'Install App' banner"
echo "  [ ] Open app from home screen"
echo "  [ ] Verify full-screen mode"
echo "  [ ] Test all features"
echo ""
echo "Version Sync Verification:"
echo "  [ ] Confirmed ONE codebase deployed"
echo "  [ ] PWA manifest accessible"
echo "  [ ] Auto-update mechanism working"
echo ""

# ==========================================
# COMPLETION
# ==========================================

echo ""
echo "======================================"
print_success "Deployment Workflow Complete!"
echo "======================================"
echo ""
echo "Next Steps:"
echo "  1. Test the deployment thoroughly"
echo "  2. Monitor Vercel logs for errors"
echo "  3. Check analytics for traffic"
echo "  4. Be ready to rollback if issues arise"
echo ""
echo "Rollback command (if needed):"
echo "  git revert HEAD && git push origin $CURRENT_BRANCH"
echo ""
echo "Version deployed: v$NEW_VERSION"
echo "Branch: $CURRENT_BRANCH"
echo ""

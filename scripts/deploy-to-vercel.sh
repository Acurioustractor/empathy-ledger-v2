#!/bin/bash

# Deployment Script for Empathy Ledger v2
# Automated deployment to Vercel

set -e  # Exit on error

echo "🚀 Empathy Ledger v2 - Deployment Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo "Install with: npm install -g vercel"
    exit 1
fi

echo -e "${GREEN}✅ Vercel CLI found${NC}"
echo ""

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Vercel${NC}"
    echo "Logging in..."
    vercel login
fi

echo -e "${GREEN}✅ Logged in to Vercel${NC}"
echo ""

# Run pre-deployment checks
echo "🔍 Running pre-deployment checks..."
echo ""

# 1. Check for TypeScript errors
echo "📝 Checking TypeScript..."
if npm run type-check; then
    echo -e "${GREEN}✅ TypeScript check passed${NC}"
else
    echo -e "${RED}❌ TypeScript errors found${NC}"
    echo "Fix TypeScript errors before deploying"
    exit 1
fi
echo ""

# 2. Check for linting errors
echo "🔍 Running linter..."
if npm run lint; then
    echo -e "${GREEN}✅ Lint check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Linting warnings found (continuing anyway)${NC}"
fi
echo ""

# 3. Try to build locally
echo "🏗️  Testing build..."
if npm run build; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    echo "Fix build errors before deploying"
    exit 1
fi
echo ""

# Ask for deployment type
echo "Select deployment type:"
echo "1) Production (--prod)"
echo "2) Preview (default)"
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        DEPLOY_FLAG="--prod"
        ENV="production"
        echo -e "${YELLOW}⚠️  Deploying to PRODUCTION${NC}"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            echo "Deployment cancelled"
            exit 0
        fi
        ;;
    2)
        DEPLOY_FLAG=""
        ENV="preview"
        echo "Deploying to PREVIEW"
        ;;
    *)
        echo "Invalid choice, using preview"
        DEPLOY_FLAG=""
        ENV="preview"
        ;;
esac
echo ""

# Check environment variables
echo "🔐 Checking environment variables..."
required_vars=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "OPENAI_API_KEY"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if ! vercel env ls $ENV 2>/dev/null | grep -q "$var"; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Missing environment variables:${NC}"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo ""
    read -p "Do you want to add them now? (yes/no): " add_vars
    if [ "$add_vars" = "yes" ]; then
        for var in "${missing_vars[@]}"; do
            echo ""
            read -p "Enter value for $var: " value
            vercel env add $var $ENV <<< "$value"
        done
    else
        echo "Please add missing environment variables and try again"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Environment variables configured${NC}"
echo ""

# Deploy
echo "🚀 Starting deployment..."
echo ""

if vercel $DEPLOY_FLAG; then
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Get deployment URL
    URL=$(vercel ls 2>/dev/null | grep $ENV | head -1 | awk '{print $2}')
    if [ -n "$URL" ]; then
        echo "🌐 Your app is live at:"
        echo "   $URL"
        echo ""
    fi

    echo "📊 Next steps:"
    echo "   1. Visit your deployment URL"
    echo "   2. Test critical features"
    echo "   3. Check error logs: vercel logs"
    echo "   4. Monitor analytics in Vercel dashboard"
    echo ""

    if [ "$ENV" = "production" ]; then
        echo -e "${YELLOW}⚠️  Production deployment complete!${NC}"
        echo "   - Monitor for errors"
        echo "   - Run smoke tests"
        echo "   - Notify team"
    fi
else
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "Check the error messages above"
    exit 1
fi

echo ""
echo "✅ Deployment script complete"

# Production Launch - Quick Reference

**Empathy Ledger v2 Production Deployment**

---

## 🚀 Three Ways to Deploy

### 1️⃣ Fastest (Automated - Recommended)
```bash
# One-command verification and deployment
./scripts/pre-deployment-checklist.sh && ./scripts/deploy-to-vercel.sh
```

### 2️⃣ Guided (5 minutes)
Follow [QUICK_DEPLOY.md](QUICK_DEPLOY.md) steps 1-5

### 3️⃣ Comprehensive (30 minutes)
Follow full [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## ✅ Quick Verification

**Before deploying, run:**
```bash
./scripts/pre-deployment-checklist.sh
```

This checks:
- ✓ Environment variables
- ✓ Dependencies installed
- ✓ TypeScript compiles
- ✓ Build succeeds
- ✓ Database setup
- ✓ Git status

---

## 🧪 UAT (User Testing) Setup

### 1. Seed Demo Data
```bash
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
npx tsx scripts/seed-uat-demo-data.ts
```

**Creates:**
- 1 demo organization
- 3 demo storytellers
- 5 demo stories
- Theme registry populated

### 2. Follow UAT Guide
See [UAT_TESTING_GUIDE.md](UAT_TESTING_GUIDE.md) for:
- 4 testing sessions (60-90 min each)
- Test scenarios
- Feedback forms

---

## 📋 Environment Variables

**Required:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_SECRET=generate-with-openssl
```

**Optional:**
```bash
OPENAI_API_KEY=sk-your-key     # For AI features
```

---

## 📚 Documentation

| Document | Purpose | Time |
|----------|---------|------|
| [LAUNCH_READINESS.md](LAUNCH_READINESS.md) | Complete overview | 5 min |
| [QUICK_DEPLOY.md](QUICK_DEPLOY.md) | Fast deployment | 5 min |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Full guide | 30 min |
| [UAT_TESTING_GUIDE.md](UAT_TESTING_GUIDE.md) | User testing | 15 min |

---

## 🎯 Quick Commands

```bash
# Verify setup
./scripts/pre-deployment-checklist.sh

# Deploy to Vercel
./scripts/deploy-to-vercel.sh

# Seed UAT data
npx tsx scripts/seed-uat-demo-data.ts

# Database migrations
supabase db push
```

---

## ✨ What's Deployed

- ✅ 131+ Components
- ✅ 50+ API Endpoints
- ✅ Performance optimized
- ✅ Accessibility (WCAG 2.1 AAA)
- ✅ 100% OCAP compliance
- ✅ Security hardened
- ✅ Error handling
- ✅ Monitoring ready

---

## 🎉 Launch Checklist

**Setup** (15 min)
- [ ] Create `.env.local` from example
- [ ] Set environment variables
- [ ] Run `npm install`
- [ ] Create Supabase project
- [ ] Run migrations

**Deploy** (10 min)
- [ ] Run pre-deployment check
- [ ] Deploy to Vercel
- [ ] Verify deployment

**UAT** (15 min)
- [ ] Seed demo data
- [ ] Create test accounts
- [ ] Schedule testing

---

## 🆘 Quick Troubleshooting

**Build fails:**
```bash
rm -rf .next node_modules && npm install && npm run build
```

**Database issues:**
```bash
echo $NEXT_PUBLIC_SUPABASE_URL  # Verify URL
supabase db push                # Run migrations
```

**Deployment script:**
```bash
chmod +x scripts/*.sh           # Make executable
```

---

## 📞 Need Help?

- Full deployment: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- Troubleshooting: [DEPLOYMENT_GUIDE.md#troubleshooting](DEPLOYMENT_GUIDE.md#troubleshooting)
- UAT procedures: [UAT_TESTING_GUIDE.md](UAT_TESTING_GUIDE.md)

---

**Ready? Start here:**
```bash
./scripts/pre-deployment-checklist.sh
```

*Status: Production Ready ✅ | Version: 1.0.0 | Date: Jan 6, 2026*

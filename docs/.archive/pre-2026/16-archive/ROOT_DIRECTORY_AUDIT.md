# Root Directory Audit - Best Practices Review

**Date**: January 6, 2026
**Purpose**: Comprehensive review of all root-level files and folders
**Goal**: Ensure production-ready, best-practice organization

---

## 📊 CURRENT STATE ANALYSIS

### Root Directory Contents (69 items total)

#### ✅ KEEP - Essential Files (4)
- README.md ✅
- START_HERE.md ✅
- CLAUDE.md ✅
- GETTING_STARTED.md ✅

#### ✅ KEEP - Configuration Files (12)
- package.json ✅
- package-lock.json ✅
- tsconfig.json ✅
- next.config.js ✅
- tailwind.config.ts ✅
- postcss.config.js ✅
- vercel.json ✅
- .gitignore ✅
- .npmrc ✅
- .claudeignore ✅
- .mcp.json ✅
- next-env.d.ts ✅ (auto-generated)

#### ✅ KEEP - Essential Directories (6)
- src/ ✅ (source code)
- docs/ ✅ (documentation - just organized!)
- public/ ✅ (static assets)
- supabase/ ✅ (database)
- node_modules/ ✅ (dependencies)
- .next/ ✅ (Next.js build output)

#### ⚠️ REVIEW - Hidden Directories (9)
- .git/ ✅ (version control - keep)
- .github/ ⚠️ (GitHub workflows - review)
- .claude/ ✅ (Claude skills - keep)
- .supabase/ ✅ (Supabase CLI - keep)
- .vercel/ ✅ (Vercel deployment - keep)
- .husky/ ⚠️ (Git hooks - review if used)
- .archive/ ⚠️ (old files - should be in archive/ or docs/16-archive/)

#### ❌ MOVE/CLEAN - Test Files (11)
- test-consent-api.js → scripts/
- test-consent-manual.sh → scripts/
- test-consent-with-login.sh → scripts/
- test-story-api-final.sh → scripts/
- test-story-api-service-role.sh → scripts/
- test-story-api.sh → scripts/
- test-syndication.sh → scripts/
- test-direct-insert.sql → scripts/
- .vercel-deploy-test → DELETE or archive
- get-my-token.js → scripts/
- get-token.html → scripts/ or DELETE

#### ❌ MOVE/CLEAN - SQL Files (4)
- fix-audit-trigger.sql → supabase/migrations/ or archive
- fix-cultural-sensitivity-constraint.sql → supabase/migrations/ or archive
- fix-stories-rls.sql → supabase/migrations/ or archive
- deploy_sprint2_direct.sql → archive
- deploy_sprint2_migrations.sql → archive

#### ❌ MOVE/CLEAN - Deployment Scripts (3)
- deploy.sh → scripts/ or DELETE if obsolete
- deploy-migrations.sh → scripts/ or DELETE if obsolete
- start-dev.sh → scripts/ or DELETE if obsolete

#### ❌ MOVE/CLEAN - Data Files (4)
- GOODS_COMPREHENSIVE_INSIGHTS.json → archive/ or examples/
- GOODS_SEED_INTERVIEW.json → archive/ or examples/
- training-data-506.json → archive/ or examples/
- training-data-506.jsonl → archive/ or examples/

#### ❌ MOVE/CLEAN - Build Artifacts (1)
- tsconfig.tsbuildinfo → (should be in .gitignore)

#### ❌ MOVE/CLEAN - Extra Directories (10)
- archive/ ⚠️ (redundant with docs/16-archive/)
- database/ ⚠️ (redundant with supabase/?)
- migrations/ ⚠️ (redundant with supabase/migrations/)
- Design files/ → docs/12-design/ or archive
- backups/ → .gitignore or move outside repo
- logs/ → .gitignore
- reports/ ⚠️ (check if needed vs docs/15-reports/)
- screenshots/ → docs/14-poc/ or archive
- test-pages/ → src/app/ or DELETE
- test-results/ → .gitignore or archive
- templates/ ⚠️ (check if used)
- examples/ ✅ (keep if has useful examples)

#### ❌ DELETE - System Files (1)
- .DS_Store (macOS) → add to .gitignore
- KILL_BACKGROUND_SCRIPTS.sh → DELETE or move to scripts/

---

## 🎯 RECOMMENDED ACTIONS

### Priority 1: Move Test/Script Files (15 files)
```bash
# Move test scripts to scripts/testing/
mkdir -p scripts/testing
mv test-*.sh scripts/testing/
mv test-*.js scripts/testing/
mv test-*.sql scripts/testing/
mv get-my-token.js scripts/testing/
mv get-token.html scripts/testing/
```

### Priority 2: Move/Archive SQL Files (5 files)
```bash
# Archive old deployment SQL
mkdir -p archive/old-migrations
mv deploy_sprint2_*.sql archive/old-migrations/

# Move fix scripts to supabase
mv fix-*.sql supabase/migrations/fixes/
```

### Priority 3: Move Deployment Scripts (3 files)
```bash
# Move to scripts/deployment/
mkdir -p scripts/deployment
mv deploy.sh scripts/deployment/ 2>/dev/null || echo "deploy.sh not needed"
mv deploy-migrations.sh scripts/deployment/ 2>/dev/null || echo "Use supabase CLI instead"
mv start-dev.sh scripts/deployment/ 2>/dev/null || echo "Use npm run dev instead"
```

### Priority 4: Move Data Files (4 files)
```bash
# Move to examples or archive
mv GOODS_*.json examples/data/ 2>/dev/null || mv GOODS_*.json archive/
mv training-data-506.* archive/ai-training-data/
```

### Priority 5: Clean Up Directories (6 actions)

**A. Consolidate Archives**
```bash
# Move .archive contents to main archive
mv .archive/* archive/ 2>/dev/null
rmdir .archive
```

**B. Review database/ directory**
```bash
# Check if database/ is redundant with supabase/
# If yes, move contents or delete
ls -la database/
# Decision: Move or delete based on contents
```

**C. Review migrations/ directory**
```bash
# Check if migrations/ is redundant with supabase/migrations/
# If yes, move contents or delete
ls -la migrations/
# Decision: Move or delete based on contents
```

**D. Move Design Files**
```bash
# Move to docs
mv "Design files"/* docs/12-design/ 2>/dev/null
rmdir "Design files"
```

**E. Handle backups, logs, test-results**
```bash
# Add to .gitignore if not already
echo "backups/" >> .gitignore
echo "logs/" >> .gitignore
echo "test-results/" >> .gitignore
echo ".DS_Store" >> .gitignore
echo "tsconfig.tsbuildinfo" >> .gitignore
```

**F. Review and handle other directories**
```bash
# screenshots/ - move to docs or archive
mv screenshots/* docs/14-poc/screenshots/ 2>/dev/null

# test-pages/ - check if needed
ls -la test-pages/
# If obsolete, delete

# templates/ - check if used
ls -la templates/
# If used, keep; if obsolete, archive

# reports/ - check vs docs/15-reports/
ls -la reports/
# If duplicates docs, delete
```

### Priority 6: Update .gitignore
```bash
# Add commonly ignored items
cat >> .gitignore << 'EOF'

# Development
backups/
logs/
test-results/
*.log

# System files
.DS_Store
Thumbs.db

# Build artifacts
tsconfig.tsbuildinfo
.next/
.vercel/

# Environment
.env*.local
!.env.example

# Test files
test-pages/
EOF
```

---

## 📋 BEST PRACTICES CHECKLIST

### ✅ Should Be in Root
- [x] README.md
- [x] package.json
- [x] Configuration files (.json, .js, .ts)
- [x] .gitignore
- [x] src/
- [x] public/
- [x] docs/
- [x] supabase/ (or database/)
- [x] node_modules/
- [x] .git/

### ❌ Should NOT Be in Root
- [ ] Test scripts (move to scripts/testing/)
- [ ] SQL fix files (move to supabase/migrations/fixes/)
- [ ] Deployment scripts (move to scripts/deployment/)
- [ ] Data files (move to examples/ or archive/)
- [ ] Build artifacts (add to .gitignore)
- [ ] System files (.DS_Store - add to .gitignore)
- [ ] Redundant directories (consolidate or delete)
- [ ] Old migration files (archive)

### ⚠️ Review These
- [ ] .archive/ - Consolidate with archive/
- [ ] database/ - Check if redundant with supabase/
- [ ] migrations/ - Check if redundant with supabase/migrations/
- [ ] Design files/ - Move to docs/12-design/
- [ ] backups/ - Add to .gitignore or move outside repo
- [ ] logs/ - Add to .gitignore
- [ ] reports/ - Check if redundant with docs/15-reports/
- [ ] screenshots/ - Move to docs/14-poc/
- [ ] test-pages/ - Delete if obsolete
- [ ] test-results/ - Add to .gitignore
- [ ] templates/ - Keep if used, archive if not
- [ ] .husky/ - Keep if using git hooks, remove if not

---

## 🎯 IDEAL ROOT DIRECTORY STRUCTURE

After cleanup, root should contain:

```
empathy-ledger-v2/
├── .github/              # GitHub workflows (if used)
├── .claude/              # Claude skills
├── .git/                 # Version control
├── .next/                # Next.js build (gitignored)
├── .supabase/            # Supabase CLI config
├── .vercel/              # Vercel deployment config
├── docs/                 # Documentation (organized!)
├── examples/             # Example data/code (if needed)
├── node_modules/         # Dependencies (gitignored)
├── public/               # Static assets
├── scripts/              # All scripts organized
│   ├── testing/          # Test scripts
│   ├── deployment/       # Deployment scripts
│   └── ...              # Other script categories
├── src/                  # Source code
├── supabase/             # Database (migrations, seed data)
├── archive/              # Historical files (gitignored or selectively committed)
├── .gitignore            # Git ignore rules
├── .npmrc                # npm configuration
├── CLAUDE.md             # AI context
├── GETTING_STARTED.md    # Developer onboarding
├── next.config.js        # Next.js config
├── next-env.d.ts         # Next.js types (auto-generated)
├── package.json          # Dependencies
├── package-lock.json     # Dependency lock
├── postcss.config.js     # PostCSS config
├── README.md             # Main documentation
├── START_HERE.md         # Quick start
├── tailwind.config.ts    # Tailwind config
├── tsconfig.json         # TypeScript config
└── vercel.json           # Vercel config
```

**Total**: ~25 items (down from 69)

---

## 📊 CLEANUP IMPACT

### Before Cleanup
- **69 items** in root directory
- **38 files** that shouldn't be in root
- **10 redundant directories**
- Confusing organization
- Development clutter

### After Cleanup
- **~25 items** in root directory
- Only essential files and directories
- Clear, professional organization
- Follows Next.js best practices
- Production-ready

### Reduction
- **64% fewer items** in root ✅
- All test/script files organized
- All data files archived
- All redundant directories consolidated

---

## ⏱️ ESTIMATED TIME

- **Priority 1** (Test/Script files): 5 minutes
- **Priority 2** (SQL files): 3 minutes
- **Priority 3** (Deployment scripts): 2 minutes
- **Priority 4** (Data files): 2 minutes
- **Priority 5** (Directory cleanup): 15 minutes
- **Priority 6** (.gitignore update): 2 minutes

**Total**: ~30 minutes

---

## 🎯 NEXT STEPS

1. **Review this audit** with the team
2. **Verify redundant directories** before deleting
3. **Execute cleanup priorities** 1-6
4. **Update .gitignore** to prevent future clutter
5. **Commit changes** with clear message
6. **Document any kept unusual files** in README

---

## ⚠️ WARNINGS

### Before Deleting Anything
- [ ] Check if database/ has unique content vs supabase/
- [ ] Check if migrations/ has unique content vs supabase/migrations/
- [ ] Verify backups/ doesn't have needed backups
- [ ] Check if test-pages/ is used in development
- [ ] Verify templates/ isn't actively used
- [ ] Ensure reports/ doesn't have unique reports

### Files That Look Suspicious
- `KILL_BACKGROUND_SCRIPTS.sh` - What does this kill? Still needed?
- `.vercel-deploy-test` - Test file, can likely delete
- `tsconfig.tsbuildinfo` - Should be gitignored
- Multiple test scripts - Why so many? Can we consolidate?

---

## 📝 RECOMMENDATIONS SUMMARY

### Immediate Actions (High Priority)
1. ✅ Move all test-*.sh, test-*.js files to scripts/testing/
2. ✅ Move all fix-*.sql files to supabase/migrations/fixes/
3. ✅ Archive deploy_sprint2_*.sql files
4. ✅ Move GOODS_*.json and training-data to examples/ or archive/
5. ✅ Update .gitignore to prevent future clutter

### Review & Decide (Medium Priority)
1. ⚠️ Review database/ directory - is it needed?
2. ⚠️ Review migrations/ directory - redundant with supabase/migrations/?
3. ⚠️ Review reports/ directory - redundant with docs/15-reports/?
4. ⚠️ Check templates/ - is it used?
5. ⚠️ Check test-pages/ - is it used?

### Nice to Have (Low Priority)
1. 📁 Move "Design files" to docs/12-design/
2. 📁 Move screenshots/ to docs/14-poc/screenshots/
3. 📁 Consolidate .archive/ into archive/
4. 🗑️ Delete KILL_BACKGROUND_SCRIPTS.sh if not needed
5. 🗑️ Delete .vercel-deploy-test

---

## ✅ BENEFITS

After cleanup:
- **Professional appearance** for open source or client handoff
- **Easy to navigate** for new developers
- **Follows Next.js best practices**
- **Production-ready** organization
- **Clear separation** of code, config, docs, and scripts
- **No clutter** in root directory

---

**Ready to execute cleanup and achieve a best-practice root directory!**

**Current**: 69 items (cluttered)
**Target**: ~25 items (professional)
**Reduction**: 64% ✅

# File Organization Guide

## 📁 Project Structure

The Empathy Ledger v2 project has been organized for clarity and maintainability.

### Root Directory (Clean)
```
/
├── README.md                    # Project overview
├── CLAUDE.md                    # AI assistant context
├── next.config.js              # Next.js configuration
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript config
└── .env.local                  # Environment variables
```

### 📚 Documentation (`/docs`)

#### Platform Documentation (`/docs/platform`)
- `EMPATHY_LEDGER_PLATFORM_PROSPECTUS.md` - Platform overview
- `EMPATHY_LEDGER_COMPLETE_PLATFORM_PROSPECTUS.md` - Detailed prospectus
- `PRODUCTION_READINESS_REPORT.md` - Production deployment status
- `SITE_AUDIT_REPORT.md` - Site audit findings
- `DEPLOYMENT_COMPLETE.md` - Deployment documentation

#### Development Documentation (`/docs/development`)
- `AUSTRALIAN_SPELLING_GUIDE.md` - 🇦🇺 Spelling conventions
- `SPELLING_GUIDELINES.md` - Additional spelling rules
- `DEVELOPMENT_STANDARDS.md` - Development best practices
- `FRONTEND_BEST_PRACTICES.md` - Frontend guidelines
- `FRONTEND_STORY_WORKFLOW_PLAN.md` - Story workflow
- `DATABASE_ACTION_PLAN.md` - Database management
- `GOOGLE_OAUTH_SETUP.md` - OAuth configuration
- `LOCAL_HOSTING_SETUP.md` - Local development setup
- `STORY_CREATION_FRAMEWORK.md` - Story creation guide
- `JUNCTION_TABLES_ANALYSIS_REPORT.md` - Database analysis

#### Analytics Documentation (`/docs/analytics`)
- `STORYTELLER_ANALYTICS_DATABASE_DESIGN.md` - Analytics schema
- `STORYTELLER_ANALYTICS_IMPLEMENTATION_GUIDE.md` - Implementation guide
- `STORYTELLER_CARD_ENHANCEMENT_GUIDE.md` - UI improvements
- `STORYTELLER_CARD_IMPROVEMENTS.md` - Card design updates
- `LAUNCH_STORYTELLER_ANALYTICS.md` - Analytics launch plan
- `snow-foundation-ai-analysis-report.md` - AI analysis results
- `STORY_CLEANUP_REPORT.md` - Data cleanup report

### 🛠️ Scripts (`/scripts`)

#### Analysis Scripts (`/scripts/analysis`)
- `analyze-*.js` - Various data analysis scripts
- `comprehensive-*.js` - Comprehensive analysis tools
- `debug-*.js` - Debugging utilities
- `final-*.js` - Final analysis reports
- `investigate-*.js` - Investigation tools

#### Migration Scripts (`/scripts/migration`)
- `apply-*.js` - Apply database migrations
- `*-migration*.js` - Migration utilities
- `*.sql` - SQL migration files
- `MIGRATION_PART_1.sql` - Phased migration scripts
- `COMBINED_STORYTELLER_ANALYTICS_MIGRATION.sql` - Analytics migration

#### Data Management (`/scripts/data-management`)
- `cleanup-*.js` - Data cleanup scripts
- `check-*.js` - Data validation checks
- `batch-*.js` - Batch processing
- `complete-*.js` - Completion scripts
- `populate-*.js` - Data population
- `delete-*.js` - Deletion utilities
- `find-*.js` - Search utilities
- `fix-*.js` - Data fixes
- `create-*.js` - Creation scripts
- `enhance-*.js` - Data enhancement
- `link-*.js` - Relationship management
- `regenerate-*.js` - Data regeneration
- `remove-*.js` - Removal utilities
- `restore-*.js` - Data restoration
- `setup-*.js` - Setup scripts

#### Validation Scripts (`/scripts/validation`)
- `validate-*.js` - Validation utilities
- `australian-spelling-audit.js` - 🇦🇺 Spelling checker
- `test-*.js` - Test scripts
- `verify-*.js` - Verification tools
- `validate-database-schema.js` - Schema validation

### 🧪 Test Pages (`/test-pages`)
- Various HTML files for testing authentication and features
- `quick-login.html`
- `super-admin-login.html`
- `test-ai-generation.html`
- etc.

### 💾 Database (`/database`)
- Images and assets for database seeding
- Sample data files

### 🎨 Design Files (`/Design files`)
- Design documentation and mockups

## 📝 Quick Reference

### Running Scripts

#### Validation
```bash
npm run validate:spelling    # Check Australian spelling
npm run validate:schema      # Validate DB schema
npm run type-check          # TypeScript validation
```

#### Data Management
```bash
node scripts/analysis/analyze-storytellers.js
node scripts/migration/apply-migration.js
node scripts/data-management/cleanup-bios.js
```

#### Development
```bash
npm run dev                 # Start dev server
npm run build               # Build for production
npm run lint                # Run linting
```

## 🔍 Finding Files

### By Type
- **Documentation**: `/docs/`
- **Scripts**: `/scripts/`
- **Source Code**: `/src/`
- **Tests**: `/test-pages/` and `*.spec.ts` files
- **Config**: Root directory (`*.config.js`, `*.json`)

### By Purpose
- **Australian Spelling**: `/docs/development/AUSTRALIAN_SPELLING_GUIDE.md`
- **Database Scripts**: `/scripts/migration/` and `/scripts/data-management/`
- **Analytics**: `/docs/analytics/` and `/scripts/analysis/`
- **Development Setup**: `/docs/development/LOCAL_HOSTING_SETUP.md`

## 🚀 Getting Started

1. Read `/README.md` for project overview
2. Check `/docs/development/LOCAL_HOSTING_SETUP.md` for setup
3. Review `/docs/development/DEVELOPMENT_STANDARDS.md` for coding standards
4. Use `/CLAUDE.md` for AI assistant context

## 📊 File Statistics

- **~50** JavaScript utility scripts organized
- **~25** Documentation files categorized
- **~10** SQL migration files archived
- **~15** HTML test pages grouped

All files are now properly organized for easy access and maintenance!

---

*Last organized: December 2024*
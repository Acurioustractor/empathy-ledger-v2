# Deployment Checklist

Use this checklist before pushing to GitHub or deploying to production.

## Pre-Commit Checklist

### Code Quality

- [ ] All TypeScript errors resolved (`npm run build`)
- [ ] No `console.log` statements in production code
- [ ] No `any` types without justification
- [ ] All imports organized and unused imports removed
- [ ] Code formatted consistently

### Database

- [ ] All migrations are idempotent (use `IF NOT EXISTS`, `DROP IF EXISTS`)
- [ ] Migrations tested locally (`npm run db:reset`)
- [ ] TypeScript types generated and up-to-date (`npm run db:types`)
- [ ] RLS policies implemented on all tables
- [ ] Tenant isolation verified on multi-tenant tables
- [ ] No hardcoded IDs or sensitive data in migrations

### Security

- [ ] No API keys or secrets in code
- [ ] Environment variables documented in `.env.example`
- [ ] RLS policies tested for all user roles
- [ ] Admin routes protected
- [ ] CORS configured appropriately
- [ ] Input validation on all forms and API endpoints

### Cultural Sensitivity

- [ ] Elder status displayed respectfully
- [ ] Traditional territories acknowledged
- [ ] Cultural backgrounds shown with context
- [ ] Consent workflows implemented
- [ ] No cultural appropriation in design
- [ ] Respectful language throughout ("storyteller" not "user")
- [ ] Sacred knowledge markers implemented

### Testing

- [ ] Critical paths have E2E tests
- [ ] Forms tested with valid and invalid data
- [ ] Error states handled gracefully
- [ ] Loading states implemented
- [ ] Mobile responsive design verified

### Documentation

- [ ] README.md up to date
- [ ] API changes documented
- [ ] New environment variables added to docs
- [ ] Database schema changes noted
- [ ] Migration backup created if needed

## Pre-Push to GitHub

### Repository Hygiene

- [ ] `.gitignore` includes all sensitive files
- [ ] No `.env` or `.env.local` files committed
- [ ] No `node_modules/` committed
- [ ] No `.DS_Store` files
- [ ] Large files (<100MB) not committed

### Branch Strategy

- [ ] Working on feature branch (not main)
- [ ] Branch name follows convention (`feature/`, `fix/`, `docs/`)
- [ ] Commits are atomic and well-described
- [ ] Commit messages follow conventional commits

### Files to Check

```bash
# Should NOT be in git
.env
.env.local
.env.production
node_modules/
.next/
.DS_Store
*.log

# SHOULD be in git
.env.example
README.md
package.json
package-lock.json
tsconfig.json
next.config.js
supabase/migrations/
docs/
```

## Pre-Production Deployment

### Environment Setup

- [ ] Production environment variables configured
- [ ] Database migrations applied to production
- [ ] Storage buckets created and configured
- [ ] CORS settings configured for production domain
- [ ] SSL certificates valid

### Performance

- [ ] Images optimized
- [ ] Build size checked (`npm run build`)
- [ ] No unnecessary dependencies
- [ ] Code splitting implemented where needed
- [ ] Lazy loading for heavy components

### Monitoring

- [ ] Error tracking configured (Sentry, etc.)
- [ ] Analytics tracking implemented
- [ ] Database query performance reviewed
- [ ] RLS policy performance tested

### Backup & Recovery

- [ ] Database backup strategy in place
- [ ] Migration rollback procedure tested
- [ ] Storage backup configured
- [ ] Disaster recovery plan documented

## Post-Deployment Verification

- [ ] Site loads correctly
- [ ] Authentication works
- [ ] Forms submit successfully
- [ ] Database queries return expected data
- [ ] Real-time features working
- [ ] File uploads functioning
- [ ] Email notifications sending (if applicable)
- [ ] All integrations operational

## Git Commands

```bash
# Review changes
git status
git diff

# Stage changes
git add .

# Commit
git commit -m "feat: describe your changes"

# Push to GitHub
git push origin feature/your-branch

# Create PR
gh pr create --title "Your feature" --body "Description"
```

## Quick Fixes for Common Issues

### "TypeScript errors"
```bash
npm run build
# Fix errors shown
npm run db:types  # Regenerate if DB-related
```

### "Migration conflicts"
```bash
npm run db:pull    # Pull remote state
# Review generated migration
# Commit if needed
```

### "Missing environment variables"
```bash
cp .env.example .env.local
# Fill in values
```

### "RLS policy blocking data"
```bash
# Check policies in migration files
# Test with admin client in API route
# Verify tenant_id matching
```

## Emergency Rollback

If deployment causes issues:

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Rollback database migration
supabase migration new rollback_feature
# Write SQL to undo changes
npm run db:push
```

## Checklist Template

Copy this for each deployment:

```markdown
## Deployment [YYYY-MM-DD]

**Feature**: [Feature name]
**Branch**: [feature/branch-name]
**Jira**: [TICKET-123]

### Pre-Commit
- [ ] TypeScript builds
- [ ] Tests passing
- [ ] Cultural sensitivity reviewed
- [ ] RLS policies implemented

### Pre-Push
- [ ] No secrets committed
- [ ] Documentation updated
- [ ] Migrations backed up

### Post-Deploy
- [ ] Site functional
- [ ] No errors in logs
- [ ] Performance acceptable

**Deployed by**: [Your name]
**Deployed at**: [YYYY-MM-DD HH:MM]
```

# Common Tasks - Empathy Ledger v2

Quick reference for frequent development tasks and workflows.

## Table of Contents

- [Development Workflow](#development-workflow)
- [Database Operations](#database-operations)
- [Story Management](#story-management)
- [User Management](#user-management)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Development Workflow

### Start Development Server

```bash
# Start Next.js dev server on port 3005
npm run dev

# Start on custom port
npm run dev -- -p 3006

# Start with turbopack (faster)
npm run dev --turbo
```

### Check Code Quality

```bash
# Run TypeScript type checking
npm run type-check

# Run ESLint
npm run lint

# Auto-fix linting issues
npm run lint -- --fix

# Run all checks (type + lint)
npm run check
```

### Build for Production

```bash
# Create production build
npm run build

# Test production build locally
npm run start
```

---

## Database Operations

### Interactive Database CLI

```bash
# Launch interactive database management
npm run db:sync

# Menu options:
# 1. Pull schema from remote
# 2. Push migrations to remote
# 3. Generate TypeScript types
# 4. Audit RLS policies
# 5. View migration status
```

### Pull Latest Schema

```bash
# Pull schema from remote Supabase
npm run db:pull

# This updates: supabase/migrations/ with latest schema
```

### Push Migrations

```bash
# Push local migrations to remote
npm run db:push

# ⚠️ WARNING: This modifies production database
```

### Generate TypeScript Types

```bash
# Generate types from database schema
npm run db:types

# Creates: src/types/database/supabase.ts (17,000+ lines)
```

### Create New Migration

```bash
# Create empty migration file
npx supabase migration new migration_name

# Edit: supabase/migrations/YYYYMMDDHHMMSS_migration_name.sql
```

### Audit RLS Policies

```bash
# Run comprehensive RLS audit
npm run db:audit

# Output:
# - Lists all 273 RLS policies
# - Shows missing policies
# - Highlights optimization opportunities
```

### Reset Local Database

```bash
# ⚠️ WARNING: Destroys local data

# Stop Supabase
npx supabase stop

# Reset database
npx supabase db reset

# Start Supabase
npx supabase start
```

### Query Database

```bash
# Direct SQL query
npx supabase db execute --sql "SELECT * FROM profiles LIMIT 5"

# Run SQL file
npx supabase db execute --file path/to/query.sql
```

---

## Story Management

### Create a Story

#### Via UI
1. Navigate to `/projects`
2. Select a project
3. Click "New Story"
4. Fill in story details
5. Upload media (optional)
6. Save

#### Via API

```typescript
// POST /api/stories
const response = await fetch('/api/stories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    project_id: 'project-uuid',
    title: 'My Story Title',
    content: 'Story content here...',
    status: 'draft'
  })
})

const story = await response.json()
```

#### Via Direct Database

```sql
-- Insert story
INSERT INTO stories (
  project_id,
  storyteller_id,
  tenant_id,
  title,
  status
) VALUES (
  'project-uuid',
  'user-uuid',
  'tenant-uuid',
  'My Story Title',
  'draft'
);
```

### Upload Media to Story

```typescript
// Upload to Supabase Storage
const file = event.target.files[0]

const { data, error } = await supabase.storage
  .from('media-assets')
  .upload(`${storyId}/${file.name}`, file)

// Create media_assets record
await supabase.from('media_assets').insert({
  story_id: storyId,
  file_path: data.path,
  file_type: file.type,
  file_size: file.size
})
```

### Transcribe Audio/Video

```typescript
// POST /api/stories/[id]/transcripts
const response = await fetch(`/api/stories/${storyId}/transcripts`, {
  method: 'POST',
  body: JSON.stringify({
    media_asset_id: 'media-uuid',
    language: 'en'
  })
})

// Returns: transcript job ID for polling
```

### Analyze Transcript

```typescript
// POST /api/stories/[id]/analyze
const response = await fetch(`/api/stories/${storyId}/analyze`, {
  method: 'POST',
  body: JSON.stringify({
    extract_themes: true,
    extract_quotes: true,
    generate_summary: true
  })
})

// Returns: analysis results with themes, quotes, summary
```

### Share Story

```typescript
// Create shareable link
const { data } = await supabase
  .from('story_distributions')
  .insert({
    story_id: storyId,
    distribution_type: 'public_link',
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  })
  .select('access_token')
  .single()

const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/embed/stories/${storyId}?token=${data.access_token}`
```

---

## User Management

### Create New User (Admin)

```sql
-- 1. Create auth user (via Supabase Dashboard or auth.users table)
-- 2. Profile is auto-created via trigger
-- 3. Assign organization and role

UPDATE profiles
SET
  tenant_id = 'tenant-uuid',
  role = 'community_member',
  display_name = 'User Name'
WHERE email = 'user@example.com';
```

### Change User Role

```sql
-- Update role
UPDATE profiles
SET role = 'storyteller'
WHERE id = 'user-uuid';

-- Verify
SELECT id, email, role, role_level
FROM profiles
WHERE id = 'user-uuid';
```

### Assign User to Organization

```sql
-- Get organization's tenant_id
SELECT tenant_id FROM organisations WHERE slug = 'org-slug';

-- Assign user
UPDATE profiles
SET tenant_id = 'tenant-uuid-from-above'
WHERE id = 'user-uuid';

-- Create organization membership record
INSERT INTO organization_members (
  organization_id,
  profile_id,
  role
) VALUES (
  'org-uuid',
  'user-uuid',
  'member'
);
```

### List All Users in Organization

```sql
SELECT
  p.id,
  p.email,
  p.display_name,
  p.role,
  p.created_at,
  om.role as membership_role
FROM profiles p
JOIN organization_members om ON om.profile_id = p.id
WHERE p.tenant_id = 'tenant-uuid'
ORDER BY p.created_at DESC;
```

---

## Testing

### Run Unit Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- auth.test.ts

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Run E2E Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run specific test
npx playwright test tests/auth/login.spec.ts

# Run in UI mode (interactive)
npx playwright test --ui

# Run in debug mode
npx playwright test --debug
```

### Test Specific Feature

```bash
# Test authentication flow
npm run test -- tests/auth/

# Test story creation
npm run test -- tests/stories/

# Test API routes
npm run test -- tests/api/
```

---

## Deployment

### Deploy to Vercel

```bash
# Interactive deployment script
./scripts/deploy.sh

# Follow prompts:
# 1. Choose environment (staging/production)
# 2. Run pre-flight checks
# 3. Confirm deployment
# 4. Push to GitHub
# 5. Vercel auto-deploys
```

### Manual Deployment Steps

```bash
# 1. Run checks
npm run build
npm run lint
npm run type-check

# 2. Verify migrations
npm run db:sync

# 3. Commit and push
git add .
git commit -m "feat: description"
git push origin main

# 4. Vercel deploys automatically
```

### Deploy Database Changes

```bash
# 1. Create migration
npx supabase migration new add_feature

# 2. Write SQL in migration file
# Edit: supabase/migrations/YYYYMMDDHHMMSS_add_feature.sql

# 3. Test locally
npx supabase db reset

# 4. Push to remote
npm run db:push

# ⚠️ Always migrate database BEFORE deploying code changes
```

### Rollback Deployment

#### Vercel Rollback
1. Go to [Vercel Dashboard](https://vercel.com)
2. Select project
3. Go to **Deployments**
4. Find previous working deployment
5. Click **•••** → **Promote to Production**

#### Database Rollback

```bash
# Create rollback migration
npx supabase migration new rollback_feature

# Write reverse SQL
# DROP TABLE added_table;
# ALTER TABLE modified_table DROP COLUMN added_column;

# Push rollback
npm run db:push
```

---

## Troubleshooting

### Build Fails

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### TypeScript Errors

```bash
# Regenerate database types
npm run db:types

# Restart TypeScript server (in VS Code)
# CMD+Shift+P → "TypeScript: Restart TS Server"

# Check for type errors
npm run type-check
```

### Database Connection Issues

```bash
# Check Supabase status
npx supabase status

# Restart Supabase
npx supabase stop
npx supabase start

# Verify environment variables
cat .env.local | grep SUPABASE
```

### RLS Policy Violations

```sql
-- Check user's tenant_id and role
SELECT id, email, tenant_id, role, role_level
FROM profiles
WHERE id = 'user-uuid';

-- Check resource's tenant_id
SELECT id, tenant_id, storyteller_id
FROM stories
WHERE id = 'story-uuid';

-- Temporarily disable RLS (testing only!)
ALTER TABLE stories DISABLE ROW LEVEL SECURITY;
-- Remember to re-enable!
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
```

### Port Already in Use

```bash
# Find process on port 3005
lsof -ti:3005

# Kill process
lsof -ti:3005 | xargs kill

# Verify port is free
lsof -ti:3005
```

### Supabase CLI Issues

```bash
# Update Supabase CLI
npm update -g supabase

# Check version
supabase --version

# Reset Supabase (nuclear option)
npx supabase stop --no-backup
npx supabase start
```

---

## Quick Command Reference

### Daily Development

```bash
npm run dev              # Start dev server
npm run type-check       # Check types
npm run lint             # Lint code
npm run test             # Run tests
```

### Database

```bash
npm run db:sync          # Interactive DB CLI
npm run db:pull          # Pull schema
npm run db:push          # Push migrations
npm run db:types         # Generate types
npm run db:audit         # Audit RLS
```

### Deployment

```bash
./scripts/deploy.sh      # Interactive deploy
npm run build            # Build for production
git push origin main     # Trigger Vercel deploy
```

### Troubleshooting

```bash
rm -rf .next             # Clear Next.js cache
rm -rf node_modules      # Clear dependencies
npm install              # Reinstall
npx supabase status      # Check DB status
lsof -ti:3005 | xargs kill  # Kill port 3005
```

---

## Getting Help

- **Documentation**: [docs/INDEX.md](../INDEX.md)
- **Architecture**: [../architecture/](../architecture/)
- **API Reference**: [../api/](../api/)
- **Database Schema**: [../database/](../database/)
- **GitHub Issues**: [Issues](https://github.com/your-org/empathy-ledger-v2/issues)

---

**Quick Start**: [installation.md](installation.md) | **Auth Setup**: [authentication.md](authentication.md)

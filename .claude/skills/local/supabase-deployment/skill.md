# Supabase Deployment & Best Practices Skill

**Purpose:** Complete guide for deploying Supabase schema changes, managing migrations, and maintaining production database integrity for Empathy Ledger.

**Invoke When:**
- Creating new database migrations
- Deploying schema changes to production
- Troubleshooting migration issues
- Setting up new environments
- Reviewing database best practices

---

## 🎯 Quick Start

**Safe Deployment Workflow:**
```bash
# 1. Check current status
npm run db:status

# 2. Create migration
npx supabase migration new your_change_description

# 3. Write idempotent SQL
# (See patterns below)

# 4. Test locally
npx supabase db reset

# 5. Generate types
npx supabase gen types typescript --local > src/lib/database/types/database-generated.ts

# 6. Commit changes
git add supabase/migrations/ src/lib/database/types/
git commit -m "feat(db): your change description"

# 7. Deploy to production
npx supabase db push
```

---

## 📁 Project Configuration

### Supabase Project Details
- **Project ID:** `yvnuayzslukamizrlhwb`
- **Region:** `ap-southeast-2` (Sydney, Australia)
- **Database:** PostgreSQL 15.6

### Connection URLs

**Direct Connection (6543 - Pooler):**
```
postgresql://postgres.yvnuayzslukamizrlhwb:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres
```

**Session Pooler (5432 - pgbouncer):**
```
postgresql://postgres.yvnuayzslukamizrlhwb:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
```

**Use Pooler (6543) for:**
- Serverless functions (Vercel, AWS Lambda)
- API routes with many concurrent connections
- Connection pooling required

**Use Direct (5432) for:**
- Long-running sessions
- Migrations (supabase db push)
- Admin operations
- pgAdmin or other SQL clients

### Environment Variables

**Required:**
```env
# Public (client-side safe)
NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Server-only (NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database URL (for direct access)
DATABASE_URL=postgresql://postgres.yvnuayzslukamizrlhwb:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
```

**Get Keys:**
```bash
# List all project secrets
npx supabase secrets list

# Get specific key
npx supabase secrets get SUPABASE_SERVICE_ROLE_KEY
```

---

## 🗄️ Database Architecture

### Multi-Tenant Structure

**171 Tables** organized by 19 functional categories:

**Priority 1 - CRITICAL (Never modify without review):**
- Cultural Safety (12 tables): `elder_review_queue`, `cultural_protocols`, `consent_change_log`
- Storyteller Core (18 tables): `profiles`, `storyteller_analytics`, `storyteller_connections`
- Content Core (15 tables): `stories`, `transcripts`, `media_assets`, `empathy_entries`
- Privacy & Consent (10 tables): `deletion_requests`, `story_access_log`, `audit_logs`

**All tables have:**
- `tenant_id UUID REFERENCES tenants(id)` - Multi-tenant isolation
- `created_at TIMESTAMPTZ DEFAULT NOW()`
- `updated_at TIMESTAMPTZ DEFAULT NOW()`
- RLS policies enforcing tenant isolation

### Row-Level Security (RLS)

**228 RLS policies** enforce:
- Multi-tenant data isolation
- Role-based access (elder > admin > member > guest)
- Elder authority for cultural content
- Privacy levels (public, community, private, restricted)

**Example Policy:**
```sql
-- Storytellers see only their own data
CREATE POLICY storyteller_own_data ON stories
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = author_id
    OR EXISTS (
      SELECT 1 FROM profile_organizations po
      WHERE po.profile_id = auth.uid()
      AND po.organization_id = stories.organization_id
      AND po.role IN ('elder', 'admin')
    )
  );
```

---

## 📝 Migration Best Practices

### 1. Idempotent SQL (CRITICAL)

**ALWAYS use IF NOT EXISTS / IF EXISTS:**

```sql
-- ✅ GOOD - Idempotent
CREATE TABLE IF NOT EXISTS my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ❌ BAD - Will fail if run twice
CREATE TABLE my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Functions - use OR REPLACE:**
```sql
-- ✅ GOOD - Idempotent
CREATE OR REPLACE FUNCTION my_function()
RETURNS void AS $$
BEGIN
  -- function body
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION my_function IS 'Description of what this does';
```

**Policies - DROP IF EXISTS first:**
```sql
-- ✅ GOOD - Idempotent
DROP POLICY IF EXISTS my_policy ON my_table;
CREATE POLICY my_policy ON my_table
  FOR SELECT
  USING (auth.uid() = user_id);
```

**Indexes:**
```sql
-- ✅ GOOD - Idempotent
CREATE INDEX IF NOT EXISTS idx_my_table_user_id
  ON my_table(user_id);

-- Partial index (only non-deleted)
CREATE INDEX IF NOT EXISTS idx_my_table_active
  ON my_table(user_id)
  WHERE deleted_at IS NULL;
```

### 2. Foreign Key Best Practices

**ALWAYS use CASCADE DELETE for dependent data:**

```sql
-- ✅ GOOD - Cascade deletes
CREATE TABLE story_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media_assets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ❌ BAD - Orphan risk
CREATE TABLE story_media (
  story_id UUID REFERENCES stories(id), -- What happens on delete?
  media_id UUID REFERENCES media_assets(id)
);
```

**Exceptions (use RESTRICT or SET NULL):**
```sql
-- RESTRICT - Prevent deletion if referenced
organization_id UUID REFERENCES organizations(id) ON DELETE RESTRICT

-- SET NULL - Soft delete pattern
deleted_by UUID REFERENCES profiles(id) ON DELETE SET NULL
```

### 3. Adding Columns Safely

**Nullable first, then backfill, then make NOT NULL:**

```sql
-- Step 1: Add column as nullable
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS ai_confidence_score NUMERIC(3,2);

-- Step 2: Backfill data (in separate migration if large table)
UPDATE stories
SET ai_confidence_score = 0.0
WHERE ai_confidence_score IS NULL;

-- Step 3: Make NOT NULL (in separate migration)
ALTER TABLE stories
ALTER COLUMN ai_confidence_score SET NOT NULL;

-- Step 4: Add default (optional)
ALTER TABLE stories
ALTER COLUMN ai_confidence_score SET DEFAULT 0.0;
```

### 4. RLS Policy Patterns

**Multi-Tenant Isolation:**
```sql
-- All users see only their tenant's data
CREATE POLICY tenant_isolation ON my_table
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles
      WHERE id = auth.uid()
    )
  );
```

**Role-Based Access:**
```sql
-- Elders see everything, members see approved only
CREATE POLICY role_based_access ON cultural_content
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profile_organizations po
      WHERE po.profile_id = auth.uid()
      AND po.organization_id = cultural_content.organization_id
      AND (
        po.role = 'elder'  -- Elders see all
        OR (po.role IN ('admin', 'member') AND cultural_content.status = 'approved')  -- Others see approved
      )
    )
  );
```

**Privacy Levels:**
```sql
-- Respect storyteller privacy settings
CREATE POLICY privacy_levels ON stories
  FOR SELECT
  TO authenticated
  USING (
    privacy_level = 'public'  -- Everyone sees public
    OR (
      privacy_level = 'community' AND auth.uid() IS NOT NULL  -- Logged in users see community
    )
    OR (
      privacy_level = 'private' AND auth.uid() = author_id  -- Only author sees private
    )
    OR (
      privacy_level = 'restricted' AND EXISTS (
        SELECT 1 FROM story_access_grants
        WHERE story_id = stories.id AND user_id = auth.uid()
      )  -- Explicit grant required for restricted
    )
  );
```

### 5. Triggers for Auto-Update

**Updated timestamp:**
```sql
-- Create trigger function (once)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to table
CREATE TRIGGER update_my_table_updated_at
  BEFORE UPDATE ON my_table
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 🚀 Deployment Workflow

### Local Development

**1. Start Supabase:**
```bash
npx supabase start

# Check status
npx supabase status

# Outputs:
# API URL: http://localhost:54321
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# Studio URL: http://localhost:54323
```

**2. Create Migration:**
```bash
# Descriptive name
npx supabase migration new add_storyteller_milestones

# Opens: supabase/migrations/YYYYMMDDHHMMSS_add_storyteller_milestones.sql
```

**3. Write SQL:**
```sql
-- supabase/migrations/20260102120000_add_storyteller_milestones.sql

-- Create table
CREATE TABLE IF NOT EXISTS storyteller_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('first_story', '10_stories', '100_views', 'featured')),
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_milestones_storyteller
  ON storyteller_milestones(storyteller_id);

CREATE INDEX IF NOT EXISTS idx_milestones_type
  ON storyteller_milestones(milestone_type);

-- Enable RLS
ALTER TABLE storyteller_milestones ENABLE ROW LEVEL SECURITY;

-- RLS policy
DROP POLICY IF EXISTS storyteller_milestones_own_data ON storyteller_milestones;
CREATE POLICY storyteller_milestones_own_data ON storyteller_milestones
  FOR ALL
  TO authenticated
  USING (auth.uid() = storyteller_id);

-- Trigger
CREATE TRIGGER update_storyteller_milestones_updated_at
  BEFORE UPDATE ON storyteller_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comment
COMMENT ON TABLE storyteller_milestones IS 'Track storyteller achievements and milestones';
```

**4. Test Migration:**
```bash
# Reset DB (applies ALL migrations fresh)
npx supabase db reset

# Check it worked
npx supabase db diff  # Should show "No schema differences"
```

**5. Generate Types:**
```bash
npx supabase gen types typescript --local > src/lib/database/types/database-generated.ts

# Verify types
grep "storyteller_milestones" src/lib/database/types/database-generated.ts
```

### Production Deployment

**Pre-Deployment Checklist:**
- [ ] Migration tested locally with `db reset`
- [ ] TypeScript types generated and committed
- [ ] Migration is idempotent (IF NOT EXISTS, OR REPLACE, DROP IF EXISTS)
- [ ] Foreign keys have proper CASCADE/RESTRICT
- [ ] RLS policies created
- [ ] Indexes added for performance
- [ ] Triggers created if needed
- [ ] Comments added for documentation
- [ ] Cultural review completed (if storyteller-facing)

**Deploy:**
```bash
# Link to production project (once)
npx supabase link --project-ref yvnuayzslukamizrlhwb

# Check what will be deployed
npx supabase db diff --linked

# Deploy migrations
npx supabase db push

# Verify success
npx supabase migration list
```

**Post-Deployment:**
```bash
# Generate production types
npx supabase gen types typescript --linked > src/lib/database/types/database-generated.ts

# Commit type changes
git add src/lib/database/types/database-generated.ts
git commit -m "chore(types): regenerate after migration"

# Redeploy frontend (types changed)
git push origin main  # Triggers Vercel deployment
```

---

## 🔍 Troubleshooting

### Migration Fails - Relation Already Exists

**Error:**
```
relation "my_table" already exists
```

**Fix:**
```sql
-- Add IF NOT EXISTS
CREATE TABLE IF NOT EXISTS my_table (...)
```

### Migration Fails - Column Already Exists

**Error:**
```
column "my_column" of relation "my_table" already exists
```

**Fix:**
```sql
-- Use DO block for conditional ALTER
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'my_table' AND column_name = 'my_column'
  ) THEN
    ALTER TABLE my_table ADD COLUMN my_column TEXT;
  END IF;
END $$;
```

### RLS Policy Denies Access

**Error:**
```
new row violates row-level security policy
```

**Debug:**
```sql
-- Check current user
SELECT auth.uid();  -- Should return UUID if authenticated

-- Check policies on table
SELECT * FROM pg_policies WHERE tablename = 'my_table';

-- Test policy logic
SELECT EXISTS (
  -- Paste the policy USING clause here
);
```

**Fix:**
- Ensure user has proper role in `profile_organizations`
- Check tenant_id matches user's tenant
- Verify auth.uid() is set (using authenticated client)

### Type Generation Fails

**Error:**
```
Error: Could not connect to database
```

**Fix:**
```bash
# Ensure Supabase is running
npx supabase status

# If stopped
npx supabase start

# Then retry
npx supabase gen types typescript --local > src/lib/database/types/database-generated.ts
```

### Migration Out of Order

**Error:**
```
migration YYYYMMDD already applied but not in migrations directory
```

**Fix:**
```bash
# Pull remote migrations
npx supabase db pull

# This creates a new migration with remote state
# Review and commit it
```

---

## 📊 Performance Best Practices

### Indexes

**Add indexes for:**
- Foreign keys (automatic in some DBs, not Supabase)
- Frequently queried columns
- JOIN conditions
- WHERE clauses
- ORDER BY columns

```sql
-- Foreign key index
CREATE INDEX IF NOT EXISTS idx_stories_author_id
  ON stories(author_id);

-- Composite index (order matters!)
CREATE INDEX IF NOT EXISTS idx_stories_org_status
  ON stories(organization_id, status);

-- Partial index (only active records)
CREATE INDEX IF NOT EXISTS idx_stories_active
  ON stories(organization_id, status)
  WHERE deleted_at IS NULL;

-- GIN index for JSONB
CREATE INDEX IF NOT EXISTS idx_stories_metadata
  ON stories USING gin(metadata);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_stories_search
  ON stories USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '')));
```

### Query Optimization

**Use EXPLAIN ANALYZE:**
```sql
EXPLAIN ANALYZE
SELECT * FROM stories
WHERE organization_id = 'uuid-here'
AND status = 'published';

-- Look for:
-- - Seq Scan (bad) vs Index Scan (good)
-- - High execution time
-- - Missing indexes
```

**Avoid N+1 Queries:**
```sql
-- ❌ BAD - N+1 query
SELECT * FROM stories;  -- Then for each story:
SELECT * FROM profiles WHERE id = story.author_id;

-- ✅ GOOD - Single query with JOIN
SELECT
  s.*,
  p.display_name as author_name
FROM stories s
LEFT JOIN profiles p ON p.id = s.author_id;
```

### Connection Pooling

**Use Pooler for serverless:**
```typescript
// API route
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    db: {
      schema: 'public',
    },
    global: {
      fetch: (...args) => fetch(...args),
    },
  }
);
```

**Use Service Role for admin operations:**
```typescript
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,  // Server-only!
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

---

## 🎯 Empathy Ledger-Specific Guidelines

### Cultural Safety Tables (NEVER modify without review)

**These tables are sacred:**
- `elder_review_queue` - Elder approval workflow
- `cultural_protocols` - Community-specific protocols
- `consent_change_log` - GDPR audit trail

**Before modifying:**
1. Invoke `cultural-review` skill
2. Invoke `empathy-ledger-mission` skill
3. Get approval from team lead
4. Test with sample Indigenous data
5. Document cultural implications

### Multi-Tenant Isolation (CRITICAL)

**Every table MUST have:**
```sql
tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE
```

**Every query MUST filter by tenant:**
```sql
-- RLS policy enforces this automatically
CREATE POLICY tenant_isolation ON my_table
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );
```

### Storyteller Data Ownership

**Storytellers own their data:**
- Stories: `author_id = auth.uid()`
- Transcripts: `storyteller_id = auth.uid()`
- Media: `uploaded_by = auth.uid()`

**Delete must cascade:**
```sql
-- When storyteller deletes account, their stories go too
profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE
```

---

## 📚 Related Skills

**Invoke together:**
- `empathy-ledger-mission` - Mission alignment check
- `cultural-review` - Cultural safety review
- `supabase` - Database schema reference
- `supabase-sql-manager` - Migration management
- `supabase-connection` - Connection troubleshooting

**Reference docs:**
- [Database Mission Alignment](../../../docs/database/mission-summary.md)
- [Empathy Ledger Wiki](../../../docs/EMPATHY_LEDGER_WIKI.md)
- [Supabase Docs](https://supabase.com/docs)

---

## ✅ Quick Checklist

Before deploying ANY migration:

**Technical:**
- [ ] Migration is idempotent (IF NOT EXISTS, OR REPLACE, DROP IF EXISTS)
- [ ] Foreign keys have CASCADE/RESTRICT/SET NULL
- [ ] Indexes added for performance
- [ ] RLS policies created
- [ ] Triggers added (updated_at)
- [ ] Comments added for documentation
- [ ] Types generated and committed
- [ ] Tested locally with `db reset`

**Mission:**
- [ ] Cultural safety considered (invoke `cultural-review` if needed)
- [ ] Multi-tenant isolation maintained
- [ ] Storyteller data ownership respected
- [ ] Mission alignment checked (invoke `empathy-ledger-mission` if needed)

**Deploy:**
- [ ] `npx supabase db push` successful
- [ ] Vercel redeploy triggered
- [ ] Production tested
- [ ] No errors in Supabase logs

---

**Remember:** Every migration is permanent. Test thoroughly. Deploy carefully. Storytellers depend on data integrity.

🛡️ **"Data sovereignty is non-negotiable. Cultural safety is foundational. Storytellers own their narratives."**

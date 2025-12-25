# Empathy Ledger Database Documentation

**Version**: 2.0
**Database**: Supabase (PostgreSQL)
**Last Updated**: 2024-12-24

## 📊 Database Overview

The Empathy Ledger uses a **multi-tenant PostgreSQL database** with comprehensive analytics, cultural sensitivity protocols, and storytelling features.

### Quick Stats

- **87 Tables** - Core data structures
- **82 Functions** - Stored procedures and business logic
- **8 Views** - Query abstractions
- **210 RLS Policies** - Row-level security rules
- **47 Migrations** - Schema evolution history

## 🚀 Quick Start

### View Database Summary

```bash
cat docs/database/SCHEMA_SUMMARY.md
```

### Regenerate Documentation

```bash
./scripts/analyze-database.sh
```

### Use Database Navigator Skill

```
/database-navigator "Show me the storyteller system"
/database-navigator "Document the media tables"
/database-navigator "What are all the RLS policies?"
```

## 📚 Documentation Structure

### Core Documentation

| Document | Purpose |
|----------|---------|
| [SCHEMA_SUMMARY.md](./database/SCHEMA_SUMMARY.md) | Complete schema overview with table categories |
| [MIGRATION_GUIDE.md](#) | How to create and manage migrations |
| [FUNCTION_REFERENCE.md](#) | All stored procedures and triggers |
| [SECURITY_POLICIES.md](#) | RLS policies and access control |

### System Documentation

| System | Tables | Description |
|--------|--------|-------------|
| [User & Profile](./database/USER_PROFILE_SYSTEM.md) | 1 | Profile management and user data |
| [Content (Stories & Transcripts)](./database/CONTENT_SYSTEM.md) | 3 | Storyteller content and narratives |
| [Media](./database/MEDIA_SYSTEM.md) | 5 | Asset management, galleries, CDN integration |
| [Organization & Multi-Tenant](./database/ORGANIZATION_SYSTEM.md) | 13 | Tenant isolation, org management |
| [Project Management](./database/PROJECT_SYSTEM.md) | 11 | Project contexts, analysis, planning |
| [Cultural Sensitivity](./database/CULTURAL_SYSTEM.md) | 5 | Moderation, consent, protocols |
| [Analytics & Metrics](./database/ANALYTICS_SYSTEM.md) | 13 | Impact metrics, engagement tracking |
| [Access Control & Sharing](./database/ACCESS_SYSTEM.md) | Various | Tokens, invitations, partner portal |

## 🏗️ Database Architecture

### Multi-Tenant Design

All core tables include `tenant_id` for isolation:

```sql
CREATE TABLE stories (
    id uuid PRIMARY KEY,
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    -- ... other columns
);
```

**RLS Policy Pattern:**
```sql
CREATE POLICY stories_tenant_isolation ON stories
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);
```

### Key Systems

```
┌─────────────────────────────────────────────────────────┐
│                    EMPATHY LEDGER DB                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐      ┌──────────────┐                │
│  │   Profiles   │─────▶│   Stories    │                │
│  │  (storytellers)│      │  (content)   │                │
│  └──────┬───────┘      └──────┬───────┘                │
│         │                      │                         │
│         ▼                      ▼                         │
│  ┌──────────────┐      ┌──────────────┐                │
│  │ Transcripts  │      │ Media Assets │                │
│  │  (interviews)│      │   (files)    │                │
│  └──────────────┘      └──────────────┘                │
│                                                          │
│  ┌──────────────────────────────────────┐              │
│  │   Multi-Tenant Layer (tenant_id)      │              │
│  ├───────────────────────────────────────┤              │
│  │  Organizations │ Projects │ Analytics │              │
│  └──────────────────────────────────────┘              │
│                                                          │
│  ┌──────────────────────────────────────┐              │
│  │      RLS Security (210 policies)      │              │
│  └──────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ Common Tasks

### Finding Tables

**By system:**
```bash
grep -E "stories|transcripts|quotes" docs/database/SCHEMA_SUMMARY.md
```

**By column:**
```bash
grep -r "tenant_id" supabase/migrations/*.sql | grep "CREATE TABLE"
```

### Finding Functions

```bash
grep "CREATE OR REPLACE FUNCTION" supabase/migrations/*.sql | grep "function_name"
```

### Viewing Policies

```bash
grep "CREATE POLICY" supabase/migrations/*.sql | grep "table_name"
```

### Understanding Relationships

```bash
grep "REFERENCES" supabase/migrations/*.sql | grep "your_table"
```

## 🔍 Using the Database Navigator Skill

The `/database-navigator` skill helps you explore and document the database.

### Example Queries

**"Show me all storyteller-related tables"**
- Lists profiles, stories, transcripts
- Shows relationships and foreign keys
- Documents columns and types
- Includes example queries

**"Document the media system"**
- Creates comprehensive media system guide
- Shows upload workflow
- Documents CDN integration
- Maps usage tracking

**"What migrations modified the profiles table?"**
- Traces all changes to profiles
- Shows chronological evolution
- Lists added columns and indexes
- Documents policy updates

**"Find all tables with tenant_id"**
- Identifies multi-tenant tables
- Shows isolation patterns
- Lists RLS policies
- Documents security boundaries

## 📝 Migration Management

### Migration File Naming

```
YYYYMMDD_descriptive_name.sql
20251224_feature_description.sql
```

### Creating Migrations

1. Create file in `supabase/migrations/`
2. Use descriptive name
3. Include comments explaining purpose
4. Make idempotent (use `IF NOT EXISTS`)
5. Test locally first

### Migration Template

```sql
-- Description: What this migration does
-- Date: YYYY-MM-DD
-- Related: Links to related migrations or issues

-- Create table
CREATE TABLE IF NOT EXISTS my_table (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id),
    -- ... columns
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_my_table_tenant_id
    ON my_table(tenant_id);

-- Enable RLS
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY my_table_tenant_isolation ON my_table
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);

-- Add comments
COMMENT ON TABLE my_table IS 'Purpose of this table';
```

## 🔐 Security Best Practices

### Always Enable RLS

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### Tenant Isolation Pattern

```sql
CREATE POLICY table_tenant_isolation ON table_name
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);
```

### Public Read Pattern

```sql
CREATE POLICY table_public_read ON table_name
    FOR SELECT USING (true);
```

### Owner-Only Pattern

```sql
CREATE POLICY table_owner_only ON table_name
    FOR ALL USING (user_id = auth.uid());
```

## 📊 Performance Optimization

### Index Critical Columns

```sql
-- Tenant queries (almost all tables)
CREATE INDEX idx_table_tenant_id ON table_name(tenant_id);

-- Foreign keys
CREATE INDEX idx_table_ref_id ON table_name(reference_id);

-- Frequent searches
CREATE INDEX idx_table_search_col ON table_name(search_column);

-- Date ranges
CREATE INDEX idx_table_created_at ON table_name(created_at);
```

### JSONB Indexes

```sql
-- GIN index for JSONB containment
CREATE INDEX idx_table_json ON table_name USING GIN(json_column);

-- Specific path index
CREATE INDEX idx_table_json_path
    ON table_name((json_column->>'key'));
```

### Array Indexes

```sql
-- GIN index for array containment
CREATE INDEX idx_table_array ON table_name USING GIN(array_column);
```

## 🧪 Testing Queries

### Check Tenant Isolation

```sql
-- Should only return rows for current tenant
SELECT * FROM table_name;

-- Should fail (no access to other tenant)
SELECT * FROM table_name WHERE tenant_id = 'other-tenant-uuid';
```

### Check Performance

```sql
EXPLAIN ANALYZE
SELECT * FROM table_name WHERE tenant_id = :tenant_id;
-- Should use index, not sequential scan
```

## 🚨 Common Issues

### Issue: Tables Not Showing in API

**Cause**: RLS enabled but no policies created
**Fix**: Add appropriate RLS policies

### Issue: Slow Queries

**Cause**: Missing indexes
**Fix**: Add indexes on frequently queried columns

### Issue: Permission Denied

**Cause**: RLS policy blocking access
**Fix**: Review and update policy logic

### Issue: Function Not Found

**Cause**: Schema search path
**Fix**: Use fully qualified name `public.function_name()`

## 📖 Additional Resources

### Tools

- **Supabase Dashboard** - Visual schema editor
- **pgAdmin** - PostgreSQL administration
- **DBeaver** - Universal database tool
- [`./scripts/analyze-database.sh`](../scripts/analyze-database.sh) - Schema analyzer

### TypeScript Types

Database types are auto-generated:
- `src/types/database-generated.ts` - Auto-generated from Supabase
- `src/types/database/*.ts` - Organized by domain

### API Integration

- [Avatar URL System](./AVATAR_URL_SYSTEM.md) - Profile image handling
- [Supabase Client](../src/lib/supabase/) - Database clients

## 🆘 Getting Help

### Use the Database Navigator

```
/database-navigator "Your question about the database"
```

### Common Questions

- **"What tables exist?"** → See [SCHEMA_SUMMARY.md](./database/SCHEMA_SUMMARY.md)
- **"How do I query X?"** → Use database-navigator skill
- **"What are the relationships?"** → Check migration files or use navigator
- **"What changed recently?"** → Review recent migration files

### Contact

For database-related questions:
1. Check this documentation
2. Use `/database-navigator` skill
3. Review migration files
4. Check TypeScript types

## 🔄 Keeping Documentation Updated

### Automatic Updates

Run after adding migrations:
```bash
./scripts/analyze-database.sh
```

### Manual Updates

- Update system docs when adding new tables
- Document new functions in FUNCTION_REFERENCE.md
- Add migration notes to MIGRATION_GUIDE.md
- Update ERD diagrams for major changes

---

**Last Generated**: 2024-12-24
**Schema Version**: 2.0
**Total Objects**: 387 (87 tables + 82 functions + 8 views + 210 policies)

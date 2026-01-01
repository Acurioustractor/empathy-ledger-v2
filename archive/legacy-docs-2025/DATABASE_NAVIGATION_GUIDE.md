# Database Navigation Guide

**How to understand and work with the Empathy Ledger database**

## 🎯 The Problem

You have:
- **47 migration files** spread across `supabase/migrations/`
- **87 tables** with complex relationships
- **82 functions** and stored procedures
- **210 RLS policies** for security
- **No clear map** of how it all fits together

## ✅ The Solution

We've created a **comprehensive navigation system** to help you understand the database without getting overwhelmed.

## 🛠️ Tools Available

### 1. Database Navigator Skill (NEW!)

**What**: Claude Code skill that analyzes and documents database systems

**How to use**:
```
/database-navigator "Show me the storyteller system"
/database-navigator "Document all media tables"
/database-navigator "What are the RLS policies for organizations?"
/database-navigator "How do transcripts connect to stories?"
```

**What it does**:
- Scans migration files automatically
- Extracts table definitions, functions, views
- Maps relationships and foreign keys
- Generates clear documentation
- Creates ERD diagrams
- Provides example queries

### 2. Schema Analysis Script (NEW!)

**What**: Automated script that categorizes and documents your entire schema

**How to run**:
```bash
./scripts/analyze-database.sh
```

**What it generates**:
- Complete table inventory
- System categorization (User, Content, Media, etc.)
- Function listing
- RLS policy count
- Migration timeline

**Output**: [docs/database/SCHEMA_SUMMARY.md](./database/SCHEMA_SUMMARY.md)

### 3. Documentation Hub (NEW!)

**Main index**: [docs/DATABASE_README.md](./DATABASE_README.md)
- Overview of entire database
- Quick start guides
- Common patterns
- Troubleshooting tips

**Quick reference**: [docs/database/QUICK_REFERENCE.md](./database/QUICK_REFERENCE.md)
- Common queries
- Security patterns
- Index patterns
- Performance tips

## 📖 How to Navigate

### Starting Point: "I'm Lost"

**Step 1**: View the big picture
```bash
cat docs/database/SCHEMA_SUMMARY.md
```

**Step 2**: Find your system
- User & Profile System (1 table)
- Content System (3 tables) ← stories, transcripts
- Media System (5 tables) ← assets, galleries
- Organization & Multi-Tenant (13 tables)
- Project Management (11 tables)
- Cultural Sensitivity (5 tables)
- Analytics & Metrics (13 tables)
- Access Control & Sharing (varies)

**Step 3**: Deep dive with Navigator
```
/database-navigator "Show me [your system]"
```

### Use Case: "I need to work with storyteller data"

**Quick answer**:
```
/database-navigator "Show me all storyteller-related tables"
```

**Output you'll get**:
- `profiles` - Storyteller profile data
- `stories` - Content created by storytellers
- `transcripts` - Interview/transcript data
- `storyteller_impact_metrics` - Analytics
- `storyteller_network_connections` - Relationships
- Foreign keys, columns, types, policies
- Example queries

### Use Case: "How do I query media assets?"

**Quick answer**:
```
/database-navigator "Document the media system"
```

**Or check quick reference**:
```bash
grep -A 20 "Get Media with Usage" docs/database/QUICK_REFERENCE.md
```

### Use Case: "What migrations changed the profiles table?"

**Quick answer**:
```
/database-navigator "What migrations modified the profiles table?"
```

**Manual way**:
```bash
grep -l "ALTER TABLE.*profiles" supabase/migrations/*.sql
```

### Use Case: "How does multi-tenancy work?"

**Quick answer**:
```
/database-navigator "Show me the multi-tenant architecture"
```

**Or read**:
[docs/DATABASE_README.md#multi-tenant-design](./DATABASE_README.md#multi-tenant-design)

## 🎓 Learning Path

### Level 1: Orientation (5 minutes)

1. Read [DATABASE_README.md](./DATABASE_README.md) overview
2. Run `./scripts/analyze-database.sh`
3. Browse [SCHEMA_SUMMARY.md](./database/SCHEMA_SUMMARY.md)

**You'll know**: What tables exist and how they're organized

### Level 2: System Understanding (15 minutes)

1. Pick a system you need to work with
2. Use `/database-navigator "Show me [system]"`
3. Read the generated documentation
4. Try the example queries

**You'll know**: How your specific system works

### Level 3: Deep Knowledge (30 minutes)

1. Read migration files for your system
2. Understand RLS policies
3. Review TypeScript types in `src/types/database/`
4. See how API routes use the tables

**You'll know**: How to extend and modify the system

## 🔍 Common Questions

### "How many tables are there?"

**87 tables** across 9 major systems.

See: [SCHEMA_SUMMARY.md](./database/SCHEMA_SUMMARY.md)

### "What functions exist?"

**82 functions** for analytics, permissions, data processing.

```bash
grep "CREATE OR REPLACE FUNCTION" supabase/migrations/*.sql | wc -l
```

Or use: `/database-navigator "List all database functions"`

### "How do I find a specific table?"

**Option 1**: Search summary
```bash
grep "your_table_name" docs/database/SCHEMA_SUMMARY.md
```

**Option 2**: Ask navigator
```
/database-navigator "Show me the your_table_name table"
```

**Option 3**: Search migrations
```bash
grep -l "CREATE TABLE.*your_table_name" supabase/migrations/*.sql
```

### "What are the RLS policies?"

**210 policies total** for row-level security.

```bash
grep "CREATE POLICY" supabase/migrations/*.sql | wc -l
```

Or use: `/database-navigator "Show all RLS policies"`

### "How do tables relate to each other?"

Use the navigator to generate ERD diagrams:

```
/database-navigator "Show relationships between stories, profiles, and transcripts"
```

### "Where are database types defined?"

**Generated types**: `src/types/database-generated.ts`
**Organized types**: `src/types/database/*.ts`

See: [DATABASE_README.md#typescript-types](./DATABASE_README.md#typescript-types)

## 🚀 Workflows

### Workflow: Adding a New Table

1. **Research similar tables**
   ```
   /database-navigator "Show me tables similar to my use case"
   ```

2. **Check migration patterns**
   ```bash
   grep -A 30 "CREATE TABLE.*similar_table" supabase/migrations/*.sql
   ```

3. **Create migration file**
   ```sql
   -- supabase/migrations/YYYYMMDD_my_feature.sql
   CREATE TABLE IF NOT EXISTS my_table (
       id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
       tenant_id uuid NOT NULL REFERENCES tenants(id),
       -- ... columns
       created_at timestamp with time zone DEFAULT now()
   );
   ```

4. **Add indexes and RLS**
   ```sql
   CREATE INDEX idx_my_table_tenant_id ON my_table(tenant_id);

   ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

   CREATE POLICY my_table_tenant_isolation ON my_table
       FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);
   ```

5. **Update documentation**
   ```bash
   ./scripts/analyze-database.sh
   ```

### Workflow: Understanding Existing Code

1. **Find the table being used**
   ```typescript
   // In API route
   const { data } = await supabase.from('stories').select('*')
   ```

2. **Document the table**
   ```
   /database-navigator "Show me the stories table"
   ```

3. **Check TypeScript types**
   ```typescript
   import { Story } from '@/types/database/content-media'
   ```

4. **Review related code**
   ```bash
   grep -r "from('stories')" src/app/api/
   ```

### Workflow: Debugging Query Issues

1. **Check the query**
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM table_name WHERE conditions;
   ```

2. **Review RLS policies**
   ```
   /database-navigator "Show RLS policies for table_name"
   ```

3. **Check indexes**
   ```sql
   SELECT * FROM pg_indexes WHERE tablename = 'table_name';
   ```

4. **See quick reference**
   ```bash
   cat docs/database/QUICK_REFERENCE.md | grep -A 10 "Troubleshooting"
   ```

## 📚 Documentation Map

```
docs/
├── DATABASE_README.md ........................... Main entry point
├── DATABASE_NAVIGATION_GUIDE.md ................. This guide
├── AVATAR_URL_SYSTEM.md ......................... Avatar resolution
└── database/
    ├── SCHEMA_SUMMARY.md ........................ Complete schema overview
    ├── QUICK_REFERENCE.md ....................... Common patterns
    └── [System docs created by navigator] ....... Detailed guides

scripts/
└── analyze-database.sh .......................... Schema analyzer

.claude/skills/
├── database-navigator.md ........................ Skill description
└── database-navigator.prompt.md ................. Skill implementation
```

## 🎯 Best Practices

### DO

✅ Use `/database-navigator` for exploration
✅ Run `./scripts/analyze-database.sh` after migrations
✅ Check [QUICK_REFERENCE.md](./database/QUICK_REFERENCE.md) for patterns
✅ Follow multi-tenant RLS patterns
✅ Add indexes for foreign keys
✅ Document new systems

### DON'T

❌ Read all 47 migration files manually
❌ Skip RLS policies
❌ Forget to add indexes
❌ Hardcode tenant IDs
❌ Bypass security with service keys (unless necessary)

## 🆘 Getting Help

### Quick Questions

Use the navigator skill:
```
/database-navigator "your question"
```

### System Questions

Check the docs:
1. [DATABASE_README.md](./DATABASE_README.md) - Overview
2. [SCHEMA_SUMMARY.md](./database/SCHEMA_SUMMARY.md) - All tables
3. [QUICK_REFERENCE.md](./database/QUICK_REFERENCE.md) - Patterns

### Code Questions

Search the codebase:
```bash
# Find where table is used
grep -r "from('table_name')" src/

# Find type definitions
grep -r "table_name" src/types/database/

# Find migrations
grep -l "table_name" supabase/migrations/*.sql
```

## 🎉 You're Ready!

Now you have:

✅ **Database Navigator Skill** - AI-powered exploration
✅ **Schema Analysis Script** - Automated documentation
✅ **Comprehensive Docs** - All systems documented
✅ **Quick Reference** - Common patterns at your fingertips
✅ **Navigation Guide** - This document

**Next steps**:

1. Run the analyzer: `./scripts/analyze-database.sh`
2. Browse the summary: `cat docs/database/SCHEMA_SUMMARY.md`
3. Try the navigator: `/database-navigator "Show me the storyteller system"`

**No more being lost in 47 migration files!** 🚀

---

**Questions?** Use `/database-navigator "your question here"`

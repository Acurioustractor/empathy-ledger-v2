# Database Migration

Create a new Supabase database migration for Empathy Ledger.

## Instructions

1. **Analyze the requirement**: Understand what database changes are needed
2. **Check existing schema**: Review `src/types/database/` for current structure
3. **Plan the migration**: Design tables, columns, indexes, and RLS policies
4. **Create migration file**: In `supabase/migrations/` with timestamp prefix
5. **Update TypeScript types**: Add corresponding types in appropriate domain file

## Multi-Tenant Requirements

ALL tables MUST include:
- `tenant_id UUID NOT NULL REFERENCES organizations(id)`
- Row Level Security (RLS) policies for tenant isolation
- Index on tenant_id

## Migration Checklist

- [ ] Table has tenant_id column
- [ ] Foreign keys have ON DELETE behavior
- [ ] Indexes on foreign keys
- [ ] Indexes on common query columns
- [ ] RLS enabled and policies created
- [ ] updated_at trigger added
- [ ] TypeScript types updated

## File Naming

Use format: `YYYYMMDD_descriptive_name.sql`

Example: `20251208_story_distributions.sql`

## Reference

- Check `.claude/agents/database-architect.md` for patterns
- Review existing migrations in `supabase/migrations/`
- Follow OCAP principles for data sovereignty

---

**Migration to create:** $ARGUMENTS

# Supabase Deployment Troubleshooting

## Migration Fails - Relation Already Exists
**Error:** `relation "my_table" already exists`
**Fix:** Add `IF NOT EXISTS` to CREATE TABLE

## Migration Fails - Column Already Exists
**Error:** `column "my_column" of relation "my_table" already exists`
**Fix:** Use DO block for conditional ALTER:
```sql
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

## RLS Policy Denies Access
**Error:** `new row violates row-level security policy`
**Debug:**
```sql
SELECT auth.uid();  -- Check if authenticated
SELECT * FROM pg_policies WHERE tablename = 'my_table';  -- Check policies
```
**Fixes:**
- Ensure user has proper role in `profile_organizations`
- Check tenant_id matches user's tenant
- Verify auth.uid() is set (using authenticated client)

## Type Generation Fails
**Error:** `Could not connect to database`
**Fix:**
```bash
npx supabase status
npx supabase start  # If stopped
npx supabase gen types typescript --local > src/lib/database/types/database-generated.ts
```

## Migration Out of Order
**Error:** `migration YYYYMMDD already applied but not in migrations directory`
**Fix:**
```bash
npx supabase db pull  # Pull remote migrations
# Review and commit the new migration
```

## Connection Issues
**Pooler (6543)** - Use for serverless, API routes, many connections
**Direct (5432)** - Use for migrations, long sessions, admin ops

## Performance Issues
Check for missing indexes:
```sql
EXPLAIN ANALYZE SELECT * FROM my_table WHERE column = 'value';
-- Look for Seq Scan (bad) vs Index Scan (good)
```

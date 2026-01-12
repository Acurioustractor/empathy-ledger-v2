# Troubleshooting

## Common Issues

### "Tenant or user not found"
- Using pooler connection for admin tasks
- Solution: Use Supabase CLI or Dashboard SQL Editor

### "No route to host" on direct connection
- Network routing doesn't allow direct psql from most environments
- Solution: Use Supabase CLI (`npx supabase db push`)

### "already exists" on migration
- Migration already partially applied
- Solutions:
  1. Use Dashboard SQL Editor for new migrations only
  2. Mark old migrations as applied in `supabase_migrations.schema_migrations`

### RLS blocking data access
- User not authenticated, or policy not matching
- Debug: Use Service Role client to verify data exists
- Check: `auth.uid()` returns expected value

### Types out of sync
```bash
npx supabase gen types typescript --project-ref yvnuayzslukamizrlhwb > src/types/database-generated.ts
```

## Health Check Queries
```sql
-- Check connection
SELECT NOW();

-- Check tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

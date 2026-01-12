# Deployment Workflow Reference

## Local Development

### 1. Start Supabase
```bash
npx supabase start
npx supabase status  # API URL, DB URL, Studio URL
```

### 2. Create Migration
```bash
npx supabase migration new add_feature_description
# Opens: supabase/migrations/YYYYMMDDHHMMSS_add_feature_description.sql
```

### 3. Write Idempotent SQL
- Use IF NOT EXISTS, OR REPLACE, DROP IF EXISTS
- Add foreign keys with CASCADE/RESTRICT
- Create indexes for performance
- Enable RLS and add policies
- Add triggers for updated_at
- Add comments for documentation

### 4. Test Locally
```bash
npx supabase db reset  # Applies all migrations fresh
npx supabase db diff   # Should show no differences
```

### 5. Generate Types
```bash
npx supabase gen types typescript --local > src/lib/database/types/database-generated.ts
```

## Production Deployment

### Pre-Deployment Checklist
- [ ] Migration tested locally with `db reset`
- [ ] TypeScript types generated and committed
- [ ] Migration is idempotent
- [ ] Foreign keys have proper ON DELETE
- [ ] RLS policies created
- [ ] Indexes added
- [ ] Cultural review completed (if storyteller-facing)

### Deploy
```bash
# Link to production (once)
npx supabase link --project-ref yvnuayzslukamizrlhwb

# Check what will be deployed
npx supabase db diff --linked

# Deploy migrations
npx supabase db push

# Verify success
npx supabase migration list
```

### Post-Deployment
```bash
# Regenerate types from production
npx supabase gen types typescript --linked > src/lib/database/types/database-generated.ts

# Commit and deploy frontend
git add src/lib/database/types/database-generated.ts
git commit -m "chore(types): regenerate after migration"
git push origin main
```

## Project Configuration

### Connection Strings
- **Pooler (6543)**: Serverless, API routes, many connections
- **Direct (5432)**: Migrations, long sessions, admin ops

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Server-only!
DATABASE_URL=postgresql://postgres.yvnuayzslukamizrlhwb:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
```

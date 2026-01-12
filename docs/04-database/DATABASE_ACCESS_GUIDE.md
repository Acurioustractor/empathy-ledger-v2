# Database Access Guide

## ⚠️ CRITICAL: Always Use Supabase Client

**NEVER use `psql` commands directly.** The `DATABASE_URL` in `.env.local` points to a connection pooler that doesn't support all operations.

## ✅ Correct Way to Query Database

### Check Table Schema
```bash
set -a && source .env.local && set +a && node scripts/db-query.js "DESCRIBE tablename"
```

### Run Custom Queries
Create a script like `check-transcript-schema.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function query() {
  const { data, error } = await supabase
    .from('tablename')
    .select('*')
    .limit(1);

  if (data) {
    console.log('Columns:', Object.keys(data[0]));
  }
}

query();
```

Then run:
```bash
set -a && source .env.local && set +a && node your-script.js
```

## ❌ Wrong Way (DO NOT USE)

```bash
# WRONG - uses connection pooler, limited functionality
psql $DATABASE_URL -c "SELECT * FROM table"

# WRONG - won't work with Supabase
psql -h host -p 5432 -U user -d postgres
```

## Why?

1. **Supabase uses RLS (Row Level Security)** - direct SQL bypasses this
2. **Connection pooler** - The DATABASE_URL uses port 6543 (pooler), not 5432 (direct)
3. **Schema access** - Supabase client knows the correct schema and handles it properly
4. **Proper auth** - Service role key bypasses RLS correctly

## Quick Reference

| Task | Command |
|------|---------|
| Check schema | `set -a && source .env.local && set +a && node scripts/db-query.js "DESCRIBE tablename"` |
| Custom query | Create script with Supabase client, run with env vars |
| API testing | Use Supabase client in scripts |

# Database Connection Reference

## Connection Methods

### 1. Via Supabase Client (Recommended)
```typescript
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

### 2. Via Direct PostgreSQL
Use environment variables from `.env.local`:
```bash
PGDATABASE=$SUPABASE_DB_NAME
PGHOST=$SUPABASE_DB_HOST
PGPORT=$SUPABASE_DB_PORT
PGUSER=$SUPABASE_DB_USER
PGPASSWORD=$SUPABASE_DB_PASSWORD
psql
```

### 3. Via Supabase Dashboard
Navigate to: Project Settings > Database > Connection string

## Environment Variables
Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)

## Security Notes
- Never commit credentials to git
- Use service role key only server-side
- Use anon key for client-side operations

# Supabase Client Types

## 1. Browser Client (Client Components)
```typescript
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
const supabase = createSupabaseBrowserClient()
```
- Respects RLS
- Uses cookies for auth
- For: client components, real-time subscriptions

## 2. Server Client (API Routes, Server Components)
```typescript
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
const supabase = createSupabaseServerClient()
```
- Respects RLS
- Uses server-side session
- For: API routes, server components, server actions

## 3. Service Role Client (Admin)
```typescript
import { createSupabaseServiceClient } from '@/lib/supabase/service-role-client'
const supabase = createSupabaseServiceClient()
```
- **BYPASSES RLS** - use with caution
- For: background jobs, migrations, batch ops, admin endpoints

## When to Use Which
| Scenario | Client |
|----------|--------|
| React component fetching user data | Browser |
| API route with user context | Server |
| Server component | Server |
| Background job / cron | Service Role |
| System migration | Service Role |
| Webhook handler | Service Role |

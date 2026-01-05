# Database Access Policy

## ❌ NEVER DO THIS

**DO NOT use direct database connections:**
```bash
# ❌ WRONG - Connects to local test database
psql "$DATABASE_URL" -c "SELECT * FROM profiles"

# ❌ WRONG - Uses environment variable for local DB
source .env.local && psql "$DATABASE_URL"

# ❌ WRONG - Direct SQL queries to local database
npx supabase db execute --sql "..."
```

**Why this is wrong:**
- Connects to local test database (only has 2 test profiles)
- Does NOT access production Supabase data
- Misses all real storytellers (Kristy Bloomfield, Graham Williams, etc.)
- Bypasses RLS policies and security
- Doesn't use proper authentication

---

## ✅ ALWAYS DO THIS

**Use the application's API routes:**

### 1. **For Admin/System Queries**
```bash
# ✅ CORRECT - Uses API with proper Supabase client
curl "http://localhost:3030/api/admin/storytellers?search=Kristy"
curl "http://localhost:3030/api/profiles/me"
```

### 2. **For User-Specific Data**
```bash
# ✅ CORRECT - Authenticated API requests
fetch('/api/profiles/me')
fetch('/api/admin/storytellers')
```

### 3. **In Code - Server Components**
```typescript
// ✅ CORRECT - Uses Supabase client with RLS
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data } = await supabase
  .from('profiles')
  .select('*')
  .ilike('display_name', '%Kristy%')
```

### 4. **In Code - API Routes**
```typescript
// ✅ CORRECT - API route pattern
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  // Query production Supabase here
}
```

---

## 📊 Data Access Patterns

### Finding a Specific Person (like Kristy Bloomfield):

**Option 1: Use Existing API**
```typescript
// Use the admin storytellers API
const response = await fetch('/api/admin/storytellers?search=Kristy')
const data = await response.json()
```

**Option 2: Create Specific API Endpoint**
```typescript
// Create: src/app/api/profiles/search/route.ts
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .ilike('display_name', `%${query}%`)

  return NextResponse.json(data)
}
```

**Option 3: Use Browser to Navigate**
```
1. Open http://localhost:3030/storytellers
2. Search for "Kristy"
3. Click on profile
4. URL shows their ID: /storytellers/[id]
5. Use that ID in API calls
```

---

## 🔍 Why This Matters

**The Local Database:**
- Used for development/testing only
- Has mock data (Test User, Elder User)
- NOT connected to production Supabase

**The Production Supabase:**
- Has real data (235 profiles)
- Has Kristy Bloomfield, Graham Williams, Orange Sky team
- Has real transcripts, photos, organizations, projects
- Has proper RLS policies and security
- Accessed via `createClient()` from `@/lib/supabase/server`

---

## 🎯 Correct Workflow for Finding Data

### Step 1: Use the UI
- Navigate to http://localhost:3030/storytellers
- Visual search and browse
- Click to see details
- Note the ID from URL

### Step 2: Use APIs
- Hit `/api/admin/storytellers` for listings
- Hit `/api/profiles/me` for current user
- Hit `/api/storytellers/[id]` for specific person

### Step 3: Create New APIs When Needed
- Follow pattern in existing API routes
- Always use `createClient()` from `@/lib/supabase/server`
- Never use raw SQL or psql

---

## 📝 Summary

**Golden Rule:**
> **ALL database access MUST go through Supabase client (`createClient()`) in API routes or server components. NEVER use psql or direct DATABASE_URL connections.**

**The Supabase client:**
- ✅ Connects to production database
- ✅ Respects RLS policies
- ✅ Handles authentication
- ✅ Has all real data
- ✅ Is the single source of truth

**Direct psql:**
- ❌ Connects to local test DB
- ❌ Bypasses security
- ❌ Has fake data
- ❌ Should never be used

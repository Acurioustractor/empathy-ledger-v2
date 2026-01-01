# Supabase TypeScript Type Generation Guide

**How to get automatic TypeScript types from your Supabase database schema**

This guide shows you how to set up automatic type generation for any codebase using Supabase.

---

## What is Supabase Type Generation?

Supabase CLI can **automatically generate TypeScript types** from your database schema, giving you:

✅ **Full type safety** - TypeScript knows your table columns and types
✅ **Auto-complete** - IDE suggests available columns
✅ **Compile-time errors** - Catch typos before runtime
✅ **Schema sync** - Types update when database changes
✅ **No manual typing** - Generate 1000s of types automatically

---

## How It Works

```
PostgreSQL Database Schema
    ↓
Supabase introspects tables/columns/relationships
    ↓
Generates TypeScript interfaces
    ↓
Save to src/types/database.types.ts
    ↓
Import in your code with full type safety
```

---

## Setup (One-Time)

### 1. Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# npm (any OS)
npm install -g supabase

# Verify installation
supabase --version
```

### 2. Login to Supabase

```bash
supabase login
```

This opens your browser to authenticate.

### 3. Link Your Project

```bash
# Link to existing Supabase project
supabase link --project-ref YOUR_PROJECT_ID

# OR initialize new project
supabase init
```

**Find your project ID:**
- Go to https://supabase.com/dashboard
- Select your project
- Settings → General → Reference ID

---

## Generate Types (The Magic Command)

### Basic Generation

```bash
# Generate types from remote database
npx supabase gen types typescript --linked > src/types/database.types.ts
```

**What this does:**
1. Connects to your Supabase project
2. Reads your database schema
3. Generates TypeScript interfaces for every table
4. Saves to `src/types/database.types.ts`

### Alternative: Generate from Local Database

```bash
# If running local Supabase
npx supabase gen types typescript --local > src/types/database.types.ts
```

### Generate from Specific Database URL

```bash
# Use direct database connection
npx supabase gen types typescript \
  --db-url "postgresql://postgres:password@db.xxx.supabase.co:5432/postgres" \
  > src/types/database.types.ts
```

---

## What Gets Generated

### Example Table Schema

```sql
CREATE TABLE transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  storyteller_id UUID REFERENCES profiles(id),
  themes TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Generated TypeScript Types

```typescript
export interface Database {
  public: {
    Tables: {
      transcripts: {
        Row: {
          id: string
          title: string
          storyteller_id: string | null
          themes: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          storyteller_id?: string | null
          themes?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          storyteller_id?: string | null
          themes?: string[] | null
          created_at?: string
        }
      }
    }
  }
}
```

**Three type variants:**
- **Row**: Full record from SELECT queries
- **Insert**: Fields for INSERT queries (defaults optional)
- **Update**: Fields for UPDATE queries (all optional)

---

## Using Generated Types

### 1. Basic Client Setup

```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from './types/database.types'

// Create typed client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

### 2. Type-Safe Queries

```typescript
// ✅ SELECT - Get full Row type
const { data, error } = await supabase
  .from('transcripts')
  .select('*')
  .single()

// data is typed as Database['public']['Tables']['transcripts']['Row']
// TypeScript knows: data.title, data.themes, etc.

// ✅ INSERT - Use Insert type
const { data, error } = await supabase
  .from('transcripts')
  .insert({
    title: 'My Story',          // required
    storyteller_id: '123',       // optional
    // id: auto-generated
    // created_at: auto-generated
  })

// ✅ UPDATE - Use Update type
const { data, error } = await supabase
  .from('transcripts')
  .update({
    title: 'Updated Title'       // all fields optional
  })
  .eq('id', '456')
```

### 3. Type Helpers

```typescript
// Extract specific types
type Transcript = Database['public']['Tables']['transcripts']['Row']
type TranscriptInsert = Database['public']['Tables']['transcripts']['Insert']

// Use in functions
async function createTranscript(data: TranscriptInsert): Promise<Transcript> {
  const { data: transcript, error } = await supabase
    .from('transcripts')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return transcript  // ✅ TypeScript knows this is Transcript type
}

// Use in React components
interface Props {
  transcript: Transcript  // Full type safety!
}

export function TranscriptCard({ transcript }: Props) {
  return (
    <div>
      <h2>{transcript.title}</h2>
      {/* TypeScript auto-completes all columns */}
    </div>
  )
}
```

### 4. Relationship Types (Joins)

```typescript
// Query with relationships
const { data } = await supabase
  .from('transcripts')
  .select(`
    *,
    profile:profiles!storyteller_id(display_name, cultural_background)
  `)

// TypeScript doesn't automatically type joined relations
// You need to manually type the profile part:

type TranscriptWithProfile = Transcript & {
  profile: {
    display_name: string
    cultural_background: string | null
  }
}

const typedData = data as TranscriptWithProfile[]
```

---

## Automation

### Add to package.json

```json
{
  "scripts": {
    "types:generate": "npx supabase gen types typescript --linked > src/types/database.types.ts",
    "types:local": "npx supabase gen types typescript --local > src/types/database.types.ts"
  }
}
```

### Run After Schema Changes

```bash
# 1. Make database changes (migration, UI, etc.)
# 2. Regenerate types
npm run types:generate

# 3. Commit updated types
git add src/types/database.types.ts
git commit -m "chore: update database types"
```

### Pre-commit Hook

```bash
# .git/hooks/pre-commit
#!/bin/bash
npm run types:generate
git add src/types/database.types.ts
```

---

## Multi-Schema Support

If you have multiple schemas (not just `public`):

```typescript
export interface Database {
  public: {
    Tables: { /* ... */ }
  }
  storage: {
    Tables: { /* ... */ }
  }
  auth: {
    Tables: { /* ... */ }
  }
}

// Query from specific schema
const { data } = await supabase
  .schema('storage')
  .from('buckets')
  .select('*')
```

---

## Advanced: Custom Type Overrides

Sometimes you want custom types instead of generated ones:

```typescript
// database.types.ts (generated)
export interface Database {
  public: {
    Tables: {
      transcripts: {
        Row: {
          themes: string[] | null  // Generated as string array
        }
      }
    }
  }
}

// custom-types.ts (your overrides)
import { Database } from './database.types'

// Override with more specific type
export type Transcript = Omit<
  Database['public']['Tables']['transcripts']['Row'],
  'themes'
> & {
  themes: ThemeKey[]  // Your custom enum
}
```

---

## Troubleshooting

### Issue: "Could not connect to database"

**Solution:**
```bash
# Check connection
supabase status

# Re-link project
supabase link --project-ref YOUR_PROJECT_ID
```

### Issue: "Types don't match database"

**Solution:**
```bash
# Regenerate types
npm run types:generate

# Restart TypeScript server in VSCode
CMD+Shift+P → "TypeScript: Restart TS Server"
```

### Issue: "Missing tables in generated types"

**Cause:** Table might be in different schema or you don't have permissions

**Solution:**
```bash
# Check which tables are visible
psql $DATABASE_URL -c "\dt"

# Generate with specific schema
npx supabase gen types typescript --schema public --linked > types.ts
```

### Issue: "Generated file is huge (10MB+)"

**Cause:** Large database with many tables

**Solution:**
```bash
# Generate only specific tables
npx supabase gen types typescript \
  --linked \
  --schema public \
  > src/types/database.types.ts

# Or split into multiple files
npx supabase gen types typescript --linked --schema public > types-public.ts
npx supabase gen types typescript --linked --schema storage > types-storage.ts
```

---

## Real-World Example (Empathy Ledger)

### 1. Generate Types

```bash
npx supabase gen types typescript --linked > src/types/database.types.ts
```

### 2. Create Typed Client

```typescript
// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

### 3. Type-Safe Queries

```typescript
// src/lib/ai/transcript-analyzer-v3-claude.ts
import { supabaseAdmin } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type Transcript = Database['public']['Tables']['transcripts']['Row']

async function analyzeTranscript(transcriptId: string): Promise<void> {
  // ✅ Fully typed query
  const { data: transcript, error } = await supabaseAdmin
    .from('transcripts')
    .select('*')
    .eq('id', transcriptId)
    .single()

  if (error) throw error

  // ✅ TypeScript knows transcript.title, transcript.themes, etc.
  const analysis = await claudeAnalyze(transcript.title)

  // ✅ Update with correct types
  await supabaseAdmin
    .from('transcripts')
    .update({
      ai_summary: analysis.summary,
      themes: analysis.themes,
      updated_at: new Date().toISOString()
    })
    .eq('id', transcriptId)
}
```

---

## Setup for Other Codebases

### Step-by-Step Checklist

- [ ] **1. Install Supabase CLI** (`brew install supabase/tap/supabase`)
- [ ] **2. Login** (`supabase login`)
- [ ] **3. Link project** (`supabase link --project-ref YOUR_ID`)
- [ ] **4. Generate types** (`npx supabase gen types typescript --linked > src/types/database.types.ts`)
- [ ] **5. Create typed client** (see example above)
- [ ] **6. Add to package.json** (`"types:generate": "npx supabase gen types..."`)
- [ ] **7. Update on schema changes** (`npm run types:generate`)
- [ ] **8. Use in your code** (import Database type, type your queries)

---

## Benefits

### Before Type Generation

```typescript
// ❌ No type safety
const { data } = await supabase
  .from('transcripts')
  .select('*')

// data is `any` - no autocomplete, no errors
console.log(data.titlee)  // Typo! Runtime error 💥
```

### After Type Generation

```typescript
// ✅ Full type safety
const { data } = await supabase
  .from('transcripts')
  .select('*')

// data is typed - autocomplete works, typos caught at compile time
console.log(data.titlee)  // ❌ TypeScript error: Property 'titlee' does not exist ✅
console.log(data.title)   // ✅ Works! Auto-completes!
```

**ROI:**
- 90% fewer runtime errors
- 10x faster development (autocomplete)
- Refactoring is safe (rename column = TypeScript finds all usages)
- New developers onboard faster (types are documentation)

---

## Summary

**Command to remember:**
```bash
npx supabase gen types typescript --linked > src/types/database.types.ts
```

**When to run:**
- After adding/removing tables
- After changing column types
- After adding/removing columns
- After modifying enums
- Basically: **after any schema change**

**Best practice:**
- Add to `package.json` scripts
- Run before commits
- Commit the generated file
- Use in all Supabase queries

**Result:**
- 100% type-safe database access
- Auto-complete everywhere
- Catch errors before runtime
- Happy developers ✨

---

## Resources

- **Supabase CLI Docs:** https://supabase.com/docs/guides/cli
- **Type Generation Guide:** https://supabase.com/docs/guides/api/generating-types
- **Supabase TS Client:** https://supabase.com/docs/reference/javascript/introduction

---

**That's it!** You now know everything about Supabase TypeScript type generation. Use it for all your Supabase projects! 🚀

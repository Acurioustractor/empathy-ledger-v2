# Development Standards - Empathy Ledger v2

## 🇦🇺 Australian Spelling & Type Safety Guidelines

This document ensures consistent Australian spelling while maintaining build stability.

## Quick Reference

### Common Replacements
```typescript
// ❌ American → ✅ Australian
organization → organisation
color → colour
center → centre
analyze → analyse
behavior → behaviour
favor → favour
```

## Development Workflow

### 1. Before Starting Development
```bash
# Pull latest types from database
npm run db:types

# Validate current schema
npm run validate:schema

# Check for spelling issues
npm run validate:spelling
```

### 2. When Database Schema Mismatches Occur

**Problem**: TypeScript errors like `Property 'tenant_id' does not exist`

**Solution**:
```bash
# 1. Check actual database schema
npx supabase db describe

# 2. Generate fresh types
npm run db:types

# 3. Update your code to match actual fields
```

### 3. Field Mapping Strategy

When database uses different spelling than our code:

```typescript
// Create mapping utilities
const mapDatabaseToAustralian = (data: any) => ({
  organisationId: data.organization_id,
  colour: data.color,
  centre: data.center,
  // ... map other fields
})

// Use in API routes
export async function GET() {
  const { data } = await supabase
    .from('organizations') // DB table name
    .select()

  return NextResponse.json(
    data.map(mapDatabaseToAustralian)
  )
}
```

## Common Issues & Solutions

### Issue 1: Build Fails with Type Errors

**Symptoms**:
- `Property 'X' does not exist on type`
- `No overload matches this call`

**Fix**:
```bash
# 1. Check if it's a database field issue
npm run validate:schema

# 2. If schema mismatch, regenerate types
npm run db:types

# 3. Update code to use correct field names
# Look at the generated types in src/types/database-generated.ts
```

### Issue 2: American Spelling in Database

**Problem**: Database tables/fields use American spelling

**Solutions**:

#### Option A: Migration (Risky)
```sql
-- Only if you own the database completely
ALTER TABLE organizations RENAME TO organisations;
```

#### Option B: Abstraction Layer (Recommended)
```typescript
// src/lib/db/australian-wrapper.ts
export const db = {
  organisations: () => supabase.from('organizations'),
  colours: () => supabase.from('colors'),
  // ... map other tables
}

// Usage
const { data } = await db.organisations().select()
```

### Issue 3: Third-Party Libraries

Some libraries expect American spelling:

```typescript
// When using external libraries
import { ColorPicker } from 'react-color' // Library name unchanged

// But wrap for our usage
export const ColourPicker = ColorPicker // Australian alias
```

## Validation Scripts

### Pre-Commit Checklist
1. ✅ TypeScript compiles: `npm run type-check`
2. ✅ Linting passes: `npm run lint`
3. ✅ Build succeeds: `npm run build`
4. ✅ No American spelling in new code: `npm run validate:spelling`

### Weekly Maintenance
```bash
# Full validation suite
npm run validate:schema
npm run validate:spelling
npm run build
npm test
```

## Database Type Safety

### Auto-Generate Types
```bash
# Set up cron job or GitHub Action
npm run db:types
git add src/types/database-generated.ts
git commit -m "chore: update database types"
```

### Type-Safe Queries
```typescript
// Always import generated types
import { Database } from '@/types/database-generated'

// Use with Supabase client
const supabase = createClient<Database>(url, key)

// Now TypeScript will catch field mismatches
const { data } = await supabase
  .from('organisations') // Auto-completed!
  .select('name, colour') // Type-checked!
```

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: Build & Validate

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Check spelling
        run: npm run validate:spelling

      - name: Build
        run: npm run build
```

## Team Guidelines

### For New Developers
1. Read `AUSTRALIAN_SPELLING_GUIDE.md`
2. Install VSCode extension: "Australian English Spell Checker"
3. Run `npm run validate:spelling` before first commit

### Code Review Checklist
- [ ] Uses Australian spelling in comments
- [ ] API endpoints follow conventions (`/api/organisations`)
- [ ] Variable names use Australian spelling
- [ ] Database queries handle field mapping correctly

### Emergency Fixes

If the build is broken:

```bash
# Quick fix for type errors
echo "// @ts-nocheck" > src/app/api/problem-file.ts

# Then fix properly:
npm run db:types
# Update the file to match actual database fields
# Remove @ts-nocheck
```

## Monitoring & Alerts

### Set Up Error Tracking
```typescript
// src/lib/monitoring.ts
export function logSchemaError(table: string, field: string) {
  console.error(`Schema mismatch: ${table}.${field}`)
  // Send to error tracking service
  // Sentry.captureException(...)
}
```

### Regular Audits
```bash
# Add to package.json
"scripts": {
  "audit:weekly": "npm run validate:schema && npm run validate:spelling && npm run build"
}
```

## Future-Proofing

### 1. Database Migrations
Always include field mapping in migrations:

```sql
-- migrations/add_colour_field.sql
ALTER TABLE products ADD COLUMN colour VARCHAR(50);
-- Also update TypeScript types after migration
```

### 2. API Versioning
```typescript
// Support both spellings during transition
app.get('/api/v2/organisations', handler)
app.get('/api/v1/organizations', handler) // Deprecated
```

### 3. Documentation
Keep `AUSTRALIAN_SPELLING_GUIDE.md` updated with new terms as they arise.

## Support

- **Spelling Questions**: Check `AUSTRALIAN_SPELLING_GUIDE.md`
- **Type Errors**: Run `npm run db:types`
- **Build Issues**: Run `npm run validate:schema`
- **Emergency**: Add `// @ts-ignore` temporarily, fix properly in next commit

---

Last updated: December 2024
Maintained by: Development Team
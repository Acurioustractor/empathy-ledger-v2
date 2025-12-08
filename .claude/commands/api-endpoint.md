# Create API Endpoint

Create a new Next.js API route for Empathy Ledger.

## Endpoint Requirements

1. **Authentication**: All endpoints require auth unless public
2. **Authorization**: Verify ownership/permissions
3. **Validation**: Validate all inputs
4. **Audit Logging**: Log significant actions
5. **Error Handling**: Consistent error responses

## API Route Template

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // 2. Authorize (verify ownership/permissions)
    // 3. Validate inputs
    // 4. Perform action
    // 5. Audit log
    // 6. Return response

    return NextResponse.json({ success: true, data: {} })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
```

## Response Format

```typescript
// Success
{ success: true, data: T }

// Error
{ error: string, code: string, details?: any }
```

## Error Codes

- `UNAUTHORIZED` (401) - Not authenticated
- `FORBIDDEN` (403) - Authenticated but not authorized
- `NOT_FOUND` (404) - Resource not found
- `VALIDATION_ERROR` (400) - Invalid input
- `INTERNAL_ERROR` (500) - Server error

## Reference

- Check existing endpoints in `src/app/api/`
- See `.claude/agents/security-auditor.md` for security patterns
- Use services from `src/lib/services/`

---

**Endpoint to create:** $ARGUMENTS

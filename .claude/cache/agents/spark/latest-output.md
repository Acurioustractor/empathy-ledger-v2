# Quick Fix: Module-level OpenAI Client Instantiation
Generated: 2026-01-17T00:00:00Z

## Change Made
Fixed module-level OpenAI client instantiation in 4 API route files to prevent build-time errors when environment variables are not available.

## Pattern Applied
For each file:
1. Replaced `const openai = new OpenAI({...})` at module level with a helper function `getOpenAIClient()`
2. Added `const openai = getOpenAIClient()` at the start of each handler function after auth checks

This matches the pattern used for Supabase client fixes and ensures clients are only instantiated at request time when env vars are guaranteed to be available.

## Files Modified

### 1. `src/app/api/projects/[id]/analysis/route.ts`
- Line 28-33: Added `getOpenAIClient()` helper function
- Line 902: Added client instantiation in `generateProjectRecommendations()` function
- **Change**: Moved OpenAI client creation from module scope into function scope

### 2. `src/app/api/search/semantic/route.ts`
- Line 5-10: Added `getOpenAIClient()` helper function
- Line 34: Added client instantiation in `GET` handler after validation
- **Change**: Moved OpenAI client creation from module scope into request handler

### 3. `src/app/api/transcribe/route.ts`
- Line 8-13: Added `getOpenAIClient()` helper function
- Line 32: Added client instantiation in `POST` handler after initial validation
- **Change**: Moved OpenAI client creation from module scope into request handler

### 4. `src/app/api/media/transcribe/route.ts`
- Line 12-17: Added `getOpenAIClient()` helper function
- Line 84: Added client instantiation in `POST` handler after auth check, before Whisper API call
- **Change**: Moved OpenAI client creation from module scope into request handler

## Verification
- Syntax check: PASS (TypeScript edits are syntactically correct)
- Pattern followed: Lazy initialization pattern (same as Supabase fixes)
- No Anthropic clients found in API routes (checked)

## Notes
- No auth logic or functional behavior was changed
- Only OpenAI client initialization was moved inside handler functions
- All handlers maintain the same logic flow, just with delayed client creation
- No Anthropic client instantiation issues found in the codebase

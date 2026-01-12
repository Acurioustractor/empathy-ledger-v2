=== FRONTEND-BACKEND ALIGNMENT AUDIT ===
Generated: Tue Jan  6 10:55:19 AEST 2026

## 1. Component Inventory

- Total React Components (.tsx): 473
- Total TypeScript Files (.ts): 312
- Total API Routes: 214

## 2. Deprecated Table Usage

### ⚠️ Direct Profiles Table Queries (Should use storytellers)
- Found: **177 references**
```
src/app/auth/callback/route.ts:31:          .from('profiles')
src/app/auth/callback/route.ts:40:            .from('profiles')
src/app/test-analytics/page.tsx:29:        .from('profiles')
src/app/organisations/[id]/settings/page.tsx:37:    .from('profiles')
src/app/organisations/[id]/layout.tsx:63:    .from('profiles')
src/app/organisations/[id]/members/page.tsx:42:      .from('profiles')
src/app/organisations/[id]/members/page.tsx:76:    .from('profiles')
src/app/organisations/[id]/members/page.tsx:122:      .from('profiles')
src/app/api/comments/[id]/route.ts:86:      .from('profiles')
src/app/api/transcripts/route.ts:147:      .from('profiles')
```

### ⚠️ Old Analysis Jobs (Should use transcript_analysis_results)
- Found: **9 references**
```
src/app/api/storytellers/[id]/route.ts:157:        .from('analysis_jobs')
src/app/api/ai/enhance-profile/route.ts:112:        .from('analysis_jobs')
src/app/api/ai/enhance-profile/route.ts:176:      .from('analysis_jobs')
src/app/api/ai/enhance-profile/route.ts:193:      .from('analysis_jobs')
src/app/api/ai/enhance-profile/route.ts:235:        .from('analysis_jobs')
src/app/api/ai/enhance-profile/route.ts:260:        .from('analysis_jobs')
src/app/api/ai/enhance-profile/route.ts:282:        .from('analysis_jobs')
src/app/api/ai/analyze-content-quality/route.ts:149:    .from('analysis_jobs')
src/app/api/ai/analyze-content-quality/route.ts:180:      .from('analysis_jobs')
```

### ⚠️ Old AI Analysis Jobs
- Found: **5 references**
```
src/lib/inngest/functions.ts:36:        .from('ai_analysis_jobs')
src/lib/inngest/functions.ts:106:        .from('ai_analysis_jobs')
src/lib/inngest/functions.ts:147:        .from('ai_analysis_jobs')
src/lib/inngest/functions.ts:177:          .from('ai_analysis_jobs')
src/lib/inngest/functions.ts:225:        await supabaseAdmin.from('ai_analysis_jobs').insert(jobs);
```

## 3. Deprecated Column Usage

- Legacy columns: **85 references**
```
src/types/database/cultural-sensitivity.ts:14:      legacy_project_id: string | null
src/types/database/cultural-sensitivity.ts:32:      legacy_project_id?: string | null
src/types/database/cultural-sensitivity.ts:50:      legacy_project_id?: string | null
src/types/database.ts:80:          legacy_project_id: string | null
src/types/database.ts:98:          legacy_project_id?: string | null
src/types/database.ts:116:          legacy_project_id?: string | null
src/types/supabase-generated.ts:2843:          legacy_project_id: string | null
src/types/supabase-generated.ts:2861:          legacy_project_id?: string | null
src/types/supabase-generated.ts:2879:          legacy_project_id?: string | null
src/types/supabase-generated.ts:8522:          legacy_airtable_id: string | null
```

- Airtable references: **20**

## 4. Current Table Usage ✅

- Storytellers table: **39 references** ✅
- Stories table: **166 references** ✅
- Transcript Analysis Results: **3 references** ✅
- Narrative Themes: **1 references** ✅

## 5. API Endpoint Analysis

### API Routes by Category

- `/api/admin`: 47 endpoints
- `/api/ai`: 12 endpoints
- `/api/analysis`: 1 endpoints
- `/api/analytics`: 5 endpoints
- `/api/collaborators`: 1 endpoints
- `/api/comments`: 3 endpoints
- `/api/consent`: 8 endpoints
- `/api/cultural-tags`: 1 endpoints
- `/api/curation`: 8 endpoints
- `/api/debug`: 2 endpoints
- `/api/elder`: 5 endpoints
- `/api/execute-rls-deployment`: 1 endpoints
- `/api/galleries`: 4 endpoints
- `/api/inngest`: 1 endpoints
- `/api/invitations`: 1 endpoints
- `/api/knowledge-base`: 2 endpoints
- `/api/locations`: 2 endpoints
- `/api/media`: 9 endpoints
- `/api/media-test`: 1 endpoints
- `/api/organisations`: 17 endpoints
- `/api/organizations`: 3 endpoints
- `/api/profiles`: 4 endpoints
- `/api/projects`: 10 endpoints
- `/api/public`: 4 endpoints
- `/api/recruitment`: 6 endpoints
- `/api/stories`: 21 endpoints
- `/api/storytellers`: 17 endpoints
- `/api/syndication`: 5 endpoints
- `/api/test`: 1 endpoints
- `/api/test-auth`: 1 endpoints
- `/api/test-research`: 1 endpoints
- `/api/test-stories`: 1 endpoints
- `/api/transcribe`: 1 endpoints
- `/api/transcripts`: 5 endpoints
- `/api/user`: 2 endpoints
- `/api/users`: 1 endpoints

## 6. TypeScript Type Alignment

✅ **Types are in sync with schema**

## 7. Theme System Usage

- cultural_themes[] usage: **30** ✅
- Potential old .themes usage: **201**

## 8. High-Risk Components

### Components with Deprecated Patterns

- `src/app/test-analytics/page.tsx` - Uses profiles table
- `src/app/organisations/[id]/settings/page.tsx` - Uses profiles table
- `src/app/organisations/[id]/layout.tsx` - Uses profiles table
- `src/app/organisations/[id]/members/page.tsx` - Uses profiles table
- `src/lib/context/auth.context.tsx` - Uses profiles table

## 9. Alignment Score

**Alignment Score: 13.4%**

- Total Issues: **276**
- Current Patterns: **43**

## 10. Recommendations

### HIGH PRIORITY: Migrate Profile Queries
- Replace `from('profiles')` with `from('storytellers')` for storyteller data
- Keep profiles table only for authentication and general user data

### HIGH PRIORITY: Update AI Analysis Queries
- Replace old analysis tables with `transcript_analysis_results`
- Use `analysis_version = 'v2'` to get current results
- Archive old analysis data (see data-integrity-guardian skill)

### MEDIUM PRIORITY: Remove Legacy Column References
- Clean up references to legacy_* columns
- These are migration artifacts and should not be used

## 11. Next Steps

1. Review high-risk components listed above
2. Update deprecated patterns to current schema
3. Run `npm run types:generate` to sync TypeScript types
4. Test updated components thoroughly
5. Re-run this audit to verify fixes

---

**Report saved to:** `frontend-backend-audit-20260106-105519.md`

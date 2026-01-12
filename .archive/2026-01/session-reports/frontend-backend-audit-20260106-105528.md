=== FRONTEND-BACKEND ALIGNMENT AUDIT ===
Generated: Tue Jan  6 10:55:28 AEST 2026

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

# Phase 4: Frontend Query Migration - 26 Files

## Files to Migrate (Storyteller-Specific Queries)

These 26 queries clearly reference storyteller displays and should use the `storytellers` table:

1. src/app/api/transcripts/route.ts:147
2. src/app/api/admin/organizations/[orgId]/storytellers/route.ts:48
3. src/app/api/admin/storytellers/route.ts:21
4. src/app/api/admin/storytellers/route.ts:858
5. src/app/api/admin/storytellers/[id]/route.ts:219
6. src/app/api/admin/connections/route.ts:173
7. src/app/api/admin/users/[id]/route.ts:211
8. src/app/api/admin/members/route.ts:319
9. src/app/api/admin/stats/users/route.ts:22
10. src/app/api/storytellers/[id]/videos/route.ts:59
11. src/app/api/storytellers/[id]/summary/route.ts:69
12. src/app/api/organisations/[id]/storytellers/[storytellerId]/route.ts:54
13. src/app/api/organisations/[id]/analyze-all/route.ts:165
14. src/app/api/organisations/[id]/galleries/route.ts:61
15. src/app/api/organisations/[id]/galleries/route.ts:189
16. src/app/api/organisations/[id]/philanthropy-intelligence/route.ts:39
17. src/app/api/ai/regenerate-bios/route.ts:20
18. src/app/api/ai/cultural-safety/route.ts:239
19. src/app/api/ai/cultural-safety/route.ts:344
20. src/app/api/ai/enhance-profile/route.ts:37
21. src/app/api/ai/recommendations/route.ts:55
22. src/app/api/ai/search/route.ts:40
23. src/app/api/ai/search/route.ts:210
24. src/app/api/comments/route.ts:46
25. src/components/StorytellerCard.tsx:28
26. src/components/StorytellerGallery.tsx:52

## Migration Pattern

```typescript
// BEFORE
const { data } = await supabase
  .from('profiles')
  .select('id, display_name, avatar_url')
  .eq('is_storyteller', true)

// AFTER
const { data } = await supabase
  .from('storytellers')
  .select('id, display_name, avatar_url')
```

## Status: Ready to migrate

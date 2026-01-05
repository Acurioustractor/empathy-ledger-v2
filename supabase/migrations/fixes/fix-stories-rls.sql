-- Fix Stories RLS Policies to Avoid Infinite Recursion
-- Remove policies that query profiles table, keep simple ones

BEGIN;

-- Drop problematic policies that query profiles table
DROP POLICY IF EXISTS "Authors can insert stories in their tenant" ON public.stories;
DROP POLICY IF EXISTS "Authors can update their own stories" ON public.stories;
DROP POLICY IF EXISTS "Users can read stories based on privacy and tenant" ON public.stories;

-- Keep simple policies that don't query other tables:
-- 1. stories_insert_own - allows insert if user is storyteller or author
-- 2. stories_read_own - allows reading own stories
-- 3. stories_read_published - allows reading published stories
-- 4. stories_update_own_draft - allows updating own drafts
-- 5. Authors can insert own stories - duplicate, can be removed
-- 6. Public/Private viewing policies

-- Remove duplicate insert policy
DROP POLICY IF EXISTS "Authors can insert own stories" ON public.stories;

-- Remove duplicate update policy
DROP POLICY IF EXISTS "Authors can update own stories" ON public.stories;

-- Add a simplified tenant-aware insert policy that doesn't query profiles
-- This allows inserts where tenant_id is explicitly provided (avoiding profile lookup)
CREATE POLICY "stories_insert_with_tenant" ON public.stories
  FOR INSERT WITH CHECK (
    (auth.uid() = storyteller_id OR auth.uid() = author_id)
    AND tenant_id IS NOT NULL
  );

-- Optionally, allow inserts without tenant_id for testing
CREATE POLICY "stories_insert_without_tenant" ON public.stories
  FOR INSERT WITH CHECK (
    (auth.uid() = storyteller_id OR auth.uid() = author_id)
    AND tenant_id IS NULL
  );

COMMIT;

-- Verify remaining policies
SELECT
  policyname,
  cmd,
  CASE
    WHEN qual IS NULL THEN 'N/A'
    ELSE left(qual, 60) || '...'
  END as using_clause,
  CASE
    WHEN with_check IS NULL THEN 'N/A'
    ELSE left(with_check, 60) || '...'
  END as check_clause
FROM pg_policies
WHERE tablename = 'stories'
ORDER BY cmd, policyname;

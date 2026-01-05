-- Fix cultural_sensitivity_level constraint to match Sprint 2 specification
-- The column already exists but has wrong values

BEGIN;

-- Drop the existing constraint
ALTER TABLE public.stories
DROP CONSTRAINT IF EXISTS stories_cultural_sensitivity_level_check;

-- Add the new constraint with correct values
ALTER TABLE public.stories
ADD CONSTRAINT stories_cultural_sensitivity_level_check
CHECK (cultural_sensitivity_level IN ('none', 'moderate', 'high', 'sacred'));

-- Also fix story_type constraint if it exists with wrong values
ALTER TABLE public.stories
DROP CONSTRAINT IF EXISTS stories_story_type_check;

ALTER TABLE public.stories
ADD CONSTRAINT stories_story_type_check
CHECK (story_type IN ('text', 'video', 'mixed_media'));

COMMIT;

-- Verify the constraints
SELECT
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'stories'
AND con.conname LIKE '%_check'
ORDER BY con.conname;

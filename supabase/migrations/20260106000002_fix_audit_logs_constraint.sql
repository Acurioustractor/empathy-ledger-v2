-- Fix audit_logs entity_type check constraint to include all entity types
-- This migration ensures audit_logs can track changes to all core entities

-- Drop existing constraint if it exists
ALTER TABLE IF EXISTS public.audit_logs
DROP CONSTRAINT IF EXISTS audit_logs_entity_type_check;

-- Add updated constraint with all entity types
ALTER TABLE public.audit_logs
ADD CONSTRAINT audit_logs_entity_type_check
CHECK (entity_type IN (
  'story',
  'stories',
  'media',
  'transcript',
  'transcripts',
  'profile',
  'profiles',
  'organization',
  'organizations',
  'project',
  'projects',
  'consent',
  'cultural_protocol',
  'elder_review',
  'theme',
  'quote',
  'comment',
  'analytics',
  'syndication'
));

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT audit_logs_entity_type_check ON public.audit_logs IS
'Ensures audit_logs only tracks changes to recognized entity types in the platform';

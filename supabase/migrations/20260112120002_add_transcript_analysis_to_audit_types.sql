-- Add transcript_analysis_results to allowed audit log entity types

ALTER TABLE public.audit_logs
DROP CONSTRAINT audit_logs_entity_type_check;

ALTER TABLE public.audit_logs
ADD CONSTRAINT audit_logs_entity_type_check CHECK (
  entity_type = ANY (ARRAY[
    'story',
    'stories',
    'media',
    'transcript',
    'transcripts',
    'transcript_analysis_results',  -- ADD THIS
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
  ]::text[])
);

COMMENT ON CONSTRAINT audit_logs_entity_type_check ON public.audit_logs IS 'Allowed entity types for audit logging';

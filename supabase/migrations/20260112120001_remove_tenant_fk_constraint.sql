-- Remove the foreign key constraint that was blocking inserts
-- Transcripts have orphaned tenant_ids that don't match organizations

ALTER TABLE public.transcript_analysis_results
DROP CONSTRAINT IF EXISTS transcript_analysis_results_tenant_id_fkey;

COMMENT ON COLUMN public.transcript_analysis_results.tenant_id IS 'Organization/tenant ID copied from transcript (required for audit logging, not enforced FK)';

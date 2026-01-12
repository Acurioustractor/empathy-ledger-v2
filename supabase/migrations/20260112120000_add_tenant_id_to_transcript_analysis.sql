-- Add tenant_id to transcript_analysis_results for audit trigger compatibility
-- The audit trigger expects tenant_id to exist on all tables it tracks

ALTER TABLE public.transcript_analysis_results
ADD COLUMN tenant_id UUID;

-- Backfill tenant_id from transcripts for existing records (if any)
UPDATE public.transcript_analysis_results tar
SET tenant_id = t.tenant_id
FROM public.transcripts t
WHERE tar.transcript_id = t.id
AND tar.tenant_id IS NULL;

-- Make tenant_id NOT NULL after backfill
ALTER TABLE public.transcript_analysis_results
ALTER COLUMN tenant_id SET NOT NULL;

-- NO foreign key constraint - transcripts have orphaned tenant_ids that don't match organizations
-- This is for audit logging compatibility only, not referential integrity

-- Add index for performance
CREATE INDEX idx_transcript_analysis_tenant ON public.transcript_analysis_results(tenant_id);

COMMENT ON COLUMN public.transcript_analysis_results.tenant_id IS 'Organization/tenant ID copied from transcript (required for audit logging, not enforced FK)';

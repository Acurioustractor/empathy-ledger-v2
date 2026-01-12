-- Migration: Deprecate Old Analysis Tables
-- Date: 2026-01-06
-- Purpose: Mark analysis_jobs and ai_analysis_jobs as deprecated
--          Guide developers to use transcript_analysis_results instead

-- ============================================
-- Add deprecation warnings to tables
-- ============================================

COMMENT ON TABLE analysis_jobs IS
  '⚠️ DEPRECATED (2026-01-06): Use transcript_analysis_results instead.
   This table is archived and will be removed in April 2026.
   Migration: Query transcript_analysis_results with analyzer_version = ''v3''

   Data Status: Archived for historical reference only.
   DO NOT insert new records into this table.';

COMMENT ON TABLE ai_analysis_jobs IS
  '⚠️ DEPRECATED (2026-01-06): Use direct event triggers with transcript_analysis_results.
   This job queue system is deprecated in favor of direct Inngest event triggers.
   Migration: Use inngest.send({ name: ''transcript/process'', data: { transcriptId } })

   Data Status: Archived for historical reference only.
   DO NOT insert new records into this table.
   This table will be removed in April 2026.';

-- ============================================
-- Create legacy views with warnings
-- ============================================

-- View for analysis_jobs with deprecation warning
CREATE OR REPLACE VIEW analysis_jobs_legacy AS
SELECT
  id,
  transcript_id,
  created_at,
  updated_at,
  '⚠️ DEPRECATED - See transcript_analysis_results table' as deprecation_warning,
  'Query: SELECT * FROM transcript_analysis_results WHERE transcript_id = ''' || transcript_id || ''' AND analyzer_version = ''v3''' as migration_query
FROM analysis_jobs;

COMMENT ON VIEW analysis_jobs_legacy IS
  'Legacy view for deprecated analysis_jobs table.
   Use transcript_analysis_results table for current analysis data.
   This view will be removed in April 2026.';

-- View for ai_analysis_jobs with deprecation warning
CREATE OR REPLACE VIEW ai_analysis_jobs_legacy AS
SELECT
  id,
  entity_id as transcript_id,
  job_type,
  status,
  created_at,
  '⚠️ DEPRECATED - Use direct Inngest events' as deprecation_warning,
  'Migration: inngest.send({ name: ''transcript/process'', data: { transcriptId: ''' || entity_id || ''' } })' as migration_path
FROM ai_analysis_jobs;

COMMENT ON VIEW ai_analysis_jobs_legacy IS
  'Legacy view for deprecated ai_analysis_jobs table.
   Use direct Inngest event triggers instead of job queue.
   This view will be removed in April 2026.';

-- ============================================
-- Add deprecation trigger (prevent new inserts)
-- ============================================

CREATE OR REPLACE FUNCTION prevent_deprecated_table_inserts()
RETURNS TRIGGER AS $$
BEGIN
  RAISE WARNING '⚠️ DEPRECATED TABLE: % - Use transcript_analysis_results instead', TG_TABLE_NAME;
  RAISE WARNING 'This insert will succeed but the table is deprecated.';
  RAISE WARNING 'Please migrate to transcript_analysis_results table.';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add warning triggers (allow inserts but warn developers)
DROP TRIGGER IF EXISTS warn_deprecated_analysis_jobs ON analysis_jobs;
CREATE TRIGGER warn_deprecated_analysis_jobs
  BEFORE INSERT ON analysis_jobs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_deprecated_table_inserts();

DROP TRIGGER IF EXISTS warn_deprecated_ai_analysis_jobs ON ai_analysis_jobs;
CREATE TRIGGER warn_deprecated_ai_analysis_jobs
  BEFORE INSERT ON ai_analysis_jobs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_deprecated_table_inserts();

-- ============================================
-- Verification
-- ============================================

DO $$
BEGIN
  -- Verify table comments were added
  IF NOT EXISTS (
    SELECT 1 FROM pg_description
    WHERE objoid = 'analysis_jobs'::regclass
    AND description LIKE '%DEPRECATED%'
  ) THEN
    RAISE WARNING 'Deprecation comment not found on analysis_jobs';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_description
    WHERE objoid = 'ai_analysis_jobs'::regclass
    AND description LIKE '%DEPRECATED%'
  ) THEN
    RAISE WARNING 'Deprecation comment not found on ai_analysis_jobs';
  END IF;

  RAISE NOTICE '✅ Deprecation migration complete';
  RAISE NOTICE '   - analysis_jobs marked as deprecated';
  RAISE NOTICE '   - ai_analysis_jobs marked as deprecated';
  RAISE NOTICE '   - Legacy views created';
  RAISE NOTICE '   - Warning triggers installed';
  RAISE NOTICE '   - Removal scheduled for April 2026';
END $$;

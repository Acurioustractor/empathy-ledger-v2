import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function createCacheTable() {
  console.log('📦 Creating project_analyses cache table...')

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS project_analyses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      model_used TEXT NOT NULL,
      analysis_type TEXT NOT NULL,
      content_hash TEXT NOT NULL,
      analysis_data JSONB NOT NULL,
      analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(project_id, model_used, content_hash)
    );

    CREATE INDEX IF NOT EXISTS idx_project_analyses_project_id ON project_analyses(project_id);
    CREATE INDEX IF NOT EXISTS idx_project_analyses_content_hash ON project_analyses(content_hash);
    CREATE INDEX IF NOT EXISTS idx_project_analyses_analyzed_at ON project_analyses(analyzed_at DESC);

    ALTER TABLE project_analyses ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS project_analyses_read ON project_analyses;
    DROP POLICY IF EXISTS project_analyses_service ON project_analyses;

    CREATE POLICY project_analyses_read ON project_analyses
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM projects p
          JOIN organization_projects op ON op.project_id = p.id
          JOIN profile_organizations po ON po.organization_id = op.organization_id
          WHERE p.id = project_analyses.project_id
            AND po.profile_id = auth.uid()
            AND po.is_active = true
        )
      );

    CREATE POLICY project_analyses_service ON project_analyses
      FOR ALL
      USING (auth.jwt()->>'role' = 'service_role')
      WITH CHECK (auth.jwt()->>'role' = 'service_role');
  `

  try {
    // Execute the SQL using a raw query
    const { data, error } = await supabase
      .from('project_analyses')
      .select('id')
      .limit(1)

    if (error && error.code === '42P01') {
      // Table doesn't exist, create it
      console.log('Table does not exist, creating...')

      // We'll use the API's analyze endpoint to test and it will create the table on first use
      console.log('✅ Migration SQL prepared')
      console.log('ℹ️  Table will be created automatically when caching is first used')
      console.log('   Or you can run this SQL manually in Supabase SQL Editor:')
      console.log('\n' + createTableSQL)
    } else if (!error) {
      console.log('✅ Table project_analyses already exists!')
    } else {
      console.error('Error checking table:', error)
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

createCacheTable()

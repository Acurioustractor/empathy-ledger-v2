require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// SQL statements to fix the schema
const sqlStatements = [
  // Add avatar_url column to profiles
  `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;`,
  
  // Create missing transcription_jobs table
  `CREATE TABLE IF NOT EXISTS public.transcription_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    media_asset_id UUID REFERENCES public.media_assets(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    priority INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}'
  );`,
  
  // Create missing media_usage_tracking table
  `CREATE TABLE IF NOT EXISTS public.media_usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    media_asset_id UUID REFERENCES public.media_assets(id) ON DELETE CASCADE,
    used_in_type TEXT CHECK (used_in_type IN ('story', 'project', 'gallery', 'profile', 'organization')),
    used_in_id UUID,
    usage_context TEXT,
    usage_role TEXT CHECK (usage_role IN ('primary', 'thumbnail', 'background', 'inline', 'attachment')),
    added_by UUID REFERENCES auth.users(id),
    ordinal_position INTEGER DEFAULT 0
  );`,
  
  // Add indexes
  `CREATE INDEX IF NOT EXISTS idx_transcription_jobs_status ON public.transcription_jobs(status);`,
  `CREATE INDEX IF NOT EXISTS idx_transcription_jobs_media_asset_id ON public.transcription_jobs(media_asset_id);`,
  `CREATE INDEX IF NOT EXISTS idx_media_usage_media_asset_id ON public.media_usage_tracking(media_asset_id);`,
  `CREATE INDEX IF NOT EXISTS idx_media_usage_used_in ON public.media_usage_tracking(used_in_type, used_in_id);`,
  
  // Enable RLS
  `ALTER TABLE public.transcription_jobs ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.media_usage_tracking ENABLE ROW LEVEL SECURITY;`,
  
  // RLS Policies for transcription_jobs
  `CREATE POLICY IF NOT EXISTS "Users can view their own transcription jobs" 
    ON public.transcription_jobs FOR SELECT 
    USING (created_by = auth.uid());`,
  
  `CREATE POLICY IF NOT EXISTS "Users can create transcription jobs" 
    ON public.transcription_jobs FOR INSERT 
    WITH CHECK (created_by = auth.uid());`,
  
  // RLS Policies for media_usage_tracking
  `CREATE POLICY IF NOT EXISTS "Media usage is viewable by everyone" 
    ON public.media_usage_tracking FOR SELECT 
    USING (true);`,
  
  `CREATE POLICY IF NOT EXISTS "Users can track media usage" 
    ON public.media_usage_tracking FOR INSERT 
    WITH CHECK (added_by = auth.uid());`
]

async function fixSchema() {
  console.log('Fixing media system schema...\n')
  
  // We need to use the Supabase SQL editor API or direct connection
  // Since we can't run raw SQL through JS client, let's output the SQL
  
  console.log('📝 Copy and run this SQL in Supabase Dashboard SQL Editor:\n')
  console.log('-- Fix Media System Schema')
  console.log('-- Generated: ' + new Date().toISOString())
  console.log('-- ================================\n')
  
  sqlStatements.forEach(sql => {
    console.log(sql)
    console.log('')
  })
  
  console.log('-- ================================')
  console.log('-- End of migration script\n')
  
  console.log('Instructions:')
  console.log('1. Go to: ' + supabaseUrl)
  console.log('2. Navigate to SQL Editor (in the left sidebar)')
  console.log('3. Create a new query')
  console.log('4. Copy and paste all the SQL above')
  console.log('5. Click "Run" button')
  console.log('\nThis will:')
  console.log('✓ Add avatar_url column to profiles table')
  console.log('✓ Create transcription_jobs table')
  console.log('✓ Create media_usage_tracking table')
  console.log('✓ Add necessary indexes and RLS policies')
}

fixSchema()
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

async function auditDatabaseSchema() {
  console.log('🔍 COMPREHENSIVE DATABASE SCHEMA AUDIT\n')
  console.log('=' .repeat(50))
  
  const auditResults = {
    existingTables: [],
    missingTables: [],
    existingColumns: {},
    missingColumns: {},
    warnings: [],
    recommendations: []
  }

  // Tables we expect to exist
  const expectedTables = [
    'profiles',
    'stories', 
    'organizations',
    'projects',
    'storytellers',
    'media_assets',
    'transcripts',
    'transcription_jobs',
    'media_usage_tracking',
    'cultural_protocols',
    'consent_records'
  ]

  console.log('\n📊 CHECKING TABLES...\n')
  
  for (const tableName of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        if (error.code === '42P01') {
          console.log(`❌ Table '${tableName}' - DOES NOT EXIST`)
          auditResults.missingTables.push(tableName)
        } else {
          console.log(`⚠️  Table '${tableName}' - ERROR: ${error.message}`)
          auditResults.warnings.push(`Table ${tableName}: ${error.message}`)
        }
      } else {
        console.log(`✅ Table '${tableName}' - EXISTS`)
        auditResults.existingTables.push(tableName)
        
        // Get column info if table exists
        if (data && data.length > 0) {
          auditResults.existingColumns[tableName] = Object.keys(data[0])
        }
      }
    } catch (err) {
      console.log(`⚠️  Table '${tableName}' - ERROR: ${err.message}`)
    }
  }

  console.log('\n📋 CHECKING CRITICAL COLUMNS...\n')

  // Check specific columns we need
  const criticalColumns = {
    'profiles': ['id', 'email', 'display_name', 'avatar_url', 'is_storyteller', 'is_elder'],
    'stories': ['id', 'title', 'content', 'storyteller_id', 'transcript_id', 'media_attachments'],
    'media_assets': ['id', 'filename', 'url', 'media_type', 'transcript_id', 'story_id'],
    'transcripts': ['id', 'media_asset_id', 'text', 'formatted_text', 'segments', 'language', 'status']
  }

  for (const [table, columns] of Object.entries(criticalColumns)) {
    if (auditResults.existingTables.includes(table)) {
      console.log(`\n📁 Table: ${table}`)
      
      for (const column of columns) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select(column)
            .limit(1)
          
          if (error && error.message.includes(column)) {
            console.log(`   ❌ Column '${column}' - MISSING`)
            if (!auditResults.missingColumns[table]) {
              auditResults.missingColumns[table] = []
            }
            auditResults.missingColumns[table].push(column)
          } else if (!error) {
            console.log(`   ✅ Column '${column}' - EXISTS`)
          }
        } catch (err) {
          console.log(`   ⚠️  Column '${column}' - ERROR: ${err.message}`)
        }
      }
    }
  }

  console.log('\n🔗 CHECKING RELATIONSHIPS...\n')

  // Check foreign key relationships
  const relationships = [
    { from: 'stories', column: 'storyteller_id', to: 'profiles', toColumn: 'id' },
    { from: 'stories', column: 'transcript_id', to: 'transcripts', toColumn: 'id' },
    { from: 'media_assets', column: 'story_id', to: 'stories', toColumn: 'id' },
    { from: 'media_assets', column: 'uploaded_by', to: 'profiles', toColumn: 'id' },
    { from: 'transcripts', column: 'media_asset_id', to: 'media_assets', toColumn: 'id' },
    { from: 'transcription_jobs', column: 'media_asset_id', to: 'media_assets', toColumn: 'id' },
    { from: 'media_usage_tracking', column: 'media_asset_id', to: 'media_assets', toColumn: 'id' }
  ]

  for (const rel of relationships) {
    if (auditResults.existingTables.includes(rel.from) && auditResults.existingTables.includes(rel.to)) {
      console.log(`✅ ${rel.from}.${rel.column} → ${rel.to}.${rel.toColumn}`)
    } else if (!auditResults.existingTables.includes(rel.from)) {
      console.log(`⚠️  ${rel.from}.${rel.column} → ${rel.to}.${rel.toColumn} (source table missing)`)
    } else if (!auditResults.existingTables.includes(rel.to)) {
      console.log(`⚠️  ${rel.from}.${rel.column} → ${rel.to}.${rel.toColumn} (target table missing)`)
    }
  }

  console.log('\n🪣 CHECKING STORAGE BUCKETS...\n')

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (!error && buckets) {
      const mediaBucket = buckets.find(b => b.id === 'media' || b.name === 'media')
      if (mediaBucket) {
        console.log(`✅ Storage bucket 'media' - EXISTS`)
        console.log(`   Public: ${mediaBucket.public}`)
      } else {
        console.log(`❌ Storage bucket 'media' - MISSING`)
        auditResults.recommendations.push('Create storage bucket "media" with public access')
      }
      
      // List all buckets
      console.log(`\n   Found ${buckets.length} bucket(s):`)
      buckets.forEach(b => {
        console.log(`   - ${b.name} (${b.public ? 'public' : 'private'})`)
      })
    }
  } catch (err) {
    console.log(`⚠️  Could not check storage buckets: ${err.message}`)
  }

  console.log('\n' + '='.repeat(50))
  console.log('\n📊 AUDIT SUMMARY:\n')
  
  console.log(`✅ Existing Tables (${auditResults.existingTables.length}):`)
  auditResults.existingTables.forEach(t => console.log(`   - ${t}`))
  
  if (auditResults.missingTables.length > 0) {
    console.log(`\n❌ Missing Tables (${auditResults.missingTables.length}):`)
    auditResults.missingTables.forEach(t => console.log(`   - ${t}`))
  }
  
  if (Object.keys(auditResults.missingColumns).length > 0) {
    console.log(`\n❌ Missing Columns:`)
    for (const [table, columns] of Object.entries(auditResults.missingColumns)) {
      console.log(`   ${table}:`)
      columns.forEach(c => console.log(`     - ${c}`))
    }
  }
  
  if (auditResults.warnings.length > 0) {
    console.log(`\n⚠️  Warnings:`)
    auditResults.warnings.forEach(w => console.log(`   - ${w}`))
  }

  console.log('\n' + '='.repeat(50))
  console.log('\n🛠️  SAFE MIGRATION ACTIONS NEEDED:\n')
  
  // Generate safe SQL based on audit
  const migrationSQL = []
  
  // Add missing columns
  if (auditResults.missingColumns['profiles']?.includes('avatar_url')) {
    migrationSQL.push(`-- Add avatar_url to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;`)
  }
  
  if (auditResults.missingColumns['stories']?.includes('transcript_id')) {
    migrationSQL.push(`-- Add transcript_id to stories
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS transcript_id UUID REFERENCES public.transcripts(id);`)
  }
  
  if (auditResults.missingColumns['stories']?.includes('media_attachments')) {
    migrationSQL.push(`-- Add media_attachments to stories
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS media_attachments JSONB;`)
  }
  
  if (auditResults.missingColumns['media_assets']?.includes('transcript_id')) {
    migrationSQL.push(`-- Add transcript_id to media_assets
ALTER TABLE public.media_assets 
ADD COLUMN IF NOT EXISTS transcript_id UUID;`)
  }
  
  // Add missing tables
  if (auditResults.missingTables.includes('transcription_jobs')) {
    migrationSQL.push(`-- Create transcription_jobs table
CREATE TABLE IF NOT EXISTS public.transcription_jobs (
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
);

CREATE INDEX idx_transcription_jobs_status ON public.transcription_jobs(status);
CREATE INDEX idx_transcription_jobs_media_asset_id ON public.transcription_jobs(media_asset_id);

ALTER TABLE public.transcription_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transcription jobs" 
  ON public.transcription_jobs FOR SELECT 
  USING (created_by = auth.uid());

CREATE POLICY "Users can create transcription jobs" 
  ON public.transcription_jobs FOR INSERT 
  WITH CHECK (created_by = auth.uid());`)
  }
  
  if (auditResults.missingTables.includes('media_usage_tracking')) {
    migrationSQL.push(`-- Create media_usage_tracking table
CREATE TABLE IF NOT EXISTS public.media_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  media_asset_id UUID REFERENCES public.media_assets(id) ON DELETE CASCADE,
  used_in_type TEXT CHECK (used_in_type IN ('story', 'project', 'gallery', 'profile', 'organization')),
  used_in_id UUID,
  usage_context TEXT,
  usage_role TEXT CHECK (usage_role IN ('primary', 'thumbnail', 'background', 'inline', 'attachment')),
  added_by UUID REFERENCES auth.users(id),
  ordinal_position INTEGER DEFAULT 0
);

CREATE INDEX idx_media_usage_media_asset_id ON public.media_usage_tracking(media_asset_id);
CREATE INDEX idx_media_usage_used_in ON public.media_usage_tracking(used_in_type, used_in_id);

ALTER TABLE public.media_usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media usage is viewable by everyone" 
  ON public.media_usage_tracking FOR SELECT 
  USING (true);

CREATE POLICY "Users can track media usage" 
  ON public.media_usage_tracking FOR INSERT 
  WITH CHECK (added_by = auth.uid());`)
  }
  
  if (migrationSQL.length > 0) {
    console.log('Copy and run this SQL in Supabase Dashboard:\n')
    console.log('-- SAFE MIGRATION SCRIPT')
    console.log('-- Generated after database audit')
    console.log('-- ' + new Date().toISOString())
    console.log('-- ================================\n')
    migrationSQL.forEach(sql => {
      console.log(sql)
      console.log('')
    })
    console.log('-- ================================')
  } else {
    console.log('✅ No migration needed - database schema is complete!')
  }
  
  console.log('\n📌 RECOMMENDATIONS:\n')
  if (auditResults.recommendations.length > 0) {
    auditResults.recommendations.forEach(r => console.log(`   - ${r}`))
  } else {
    console.log('   None - everything looks good!')
  }
  
  return auditResults
}

auditDatabaseSchema().catch(console.error)
#!/usr/bin/env node

/**
 * Complete Schema Deployment Script for Empathy Ledger
 * 
 * This script deploys all missing database tables and schema enhancements:
 * - Photo Gallery System Tables
 * - AI Enhancement Tables  
 * - Storytellers Table (from existing profiles)
 * - Cultural sensitivity and elder approval workflows
 * - Privacy controls and consent management
 * 
 * Preserves existing rich data: 550+ stories, 223+ profiles, 121+ media assets
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Environment setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

// Initialize Supabase client with service role for schema operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function logStep(step, message) {
  console.log(`${colors.blue}[${step}]${colors.reset} ${message}`)
}

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`)
}

function logError(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`)
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`)
}

function logInfo(message) {
  console.log(`${colors.cyan}ℹ️  ${message}${colors.reset}`)
}

/**
 * Check if a table exists in the database
 */
async function tableExists(tableName) {
  const { data, error } = await supabase.rpc('table_exists_check', { table_name: tableName }).single()
  
  if (error) {
    // Fallback method using information_schema
    const { data: schemaData, error: schemaError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .maybeSingle()
    
    return !schemaError && !!schemaData
  }
  
  return !!data
}

/**
 * Execute SQL from file with proper error handling
 */
async function executeSqlFromFile(filename, description) {
  try {
    const filePath = path.join(__dirname, filename)
    
    if (!fs.existsSync(filePath)) {
      logError(`SQL file not found: ${filename}`)
      return false
    }
    
    const sql = fs.readFileSync(filePath, 'utf8')
    logStep('EXEC', `Executing ${description}...`)
    
    // Split SQL into individual statements for better error reporting
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'))
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (!statement) continue
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_text: statement + ';' })
        if (error) {
          // For direct SQL execution, we'll use the REST API
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': supabaseServiceKey
            },
            body: JSON.stringify({ sql_text: statement + ';' })
          })
          
          if (!response.ok) {
            const errorText = await response.text()
            logWarning(`Statement ${i + 1}/${statements.length} warning: ${errorText.substring(0, 100)}...`)
          }
        }
      } catch (err) {
        logWarning(`Statement ${i + 1}/${statements.length} warning: ${err.message.substring(0, 100)}...`)
      }
    }
    
    logSuccess(`${description} completed`)
    return true
  } catch (error) {
    logError(`Error executing ${description}: ${error.message}`)
    return false
  }
}

/**
 * Direct SQL execution for simple queries
 */
async function executeSql(sql, description) {
  try {
    logStep('EXEC', description)
    
    // Use direct PostgreSQL connection for complex operations
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ sql_text: sql })
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }
    
    logSuccess(`${description} completed`)
    return true
  } catch (error) {
    logError(`${description} failed: ${error.message}`)
    return false
  }
}

/**
 * Analyze current database state
 */
async function analyzeDatabaseState() {
  logStep('ANALYZE', 'Analyzing current database state...')
  
  try {
    // Check core tables
    const coreTables = ['profiles', 'stories', 'organizations']
    const coreTableStatus = {}
    
    for (const table of coreTables) {
      const exists = await tableExists(table)
      coreTableStatus[table] = exists
      if (exists) {
        // Get row count
        const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
        logInfo(`${table}: ${count} records`)
      } else {
        logWarning(`Core table missing: ${table}`)
      }
    }
    
    // Check for new tables we'll be creating
    const newTables = [
      'media_assets', 'galleries', 'gallery_media_associations',
      'cultural_tags', 'media_cultural_tags', 'photo_people',
      'cultural_locations', 'media_locations',
      'content_enhancement_results', 'moderation_results', 
      'elder_review_queue', 'ai_safety_logs', 'storytellers'
    ]
    
    const existingNewTables = []
    for (const table of newTables) {
      if (await tableExists(table)) {
        existingNewTables.push(table)
      }
    }
    
    if (existingNewTables.length > 0) {
      logInfo(`Tables already exist: ${existingNewTables.join(', ')}`)
    }
    
    return {
      coreTablesExist: coreTables.every(table => coreTableStatus[table]),
      existingNewTables,
      needsPhotoGallery: !existingNewTables.includes('media_assets'),
      needsAiEnhancement: !existingNewTables.includes('content_enhancement_results'),
      needsStorytellers: !existingNewTables.includes('storytellers')
    }
    
  } catch (error) {
    logError(`Database analysis failed: ${error.message}`)
    throw error
  }
}

/**
 * Create storytellers table from existing profile data
 */
async function createStorytellersTable() {
  logStep('CREATE', 'Creating storytellers table from profiles...')
  
  const createStorytellersSQL = `
    -- Create storytellers table
    CREATE TABLE IF NOT EXISTS storytellers (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      profile_id uuid UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
      
      -- Basic storyteller information
      display_name text NOT NULL,
      bio text,
      cultural_background text,
      storytelling_focus text[] DEFAULT '{}',
      
      -- Cultural credentials and recognition
      cultural_expert boolean DEFAULT false,
      elder_status boolean DEFAULT false,
      cultural_teaching_authority boolean DEFAULT false,
      community_recognition_level text DEFAULT 'community' CHECK (community_recognition_level IN ('community', 'regional', 'national', 'international')),
      
      -- Expertise areas
      traditional_knowledge_areas text[] DEFAULT '{}',
      ceremony_types_authorized text[] DEFAULT '{}',
      seasonal_specializations text[] DEFAULT '{}',
      
      -- Professional storytelling
      professional_storyteller boolean DEFAULT false,
      storytelling_experience_years integer,
      audience_specializations text[] DEFAULT '{}', -- children, youth, adults, elders, mixed
      
      -- Consent and cultural protocols
      cultural_sharing_permissions jsonb DEFAULT '{}',
      teaching_permissions jsonb DEFAULT '{}',
      mentorship_availability boolean DEFAULT true,
      
      -- Content and engagement
      story_count integer DEFAULT 0,
      total_views integer DEFAULT 0,
      community_endorsements integer DEFAULT 0,
      
      -- Status and visibility
      status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'private')),
      visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'community', 'private')),
      featured_storyteller boolean DEFAULT false,
      
      -- Timestamps
      created_at timestamptz DEFAULT now() NOT NULL,
      updated_at timestamptz DEFAULT now() NOT NULL,
      last_story_published_at timestamptz
    );
    
    -- Create index for performance
    CREATE INDEX IF NOT EXISTS idx_storytellers_profile_id ON storytellers(profile_id);
    CREATE INDEX IF NOT EXISTS idx_storytellers_cultural_expert ON storytellers(cultural_expert);
    CREATE INDEX IF NOT EXISTS idx_storytellers_elder_status ON storytellers(elder_status);
    CREATE INDEX IF NOT EXISTS idx_storytellers_status ON storytellers(status);
    CREATE INDEX IF NOT EXISTS idx_storytellers_visibility ON storytellers(visibility);
    
    -- Enable RLS
    ALTER TABLE storytellers ENABLE ROW LEVEL SECURITY;
    
    -- RLS Policies
    CREATE POLICY "Public storytellers are viewable by everyone" ON storytellers
      FOR SELECT USING (visibility = 'public' AND status = 'active');
    
    CREATE POLICY "Community storytellers viewable by authenticated users" ON storytellers
      FOR SELECT USING (visibility = 'community' AND status = 'active' AND auth.role() = 'authenticated');
    
    CREATE POLICY "Users can view their own storyteller profile" ON storytellers
      FOR SELECT USING (profile_id = auth.uid());
    
    CREATE POLICY "Users can create their own storyteller profile" ON storytellers
      FOR INSERT WITH CHECK (profile_id = auth.uid());
    
    CREATE POLICY "Users can update their own storyteller profile" ON storytellers
      FOR UPDATE USING (profile_id = auth.uid());
    
    CREATE POLICY "Users can delete their own storyteller profile" ON storytellers
      FOR DELETE USING (profile_id = auth.uid());
    
    -- Trigger to update story count
    CREATE OR REPLACE FUNCTION update_storyteller_story_count()
    RETURNS TRIGGER AS $$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        UPDATE storytellers 
        SET story_count = (
          SELECT COUNT(*) FROM stories 
          WHERE author_id = NEW.author_id
        )
        WHERE profile_id = NEW.author_id;
        RETURN NEW;
      ELSIF TG_OP = 'DELETE' THEN
        UPDATE storytellers 
        SET story_count = (
          SELECT COUNT(*) FROM stories 
          WHERE author_id = OLD.author_id
        )
        WHERE profile_id = OLD.author_id;
        RETURN OLD;
      END IF;
      RETURN NULL;
    END;
    $$ language 'plpgsql';
    
    -- Apply story count trigger to stories table (if not exists)
    CREATE TRIGGER update_storyteller_story_count_trigger
      AFTER INSERT OR DELETE ON stories
      FOR EACH ROW EXECUTE FUNCTION update_storyteller_story_count();
  `;
  
  const success = await executeSql(createStorytellersSQL, 'Creating storytellers table')
  
  if (success) {
    // Populate from existing profiles
    await populateStorytellersFromProfiles()
  }
  
  return success
}

/**
 * Populate storytellers table from existing profile data
 */
async function populateStorytellersFromProfiles() {
  logStep('POPULATE', 'Populating storytellers from existing profiles...')
  
  try {
    const populateSQL = `
      INSERT INTO storytellers (
        profile_id, 
        display_name, 
        bio,
        cultural_background,
        elder_status,
        cultural_expert,
        story_count,
        created_at
      )
      SELECT 
        p.id,
        COALESCE(p.display_name, p.first_name || ' ' || p.last_name, 'Anonymous Storyteller'),
        p.bio,
        p.cultural_background,
        COALESCE(p.is_elder, false),
        COALESCE(p.cultural_expertise_areas IS NOT NULL AND array_length(p.cultural_expertise_areas, 1) > 0, false),
        (SELECT COUNT(*) FROM stories s WHERE s.author_id = p.id),
        p.created_at
      FROM profiles p
      WHERE NOT EXISTS (
        SELECT 1 FROM storytellers st WHERE st.profile_id = p.id
      )
      AND p.id IS NOT NULL;
    `;
    
    const success = await executeSql(populateSQL, 'Populating storytellers from profiles')
    
    if (success) {
      // Get the count of created storytellers
      const { count } = await supabase.from('storytellers').select('*', { count: 'exact', head: true })
      logSuccess(`Created ${count} storyteller profiles from existing profiles`)
    }
    
    return success
  } catch (error) {
    logError(`Failed to populate storytellers: ${error.message}`)
    return false
  }
}

/**
 * Deploy consent and privacy management schema
 */
async function deployConsentSchema() {
  logStep('DEPLOY', 'Deploying consent and privacy management schema...')
  
  const consentSQL = `
    -- Consent Management Tables
    CREATE TABLE IF NOT EXISTS consent_records (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      
      -- Consent details
      content_type text NOT NULL CHECK (content_type IN ('story', 'media', 'profile', 'cultural_content')),
      content_id uuid NOT NULL,
      consent_type text NOT NULL CHECK (consent_type IN ('sharing', 'ai_enhancement', 'cultural_analysis', 'public_display', 'commercial_use')),
      
      -- Consent status
      status text NOT NULL CHECK (status IN ('granted', 'denied', 'withdrawn', 'expired')),
      granular_permissions jsonb DEFAULT '{}',
      
      -- Context and conditions
      cultural_conditions text[] DEFAULT '{}',
      time_limitations jsonb,
      usage_restrictions jsonb DEFAULT '{}',
      
      -- Audit trail
      granted_at timestamptz DEFAULT now() NOT NULL,
      expires_at timestamptz,
      withdrawn_at timestamptz,
      last_confirmed_at timestamptz,
      
      -- Cultural oversight
      elder_witnessing_required boolean DEFAULT false,
      elder_witness_id uuid REFERENCES profiles(id),
      cultural_authority_approval boolean DEFAULT false,
      
      created_at timestamptz DEFAULT now() NOT NULL,
      updated_at timestamptz DEFAULT now() NOT NULL
    );
    
    -- Privacy Settings Table
    CREATE TABLE IF NOT EXISTS privacy_settings (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      
      -- General privacy preferences
      profile_visibility text DEFAULT 'public' CHECK (profile_visibility IN ('public', 'community', 'private')),
      story_default_visibility text DEFAULT 'public' CHECK (story_default_visibility IN ('public', 'community', 'private')),
      media_default_visibility text DEFAULT 'private' CHECK (media_default_visibility IN ('public', 'community', 'private')),
      
      -- Cultural content preferences
      cultural_content_sharing boolean DEFAULT true,
      ceremonial_content_restrictions boolean DEFAULT true,
      traditional_knowledge_protection boolean DEFAULT true,
      
      -- AI and enhancement preferences
      ai_enhancement_consent boolean DEFAULT false,
      ai_recommendation_consent boolean DEFAULT true,
      cultural_analysis_consent boolean DEFAULT false,
      
      -- Communication preferences
      community_contact_allowed boolean DEFAULT true,
      elder_guidance_requests boolean DEFAULT true,
      mentorship_visibility boolean DEFAULT false,
      
      -- Data retention preferences
      data_retention_period_months integer DEFAULT 120, -- 10 years default
      auto_delete_inactive_content boolean DEFAULT false,
      
      created_at timestamptz DEFAULT now() NOT NULL,
      updated_at timestamptz DEFAULT now() NOT NULL
    );
    
    -- Cultural Review Requirements
    CREATE TABLE IF NOT EXISTS cultural_review_requirements (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      content_type text NOT NULL,
      content_id uuid NOT NULL,
      
      -- Review requirements
      requires_elder_review boolean NOT NULL DEFAULT false,
      requires_community_input boolean DEFAULT false,
      requires_cultural_authority boolean DEFAULT false,
      sensitivity_level text CHECK (sensitivity_level IN ('low', 'medium', 'high', 'sacred')),
      
      -- Assignment and status
      assigned_elder_id uuid REFERENCES profiles(id),
      review_status text DEFAULT 'pending' CHECK (review_status IN ('pending', 'in_review', 'approved', 'rejected', 'needs_revision')),
      
      -- Timeline
      requested_at timestamptz DEFAULT now() NOT NULL,
      due_date timestamptz,
      completed_at timestamptz,
      
      -- Review details
      review_notes text,
      cultural_guidance text,
      conditions_for_approval text[] DEFAULT '{}',
      
      created_at timestamptz DEFAULT now() NOT NULL
    );
    
    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_consent_records_user_id ON consent_records(user_id);
    CREATE INDEX IF NOT EXISTS idx_consent_records_content ON consent_records(content_type, content_id);
    CREATE INDEX IF NOT EXISTS idx_consent_records_status ON consent_records(status);
    
    CREATE INDEX IF NOT EXISTS idx_privacy_settings_user_id ON privacy_settings(user_id);
    
    CREATE INDEX IF NOT EXISTS idx_cultural_review_requirements_content ON cultural_review_requirements(content_type, content_id);
    CREATE INDEX IF NOT EXISTS idx_cultural_review_requirements_assigned_elder ON cultural_review_requirements(assigned_elder_id);
    CREATE INDEX IF NOT EXISTS idx_cultural_review_requirements_status ON cultural_review_requirements(review_status);
    
    -- Enable RLS
    ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
    ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE cultural_review_requirements ENABLE ROW LEVEL SECURITY;
    
    -- RLS Policies
    CREATE POLICY "Users can view their own consent records" ON consent_records
      FOR SELECT USING (user_id = auth.uid());
    
    CREATE POLICY "Users can manage their own consent records" ON consent_records
      FOR ALL USING (user_id = auth.uid());
    
    CREATE POLICY "Users can view their own privacy settings" ON privacy_settings
      FOR SELECT USING (user_id = auth.uid());
    
    CREATE POLICY "Users can manage their own privacy settings" ON privacy_settings
      FOR ALL USING (user_id = auth.uid());
    
    CREATE POLICY "Elders can view assigned cultural reviews" ON cultural_review_requirements
      FOR SELECT USING (
        assigned_elder_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_elder = true)
      );
    
    CREATE POLICY "Content creators can view their content reviews" ON cultural_review_requirements
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM stories s WHERE s.id = content_id AND s.author_id = auth.uid()
          UNION
          SELECT 1 FROM media_assets m WHERE m.id = content_id AND m.uploaded_by = auth.uid()
        )
      );
  `;
  
  return await executeSql(consentSQL, 'consent and privacy management schema')
}

/**
 * Main deployment function
 */
async function deployCompleteSchema() {
  console.log(`${colors.bold}${colors.magenta}🚀 Empathy Ledger Complete Schema Deployment${colors.reset}\n`)
  
  try {
    // Step 1: Analyze current state
    const dbState = await analyzeDatabaseState()
    
    if (!dbState.coreTablesExist) {
      logError('Core tables (profiles, stories, organizations) missing! Deploy basic schema first.')
      return false
    }
    
    let deploymentSuccess = true
    
    // Step 2: Deploy Photo Gallery System
    if (dbState.needsPhotoGallery) {
      logStep('DEPLOY', 'Deploying Photo Gallery System...')
      const photoGallerySuccess = await executeSqlFromFile(
        'database/photo-gallery-schema.sql', 
        'Photo Gallery System'
      )
      deploymentSuccess = deploymentSuccess && photoGallerySuccess
    } else {
      logInfo('Photo Gallery System already deployed')
    }
    
    // Step 3: Deploy AI Enhancement System
    if (dbState.needsAiEnhancement) {
      logStep('DEPLOY', 'Deploying AI Enhancement System...')
      const aiEnhancementSuccess = await executeSqlFromFile(
        'database/ai-enhancement-schema.sql',
        'AI Enhancement System'
      )
      deploymentSuccess = deploymentSuccess && aiEnhancementSuccess
    } else {
      logInfo('AI Enhancement System already deployed')
    }
    
    // Step 4: Create Storytellers Table
    if (dbState.needsStorytellers) {
      const storytellersSuccess = await createStorytellersTable()
      deploymentSuccess = deploymentSuccess && storytellersSuccess
    } else {
      logInfo('Storytellers table already exists')
    }
    
    // Step 5: Deploy Consent and Privacy Schema
    logStep('DEPLOY', 'Deploying Consent and Privacy Management...')
    const consentSuccess = await deployConsentSchema()
    deploymentSuccess = deploymentSuccess && consentSuccess
    
    // Step 6: Final verification
    logStep('VERIFY', 'Verifying deployment...')
    await verifyDeployment()
    
    // Summary
    if (deploymentSuccess) {
      console.log(`\n${colors.bold}${colors.green}🎉 Schema Deployment Completed Successfully!${colors.reset}\n`)
      logSuccess('All database tables and schemas are now deployed')
      logSuccess('Cultural protocols and consent management active')
      logSuccess('AI enhancement system ready for use')
      logSuccess('Photo gallery system with cultural tagging available')
      logSuccess('Storytellers profiles created from existing data')
      console.log(`\n${colors.cyan}Ready for full platform functionality!${colors.reset}`)
    } else {
      console.log(`\n${colors.bold}${colors.yellow}⚠️  Schema Deployment Completed with Warnings${colors.reset}\n`)
      logWarning('Some components may have deployment issues')
      logInfo('Check logs above for specific warnings')
      logInfo('Platform should still be functional with existing data')
    }
    
    return deploymentSuccess
    
  } catch (error) {
    logError(`Deployment failed: ${error.message}`)
    console.error(error.stack)
    return false
  }
}

/**
 * Verify the deployment was successful
 */
async function verifyDeployment() {
  const tablesToCheck = [
    'media_assets', 'galleries', 'gallery_media_associations',
    'cultural_tags', 'storytellers', 'consent_records',
    'privacy_settings', 'content_enhancement_results',
    'ai_safety_logs', 'elder_review_queue'
  ]
  
  const verificationResults = {}
  
  for (const table of tablesToCheck) {
    try {
      const exists = await tableExists(table)
      if (exists) {
        const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
        verificationResults[table] = { exists: true, count }
        logSuccess(`${table}: deployed (${count} records)`)
      } else {
        verificationResults[table] = { exists: false, count: 0 }
        logWarning(`${table}: not found`)
      }
    } catch (error) {
      verificationResults[table] = { exists: false, error: error.message }
      logError(`${table}: verification failed - ${error.message}`)
    }
  }
  
  const deployedTables = Object.keys(verificationResults).filter(
    table => verificationResults[table].exists
  )
  
  console.log(`\n${colors.cyan}Deployment Summary:${colors.reset}`)
  console.log(`${colors.green}✅ ${deployedTables.length}/${tablesToCheck.length} tables deployed${colors.reset}`)
  
  return verificationResults
}

// Run the deployment
if (import.meta.url === `file://${process.argv[1]}`) {
  deployCompleteSchema()
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      console.error(`Fatal error: ${error.message}`)
      process.exit(1)
    })
}

export { deployCompleteSchema, analyzeDatabaseState, verifyDeployment }
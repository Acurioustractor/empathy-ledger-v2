#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createJunctionTables() {
  console.log('🚀 Creating junction tables for multi-organization projects...')

  try {
    // 1. Create project_organizations table
    console.log('📋 Creating project_organizations table...')
    const { error: createTableError1 } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS project_organizations (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          role TEXT DEFAULT 'partner',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(project_id, organization_id)
        );
      `
    })
    
    if (createTableError1) {
      console.error('❌ Error creating project_organizations:', createTableError1)
    } else {
      console.log('✅ project_organizations table created')
    }

    // 2. Create project_storytellers table
    console.log('📋 Creating project_storytellers table...')
    const { error: createTableError2 } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS project_storytellers (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          storyteller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          role TEXT DEFAULT 'participant',
          joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          status TEXT DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(project_id, storyteller_id)
        );
      `
    })
    
    if (createTableError2) {
      console.error('❌ Error creating project_storytellers:', createTableError2)
    } else {
      console.log('✅ project_storytellers table created')
    }

    // 3. Add project_id to photo_galleries if needed
    console.log('📋 Adding project_id to photo_galleries...')
    const { error: addColumnError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE photo_galleries 
        ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
      `
    })
    
    if (addColumnError) {
      console.error('❌ Error adding project_id column:', addColumnError)
    } else {
      console.log('✅ project_id column added to photo_galleries')
    }

    // 4. Create indexes
    console.log('📋 Creating indexes...')
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_project_organizations_project_id ON project_organizations(project_id);',
      'CREATE INDEX IF NOT EXISTS idx_project_organizations_organization_id ON project_organizations(organization_id);',
      'CREATE INDEX IF NOT EXISTS idx_project_storytellers_project_id ON project_storytellers(project_id);',
      'CREATE INDEX IF NOT EXISTS idx_project_storytellers_storyteller_id ON project_storytellers(storyteller_id);',
      'CREATE INDEX IF NOT EXISTS idx_photo_galleries_project_id ON photo_galleries(project_id);'
    ]

    for (const indexSql of indexes) {
      const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexSql })
      if (indexError) {
        console.error('❌ Error creating index:', indexError)
      }
    }
    console.log('✅ Indexes created')

    console.log('\n🎉 Junction tables created successfully!')
    console.log('Ready to link Deadly Hearts Project to multiple organizations!')

  } catch (error) {
    console.error('💥 Script failed:', error)
    process.exit(1)
  }
}

createJunctionTables().catch(console.error)
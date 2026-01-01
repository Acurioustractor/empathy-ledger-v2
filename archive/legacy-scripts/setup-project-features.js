#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupProjectFeatures() {
  console.log('🚀 Setting up project features tables...\n')
  
  try {
    // Create galleries table
    console.log('📸 Creating galleries table...')
    const { error: galleriesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS galleries (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
          organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
          tenant_id UUID,
          created_by UUID REFERENCES profiles(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_galleries_project_id ON galleries(project_id);
        CREATE INDEX IF NOT EXISTS idx_galleries_organization_id ON galleries(organization_id);
        CREATE INDEX IF NOT EXISTS idx_galleries_tenant_id ON galleries(tenant_id);
      `
    })
    
    if (galleriesError) {
      console.error('Error creating galleries table:', galleriesError)
    } else {
      console.log('✅ Galleries table created')
    }

    // Create gallery_photos table
    console.log('🖼️  Creating gallery_photos table...')
    const { error: photosError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS gallery_photos (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
          photo_url TEXT NOT NULL,
          caption TEXT,
          photographer TEXT,
          order_index INTEGER DEFAULT 0,
          uploaded_by UUID REFERENCES profiles(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_gallery_photos_gallery_id ON gallery_photos(gallery_id);
      `
    })
    
    if (photosError) {
      console.error('Error creating gallery_photos table:', photosError)
    } else {
      console.log('✅ Gallery photos table created')
    }

    // Create project_updates table
    console.log('📝 Creating project_updates table...')
    const { error: updatesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS project_updates (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          created_by UUID NOT NULL REFERENCES profiles(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_project_updates_project_id ON project_updates(project_id);
        CREATE INDEX IF NOT EXISTS idx_project_updates_created_at ON project_updates(created_at DESC);
      `
    })
    
    if (updatesError) {
      console.error('Error creating project_updates table:', updatesError)
    } else {
      console.log('✅ Project updates table created')
    }

    // Add sample data
    console.log('📊 Adding sample data...')
    
    // Get first project and user for sample data
    const { data: projects } = await supabase
      .from('projects')
      .select('id, tenant_id')
      .limit(1)
    
    const { data: user } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'benjamin@act.place')
      .single()
    
    if (projects && projects[0] && user) {
      const project = projects[0]
      
      // Insert sample gallery
      const { error: galleryInsertError } = await supabase
        .from('galleries')
        .insert({
          title: 'Community Gathering Photos',
          description: 'Photos from our community storytelling session',
          project_id: project.id,
          tenant_id: project.tenant_id,
          created_by: user.id
        })
      
      if (galleryInsertError && !galleryInsertError.message.includes('duplicate')) {
        console.error('Error inserting gallery:', galleryInsertError)
      } else {
        console.log('✅ Sample gallery created')
      }
      
      // Insert sample project updates
      const updates = [
        'Project kickoff meeting completed. Identified 5 key storytellers to interview.',
        'First round of interviews scheduled for next week. Community response has been very positive.',
        'Completed initial storytelling session. Collected 3 hours of valuable content.'
      ]
      
      for (const content of updates) {
        const { error: updateInsertError } = await supabase
          .from('project_updates')
          .insert({
            project_id: project.id,
            content,
            created_by: user.id
          })
        
        if (updateInsertError && !updateInsertError.message.includes('duplicate')) {
          console.error('Error inserting update:', updateInsertError)
        }
      }
      
      console.log('✅ Sample project updates created')
    }

    console.log('\n🎉 Project features setup complete!')
    console.log('📝 Tables created: galleries, gallery_photos, project_updates')
    console.log('🔍 Sample data added for testing')
    
  } catch (error) {
    console.error('❌ Error during setup:', error)
  }
}

setupProjectFeatures()
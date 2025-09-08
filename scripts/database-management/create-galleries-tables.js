require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function createGalleriesTables() {
  console.log('🚀 Creating core gallery tables...')
  
  // Create galleries table
  const createGalleriesSQL = `
    CREATE TABLE IF NOT EXISTS galleries (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at timestamptz DEFAULT now() NOT NULL,
      updated_at timestamptz DEFAULT now() NOT NULL,
      
      title text NOT NULL,
      slug text UNIQUE NOT NULL,
      description text,
      cover_image_id uuid,
      
      created_by uuid NOT NULL,
      organization_id uuid,
      
      cultural_theme text,
      cultural_context jsonb DEFAULT '{}',
      cultural_significance text,
      cultural_sensitivity_level text DEFAULT 'medium' CHECK (cultural_sensitivity_level IN ('low', 'medium', 'high')),
      
      visibility text DEFAULT 'private' CHECK (visibility IN ('public', 'community', 'organization', 'private')),
      
      status text DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
      photo_count integer DEFAULT 0,
      view_count integer DEFAULT 0,
      featured boolean DEFAULT false
    );
  `
  
  // Create gallery_media_associations table
  const createAssociationsSQL = `
    CREATE TABLE IF NOT EXISTS gallery_media_associations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at timestamptz DEFAULT now() NOT NULL,
      
      gallery_id uuid NOT NULL,
      media_asset_id uuid NOT NULL,
      
      sort_order integer DEFAULT 0,
      is_cover_image boolean DEFAULT false,
      
      caption text,
      cultural_context text,
      
      UNIQUE(gallery_id, media_asset_id)
    );
  `
  
  // Create cultural_tags table
  const createCulturalTagsSQL = `
    CREATE TABLE IF NOT EXISTS cultural_tags (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at timestamptz DEFAULT now() NOT NULL,
      
      name text NOT NULL UNIQUE,
      slug text NOT NULL UNIQUE,
      description text,
      category text NOT NULL,
      
      cultural_sensitivity_level text DEFAULT 'low' CHECK (cultural_sensitivity_level IN ('low', 'medium', 'high')),
      usage_count integer DEFAULT 0
    );
  `
  
  try {
    console.log('Creating galleries table...')
    const { error: galleriesError } = await supabase.rpc('exec', { sql: createGalleriesSQL })
    if (galleriesError) {
      console.log('Galleries table may already exist:', galleriesError.message)
    } else {
      console.log('✅ Galleries table created')
    }
    
    console.log('Creating gallery_media_associations table...')
    const { error: associationsError } = await supabase.rpc('exec', { sql: createAssociationsSQL })
    if (associationsError) {
      console.log('Associations table may already exist:', associationsError.message)
    } else {
      console.log('✅ Gallery media associations table created')
    }
    
    console.log('Creating cultural_tags table...')
    const { error: tagsError } = await supabase.rpc('exec', { sql: createCulturalTagsSQL })
    if (tagsError) {
      console.log('Cultural tags table may already exist:', tagsError.message)
    } else {
      console.log('✅ Cultural tags table created')
    }
    
    // Insert initial cultural tags
    console.log('Adding initial cultural tags...')
    const { error: insertError } = await supabase
      .from('cultural_tags')
      .upsert([
        { name: 'Snow Foundation', slug: 'snow-foundation', description: 'Photos related to Snow Foundation', category: 'organization' },
        { name: 'Deadly Hearts Trek', slug: 'deadly-hearts-trek', description: 'Photos from Deadly Hearts Trek project', category: 'project' },
        { name: 'Community Event', slug: 'community-event', description: 'Community gatherings and events', category: 'event' },
        { name: 'Traditional Practices', slug: 'traditional-practices', description: 'Traditional cultural practices', category: 'culture', cultural_sensitivity_level: 'high' },
        { name: 'Nature', slug: 'nature', description: 'Natural landscapes and environments', category: 'location' }
      ], { onConflict: 'slug' })
    
    if (insertError) {
      console.log('Tag insertion error:', insertError.message)
    } else {
      console.log('✅ Initial cultural tags added')
    }
    
    // Test table access
    console.log('\nTesting table access...')
    const { data: galleries, error: galleriesTestError } = await supabase
      .from('galleries')
      .select('*')
      .limit(1)
    
    if (galleriesTestError) {
      console.log('❌ Galleries table access error:', galleriesTestError.message)
    } else {
      console.log('✅ Galleries table accessible')
    }
    
    const { data: tags, error: tagsTestError } = await supabase
      .from('cultural_tags')
      .select('*')
      .limit(5)
    
    if (tagsTestError) {
      console.log('❌ Cultural tags table access error:', tagsTestError.message)
    } else {
      console.log('✅ Cultural tags table accessible, found', tags?.length, 'tags')
    }
    
    console.log('\n🎉 Core gallery tables setup complete!')
    
  } catch (error) {
    console.error('💥 Error creating tables:', error)
  }
}

createGalleriesTables()
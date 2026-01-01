require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupMediaTables() {
  console.log('Setting up media system tables...\n')

  // Since we can't run raw SQL through the JS client directly,
  // we'll create the tables using the Supabase Dashboard SQL editor
  // For now, let's verify what tables exist and create them through API calls

  try {
    // Test connection
    const { data: test, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (testError) {
      console.error('Failed to connect to database:', testError)
      return
    }

    console.log('✅ Connected to Supabase database')

    // Check if tables exist
    const tables = ['media_assets', 'transcripts', 'transcription_jobs', 'media_usage_tracking']
    const existingTables = []
    const missingTables = []

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1)

      if (error && error.code === '42P01') {
        missingTables.push(table)
      } else if (!error) {
        existingTables.push(table)
      }
    }

    if (existingTables.length > 0) {
      console.log('\n✅ Existing tables found:')
      existingTables.forEach(t => console.log(`   - ${t}`))
    }

    if (missingTables.length > 0) {
      console.log('\n⚠️  Missing tables that need to be created:')
      missingTables.forEach(t => console.log(`   - ${t}`))
      
      console.log('\n📝 To create the missing tables, please run the following SQL in the Supabase Dashboard:')
      console.log('   1. Go to: ' + supabaseUrl)
      console.log('   2. Navigate to SQL Editor')
      console.log('   3. Copy and paste the contents of: supabase/migrations/20250109_media_system.sql')
      console.log('   4. Click "Run"\n')
    }

    // Check for avatar_url column
    const { data: profileCheck, error: profileError } = await supabase
      .from('profiles')
      .select('id, avatar_url')
      .limit(1)

    if (profileError && profileError.message.includes('avatar_url')) {
      console.log('⚠️  Missing column: profiles.avatar_url')
      console.log('\n📝 To add the missing column, run this SQL:')
      console.log('   ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;\n')
    } else if (!profileError) {
      console.log('✅ Column profiles.avatar_url exists')
    }

    // Create sample media storage bucket configuration
    console.log('\n📦 Storage bucket configuration:')
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (!bucketsError && buckets) {
      const mediaBucket = buckets.find(b => b.id === 'media' || b.name === 'media')
      
      if (mediaBucket) {
        console.log('✅ Storage bucket "media" exists')
      } else {
        // Try to create the bucket
        const { data: newBucket, error: createError } = await supabase.storage.createBucket('media', {
          public: true,
          allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/avif',
            'video/mp4',
            'video/webm',
            'video/quicktime',
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/ogg'
          ],
          fileSizeLimit: 524288000 // 500MB
        })

        if (createError) {
          console.log('⚠️  Could not create storage bucket "media"')
          console.log('   Please create it manually in Supabase Dashboard > Storage')
        } else {
          console.log('✅ Created storage bucket "media"')
        }
      }
    }

    console.log('\n🎉 Media system check complete!')
    
    if (missingTables.length === 0 && existingTables.length === tables.length) {
      console.log('   All tables are ready for use.')
    } else {
      console.log('   Please follow the instructions above to complete setup.')
    }

  } catch (error) {
    console.error('Error during setup:', error)
  }
}

setupMediaTables()
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  try {
    console.log('Applying featured field migration...')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add-featured-field-to-profiles.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      // If the RPC doesn't exist, try executing statements one by one
      const statements = sql.split(';').filter(s => s.trim())
      
      for (const statement of statements) {
        if (statement.trim()) {
          console.log('Executing:', statement.substring(0, 50) + '...')
          
          // For ALTER TABLE, we need to use a different approach
          if (statement.includes('ALTER TABLE')) {
            console.log('Note: ALTER TABLE needs to be run directly in Supabase dashboard')
          } else if (statement.includes('CREATE INDEX')) {
            console.log('Note: CREATE INDEX needs to be run directly in Supabase dashboard')
          } else if (statement.includes('UPDATE profiles')) {
            // We can handle the update through the Supabase client
            const { data: stories } = await supabase
              .from('stories')
              .select('author_id')
              .eq('status', 'published')
            
            // Count stories per author
            const authorCounts = {}
            stories?.forEach(story => {
              authorCounts[story.author_id] = (authorCounts[story.author_id] || 0) + 1
            })
            
            // Find authors with 3+ stories
            const featuredAuthors = Object.entries(authorCounts)
              .filter(([_, count]) => count >= 3)
              .map(([authorId]) => authorId)
            
            if (featuredAuthors.length > 0) {
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ is_featured: true })
                .in('id', featuredAuthors)
              
              if (updateError) {
                console.error('Error updating featured profiles:', updateError)
              } else {
                console.log(`Set ${featuredAuthors.length} profiles as featured`)
              }
            }
          }
        }
      }
    }
    
    console.log('Migration process completed!')
    console.log('\nIMPORTANT: Please run the following SQL in your Supabase dashboard:')
    console.log('1. ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;')
    console.log('2. CREATE INDEX IF NOT EXISTS idx_profiles_is_featured ON profiles(is_featured);')
    
  } catch (error) {
    console.error('Error applying migration:', error)
  }
}

applyMigration()
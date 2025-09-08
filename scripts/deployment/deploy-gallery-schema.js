const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yvnuayzslukamizrlhwb.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Using Supabase URL:', supabaseUrl)
console.log('Using key (first 20 chars):', supabaseKey?.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseKey)

async function deployGallerySchema() {
  console.log('🚀 Deploying Gallery Schema...')
  
  try {
    // Read the gallery schema SQL file
    const schemaPath = path.join(__dirname, 'database', 'photo-gallery-schema.sql')
    const schemaSql = fs.readFileSync(schemaPath, 'utf8')
    
    // Split SQL into individual statements
    const statements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // Skip comments and empty statements
      if (statement.startsWith('COMMENT') || statement.length < 10) {
        continue
      }
      
      console.log(`\n🔄 Executing statement ${i + 1}/${statements.length}:`)
      console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''))
      
      try {
        const { error } = await supabase.rpc('exec', { 
          sql: statement + ';'
        })
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error.message)
          errorCount++
          
          // Continue with non-critical errors
          if (error.message.includes('already exists') || error.message.includes('does not exist')) {
            console.log('   ⚠️  Non-critical error, continuing...')
          } else {
            // Try direct query for certain statements
            const { error: directError } = await supabase
              .from('information_schema.tables')
              .select('*')
              .limit(1)
            
            if (!directError) {
              console.log('   ✅ Connection OK, continuing...')
            }
          }
        } else {
          console.log('   ✅ Success')
          successCount++
        }
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (err) {
        console.error(`❌ Exception in statement ${i + 1}:`, err.message)
        errorCount++
      }
    }
    
    console.log(`\n📊 Deployment Summary:`)
    console.log(`   ✅ Successful: ${successCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
    console.log(`   📝 Total statements: ${statements.length}`)
    
    // Verify key tables were created
    console.log(`\n🔍 Verifying table creation...`)
    
    const tables = ['media_assets', 'galleries', 'gallery_media_associations', 'cultural_tags']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`   ❌ ${table}: ${error.message}`)
        } else {
          console.log(`   ✅ ${table}: Table exists and accessible`)
        }
      } catch (err) {
        console.log(`   ❌ ${table}: ${err.message}`)
      }
    }
    
    console.log(`\n🎉 Gallery schema deployment completed!`)
    
  } catch (error) {
    console.error('💥 Fatal error during deployment:', error)
  }
}

// Run the deployment
deployGallerySchema()
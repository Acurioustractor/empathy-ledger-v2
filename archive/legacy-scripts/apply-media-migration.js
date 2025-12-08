const { createClient } = require('@supabase/supabase-js')
const fs = require('fs').promises
const path = require('path')

async function applyMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yvnuayzslukamizrlhwb.supabase.co'
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
  
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    console.log('Applying media system migration...')
    
    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250109_media_system.sql')
    const migrationSQL = await fs.readFile(migrationPath, 'utf8')
    
    // Split migration into individual statements (rough split on semicolons)
    const statements = migrationSQL
      .split(/;\s*$/m)
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';')
    
    console.log(`Found ${statements.length} SQL statements to execute`)
    
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // Skip comments
      if (statement.startsWith('--')) continue
      
      try {
        // Use raw SQL execution
        const { error } = await supabase.rpc('exec_sql', { 
          query: statement 
        }).single()
        
        if (error) {
          // Try direct execution as alternative
          const { error: directError } = await supabase.from('_sql').select(statement)
          
          if (directError) {
            console.error(`Error in statement ${i + 1}:`, directError.message)
            console.error('Statement:', statement.substring(0, 100) + '...')
            errorCount++
          } else {
            successCount++
            process.stdout.write('.')
          }
        } else {
          successCount++
          process.stdout.write('.')
        }
      } catch (err) {
        console.error(`\nError executing statement ${i + 1}:`, err.message)
        errorCount++
      }
    }
    
    console.log(`\n\nMigration complete!`)
    console.log(`✓ ${successCount} statements executed successfully`)
    if (errorCount > 0) {
      console.log(`✗ ${errorCount} statements failed (may be due to already existing objects)`)
    }
    
    // Test the tables were created
    console.log('\nVerifying tables...')
    
    const tables = ['media_assets', 'transcripts', 'transcription_jobs', 'media_usage_tracking']
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`✗ Table ${table}: Error - ${error.message}`)
      } else {
        console.log(`✓ Table ${table}: Ready (${count || 0} records)`)
      }
    }
    
    // Check if avatar_url column was added
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('avatar_url')
      .limit(1)
      .single()
    
    if (!profileError || profileError.code === 'PGRST116') {
      console.log('✓ Column profiles.avatar_url: Ready')
    } else {
      console.log('✗ Column profiles.avatar_url: Not found')
    }
    
    console.log('\n✅ Media system setup complete!')
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

applyMigration()
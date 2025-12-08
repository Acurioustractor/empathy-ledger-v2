require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyCorrectedMigration() {
  console.log('🚀 APPLYING CORRECTED DATABASE MIGRATION\n')
  console.log('=' .repeat(50))

  try {
    // Read the SQL migration file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'CORRECTED_MIGRATION.sql'), 
      'utf8'
    )

    console.log('📄 Migration SQL loaded successfully')
    
    // Split the SQL into individual statements (basic splitting by semicolon + newline)
    const statements = migrationSQL
      .split(';\n')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`)

    let successCount = 0
    let errorCount = 0
    const errors = []

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      if (statement.includes('-- ========') || statement.length < 10) {
        continue // Skip comment dividers and very short statements
      }

      console.log(`\n⏳ Executing statement ${i + 1}/${statements.length}:`)
      console.log(`   ${statement.substring(0, 80)}...`)

      try {
        const { data, error } = await supabase.rpc('execute_sql', {
          sql_query: statement + ';'
        })

        if (error) {
          console.log(`   ❌ ERROR: ${error.message}`)
          errors.push({ statement: statement.substring(0, 100), error: error.message })
          errorCount++
        } else {
          console.log(`   ✅ SUCCESS`)
          successCount++
        }
      } catch (err) {
        console.log(`   ❌ EXCEPTION: ${err.message}`)
        errors.push({ statement: statement.substring(0, 100), error: err.message })
        errorCount++
      }

      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log('\n' + '='.repeat(50))
    console.log('\n📊 MIGRATION SUMMARY:')
    console.log(`✅ Successful statements: ${successCount}`)
    console.log(`❌ Failed statements: ${errorCount}`)

    if (errors.length > 0) {
      console.log('\n⚠️  ERRORS ENCOUNTERED:')
      errors.forEach((err, idx) => {
        console.log(`\n${idx + 1}. Statement: ${err.statement}...`)
        console.log(`   Error: ${err.error}`)
      })
    }

    // Try to verify the migration worked
    console.log('\n🔍 VERIFYING MIGRATION...')
    
    try {
      // Check if tenant_id was added to profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('tenant_id')
        .limit(1)

      if (!error) {
        console.log('✅ tenant_id column successfully added to profiles')
      } else {
        console.log(`❌ tenant_id column verification failed: ${error.message}`)
      }
    } catch (err) {
      console.log(`❌ Verification failed: ${err.message}`)
    }

    console.log('\n🎉 Migration process completed!')
    console.log('\nNext steps:')
    console.log('1. Review any errors above')
    console.log('2. Test API endpoints')
    console.log('3. Verify application functionality')

  } catch (error) {
    console.error('❌ Critical error during migration:', error)
    process.exit(1)
  }
}

// Alternative direct execution method if rpc doesn't work
async function executeDirectSQL(sql) {
  const { data, error } = await supabase
    .rpc('execute_sql', { sql_query: sql })
  
  return { data, error }
}

applyCorrectedMigration().catch(console.error)
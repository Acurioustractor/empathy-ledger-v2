const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

const client = new Client({
  host: 'aws-0-ap-southeast-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.yvnuayzslukamizrlhwb',
  password: 'Drillsquare99',
  ssl: { rejectUnauthorized: false }
})

async function applyMigration() {
  try {
    console.log('🔌 Connecting to database...')
    await client.connect()
    console.log('✅ Connected!')

    console.log('\n📦 Reading migration file...')
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251011_project_contexts.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('🚀 Executing SQL migration...\n')
    const result = await client.query(sql)

    console.log('✅ Migration applied successfully!')
    console.log('📊 Result:', result.rowCount, 'rows affected')

  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.detail) console.error('Details:', error.detail)
    process.exit(1)
  } finally {
    await client.end()
  }
}

applyMigration()

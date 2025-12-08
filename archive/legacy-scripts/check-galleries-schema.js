const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  // Get one gallery to see its structure
  const { data, error } = await supabase
    .from('galleries')
    .select('*')
    .limit(1)
    .single()

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('galleries table columns:')
  console.log(Object.keys(data || {}).sort())
}

checkSchema().then(() => process.exit(0))

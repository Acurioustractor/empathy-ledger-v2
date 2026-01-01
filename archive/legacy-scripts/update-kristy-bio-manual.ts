/**
 * Update Kristy's Bio with Manually Crafted Version
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') })

import { createClient } from '@supabase/supabase-js'

const KRISTY_ID = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const newBio = `Kristy Bloomfield is a visionary leader and passionate advocate for Indigenous empowerment and community development in Central Australia. As a traditional owner from two pioneering families—the Bloomfield and Liddle lines—Kristy chairs Oonchiumpa, an Indigenous-led organization creating generational wealth and economic opportunities on country. Through innovative partnerships with ANU law students, she bridges legal education with lived Indigenous experience, ensuring future lawyers understand the realities of Aboriginal communities. Kristy leads multiple initiatives including HBC (Henry Bloomfield Contracting), Loves Creek tourism development, and the Oonchiumpa Hub vision—a one-stop service center empowering young people through cultural connection, education, employment, and family support. Her work challenges systemic barriers while building sustainable pathways for Indigenous youth and families.`

const culturalBackground = 'Aboriginal Australian - Traditional Owner (Bloomfield and Liddle families)'

const expertiseAreas = [
  'Indigenous Community Development',
  'Legal Education Partnerships',
  'Economic Empowerment',
  'Youth Services',
  'Traditional Territory Management'
]

const communityRoles = [
  'Chair of Oonchiumpa',
  'Traditional Owner',
  'Community Leader'
]

async function updateKristyBio() {
  console.log('📝 Updating Kristy Bloomfield\'s bio...\n')

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('New Bio:')
  console.log('─'.repeat(80))
  console.log(newBio)
  console.log('─'.repeat(80))
  console.log(`Length: ${newBio.length} characters\n`)

  console.log('Cultural Background:', culturalBackground)
  console.log('Expertise Areas:', expertiseAreas.join(', '))
  console.log('Community Roles:', communityRoles.join(', '))
  console.log('')

  const { error } = await supabase
    .from('profiles')
    .update({
      bio: newBio,
      cultural_background: culturalBackground,
      expertise_areas: expertiseAreas,
      community_roles: communityRoles,
      updated_at: new Date().toISOString()
    })
    .eq('id', KRISTY_ID)

  if (error) {
    console.error('❌ Error updating profile:', error)
    process.exit(1)
  }

  console.log('✅ Successfully updated Kristy\'s profile!')
}

updateKristyBio()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })

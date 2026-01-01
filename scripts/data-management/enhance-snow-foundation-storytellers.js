const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const storytellerEnhancements = {
  '3e2de0ab-6639-448b-bb34-d48e4f243dbf': { // Benjamin Knight
    impact_focus_areas: ['Indigenous Rights', 'Community Leadership', 'Cultural Preservation'],
    expertise_areas: ['Community Organizing', 'Traditional Knowledge', 'Youth Mentorship'],
    storytelling_methods: ['Oral Tradition', 'Digital Stories', 'Community Workshops'],
    community_roles: ['Elder Advisor', 'Cultural Keeper'],
    change_maker_type: 'community_organizer',
    geographic_scope: 'regional',
    years_of_community_work: 25,
    mentor_availability: true,
    speaking_availability: true,
    is_elder: false,
    is_featured: true
  },
  'beeecef9-125f-4507-be00-7dd1312f4fd7': { // Georgina Byron AM
    impact_focus_areas: ['Social Justice', 'Education', 'Women\'s Rights'],
    expertise_areas: ['Legal Advocacy', 'Policy Development', 'Public Speaking'],
    storytelling_methods: ['Written Stories', 'Legal Testimony', 'Public Speeches'],
    community_roles: ['Legal Advocate', 'Board Member'],
    change_maker_type: 'advocate',
    geographic_scope: 'national',
    years_of_community_work: 30,
    mentor_availability: true,
    speaking_availability: true,
    is_elder: false,
    is_featured: true
  },
  '99a2d1de-2cad-4e03-a828-bf6617b36ef1': { // Aunty Diganbal May Rose
    impact_focus_areas: ['Cultural Preservation', 'Traditional Knowledge', 'Intergenerational Learning'],
    expertise_areas: ['Traditional Medicine', 'Cultural Practices', 'Elder Guidance'],
    storytelling_methods: ['Oral Tradition', 'Cultural Ceremonies', 'Traditional Stories'],
    community_roles: ['Cultural Elder', 'Traditional Knowledge Keeper'],
    change_maker_type: 'wisdom_keeper',
    geographic_scope: 'local',
    years_of_community_work: 45,
    mentor_availability: true,
    speaking_availability: true,
    is_elder: true,
    is_featured: true
  },
  '90b2c00b-24a0-41d2-997c-adda7baa33b5': { // Dr Boe Remenyi
    impact_focus_areas: ['Climate Change', 'Environmental Justice', 'Research'],
    expertise_areas: ['Climate Science', 'Research Methodology', 'Data Analysis'],
    storytelling_methods: ['Scientific Reports', 'Data Visualization', 'Academic Presentations'],
    community_roles: ['Researcher', 'Climate Activist'],
    change_maker_type: 'innovator',
    geographic_scope: 'international',
    years_of_community_work: 15,
    mentor_availability: true,
    speaking_availability: true,
    is_elder: false,
    is_featured: true
  },
  '7380ee75-512c-41b6-9f17-416e3dbba302': { // Aunty Vicky Wade
    impact_focus_areas: ['Traditional Knowledge', 'Youth Development', 'Cultural Healing'],
    expertise_areas: ['Traditional Healing', 'Community Support', 'Cultural Education'],
    storytelling_methods: ['Oral Tradition', 'Healing Stories', 'Community Circles'],
    community_roles: ['Elder', 'Healer'],
    change_maker_type: 'wisdom_keeper',
    geographic_scope: 'regional',
    years_of_community_work: 35,
    mentor_availability: true,
    speaking_availability: false,
    is_elder: true,
    is_featured: true
  },
  'ebc60718-e377-4dc0-982e-251110017550': { // Cissy Johns
    impact_focus_areas: ['Youth Empowerment', 'Education', 'Community Development'],
    expertise_areas: ['Youth Work', 'Educational Programs', 'Community Engagement'],
    storytelling_methods: ['Youth Programs', 'Educational Content', 'Community Events'],
    community_roles: ['Youth Worker', 'Community Organizer'],
    change_maker_type: 'advocate',
    geographic_scope: 'local',
    years_of_community_work: 12,
    mentor_availability: true,
    speaking_availability: true,
    is_elder: false,
    is_featured: false
  },
  'b0ce4598-05d3-4773-92c0-8ba30ed65751': { // Heather Mundo
    impact_focus_areas: ['Health', 'Community Wellness', 'Mental Health Support'],
    expertise_areas: ['Health Advocacy', 'Community Care', 'Wellness Programs'],
    storytelling_methods: ['Health Stories', 'Wellness Workshops', 'Support Groups'],
    community_roles: ['Health Advocate', 'Support Worker'],
    change_maker_type: 'advocate',
    geographic_scope: 'local',
    years_of_community_work: 8,
    mentor_availability: false,
    speaking_availability: true,
    is_elder: false,
    is_featured: false
  }
}

async function enhanceSnowFoundationStorytellers() {
  try {
    console.log('🚀 Enhancing Snow Foundation storytellers...')

    for (const [storytellerId, enhancements] of Object.entries(storytellerEnhancements)) {
      console.log(`\n📝 Updating storyteller: ${storytellerId}`)

      const { data: updated, error } = await supabase
        .from('profiles')
        .update(enhancements)
        .eq('id', storytellerId)
        .select('id, display_name')

      if (error) {
        console.error(`❌ Error updating ${storytellerId}:`, error)
      } else if (updated && updated.length > 0) {
        console.log(`✅ Successfully enhanced: ${updated[0].display_name}`)
      } else {
        console.log(`⚠️ No profile found for: ${storytellerId}`)
      }
    }

    console.log('\n🎉 Snow Foundation storyteller enhancement complete!')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

enhanceSnowFoundationStorytellers()
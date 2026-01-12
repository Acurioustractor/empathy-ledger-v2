/**
 * UAT Demo Data Seeding Script
 * Creates realistic test data for user acceptance testing
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

// Demo organization
const demoOrg = {
  name: 'First Nations Storytelling Circle',
  slug: 'fnsc-demo',
  type: 'indigenous_organization',
  description: 'A community organization dedicated to preserving and sharing Indigenous stories',
  website: 'https://example.com',
  contact_email: 'contact@example.com'
}

// Demo storytellers
const demoStorytellers = [
  {
    display_name: 'Elder Grace Thompson',
    bio: 'Elder Grace has been sharing stories for over 40 years, preserving the traditional knowledge of her people.',
    cultural_background: 'Anishinaabe, Ojibwe',
    preferred_language: 'English, Anishinaabemowin',
    cultural_protocols: ['Permission required before sharing', 'Women\'s stories'],
    privacy_level: 'community'
  },
  {
    display_name: 'Marcus Rivers',
    bio: 'Youth advocate and storyteller working to bridge traditional knowledge with modern media.',
    cultural_background: 'Lakota',
    preferred_language: 'English',
    cultural_protocols: ['Seasonal stories - winter only'],
    privacy_level: 'public'
  },
  {
    display_name: 'Sarah Blackfeather',
    bio: 'Traditional knowledge keeper and educator, specializing in plant medicine stories.',
    cultural_background: 'Cree',
    preferred_language: 'English, Cree',
    cultural_protocols: ['Elder approval required', 'Seasonal teachings'],
    privacy_level: 'organization'
  }
]

// Demo stories
const demoStories = [
  {
    title: 'The Seven Grandfather Teachings',
    story_arc: 'A story passed down through generations about the seven sacred teachings: Love, Respect, Courage, Honesty, Humility, Wisdom, and Truth. Each teaching represents a way of living that brings balance and harmony to our communities.',
    cultural_themes: ['Traditional Teachings', 'Values', 'Community', 'Spirituality'],
    language: 'English',
    consent_status: 'approved',
    publish_status: 'published'
  },
  {
    title: 'Walking Two Paths',
    story_arc: 'My journey as a young person navigating between traditional Indigenous ways and modern urban life. Finding strength in both worlds and learning that they can complement each other.',
    cultural_themes: ['Identity', 'Youth Experience', 'Cultural Continuity', 'Modern Life'],
    language: 'English',
    consent_status: 'approved',
    publish_status: 'published'
  },
  {
    title: 'Medicine Garden Memories',
    story_arc: 'Childhood memories of learning about traditional plant medicines from my grandmother. How the garden became a classroom and the plants became our teachers.',
    cultural_themes: ['Traditional Knowledge', 'Plant Medicine', 'Intergenerational Learning', 'Land Connection'],
    language: 'English',
    consent_status: 'approved',
    publish_status: 'published'
  },
  {
    title: 'The Language Keeper',
    story_arc: 'The journey of learning and preserving our ancestral language in a time when few speakers remain. The responsibility and joy of being a language keeper for future generations.',
    cultural_themes: ['Language Revitalization', 'Cultural Preservation', 'Responsibility', 'Hope'],
    language: 'English',
    consent_status: 'approved',
    publish_status: 'published'
  },
  {
    title: 'Winter Count Stories',
    story_arc: 'Using the traditional winter count method to record and remember significant events in our community. How this ancient practice helps us understand our history and plan our future.',
    cultural_themes: ['Traditional Practices', 'History', 'Community Memory', 'Storytelling Methods'],
    language: 'English',
    consent_status: 'approved',
    publish_status: 'published'
  }
]

async function seedUATData() {
  console.log('🌱 Starting UAT demo data seeding...\n')

  try {
    // 1. Create demo organization
    console.log('📦 Creating demo organization...')
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert(demoOrg)
      .select()
      .single()

    if (orgError) throw orgError
    console.log(`✅ Organization created: ${org.name} (${org.id})\n`)

    // 2. Create demo project
    console.log('📁 Creating demo project...')
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        organization_id: org.id,
        name: 'Community Stories 2024',
        description: 'Collection of community stories for cultural preservation',
        status: 'active'
      })
      .select()
      .single()

    if (projectError) throw projectError
    console.log(`✅ Project created: ${project.name} (${project.id})\n`)

    // 3. Create demo storytellers
    console.log('👤 Creating demo storytellers...')
    const storytellerIds: string[] = []

    for (const storyteller of demoStorytellers) {
      // First create a profile (simplified - in production would use actual auth)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          email: `${storyteller.display_name.toLowerCase().replace(/\s+/g, '.')}@demo.test`,
          full_name: storyteller.display_name
        })
        .select()
        .single()

      if (profileError) {
        console.warn(`⚠️  Could not create profile for ${storyteller.display_name}:`, profileError.message)
        continue
      }

      // Create storyteller
      const { data: st, error: stError } = await supabase
        .from('storytellers')
        .insert({
          ...storyteller,
          organization_id: org.id,
          profile_id: profile.id
        })
        .select()
        .single()

      if (stError) {
        console.warn(`⚠️  Could not create storyteller ${storyteller.display_name}:`, stError.message)
        continue
      }

      storytellerIds.push(st.id)
      console.log(`  ✓ ${st.display_name}`)
    }

    console.log(`✅ Created ${storytellerIds.length} storytellers\n`)

    // 4. Create demo stories
    console.log('📖 Creating demo stories...')
    let storyCount = 0

    for (let i = 0; i < demoStories.length; i++) {
      const story = demoStories[i]
      const storytellerId = storytellerIds[i % storytellerIds.length] // Distribute stories among storytellers

      const { data: st, error: storyError } = await supabase
        .from('stories')
        .insert({
          ...story,
          organization_id: org.id,
          project_id: project.id,
          storyteller_id: storytellerId
        })
        .select()
        .single()

      if (storyError) {
        console.warn(`⚠️  Could not create story "${story.title}":`, storyError.message)
        continue
      }

      storyCount++
      console.log(`  ✓ ${st.title}`)
    }

    console.log(`✅ Created ${storyCount} stories\n`)

    // 5. Create demo themes in narrative_themes
    console.log('🎨 Creating theme registry...')
    const allThemes = new Set<string>()
    demoStories.forEach(s => s.cultural_themes.forEach(t => allThemes.add(t)))

    for (const theme of allThemes) {
      await supabase
        .from('narrative_themes')
        .insert({
          theme_name: theme,
          theme_category: 'cultural',
          usage_count: demoStories.filter(s => s.cultural_themes.includes(theme)).length,
          first_seen_date: new Date().toISOString()
        })
        .select()
    }

    console.log(`✅ Created ${allThemes.size} themes\n`)

    // 6. Print summary
    console.log('\n' + '='.repeat(60))
    console.log('🎉 UAT DEMO DATA SEEDING COMPLETE!')
    console.log('='.repeat(60))
    console.log(`
📊 Summary:
   • Organization: ${org.name}
   • Project: ${project.name}
   • Storytellers: ${storytellerIds.length}
   • Stories: ${storyCount}
   • Themes: ${allThemes.size}

🔑 Test Credentials:
   You can create test user accounts in Supabase Auth dashboard
   or use the signup flow in the app.

🌐 Organization ID: ${org.id}
📁 Project ID: ${project.id}

🧪 Ready for User Acceptance Testing!
    `)

  } catch (error) {
    console.error('❌ Error seeding UAT data:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  seedUATData()
    .then(() => {
      console.log('✅ Script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

export { seedUATData }

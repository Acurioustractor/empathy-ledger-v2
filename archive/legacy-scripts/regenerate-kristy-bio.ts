/**
 * Regenerate Kristy's Bio from her Transcripts
 *
 * This script fetches all of Kristy's transcripts and generates
 * a new bio based on the content.
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') })

import { createClient } from '@supabase/supabase-js'
import { generateBioFromMultipleTranscripts } from '../src/lib/ai/bio-generator'

const KRISTY_ID = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('🔧 Environment check:')
console.log('  Supabase URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
console.log('  Service Key:', supabaseServiceKey ? '✓ Set' : '✗ Missing')
console.log('  OpenAI Key:', process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Missing')
console.log('')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

async function regenerateKristyBio() {
  console.log('🔄 Regenerating Kristy Bloomfield\'s bio from her transcripts...\n')

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // 1. Fetch Kristy's profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name, full_name, bio')
    .eq('id', KRISTY_ID)
    .single()

  if (profileError || !profile) {
    console.error('❌ Error fetching Kristy\'s profile:', profileError)
    return
  }

  console.log('✅ Found profile:', profile.display_name || profile.full_name)
  console.log('📝 Current bio length:', profile.bio?.length || 0, 'characters\n')

  // 2. Fetch all her transcripts
  const { data: transcripts, error: transcriptsError } = await supabase
    .from('transcripts')
    .select('id, title, text, transcript_content, metadata')
    .eq('storyteller_id', KRISTY_ID)
    .not('text', 'is', null)
    .order('created_at', { ascending: false })

  if (transcriptsError) {
    console.error('❌ Error fetching transcripts:', transcriptsError)
    return
  }

  console.log(`📚 Found ${transcripts?.length || 0} transcripts:\n`)

  transcripts?.forEach((t, idx) => {
    const content = t.text || t.transcript_content || ''
    console.log(`${idx + 1}. "${t.title}"`)
    console.log(`   Length: ${content.length} characters`)
    console.log(`   Has AI Summary: ${t.metadata?.ai_summary ? 'Yes' : 'No'}\n`)
  })

  if (!transcripts || transcripts.length === 0) {
    console.log('⚠️  No transcripts found. Cannot generate bio.')
    return
  }

  // 3. Prepare transcript data for bio generation
  const transcriptData = transcripts.map(t => ({
    content: t.text || t.transcript_content || '',
    title: t.title,
    ai_summary: t.metadata?.ai_summary
  }))

  // 4. Generate new bio using AI
  console.log('🤖 Generating new bio using AI...\n')

  try {
    const result = await generateBioFromMultipleTranscripts(
      transcriptData,
      profile.display_name || profile.full_name,
      undefined // Don't use existing bio, force regeneration
    )

    console.log('✨ New Bio Generated:\n')
    console.log('─'.repeat(80))
    console.log(result.bio)
    console.log('─'.repeat(80))
    console.log(`\nLength: ${result.bio.length} characters\n`)

    if (result.cultural_background) {
      console.log('🌏 Cultural Background:', result.cultural_background)
    }

    if (result.expertise_areas && result.expertise_areas.length > 0) {
      console.log('💡 Expertise Areas:', result.expertise_areas.join(', '))
    }

    if (result.community_roles && result.community_roles.length > 0) {
      console.log('👥 Community Roles:', result.community_roles.join(', '))
    }

    console.log('\n')

    // 5. Update the profile with new bio
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        bio: result.bio,
        cultural_background: result.cultural_background,
        expertise_areas: result.expertise_areas,
        community_roles: result.community_roles,
        updated_at: new Date().toISOString()
      })
      .eq('id', KRISTY_ID)

    if (updateError) {
      console.error('❌ Error updating profile:', updateError)
      return
    }

    console.log('✅ Successfully updated Kristy\'s profile with new bio!')

  } catch (error) {
    console.error('❌ Error generating bio:', error)

    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
  }
}

// Run the script
regenerateKristyBio()
  .then(() => {
    console.log('\n✨ Script completed')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })

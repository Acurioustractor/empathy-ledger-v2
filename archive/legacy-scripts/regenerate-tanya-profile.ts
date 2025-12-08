/**
 * Regenerate Tanya Turner's Profile
 * - Create new bio from transcript
 * - Extract themes and quotes
 * - Update profile and transcript
 */

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../.env.local') })

import { createClient } from '@supabase/supabase-js'
import { generateBioFromTranscript } from '../src/lib/ai/bio-generator'
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

const TANYA_ID = 'dc85700d-f139-46fa-9074-6afee55ea801'
const TRANSCRIPT_ID = '70e54459-2298-4eb7-8655-8924bbf3811d'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const themesSchema = z.object({
  themes: z.array(z.string()).max(8).describe('Key themes from the interview (simple list)'),
  quotes: z.array(z.string()).max(6).describe('Powerful quotes from the transcript (simple list)')
})

async function regenerateTanyaProfile() {
  console.log('🔄 Regenerating Tanya Turner\'s complete profile...\n')

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // 1. Fetch Tanya's profile and transcript
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, bio')
    .eq('id', TANYA_ID)
    .single()

  const { data: transcript } = await supabase
    .from('transcripts')
    .select('id, title, transcript_content')
    .eq('id', TRANSCRIPT_ID)
    .single()

  if (!profile || !transcript) {
    console.error('❌ Could not fetch profile or transcript')
    return
  }

  console.log('✅ Found:', profile.display_name)
  console.log('📝 Transcript:', transcript.title)
  console.log('📏 Length:', transcript.transcript_content?.length, 'characters\n')

  // 2. Generate new bio
  console.log('🤖 Generating new bio from transcript...\n')

  const bioResult = await generateBioFromTranscript(
    transcript.transcript_content,
    profile.display_name,
    transcript.title,
    undefined // Force regeneration
  )

  console.log('✨ New Bio Generated:\n')
  console.log('─'.repeat(80))
  console.log(bioResult.bio)
  console.log('─'.repeat(80))
  console.log(`Length: ${bioResult.bio.length} characters\n`)

  if (bioResult.cultural_background) {
    console.log('🌏 Cultural Background:', bioResult.cultural_background)
  }
  if (bioResult.expertise_areas?.length) {
    console.log('💡 Expertise:', bioResult.expertise_areas.join(', '))
  }
  if (bioResult.community_roles?.length) {
    console.log('👥 Roles:', bioResult.community_roles.join(', '))
  }
  console.log('')

  // 3. Extract themes and quotes
  console.log('🎯 Extracting themes and quotes...\n')

  const { object: themesResult } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: themesSchema,
    temperature: 0.7,
    prompt: `Analyze this interview transcript with Tanya Turner, an Eastern Aboriginal woman and lawyer from Central Australia.

Transcript:
${transcript.transcript_content}

Extract:
1. Key themes - focus on Indigenous justice, legal practice, community development, cultural identity, youth empowerment
2. Powerful quotes - select quotes that capture Tanya's passion, experience, and vision

Prioritize content that shows:
- Her journey from law school to community work
- Her commitment to Indigenous youth
- Her vision for Alice Springs
- Her understanding of justice and empowerment
- Her leadership and cultural authority`
  })

  console.log('📚 Themes Extracted:')
  themesResult.themes.forEach((theme, idx) => {
    console.log(`${idx + 1}. ${theme}`)
  })

  console.log('\n💬 Quotes Extracted:')
  themesResult.quotes.forEach((quote, idx) => {
    console.log(`${idx + 1}. "${quote}"`)
  })

  // 4. Update profile
  console.log('💾 Updating profile...')

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      bio: bioResult.bio,
      cultural_background: bioResult.cultural_background,
      expertise_areas: bioResult.expertise_areas,
      community_roles: bioResult.community_roles,
      updated_at: new Date().toISOString()
    })
    .eq('id', TANYA_ID)

  if (profileError) {
    console.error('❌ Error updating profile:', profileError)
    return
  }

  console.log('✅ Profile updated successfully')

  // 5. Update transcript with themes and quotes
  console.log('💾 Updating transcript with themes and quotes...')

  const { error: transcriptError } = await supabase
    .from('transcripts')
    .update({
      themes: themesResult.themes,
      key_quotes: themesResult.quotes.map(q => ({
        quote: q,
        context: '',
        timestamp: null
      })),
      metadata: {
        ...(transcript.metadata || {}),
        ai_analysis: {
          themes: themesResult.themes,
          quotes: themesResult.quotes,
          analyzed_at: new Date().toISOString(),
          model: 'gpt-4o-mini'
        }
      },
      ai_processing_status: 'completed',
      updated_at: new Date().toISOString()
    })
    .eq('id', TRANSCRIPT_ID)

  if (transcriptError) {
    console.error('❌ Error updating transcript:', transcriptError)
    return
  }

  console.log('✅ Transcript updated successfully')

  console.log('\n🎉 Complete! Tanya\'s profile has been regenerated with:')
  console.log('   ✓ New bio based on her transcript')
  console.log('   ✓', themesResult.themes.length, 'themes extracted')
  console.log('   ✓', themesResult.quotes.length, 'quotes extracted')
  console.log('   ✓ Profile and transcript updated in database')
  console.log('\n📄 View Tanya\'s profile at: /admin/storytellers/' + TANYA_ID + '/edit')
}

regenerateTanyaProfile()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })

import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

import { generateText } from 'ai'

import { openai } from '@ai-sdk/openai'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const { storytellerIds, forceAll = false } = await request.json()
    const supabase = createSupabaseServerClient()

    let query = supabase
      .from('profiles')
      .select(`
        id,
        display_name,
        bio,
        cultural_background
      `)

    // If specific storyteller IDs provided, use those; otherwise process all
    if (storytellerIds && storytellerIds.length > 0) {
      query = query.in('id', storytellerIds)
    } else {
      query = query.limit(1000)
    }

    const { data: storytellers, error } = await query

    if (error) {
      console.error('Error fetching storytellers:', error)
      return NextResponse.json({ error: 'Failed to fetch storytellers' }, { status: 500 })
    }

    const results = []
    const totalStorytellers = storytellers?.length || 0
    console.log(`🚀 Generating short bios for ${totalStorytellers} storytellers`)

    for (let i = 0; i < (storytellers || []).length; i++) {
      const storyteller = storytellers![i]
      console.log(`📝 Processing ${i + 1}/${totalStorytellers}: ${storyteller.display_name}`)

      try {
        // Skip if not forcing (we'll always generate since this is a new feature)
        // if (!forceAll && storyteller.short_bio && storyteller.short_bio.length > 20) {
        //   console.log(`Skipping ${storyteller.display_name} - already has short bio`)
        //   continue
        // }

        // Fetch stories for this storyteller
        const { data: stories } = await supabase
          .from('stories')
          .select('id, title, content, summary')
          .eq('author_id', storyteller.id)
          .limit(3)

        // Fetch transcripts for this storyteller
        const { data: transcripts, error: transcriptError } = await supabase
          .from('transcripts')
          .select('id, title, transcript_content, summary')
          .eq('storyteller_id', storyteller.id)
          .limit(3)

        console.log(`${storyteller.display_name}: Found ${(stories || []).length} stories, ${(transcripts || []).length} transcripts`)
        if (transcriptError) {
          console.log(`${storyteller.display_name}: Transcript query error:`, JSON.stringify(transcriptError, null, 2))
        }

        if ((stories || []).length === 0 && (transcripts || []).length === 0) {
          console.log(`Skipping ${storyteller.display_name} - no content available`)
          results.push({
            storyteller: storyteller.display_name,
            status: 'skipped',
            reason: 'No content available'
          })
          continue
        }

        // Use existing long bio if available, otherwise prepare content
        let sourceContent = storyteller.bio || ''

        // If no bio in main field, try to use content from stories/transcripts
        if (!sourceContent || sourceContent.length < 50) {
          console.log(`${storyteller.display_name}: Main bio empty, checking transcripts and stories`)
          console.log(`${storyteller.display_name}: Found ${(stories || []).length} stories, ${(transcripts || []).length} transcripts`)

          // Prepare content from stories/transcripts
          const storyContent = (stories || []).map(s => `${s.title || 'Story'}: ${s.content || s.summary || ''}`).join('\n')
          const transcriptContent = (transcripts || []).map(t => {
            console.log(`${storyteller.display_name}: Processing transcript "${t.title}" with ${t.transcript_content?.length || 0} chars`)
            return `${t.title || 'Transcript'}: ${t.transcript_content || t.summary || ''}`
          }).join('\n')

          sourceContent = [storyContent, transcriptContent].filter(Boolean).join('\n\n')
          console.log(`${storyteller.display_name}: Combined source content length: ${sourceContent.length}`)
        }

        if (!sourceContent.trim()) {
          console.log(`Skipping ${storyteller.display_name} - no meaningful content after checking all sources`)
          results.push({
            storyteller: storyteller.display_name,
            status: 'skipped',
            reason: 'No meaningful content'
          })
          continue
        }

        // Generate short bio for cards
        const prompt = `Create a VERY short bio for ${storyteller.display_name} for their profile card.

Source: ${sourceContent.substring(0, 1500)}

STRICT Requirements:
- Maximum 100 characters total
- 1-2 sentences only
- No generic phrases
- Capture their unique essence

Bio:`

        const { text: shortBio } = await generateText({
          model: openai('gpt-4o-mini'),
          prompt,
          maxTokens: 50
        })

        if (shortBio && shortBio.length > 10 && shortBio.length <= 120) {
          // Store short bio as a custom field for now (since short_bio column might not exist)
          // We'll add it to the bio field temporarily with a marker
          const shortBioMarker = `[SHORT_BIO]${shortBio.trim()}[/SHORT_BIO]`
          const updatedBio = storyteller.bio ? `${storyteller.bio}\n\n${shortBioMarker}` : shortBioMarker

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ bio: updatedBio })
            .eq('id', storyteller.id)

          if (updateError) {
            console.error(`Error updating short bio for ${storyteller.display_name}:`, updateError)
            results.push({
              storyteller: storyteller.display_name,
              status: 'error',
              error: updateError.message
            })
          } else {
            console.log(`Updated short bio for ${storyteller.display_name}: "${shortBio}"`)
            results.push({
              storyteller: storyteller.display_name,
              status: 'updated',
              old_short_bio: 'None',
              new_short_bio: shortBio.trim(),
              character_count: shortBio.trim().length
            })
          }
        } else {
          results.push({
            storyteller: storyteller.display_name,
            status: 'skipped',
            reason: `Generated bio inappropriate length: ${shortBio?.length || 0} characters`
          })
        }

        // Brief delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 200))

      } catch (error) {
        console.error(`Error processing ${storyteller.display_name}:`, error)
        results.push({
          storyteller: storyteller.display_name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      updated: results.filter(r => r.status === 'updated').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      errors: results.filter(r => r.status === 'error').length,
      results
    })

  } catch (error) {
    console.error('Error in short bio generation:', error)
    return NextResponse.json({
      error: 'Failed to generate short bios',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
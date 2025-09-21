import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

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
    console.log(`🚀 Force regenerating bios for ${totalStorytellers} storytellers`)

    for (let i = 0; i < (storytellers || []).length; i++) {
      const storyteller = storytellers![i]
      console.log(`📝 Processing ${i + 1}/${totalStorytellers}: ${storyteller.display_name}`)

      try {
        // Fetch stories for this storyteller
        const { data: stories } = await supabase
          .from('stories')
          .select('id, title, content, summary')
          .eq('author_id', storyteller.id)
          .limit(5)

        // Fetch transcripts for this storyteller
        const { data: transcripts } = await supabase
          .from('transcripts')
          .select('id, title, transcript_content, summary')
          .eq('storyteller_id', storyteller.id)
          .limit(5)

        if ((stories || []).length === 0 && (transcripts || []).length === 0) {
          console.log(`Skipping ${storyteller.display_name} - no content available`)
          results.push({
            storyteller: storyteller.display_name,
            status: 'skipped',
            reason: 'No content available'
          })
          continue
        }

        // Prepare content for AI analysis
        const storyContent = (stories || []).map(s => `Story: ${s.title || 'Untitled'}\n${s.content || s.summary || ''}`).join('\n\n')
        const transcriptContent = (transcripts || []).map(t => `Transcript: ${t.title || 'Untitled'}\n${t.transcript_content || t.summary || ''}`).join('\n\n')

        const allContent = [storyContent, transcriptContent].filter(Boolean).join('\n\n---\n\n')

        if (!allContent.trim()) {
          console.log(`Skipping ${storyteller.display_name} - no meaningful content`)
          results.push({
            storyteller: storyteller.display_name,
            status: 'skipped',
            reason: 'No meaningful content'
          })
          continue
        }

        // Generate new bio using AI
        const prompt = `Based on the following stories and transcripts from ${storyteller.display_name}, write a compelling and authentic biographical description that captures their unique voice, experiences, and impact. Focus on what makes them distinctive based on their actual content.

Cultural Background: ${storyteller.cultural_background || 'Not specified'}

Content:
${allContent.substring(0, 4000)} ${allContent.length > 4000 ? '...' : ''}

Write a bio that:
- Is 3-4 sentences long
- Captures their authentic voice and perspective
- Highlights specific themes and experiences from their content
- Avoids generic phrases or templates
- Shows their unique contribution and story
- Is engaging and personal
- Reflects their cultural context respectfully`

        const { text: newBio } = await generateText({
          model: openai('gpt-4o-mini'),
          prompt,
          maxTokens: 300
        })

        if (newBio && newBio.length > 20) {
          // Update the bio in the database
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ bio: newBio.trim() })
            .eq('id', storyteller.id)

          if (updateError) {
            console.error(`Error updating bio for ${storyteller.display_name}:`, updateError)
            results.push({
              storyteller: storyteller.display_name,
              status: 'error',
              error: updateError.message
            })
          } else {
            console.log(`Updated bio for ${storyteller.display_name}`)
            results.push({
              storyteller: storyteller.display_name,
              status: 'updated',
              old_bio: storyteller.bio?.substring(0, 100) + '...',
              new_bio: newBio
            })
          }
        } else {
          results.push({
            storyteller: storyteller.display_name,
            status: 'skipped',
            reason: 'AI generated bio too short or empty'
          })
        }

        // Brief delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 300))

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
    console.error('Error in force bio regeneration:', error)
    return NextResponse.json({
      error: 'Failed to regenerate bios',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
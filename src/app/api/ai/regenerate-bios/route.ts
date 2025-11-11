import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

import { generateText } from 'ai'

import { openai } from '@ai-sdk/openai'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()

    // Get all storytellers with their stories and transcripts
    const { data: storytellers, error } = await supabase
      .from('profiles')
      .select(`
        id,
        display_name,
        bio,
        cultural_background
      `)
      .limit(1000) // Process all storytellers

    if (error) {
      console.error('Error fetching storytellers:', error)
      return NextResponse.json({ error: 'Failed to fetch storytellers' }, { status: 500 })
    }

    const results = []
    const totalStorytellers = storytellers?.length || 0
    console.log(`🚀 Starting bio regeneration for ${totalStorytellers} storytellers`)

    for (let i = 0; i < (storytellers || []).length; i++) {
      const storyteller = storytellers![i]
      console.log(`📝 Processing ${i + 1}/${totalStorytellers}: ${storyteller.display_name}`)
      try {
        // Skip if already has good bio (not AI template)
        if (storyteller.bio &&
            !storyteller.bio.includes('shares their journey from community member') &&
            !storyteller.bio.includes('carrying forward the wisdom of their ancestors') &&
            storyteller.bio.length > 50) {
          console.log(`Skipping ${storyteller.display_name} - already has good bio`)
          continue
        }

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
          continue
        }

        // Prepare content for AI analysis
        const storyContent = (stories || []).map(s => `Story: ${s.title || 'Untitled'}\n${s.content || s.summary || ''}`).join('\n\n')
        const transcriptContent = (transcripts || []).map(t => `Transcript: ${t.title || 'Untitled'}\n${t.transcript_content || t.summary || ''}`).join('\n\n')

        const allContent = [storyContent, transcriptContent].filter(Boolean).join('\n\n---\n\n')

        if (!allContent.trim()) {
          console.log(`Skipping ${storyteller.display_name} - no meaningful content`)
          continue
        }

        // Generate new bio using AI
        const prompt = `Based on the following stories and transcripts from ${storyteller.display_name}, write a concise 2-3 sentence biographical description that captures their unique voice, experiences, and perspective. Focus on what makes them distinctive based on their actual content, not generic templates.

Cultural Background: ${storyteller.cultural_background || 'Not specified'}

Content:
${allContent.substring(0, 3000)} ${allContent.length > 3000 ? '...' : ''}

Write a bio that:
- Is authentic to their voice and experiences
- Avoids generic phrases like "shares their journey" or "carrying forward wisdom"
- Highlights specific themes from their actual content
- Is 2-3 sentences maximum
- Feels personal and unique to this individual`

        const { text: newBio } = await generateText({
          model: openai('gpt-4o-mini'),
          prompt,
          maxTokens: 200
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

        // Smaller delay to speed up processing
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
      results
    })

  } catch (error) {
    console.error('Error in bio regeneration:', error)
    return NextResponse.json({
      error: 'Failed to regenerate bios',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
/**
 * Bio Generator
 * Creates concise storyteller bios from transcript analysis
 */

import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

const bioSchema = z.object({
  bio: z.string().max(800).describe('A concise, engaging bio (600-800 characters) highlighting the storyteller\'s key contributions, expertise, and impact'),
  cultural_background: z.string().optional().describe('Cultural or community background if mentioned'),
  expertise_areas: z.array(z.string()).max(5).optional().describe('Key areas of expertise or focus'),
  community_roles: z.array(z.string()).max(3).optional().describe('Community or professional roles'),
})

export interface BioGenerationResult {
  bio: string
  cultural_background?: string
  expertise_areas?: string[]
  community_roles?: string[]
}

export async function generateBioFromTranscript(
  transcriptContent: string,
  storytellerName: string,
  transcriptTitle?: string,
  existingBio?: string
): Promise<BioGenerationResult> {

  // If there's already a good bio, return it
  if (existingBio && existingBio.length > 400) {
    return {
      bio: existingBio,
      expertise_areas: [],
      community_roles: []
    }
  }

  const prompt = `You are creating a professional bio for a storyteller based on their interview transcript.

Storyteller Name: ${storytellerName}
${transcriptTitle ? `Interview Title: ${transcriptTitle}` : ''}

Transcript Content:
${transcriptContent.substring(0, 4000)}

Create a compelling bio (600-800 characters) that:
1. Highlights their key contributions and impact
2. Captures their unique perspective and expertise
3. Mentions specific projects, initiatives, or focus areas
4. Uses an inspiring, respectful tone
5. Focuses on what makes them a valuable community voice

${existingBio ? `\nExisting bio to enhance:\n${existingBio}\n` : ''}

Extract their cultural background, expertise areas, and community roles if clearly mentioned.`

  // Try OpenAI first
  try {
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: bioSchema,
      temperature: 0.7,
      prompt
    })

    return {
      bio: object.bio,
      cultural_background: object.cultural_background,
      expertise_areas: object.expertise_areas || [],
      community_roles: object.community_roles || []
    }

  } catch (error) {
    console.error('❌ OpenAI bio generation failed, trying Claude...', error)

    // Fallback to Claude if OpenAI fails
    try {
      const { object } = await generateObject({
        model: anthropic('claude-3-5-sonnet-20241022'),
        schema: bioSchema,
        temperature: 0.7,
        prompt
      })

      console.log('✅ Used Claude as fallback for bio generation')

      return {
        bio: object.bio,
        cultural_background: object.cultural_background,
        expertise_areas: object.expertise_areas || [],
        community_roles: object.community_roles || []
      }

    } catch (claudeError) {
      console.error('❌ Claude bio generation also failed:', claudeError)

      // Final fallback: create a simple bio
      const fallbackBio = `${storytellerName} shares valuable insights and experiences through their storytelling.`

      return {
        bio: fallbackBio,
        expertise_areas: [],
        community_roles: []
      }
    }
  }
}

export async function generateBioFromMultipleTranscripts(
  transcripts: Array<{ content: string; title?: string; ai_summary?: string }>,
  storytellerName: string,
  existingBio?: string
): Promise<BioGenerationResult> {

  // If there's already a good bio, return it
  if (existingBio && existingBio.length > 400) {
    return {
      bio: existingBio,
      expertise_areas: [],
      community_roles: []
    }
  }

  try {
    // Combine summaries and key content from all transcripts
    const combinedContent = transcripts.map((t, idx) => {
      const summary = t.ai_summary || t.content.substring(0, 500)
      return `Interview ${idx + 1}${t.title ? ` - ${t.title}` : ''}:\n${summary}`
    }).join('\n\n')

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: bioSchema,
      temperature: 0.7,
      prompt: `You are creating a professional bio for a storyteller based on multiple interview transcripts.

Storyteller Name: ${storytellerName}
Number of Interviews: ${transcripts.length}

Interview Summaries:
${combinedContent.substring(0, 5000)}

Create a comprehensive bio (600-800 characters) that:
1. Synthesizes insights across all interviews
2. Highlights their key contributions and impact
3. Captures their unique perspective and expertise
4. Mentions specific projects, initiatives, or focus areas
5. Uses an inspiring, respectful tone
6. Focuses on what makes them a valuable community voice

${existingBio ? `\nExisting bio to enhance:\n${existingBio}\n` : ''}

Extract their cultural background, expertise areas, and community roles if clearly mentioned across the interviews.`
    })

    return {
      bio: object.bio,
      cultural_background: object.cultural_background,
      expertise_areas: object.expertise_areas || [],
      community_roles: object.community_roles || []
    }

  } catch (error) {
    console.error('❌ Bio generation from multiple transcripts failed:', error)

    return {
      bio: `${storytellerName} shares valuable insights and experiences through their storytelling, contributing to community knowledge and understanding.`,
      expertise_areas: [],
      community_roles: []
    }
  }
}

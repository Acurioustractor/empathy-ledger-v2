import { inngest } from '../client'
import { createClient } from '@supabase/supabase-js'
import { hybridTranscriptAnalyzer } from '@/lib/ai/transcript-analyzer-v2'
import { generateBioFromTranscript } from '@/lib/ai/bio-generator'

/**
 * Background job for processing transcripts with AI
 *
 * Steps:
 * 1. Fetch transcript
 * 2. Run hybrid analysis (patterns + LLM)
 * 3. Extract and store themes
 * 4. Extract and store quotes
 * 5. Generate and store summary
 * 6. Update status
 * 7. Trigger real-time updates
 */
export const processTranscriptFunction = inngest.createFunction(
  {
    id: 'process-transcript',
    name: 'Process Transcript with AI',
    retries: 3, // Retry up to 3 times on failure
  },
  { event: 'transcript/process' },
  async ({ event, step }) => {
    const { transcriptId } = event.data

    console.log(`🚀 Processing transcript: ${transcriptId}`)

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Step 1: Fetch transcript
    const transcript = await step.run('fetch-transcript', async () => {
      console.log('📖 Fetching transcript...')

      const { data, error } = await supabase
        .from('transcripts')
        .select(`
          *,
          profile:profiles!storyteller_id(display_name, cultural_background)
        `)
        .eq('id', transcriptId)
        .single()

      if (error) throw new Error(`Failed to fetch transcript: ${error.message}`)

      // Update status to processing
      await supabase
        .from('transcripts')
        .update({
          ai_processing_status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', transcriptId)

      return data
    })

    // Step 2: Run hybrid AI analysis
    const analysis = await step.run('analyze-content', async () => {
      console.log('🤖 Running AI analysis...')

      const content = transcript.content || transcript.transcript_content || ''

      if (!content || content.length < 100) {
        throw new Error('Transcript content too short for analysis')
      }

      return await hybridTranscriptAnalyzer.analyzeTranscript(content, {
        title: transcript.title,
        storyteller_name: transcript.profile?.display_name,
        cultural_context: transcript.profile?.cultural_background
      })
    })

    // Step 3: Store themes and quotes
    await step.run('store-analysis', async () => {
      console.log('💾 Storing analysis results...')

      // Update transcript with AI results
      await supabase
        .from('transcripts')
        .update({
          ai_summary: analysis.summary,
          themes: analysis.themes,
          key_quotes: analysis.key_quotes.map(q => q.text), // Simple array for now
          ai_processing_status: 'completed',
          metadata: {
            ...transcript.metadata,
            ai_analysis: {
              emotional_tone: analysis.emotional_tone,
              cultural_sensitivity_level: analysis.cultural_sensitivity_level,
              requires_elder_review: analysis.requires_elder_review,
              key_insights: analysis.key_insights,
              related_topics: analysis.related_topics,
              processing_time_ms: analysis.processing_time_ms,
              analyzed_at: new Date().toISOString()
            }
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', transcriptId)

      console.log(`✅ Stored ${analysis.themes.length} themes and ${analysis.key_quotes.length} quotes`)
    })

    // Step 4: Store rich quotes in extracted_quotes table
    await step.run('store-quotes', async () => {
      console.log('💬 Storing detailed quotes...')

      const quoteRecords = analysis.key_quotes.map(quote => ({
        quote_text: quote.text,
        context: quote.context,
        source_id: transcriptId,
        source_type: 'transcript',
        author_id: transcript.storyteller_id,
        author_name: transcript.profile?.display_name,
        themes: [quote.theme],
        sentiment: analysis.emotional_tone,
        impact_score: Math.round(quote.impact_score * 20), // Convert 0-5 to 0-100
        organization_id: transcript.organization_id,
        project_id: transcript.project_id
      }))

      if (quoteRecords.length > 0) {
        const { error } = await supabase
          .from('extracted_quotes')
          .insert(quoteRecords)

        if (error) {
          console.error('Failed to store quotes:', error)
          // Don't fail the job if quote storage fails
        } else {
          console.log(`✅ Stored ${quoteRecords.length} detailed quotes`)
        }
      }
    })

    // Step 5: Update profile metrics (if needed)
    await step.run('update-metrics', async () => {
      console.log('📊 Updating metrics...')

      // Increment storyteller's total_impact_insights
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_impact_insights')
        .eq('id', transcript.storyteller_id)
        .single()

      if (profile) {
        await supabase
          .from('profiles')
          .update({
            total_impact_insights: (profile.total_impact_insights || 0) + analysis.pattern_insights.length,
            last_impact_analysis: new Date().toISOString()
          })
          .eq('id', transcript.storyteller_id)
      }
    })

    // Step 6: Generate storyteller bio if missing or short
    await step.run('generate-bio', async () => {
      console.log('📝 Generating storyteller bio...')

      if (!transcript.storyteller_id) {
        console.log('⏭️  No storyteller_id, skipping bio generation')
        return
      }

      // Check if profile already has a good bio
      const { data: profile } = await supabase
        .from('profiles')
        .select('bio, display_name, full_name, cultural_background, expertise_areas, community_roles')
        .eq('id', transcript.storyteller_id)
        .single()

      if (!profile) {
        console.log('⏭️  Profile not found, skipping bio generation')
        return
      }

      const existingBioLength = profile.bio?.length || 0

      // Only generate if bio is missing or very short
      if (existingBioLength > 400) {
        console.log(`⏭️  Bio already exists (${existingBioLength} chars), skipping generation`)
        return
      }

      const storytellerName = profile.display_name || profile.full_name || 'Unknown'
      const content = transcript.content || transcript.transcript_content || ''

      if (!content || content.length < 200) {
        console.log('⏭️  Transcript too short for bio generation')
        return
      }

      try {
        const bioResult = await generateBioFromTranscript(
          content,
          storytellerName,
          transcript.title,
          profile.bio
        )

        // Update profile with generated bio and extracted metadata
        const updateData: any = {
          bio: bioResult.bio,
          updated_at: new Date().toISOString()
        }

        if (bioResult.cultural_background && !profile.cultural_background) {
          updateData.cultural_background = bioResult.cultural_background
        }

        if (bioResult.expertise_areas && bioResult.expertise_areas.length > 0) {
          updateData.expertise_areas = bioResult.expertise_areas
        }

        if (bioResult.community_roles && bioResult.community_roles.length > 0) {
          updateData.community_roles = bioResult.community_roles
        }

        await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', transcript.storyteller_id)

        console.log(`✅ Generated bio for ${storytellerName} (${bioResult.bio.length} chars)`)

        if (bioResult.cultural_background) {
          console.log(`   Cultural background: ${bioResult.cultural_background}`)
        }
        if (bioResult.expertise_areas && bioResult.expertise_areas.length > 0) {
          console.log(`   Expertise areas: ${bioResult.expertise_areas.join(', ')}`)
        }
        if (bioResult.community_roles && bioResult.community_roles.length > 0) {
          console.log(`   Community roles: ${bioResult.community_roles.join(', ')}`)
        }

      } catch (error) {
        console.error('❌ Bio generation failed:', error)
        // Don't fail the entire job if bio generation fails
      }
    })

    // Return success result
    return {
      transcriptId,
      status: 'completed',
      themes: analysis.themes,
      quotes: analysis.key_quotes.length,
      summary_length: analysis.summary.length,
      processing_time_ms: analysis.processing_time_ms
    }
  }
)

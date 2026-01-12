import { inngest } from '../client'
import { createClient } from '@supabase/supabase-js'
import { analyzeTranscriptV3 } from '@/lib/ai/transcript-analyzer-v3-claude'
import { normalizeThemes } from '@/lib/ai/thematic-taxonomy'
import { generateBioFromTranscript } from '@/lib/ai/bio-generator'

/**
 * Background job for processing transcripts with AI (UPGRADED TO V3)
 *
 * Steps:
 * 1. Fetch transcript
 * 2. Run v3 Claude analysis (90-95% accuracy)
 * 3. Normalize themes using thematic taxonomy
 * 4. Extract and store quotes
 * 5. Store analysis in transcript_analysis_results
 * 6. Update status
 * 7. Generate bio if needed
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

    // Step 2: Run v3 Claude AI analysis
    const analysis = await step.run('analyze-content-v3', async () => {
      console.log('🤖 Running v3 Claude AI analysis...')

      const content = transcript.content || transcript.transcript_content || ''

      if (!content || content.length < 100) {
        throw new Error('Transcript content too short for analysis')
      }

      const result = await analyzeTranscriptV3(content, {
        extractQuotes: true,
        identifyThemes: true,
        assessCulturalSensitivity: true,
        suggestStoryStructure: false
      })

      // Normalize themes using thematic taxonomy
      const normalizedThemes = normalizeThemes(result.themes)

      return {
        ...result,
        themes: normalizedThemes,
        summary: result.summary || '',
        key_quotes: result.quotes || [],
        emotional_tone: result.culturalSensitivity?.tone || 'neutral',
        cultural_sensitivity_level: result.culturalSensitivity?.level || 'standard',
        requires_elder_review: result.culturalSensitivity?.requiresElderReview || false,
        key_insights: result.themes.slice(0, 5),
        related_topics: result.themes.map(t => t.name),
        processing_time_ms: result.processingTimeMs || 0,
        pattern_insights: [] // v3 doesn't use pattern insights
      }
    })

    // Step 3: Store themes and quotes (DUAL-WRITE PATTERN)
    await step.run('store-analysis', async () => {
      console.log('💾 Storing analysis results...')

      // Prepare analysis record for transcript_analysis_results table
      const analysisRecord = {
        transcript_id: transcriptId,
        analyzer_version: 'v3',
        themes: analysis.themes,
        quotes: analysis.key_quotes,
        cultural_flags: {
          emotional_tone: analysis.emotional_tone,
          cultural_sensitivity_level: analysis.cultural_sensitivity_level,
          requires_elder_review: analysis.requires_elder_review
        },
        quality_metrics: {
          themes_count: analysis.themes.length,
          quotes_count: analysis.key_quotes.length,
          summary_length: analysis.summary.length,
          processing_time_ms: analysis.processing_time_ms
        },
        processing_time_ms: analysis.processing_time_ms
      }

      // DUAL-WRITE: Update both tables in parallel
      const [transcriptResult, analysisResult] = await Promise.allSettled([
        // Write 1: Update transcript fields (existing pattern)
        supabase
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
          .eq('id', transcriptId),

        // Write 2: Create versioned analysis record (NEW)
        supabase
          .from('transcript_analysis_results')
          .upsert(analysisRecord, {
            onConflict: 'transcript_id,analyzer_version',
            ignoreDuplicates: false
          })
      ])

      // Check for errors
      if (transcriptResult.status === 'rejected') {
        console.error('❌ Failed to update transcript:', transcriptResult.reason)
        throw new Error('Failed to update transcript table')
      }

      if (analysisResult.status === 'rejected') {
        console.error('⚠️ Failed to store analysis record:', analysisResult.reason)
        // Log warning but don't fail the job - transcript update succeeded
      } else {
        console.log('✅ Stored analysis in transcript_analysis_results (v3)')
      }

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

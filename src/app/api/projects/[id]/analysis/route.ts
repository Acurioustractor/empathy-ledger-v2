import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { extractIntelligentQuotes } from '@/lib/ai/intelligent-quote-extractor'
import { assessIndigenousImpact, aggregateIndigenousImpact } from '@/lib/ai/intelligent-indigenous-impact-analyzer'
import { extractQuotesWithClaude } from '@/lib/ai/claude-quote-extractor'
import { assessImpactWithClaude, aggregateClaudeImpact } from '@/lib/ai/claude-impact-analyzer'
import crypto from 'crypto'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Helper: Calculate hash of transcript content for cache invalidation
function calculateContentHash(transcriptTexts: string[]): string {
  const combined = transcriptTexts.sort().join('|||')
  return crypto.createHash('sha256').update(combined).digest('hex')
}

// Server-side interface definitions
interface IndigenousImpactInsight {
  impactType: 'cultural_protocol' | 'community_leadership' | 'knowledge_transmission' |
              'healing_integration' | 'relationship_building' | 'system_navigation' |
              'collective_mobilization' | 'intergenerational_connection'
  evidence: {
    quote: string
    context: string
    speaker_role?: string
    confidence: number
  }
  impactDimensions: {
    relationshipStrengthening: number
    culturalContinuity: number
    communityEmpowerment: number
    systemTransformation: number
    healingProgression: number
    knowledgePreservation: number
  }
  sovereigntyMarkers: {
    communityLedDecisionMaking: boolean
    culturalProtocolsRespected: boolean
    externalSystemsResponding: boolean
    resourceControlIncreasing: boolean
  }
  transformationEvidence: string[]
  created_at: string
  transcript_id: string
  community_context?: string
}

interface ProjectAnalysisData {
  projectInfo: {
    id: string
    name: string
    description: string
    organizationName: string
    storytellerCount: number
    transcriptCount: number
  }
  storytellers: Array<{
    id: string
    displayName: string
    profileImageUrl?: string
    bio?: string
    culturalBackground?: string
    transcriptCount: number
    themes: string[]
    impactInsights: IndigenousImpactInsight[]
  }>
  aggregatedInsights: {
    overallThemes: Array<{ theme: string; frequency: number; storytellers: string[] }>
    impactFramework: {
      relationshipStrengthening: number
      culturalContinuity: number
      communityEmpowerment: number
      systemTransformation: number
      healingProgression: number
      knowledgePreservation: number
    }
    powerfulQuotes: Array<{
      quote: string
      speaker: string
      impactType: string
      confidence: number
    }>
    recommendations: {
      continuationSuggestions: string[]
      keyConnections: string[]
      systemChangeOpportunities: string[]
      communityEngagementStrategy: string[]
    }
  }
  humanStoryExtracts: {
    transformationMoments: string[]
    wisdomShared: string[]
    challengesOvercome: string[]
    communityImpact: string[]
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params
    const supabase = createSupabaseServerClient()

    // Check which AI model to use
    const { searchParams } = new URL(request.url)
    const useIntelligentAI = searchParams.get('intelligent') === 'true'
    const aiModel = searchParams.get('model') || 'gpt-4o-mini' // gpt-4o-mini (default, fast & good), claude (best quality, slower), gpt-4o, legacy

    console.log('🔍 Analyzing project:', projectId, useIntelligentAI ? `(Intelligent AI - ${aiModel})` : '(Legacy)')

    // Get project details with organisation
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        description,
        created_at,
        organisations:organization_id(
          id,
          name,
          type
        )
      `)
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      console.error('Error fetching project:', projectError)
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get all storytellers with transcripts for this project
    const { data: transcripts, error: transcriptsError } = await supabase
      .from('transcripts')
      .select(`
        id,
        title,
        text,
        transcript_content,
        formatted_text,
        metadata,
        storyteller_id,
        created_at,
        profiles:storyteller_id(
          id,
          display_name,
          full_name,
          profile_image_url,
          bio,
          cultural_background,
          is_elder,
          is_featured
        )
      `)
      .eq('project_id', projectId)
      .not('storyteller_id', 'is', null)
      .order('created_at', { ascending: false })

    if (transcriptsError) {
      console.error('Error fetching transcripts:', transcriptsError)
      return NextResponse.json({ error: 'Failed to fetch project transcripts' }, { status: 500 })
    }

    console.log(`📊 Found ${transcripts?.length || 0} transcripts for project analysis`)

    // Organize storytellers and their transcripts
    const storytellerMap = new Map()
    const allTranscriptTexts: string[] = []

    transcripts?.forEach(transcript => {
      if (transcript.profiles) {
        const storytellerId = transcript.storyteller_id
        const storyteller = transcript.profiles

        if (!storytellerMap.has(storytellerId)) {
          storytellerMap.set(storytellerId, {
            id: storytellerId,
            displayName: storyteller.display_name || storyteller.full_name,
            profileImageUrl: storyteller.profile_image_url,
            bio: storyteller.bio,
            culturalBackground: storyteller.cultural_background,
            isElder: storyteller.is_elder,
            isFeatured: storyteller.is_featured,
            transcripts: [],
            themes: [],
            impactInsights: []
          })
        }

        const transcriptText = transcript.text || transcript.transcript_content || transcript.formatted_text
        if (transcriptText) {
          storytellerMap.get(storytellerId).transcripts.push({
            id: transcript.id,
            title: transcript.title,
            text: transcriptText,
            metadata: transcript.metadata
          })
          allTranscriptTexts.push(transcriptText)
        }
      }
    })

    const storytellers = Array.from(storytellerMap.values())
    console.log(`👥 Analyzing ${storytellers.length} storytellers`)

    // ========================================================================
    // CACHE CHECK - Only regenerate if content has changed
    // ========================================================================
    const contentHash = calculateContentHash(allTranscriptTexts)
    const forceRegenerate = searchParams.get('regenerate') === 'true'

    if (useIntelligentAI && !forceRegenerate) {
      console.log(`🔍 Checking cache for project ${projectId} with model ${aiModel}...`)

      // Use service role client for database operations
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const { data: cachedAnalysis, error: cacheError } = await supabaseAdmin
        .from('project_analyses')
        .select('*')
        .eq('project_id', projectId)
        .eq('model_used', aiModel)
        .eq('content_hash', contentHash)
        .order('analyzed_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (cachedAnalysis && !cacheError) {
        console.log(`✅ Cache HIT! Returning cached analysis from ${cachedAnalysis.analyzed_at}`)
        return NextResponse.json({
          success: true,
          analysis_type: 'intelligent_ai',
          model_used: aiModel,
          cached: true,
          cached_at: cachedAnalysis.analyzed_at,
          intelligentAnalysis: cachedAnalysis.analysis_data
        })
      } else {
        console.log(`❌ Cache MISS. Generating new analysis...`)
      }
    }

    // ========================================================================
    // INTELLIGENT AI ANALYSIS (Flag-based)
    // ========================================================================
    if (useIntelligentAI) {
      console.log(`🧠 Using Intelligent AI for analysis (Model: ${aiModel})...`)

      // Fetch project context for context-aware analysis
      let projectContext: any = null
      try {
        const { data: projectData } = await supabase
          .from('projects')
          .select('context_model, context_description')
          .eq('id', projectId)
          .single()

        if (projectData?.context_model === 'quick' && projectData.context_description) {
          console.log('📋 Using quick project context for analysis')
          // Use quick extractor to get structured context
          const { extractQuickProfile } = await import('@/lib/ai/project-profile-extractor')
          projectContext = await extractQuickProfile(projectData.context_description, project.name)
          projectContext.model = 'quick'
          projectContext.description = projectData.context_description // Add original description for outcomes analysis
        } else if (projectData?.context_model === 'full') {
          console.log('📋 Using full project profile for analysis')
          const { data: profile } = await supabase
            .from('project_profiles')
            .select('*')
            .eq('project_id', projectId)
            .single()

          if (profile) {
            projectContext = {
              model: 'full',
              mission: profile.mission,
              primary_goals: profile.primary_goals,
              outcome_categories: profile.outcome_categories,
              positive_language: profile.positive_language,
              cultural_values: profile.cultural_values
            }
          }
        }

        if (projectContext) {
          console.log(`✅ Project context loaded - will extract project-aligned quotes`)
        }
      } catch (error: any) {
        console.warn('⚠️  Could not load project context:', error.message)
        // Continue without context
      }

      // Process all transcripts with intelligent AI in parallel
      const transcriptsWithText = transcripts?.filter(t =>
        t.text || t.transcript_content || t.formatted_text
      ) || []

      console.log(`📝 Analyzing ${transcriptsWithText.length} transcripts with ${aiModel}...`)

      // Process transcripts - use batching for Claude to avoid concurrent connection limits
      let intelligentResults: any[] = []

      if (aiModel === 'claude') {
        // Claude: Process in small batches with delays to respect rate limits
        const BATCH_SIZE = 2 // Small batches to avoid usage acceleration limits
        const DELAY_MS = 2000 // 2 second delay between batches
        console.log(`🔄 Processing in batches of ${BATCH_SIZE} for Claude (with ${DELAY_MS}ms delays)...`)

        for (let i = 0; i < transcriptsWithText.length; i += BATCH_SIZE) {
          const batch = transcriptsWithText.slice(i, i + BATCH_SIZE)
          const batchNum = Math.floor(i / BATCH_SIZE) + 1
          const totalBatches = Math.ceil(transcriptsWithText.length / BATCH_SIZE)
          console.log(`   Batch ${batchNum}/${totalBatches}: Processing ${batch.length} transcripts...`)

          const batchResults = await Promise.all(
            batch.map(async (t) => {
              const text = t.text || t.transcript_content || t.formatted_text
              const storytellerName = t.profiles?.display_name || t.profiles?.full_name || 'Unknown'

              const [quotes, impact] = await Promise.all([
                extractQuotesWithClaude(text!, storytellerName, 5),
                assessImpactWithClaude(text!, storytellerName)
              ])

              return {
                transcript_id: t.id,
                storyteller_id: t.storyteller_id,
                storyteller_name: storytellerName,
                quotes,
                impact
              }
            })
          )

          intelligentResults.push(...batchResults)

          // Add delay between batches (except after last batch)
          if (i + BATCH_SIZE < transcriptsWithText.length) {
            console.log(`   ⏱️  Waiting ${DELAY_MS}ms before next batch...`)
            await new Promise(resolve => setTimeout(resolve, DELAY_MS))
          }
        }
      } else {
        // GPT models: Process all at once (higher concurrent limits)
        intelligentResults = await Promise.all(
          transcriptsWithText.map(async (t) => {
            const text = t.text || t.transcript_content || t.formatted_text
            const storytellerName = t.profiles?.display_name || t.profiles?.full_name || 'Unknown'

            const [quotes, impact] = await Promise.all([
              extractIntelligentQuotes(text!, storytellerName, 5, projectContext),
              assessIndigenousImpact(text!, storytellerName)
            ])

            return {
              transcript_id: t.id,
              storyteller_id: t.storyteller_id,
              storyteller_name: storytellerName,
              quotes,
              impact
            }
          })
        )
      }

      console.log('✅ Intelligent analysis complete')

      // Aggregate impact across all transcripts - use appropriate aggregation function
      const aggregatedImpact = aiModel === 'claude'
        ? aggregateClaudeImpact(intelligentResults.map(r => r.impact))
        : aggregateIndigenousImpact(intelligentResults.map(r => r.impact))

      // Collect all quotes
      const allIntelligentQuotes = intelligentResults.flatMap(r =>
        r.quotes.powerful_quotes.map(q => ({
          ...q,
          storyteller: r.storyteller_name,
          transcript_id: r.transcript_id
        }))
      ).sort((a, b) => b.confidence_score - a.confidence_score)

      // Analyze project-specific outcomes if context exists
      let projectOutcomes = null
      if (projectContext && projectContext.description) {
        try {
          console.log('📊 Analyzing project-specific outcomes...')
          const { analyzeProjectOutcomes } = await import('@/lib/ai/project-outcomes-tracker')

          projectOutcomes = await analyzeProjectOutcomes(
            project.name,
            projectContext.description,
            transcriptsWithText.map(t => ({
              text: t.text || '',
              storyteller: storytellerMap.get(t.storyteller_id!)?.displayName || 'Unknown'
            }))
          )

          console.log(`✅ Project outcomes analyzed: ${projectOutcomes.outcomes.length} outcomes tracked`)
        } catch (error: any) {
          console.error('⚠️  Could not analyze project outcomes:', error.message)
        }
      }

      // Return intelligent analysis results
      const projectInfo = {
        id: project.id,
        name: project.name,
        description: project.description,
        organizationName: project.organisations?.name,
        storytellerCount: storytellers.length,
        transcriptCount: transcripts?.length || 0
      }

      // Prepare the analysis data
      const intelligentAnalysisData = {
        projectInfo, // Include here too for compatibility
        storyteller_results: intelligentResults.map(r => ({
          storyteller_id: r.storyteller_id,
          storyteller_name: r.storyteller_name,
          transcript_count: 1, // Per transcript
          quotes: {
            total: r.quotes.powerful_quotes.length,
            average_quality: r.quotes.powerful_quotes.reduce((sum, q) => sum + q.confidence_score, 0) / r.quotes.powerful_quotes.length || 0,
            top_quotes: r.quotes.powerful_quotes.slice(0, 3)
          },
          impact: {
            assessments: r.impact.assessments,
            overall_summary: r.impact.overall_impact_summary,
            key_strengths: r.impact.key_strengths
          }
        })),
        aggregated_impact: aggregatedImpact,
        all_quotes: allIntelligentQuotes.slice(0, 20), // Top 20 quotes
        processing_metadata: {
          total_transcripts: transcriptsWithText.length,
          total_quotes: allIntelligentQuotes.length,
          average_quote_quality: allIntelligentQuotes.reduce((sum, q) => sum + q.confidence_score, 0) / allIntelligentQuotes.length || 0
        },
        // Legacy UI compatibility fields
        storytellers: intelligentResults.map(r => {
          const storytellerProfile = storytellerMap.get(r.storyteller_id) || {}
          return {
            id: r.storyteller_id,
            name: r.storyteller_name,
            displayName: r.storyteller_name,
            transcriptCount: 1,
            profileImageUrl: storytellerProfile.profileImageUrl || null,
            themes: Array.from(new Set(r.quotes.powerful_quotes?.flatMap(q => q.themes) || [])),
            culturalBackground: storytellerProfile.culturalBackground || null,
            impactInsights: r.impact?.assessments || []
          }
        }),
        aggregatedInsights: {
          overallThemes: (() => {
            // Build theme map with frequency and storytellers
            const themeMap = new Map<string, { theme: string; frequency: number; storytellers: Set<string> }>()

            allIntelligentQuotes.forEach((q, index) => {
              // Safety check for quote structure
              if (!q || typeof q !== 'object') {
                console.warn(`⚠️  Invalid quote at index ${index}:`, q)
                return
              }

              const themes = Array.isArray(q.themes) ? q.themes : []
              const storyteller = q.storyteller || 'Unknown'

              themes.forEach(theme => {
                if (theme && typeof theme === 'string') {
                  if (!themeMap.has(theme)) {
                    themeMap.set(theme, { theme, frequency: 0, storytellers: new Set() })
                  }
                  const themeData = themeMap.get(theme)!
                  themeData.frequency++
                  themeData.storytellers.add(storyteller)
                }
              })
            })

            return Array.from(themeMap.values())
              .map(t => ({ ...t, storytellers: Array.from(t.storytellers) }))
              .sort((a, b) => b.frequency - a.frequency)
          })(),
          impactFramework: aggregatedImpact.average_scores || {},
          projectOutcomes: projectOutcomes, // Project-specific outcomes tracker
          powerfulQuotes: allIntelligentQuotes.slice(0, 10).map(q => ({
            quote: q.text,
            speaker: q.storyteller,
            impactType: q.category,
            confidence: q.confidence_score / 100 // Convert to 0-1 range
          })),
          humanStoryExtracts: {
            transformationMoments: allIntelligentQuotes
              .filter(q => q.category === 'transformation')
              .slice(0, 5)
              .map(q => q.text),
            wisdomShared: allIntelligentQuotes
              .filter(q => q.category === 'wisdom')
              .slice(0, 5)
              .map(q => q.text),
            challengesOvercome: allIntelligentQuotes
              .filter(q => q.category === 'challenge')
              .slice(0, 5)
              .map(q => q.text),
            communityImpact: allIntelligentQuotes
              .filter(q => q.category === 'impact' || q.category === 'cultural_insight')
              .slice(0, 5)
              .map(q => q.text)
          }
        }
      }

      // Save analysis to cache for future requests
      try {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { error: cacheError } = await supabaseAdmin
          .from('project_analyses')
          .upsert({
            project_id: projectId,
            model_used: aiModel,
            analysis_type: 'intelligent_ai',
            content_hash: contentHash,
            analysis_data: intelligentAnalysisData,
            analyzed_at: new Date().toISOString()
          }, {
            onConflict: 'project_id,model_used,content_hash'
          })

        if (cacheError) {
          console.warn('⚠️  Failed to cache analysis (non-critical):', cacheError.message)
        } else {
          console.log('💾 Analysis cached successfully for future requests')
        }
      } catch (cacheError) {
        console.warn('⚠️  Cache save error (non-critical):', cacheError)
      }

      return NextResponse.json({
        success: true,
        analysis_type: 'intelligent_ai',
        model_used: aiModel,
        cached: false,
        projectInfo,
        intelligentAnalysis: intelligentAnalysisData,
        generatedAt: new Date().toISOString()
      })
    }

    // ========================================================================
    // LEGACY ANALYSIS (Original keyword-based system)
    // ========================================================================
    console.log('📊 Using legacy keyword-based analysis...')

    // Analyze each storyteller's contributions using server-side pattern matching
    for (const storyteller of storytellers) {
      const combinedText = storyteller.transcripts.map((t: any) => t.text).join('\n\n')

      // Analyze themes using server-side pattern matching
      storyteller.themes = extractKeyThemes(combinedText)

      // Analyze Indigenous impact insights using server-side analysis
      storyteller.impactInsights = analyzeIndigenousImpact(combinedText)
    }

    // Generate comprehensive project analysis
    const analysisResult = await generateProjectAnalysis({
      project,
      storytellers,
      allTranscriptTexts: allTranscriptTexts
    })

    console.log('✅ Project analysis completed successfully')

    return NextResponse.json({
      success: true,
      analysis_type: 'legacy',
      analysis: analysisResult,
      generatedAt: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('💥 Project analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

async function generateProjectAnalysis({
  project,
  storytellers,
  allTranscriptTexts
}: {
  project: any
  storytellers: any[]
  allTranscriptTexts: string[]
}): Promise<ProjectAnalysisData> {

  // Aggregate all impact insights
  const allImpactInsights = storytellers.reduce((acc: IndigenousImpactInsight[], s) => {
    return acc.concat(s.impactInsights)
  }, [])

  // Calculate impact framework scores
  const impactFramework = calculateAggregatedImpact(allImpactInsights)

  // Extract themes and frequency
  const themeFrequency = new Map<string, { frequency: number; storytellers: string[] }>()
  storytellers.forEach(storyteller => {
    storyteller.themes.forEach((theme: string) => {
      if (!themeFrequency.has(theme)) {
        themeFrequency.set(theme, { frequency: 0, storytellers: [] })
      }
      const themeData = themeFrequency.get(theme)!
      themeData.frequency++
      themeData.storytellers.push(storyteller.displayName)
    })
  })

  const overallThemes = Array.from(themeFrequency.entries())
    .map(([theme, data]) => ({ theme, frequency: data.frequency, storytellers: data.storytellers }))
    .sort((a, b) => b.frequency - a.frequency)

  // Extract powerful quotes
  const powerfulQuotes = allImpactInsights
    .filter(insight => insight.evidence.confidence > 0.7)
    .sort((a, b) => b.evidence.confidence - a.evidence.confidence)
    .slice(0, 10)
    .map(insight => {
      // Find the storyteller who has this insight
      const storyteller = storytellers.find(s => {
        return s.impactInsights.some((si: any) =>
          si.evidence.quote === insight.evidence.quote &&
          si.impactType === insight.impactType
        )
      })

      return {
        quote: insight.evidence.quote,
        speaker: storyteller?.displayName || 'Unknown',
        impactType: insight.impactType,
        confidence: insight.evidence.confidence
      }
    })

  // Generate AI-powered recommendations
  const recommendations = await generateProjectRecommendations({
    projectName: project.name,
    organizationName: project.organisations?.name,
    themes: overallThemes,
    impactInsights: allImpactInsights,
    storytellers,
    transcriptTexts: allTranscriptTexts.slice(0, 5) // Sample of transcripts for context
  })

  // Extract human story elements
  const humanStoryExtracts = await extractHumanStoryElements(allTranscriptTexts)

  return {
    projectInfo: {
      id: project.id,
      name: project.name,
      description: project.description || '',
      organizationName: project.organisations?.name || 'Unknown Organization',
      storytellerCount: storytellers.length,
      transcriptCount: storytellers.reduce((total, s) => total + s.transcripts.length, 0)
    },
    storytellers: storytellers.map(s => ({
      id: s.id,
      displayName: s.displayName,
      profileImageUrl: s.profileImageUrl,
      bio: s.bio,
      culturalBackground: s.culturalBackground,
      transcriptCount: s.transcripts.length,
      themes: s.themes,
      impactInsights: s.impactInsights
    })),
    aggregatedInsights: {
      overallThemes,
      impactFramework,
      powerfulQuotes,
      recommendations
    },
    humanStoryExtracts
  }
}

function calculateAggregatedImpact(insights: IndigenousImpactInsight[]) {
  if (insights.length === 0) {
    return {
      relationshipStrengthening: 0,
      culturalContinuity: 0,
      communityEmpowerment: 0,
      systemTransformation: 0,
      healingProgression: 0,
      knowledgePreservation: 0
    }
  }

  const totals = insights.reduce((acc, insight) => {
    Object.keys(acc).forEach(key => {
      acc[key as keyof typeof acc] += insight.impactDimensions[key as keyof typeof insight.impactDimensions]
    })
    return acc
  }, {
    relationshipStrengthening: 0,
    culturalContinuity: 0,
    communityEmpowerment: 0,
    systemTransformation: 0,
    healingProgression: 0,
    knowledgePreservation: 0
  })

  // Normalize by number of insights
  Object.keys(totals).forEach(key => {
    totals[key as keyof typeof totals] = totals[key as keyof typeof totals] / insights.length
  })

  return totals
}

async function generateProjectRecommendations({
  projectName,
  organizationName,
  themes,
  impactInsights,
  storytellers,
  transcriptTexts
}: {
  projectName: string
  organizationName?: string
  themes: any[]
  impactInsights: IndigenousImpactInsight[]
  storytellers: any[]
  transcriptTexts: string[]
}) {

  const topThemes = themes.slice(0, 5).map(t => t.theme).join(', ')
  const impactTypes = [...new Set(impactInsights.map(i => i.impactType))]

  const systemPrompt = `You are an expert in Indigenous community development, systems change, and storytelling impact analysis.
Your role is to provide strategic recommendations for continuing and expanding community-led projects based on real stories and impacts.
Focus on community sovereignty, cultural protocols, relationship-building, and sustainable change.`

  const userPrompt = `Analyze this project and provide strategic recommendations for continuation and expansion:

PROJECT: ${projectName}
ORGANIZATION: ${organizationName}
STORYTELLERS: ${storytellers.length} community members
KEY THEMES: ${topThemes}
IMPACT AREAS: ${impactTypes.join(', ')}

SAMPLE COMMUNITY VOICES:
${transcriptTexts.slice(0, 2).map((text, i) => `Story ${i + 1}: ${text.substring(0, 500)}...`).join('\n\n')}

Provide recommendations in these areas:

1. CONTINUATION STRATEGIES - How to sustainably continue this project respecting community leadership
2. KEY CONNECTIONS - Who else should be involved (other communities, organisations, individuals)
3. SYSTEM CHANGE OPPORTUNITIES - Where this project could influence policy, institutions, or broader systems
4. COMMUNITY ENGAGEMENT - How to deepen community ownership and expand participation

Focus on:
- Community sovereignty and self-determination
- Cultural protocol and respect
- Relationship-based approaches
- Concrete, actionable steps
- Building on existing strengths
- Sustainable, long-term impact

Return your response as a JSON object with these keys: continuationSuggestions, keyConnections, systemChangeOpportunities, communityEngagementStrategy`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')

    return {
      continuationSuggestions: result.continuationSuggestions || [],
      keyConnections: result.keyConnections || [],
      systemChangeOpportunities: result.systemChangeOpportunities || [],
      communityEngagementStrategy: result.communityEngagementStrategy || []
    }
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return {
      continuationSuggestions: ['Continue regular community gathering sessions'],
      keyConnections: ['Local elders and community leaders'],
      systemChangeOpportunities: ['Policy advocacy for community-led initiatives'],
      communityEngagementStrategy: ['Expand storytelling circles to include more voices']
    }
  }
}

async function extractHumanStoryElements(transcriptTexts: string[]) {
  const allText = transcriptTexts.join('\n\n')

  // Use pattern matching to find key story elements
  const transformationPatterns = /\b(changed|transformed|different|overcome|breakthrough|realised|learned|growth)\b.*?[.!?]/gi
  const wisdomPatterns = /\b(wisdom|teaching|learned|understand|realise|important|advice|knowledge)\b.*?[.!?]/gi
  const challengePatterns = /\b(difficult|challenge|struggle|hard|overcome|fight|tough|barrier)\b.*?[.!?]/gi
  const impactPatterns = /\b(community|together|help|support|change|impact|difference|better)\b.*?[.!?]/gi

  const transformationMoments = [...allText.matchAll(transformationPatterns)]
    .map(match => match[0].trim())
    .slice(0, 5)

  const wisdomShared = [...allText.matchAll(wisdomPatterns)]
    .map(match => match[0].trim())
    .slice(0, 5)

  const challengesOvercome = [...allText.matchAll(challengePatterns)]
    .map(match => match[0].trim())
    .slice(0, 5)

  const communityImpact = [...allText.matchAll(impactPatterns)]
    .map(match => match[0].trim())
    .slice(0, 5)

  return {
    transformationMoments,
    wisdomShared,
    challengesOvercome,
    communityImpact
  }
}

// Server-side analysis functions (replacing client-side imports)

function extractKeyThemes(text: string): string[] {
  const themes: string[] = []
  const lowerText = text.toLowerCase()

  // Theme patterns for server-side analysis
  const themePatterns = {
    'Personal Growth': /\b(learn|grow|change|develop|transform|overcome)\w*\b/gi,
    'Family & Relationships': /\b(family|parent|child|friend|relationship|love|support)\w*\b/gi,
    'Cultural Heritage': /\b(tradition|culture|heritage|ancestor|ritual|ceremony)\w*\b/gi,
    'Community': /\b(community|neighbour|together|collective|group|social)\w*\b/gi,
    'Challenges': /\b(difficult|hard|struggle|problem|challenge|obstacle)\w*\b/gi,
    'Success & Achievement': /\b(success|achieve|accomplish|proud|win|goal)\w*\b/gi,
    'Wisdom & Learning': /\b(wisdom|knowledge|learn|teach|understand|realise)\w*\b/gi,
    'Healing': /\b(healing|recovery|health|wellness|medicine|therapy)\w*\b/gi,
    'Land & Country': /\b(country|land|territory|place|home|island)\w*\b/gi,
    'Spirituality': /\b(spiritual|sacred|ceremony|prayer|belief|faith)\w*\b/gi
  }

  for (const [theme, pattern] of Object.entries(themePatterns)) {
    const matches = text.match(pattern)
    if (matches && matches.length >= 2) {
      themes.push(theme)
    }
  }

  return themes.slice(0, 8) // Limit to top 8 themes
}

function analyzeIndigenousImpact(text: string): IndigenousImpactInsight[] {
  const insights: IndigenousImpactInsight[] = []
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20)

  // Indigenous success patterns for server-side analysis
  const impactPatterns = {
    'cultural_protocol': [
      'welcome', 'welcomed', 'invitation', 'permission', 'respect', 'protocol',
      'traditional owners', 'country', 'cultural safety', 'tread softly'
    ],
    'community_leadership': [
      'community leadership', 'community ownership', 'our mob', 'community led',
      'we decide', 'our choice', 'community control', 'self determination'
    ],
    'knowledge_transmission': [
      'matriarchal', 'lineage', 'healers', 'passed down', 'grandmother taught',
      'elder teachings', 'traditional knowledge', 'wisdom', 'generations'
    ],
    'healing_integration': [
      'medical experts', 'cultural guides', 'traditional healing', 'modern medicine',
      'holistic', 'integrated approach', 'both ways', 'community healing'
    ],
    'relationship_building': [
      'trust', 'relationship', 'connection', 'bridge', 'together', 'partnership',
      'collaboration', 'community bonds', 'bringing people together'
    ],
    'system_navigation': [
      'government', 'policy', 'advocacy', 'speaking up', 'fighting for',
      'voice heard', 'changing the system', 'institutional change'
    ],
    'collective_mobilization': [
      'community together', 'mobilize', 'organise', 'coming together', 'united',
      'collective action', 'community response', 'solidarity'
    ],
    'intergenerational_connection': [
      'young kids', 'children', 'youth', 'elder', 'grandmother', 'grandfather',
      'next generation', 'teaching young people', 'learning from elders'
    ]
  }

  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()

    for (const [impactType, patterns] of Object.entries(impactPatterns)) {
      for (const pattern of patterns) {
        if (lowerSentence.includes(pattern.toLowerCase())) {
          const insight = createImpactInsight(
            impactType as any,
            sentence,
            pattern,
            text
          )
          if (insight) {
            insights.push(insight)
          }
          break // Only one insight per sentence per impact type
        }
      }
    }
  }

  return insights.slice(0, 10) // Limit to top 10 insights
}

function createImpactInsight(
  impactType: IndigenousImpactInsight['impactType'],
  sentence: string,
  matchedPattern: string,
  fullText: string
): IndigenousImpactInsight | null {

  // Get surrounding context
  const context = extractContext(sentence, fullText)

  // Calculate impact dimensions based on community values
  const impactDimensions = calculateImpactDimensions(sentence, impactType)

  // Identify sovereignty markers
  const sovereigntyMarkers = identifySovereigntyMarkers(sentence)

  // Extract transformation evidence
  const transformationEvidence = extractTransformationEvidence(sentence)

  return {
    impactType,
    evidence: {
      quote: sentence.trim(),
      context: context,
      confidence: calculateAnalysisConfidence(sentence, matchedPattern)
    },
    impactDimensions,
    sovereigntyMarkers,
    transformationEvidence,
    created_at: new Date().toISOString(),
    transcript_id: '', // Will be set by caller
  }
}

function calculateImpactDimensions(
  sentence: string,
  impactType: IndigenousImpactInsight['impactType']
) {
  const lower = sentence.toLowerCase()

  // Base scores for different impact types
  const baseScores = {
    relationshipStrengthening: 0,
    culturalContinuity: 0,
    communityEmpowerment: 0,
    systemTransformation: 0,
    healingProgression: 0,
    knowledgePreservation: 0
  }

  // Adjust scores based on impact type and content
  switch (impactType) {
    case 'cultural_protocol':
      baseScores.culturalContinuity = 0.9
      baseScores.relationshipStrengthening = 0.7
      break
    case 'community_leadership':
      baseScores.communityEmpowerment = 0.9
      baseScores.systemTransformation = 0.6
      break
    case 'knowledge_transmission':
      baseScores.knowledgePreservation = 0.9
      baseScores.culturalContinuity = 0.8
      break
    case 'healing_integration':
      baseScores.healingProgression = 0.9
      baseScores.systemTransformation = 0.5
      break
    case 'relationship_building':
      baseScores.relationshipStrengthening = 0.9
      baseScores.communityEmpowerment = 0.6
      break
    case 'system_navigation':
      baseScores.systemTransformation = 0.9
      baseScores.communityEmpowerment = 0.7
      break
    default:
      baseScores.communityEmpowerment = 0.5
  }

  // Boost scores based on specific language patterns
  if (lower.includes('together') || lower.includes('collective')) {
    baseScores.communityEmpowerment += 0.1
  }
  if (lower.includes('traditional') || lower.includes('ancestral')) {
    baseScores.culturalContinuity += 0.1
  }
  if (lower.includes('healing') || lower.includes('health')) {
    baseScores.healingProgression += 0.1
  }

  return baseScores
}

function identifySovereigntyMarkers(sentence: string) {
  const lower = sentence.toLowerCase()

  return {
    communityLedDecisionMaking:
      lower.includes('we decide') || lower.includes('community led') ||
      lower.includes('our choice') || lower.includes('community ownership'),

    culturalProtocolsRespected:
      lower.includes('traditional') || lower.includes('cultural') ||
      lower.includes('protocol') || lower.includes('respect'),

    externalSystemsResponding:
      lower.includes('government') || lower.includes('policy') ||
      lower.includes('institution') || lower.includes('system'),

    resourceControlIncreasing:
      lower.includes('control') || lower.includes('ownership') ||
      lower.includes('access') || lower.includes('resources')
  }
}

function extractTransformationEvidence(sentence: string): string[] {
  const evidence: string[] = []
  const lower = sentence.toLowerCase()

  // Look for concrete change indicators
  if (lower.includes('now') || lower.includes('today') || lower.includes('different')) {
    evidence.push('Current state change mentioned')
  }
  if (lower.includes('before') || lower.includes('used to') || lower.includes('previously')) {
    evidence.push('Historical comparison made')
  }
  if (lower.includes('impact') || lower.includes('result') || lower.includes('outcome')) {
    evidence.push('Direct impact statement')
  }
  if (lower.includes('better') || lower.includes('improved') || lower.includes('stronger')) {
    evidence.push('Improvement indicated')
  }

  return evidence
}

function extractContext(sentence: string, fullText: string): string {
  const sentences = fullText.split(/[.!?]+/)
  let currentIndex = -1

  // Find the sentence in the full text
  for (let i = 0; i < sentences.length; i++) {
    if (sentences[i].includes(sentence.substring(0, 50))) {
      currentIndex = i
      break
    }
  }

  if (currentIndex === -1) return sentence

  // Get surrounding sentences for context
  const start = Math.max(0, currentIndex - 1)
  const end = Math.min(sentences.length, currentIndex + 2)

  return sentences.slice(start, end).join('. ').trim()
}

function calculateAnalysisConfidence(sentence: string, matchedPattern: string): number {
  let confidence = 0.6 // Base confidence

  // Increase confidence for exact pattern matches
  if (sentence.toLowerCase().includes(matchedPattern.toLowerCase())) {
    confidence += 0.2
  }

  // Increase confidence for longer, more detailed sentences
  if (sentence.length > 100) {
    confidence += 0.1
  }

  // Increase confidence for first-person narratives
  if (sentence.toLowerCase().includes('i ') || sentence.toLowerCase().includes('we ')) {
    confidence += 0.1
  }

  return Math.min(0.95, confidence) // Cap at 95%
}
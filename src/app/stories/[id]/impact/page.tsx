import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { StoryArcVisualization } from '@/components/impact/StoryArcVisualization'
import { RippleEffectVisualization } from '@/components/impact/RippleEffectVisualization'
import { EmpathyCard, CardContent, CardHeader } from '@/components/empathy-ledger'
import { analyzeStoryNarrativeArc } from '@/services/narrative-analysis'

/**
 * Individual Story Impact Page
 *
 * Shows impact analysis for a specific story including:
 * - Narrative arc visualization
 * - Ripple effects
 * - Community responses
 */

interface PageProps {
  params: {
    id: string
  }
}

export default async function StoryImpactPage({ params }: PageProps) {
  const supabase = await createClient()

  // Fetch story
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('*')
    .eq('id', params.id)
    .single()

  if (storyError || !story) {
    notFound()
  }

  // Fetch or generate narrative arc
  let { data: existingArc } = await supabase
    .from('story_narrative_arcs')
    .select('*')
    .eq('story_id', params.id)
    .single()

  // If no arc exists and we have a transcript, analyze it
  if (!existingArc && story.transcript) {
    try {
      const arcData = await analyzeStoryNarrativeArc(story.transcript, {
        method: 'openai',
        model: 'gpt-4o'
      })

      // Save to database
      const { data: newArc } = await supabase
        .from('story_narrative_arcs')
        .insert({
          story_id: params.id,
          ...arcData
        })
        .select()
        .single()

      existingArc = newArc
    } catch (error) {
      console.error('Failed to analyze story arc:', error)
    }
  }

  // Fetch ripple effects
  const { data: rippleEffects } = await supabase
    .from('ripple_effects')
    .select('*')
    .eq('story_id', params.id)
    .order('ripple_level', { ascending: true })

  // Fetch community responses
  const { data: responses } = await supabase
    .from('community_story_responses')
    .select('*')
    .eq('story_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Story Impact Analysis</h1>
        <p className="text-lg text-muted-foreground">{story.title}</p>
      </div>

      {/* Narrative Arc */}
      {existingArc ? (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Emotional Journey</h2>
          <StoryArcVisualization
            arc={existingArc}
            storyTitle={story.title}
            variant="detailed"
            showMetrics={true}
            showDescription={true}
          />
        </div>
      ) : (
        <EmpathyCard>
          <CardHeader
            title="Emotional Journey"
            subtitle="Not yet analyzed"
          />
          <CardContent>
            <p className="text-muted-foreground">
              {story.transcript
                ? 'Click the button below to analyze this story\'s emotional arc.'
                : 'This story needs a transcript before it can be analyzed.'}
            </p>
            {story.transcript && (
              <form action={async () => {
                'use server'
                const supabase = await createClient()
                const arcData = await analyzeStoryNarrativeArc(story.transcript!)
                await supabase.from('story_narrative_arcs').insert({
                  story_id: params.id,
                  ...arcData
                })
              }}>
                <button
                  type="submit"
                  className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Analyze Story Arc
                </button>
              </form>
            )}
          </CardContent>
        </EmpathyCard>
      )}

      {/* Ripple Effects */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Ripple Effects</h2>
        {rippleEffects && rippleEffects.length > 0 ? (
          <RippleEffectVisualization
            effects={rippleEffects}
            variant="detailed"
            allowReporting={true}
          />
        ) : (
          <EmpathyCard>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No ripple effects tracked yet for this story.
              </p>
              <p className="text-sm text-muted-foreground">
                Community members can report how this story has created impact in their lives and communities.
              </p>
            </CardContent>
          </EmpathyCard>
        )}
      </div>

      {/* Community Responses */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Community Responses</h2>
        {responses && responses.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {responses.map((response) => (
              <EmpathyCard key={response.id} variant="connection">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm font-medium capitalize">
                      {response.response_type?.replace(/_/g, ' ')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(response.response_date).toLocaleDateString()}
                    </div>
                  </div>

                  {response.emotional_reaction && (
                    <div className="mb-2 text-sm">
                      <span className="text-muted-foreground">Emotional reaction: </span>
                      <span className="capitalize">{response.emotional_reaction}</span>
                    </div>
                  )}

                  {response.response_text && (
                    <p className="text-sm mb-2">{response.response_text}</p>
                  )}

                  {response.personal_connection && (
                    <div className="text-sm text-muted-foreground italic">
                      "{response.personal_connection}"
                    </div>
                  )}

                  {response.action_inspired && (
                    <div className="mt-2 p-2 bg-primary-50 dark:bg-primary-950/30 rounded text-sm">
                      <strong>Action inspired:</strong> {response.action_inspired}
                    </div>
                  )}

                  {response.shared_with_others && (
                    <div className="mt-2 text-xs text-primary-600">
                      ✓ Shared with others
                    </div>
                  )}
                </CardContent>
              </EmpathyCard>
            ))}
          </div>
        ) : (
          <EmpathyCard>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                No community responses yet. Be the first to share how this story resonated with you.
              </p>
            </CardContent>
          </EmpathyCard>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <a
          href={`/stories/${params.id}`}
          className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-colors"
        >
          ← Back to Story
        </a>
      </div>
    </div>
  )
}

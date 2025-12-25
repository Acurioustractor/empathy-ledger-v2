import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ImpactDashboard } from '@/components/impact/ImpactDashboard'
import { StoryArcVisualization } from '@/components/impact/StoryArcVisualization'
import { SROIVisualization } from '@/components/impact/SROIVisualization'
import { RippleEffectVisualization } from '@/components/impact/RippleEffectVisualization'
import { ThemeEvolutionVisualization } from '@/components/impact/ThemeEvolutionVisualization'
import {
  InterpretationSessionForm,
  OutcomeHarvestingForm
} from '@/components/impact/ParticipatoryEvaluation'
import { EmpathyCard, CardContent, CardHeader } from '@/components/empathy-ledger'

/**
 * Impact Analysis Demo Page
 *
 * Demonstrates all impact analysis and visualization components
 * with example data and real database integration.
 */

export default async function ImpactAnalysisDemoPage() {
  const supabase = await createClient()

  // Fetch real data from database (will be empty initially)
  const { data: narrativeArcs } = await supabase
    .from('story_narrative_arcs')
    .select('*')
    .limit(10)

  const { data: themeEvolutions } = await supabase
    .from('theme_evolution')
    .select('*')
    .limit(50)

  const { data: rippleEffects } = await supabase
    .from('ripple_effects')
    .select('*')
    .limit(20)

  const { data: sroiInputs } = await supabase
    .from('sroi_inputs')
    .select('*')
    .limit(1)
    .single()

  const { data: sroiOutcomes } = await supabase
    .from('sroi_outcomes')
    .select('*')
    .limit(10)

  const { data: sroiCalculation } = await supabase
    .from('sroi_calculations')
    .select('*')
    .limit(1)
    .single()

  // Count totals for dashboard
  const { count: totalStories } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })

  const { count: totalStorytellers } = await supabase
    .from('storyteller_profiles')
    .select('*', { count: 'exact', head: true })

  const { count: totalOrganizations } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Impact Analysis System</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Comprehensive impact measurement and visualization for Indigenous storytelling.
            Track emotional journeys, calculate social return on investment, and measure ripple effects.
          </p>
        </div>

        {/* Quick Stats */}
        <EmpathyCard variant="warmth">
          <CardHeader
            title="System Status"
            subtitle="Current data in the platform"
          />
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl font-bold text-primary-600">
                  {narrativeArcs?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Story Arcs Analyzed</div>
              </div>

              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl font-bold text-primary-600">
                  {themeEvolutions?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Theme Evolution Records</div>
              </div>

              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl font-bold text-primary-600">
                  {rippleEffects?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Ripple Effects Tracked</div>
              </div>

              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl font-bold text-primary-600">
                  {sroiOutcomes?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">SROI Outcomes</div>
              </div>
            </div>
          </CardContent>
        </EmpathyCard>

        {/* Platform Dashboard */}
        {(narrativeArcs?.length || 0) > 0 || (sroiInputs && sroiOutcomes) ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">Platform Overview Dashboard</h2>
            <ImpactDashboard
              view="platform"
              narrativeArcs={narrativeArcs || []}
              themeEvolutions={themeEvolutions || []}
              sroiInputs={sroiInputs || undefined}
              sroiOutcomes={sroiOutcomes || []}
              sroiCalculation={sroiCalculation || undefined}
              rippleEffects={rippleEffects || []}
              totalStories={totalStories || 0}
              totalStorytellers={totalStorytellers || 0}
              totalOrganizations={totalOrganizations || 0}
              timeRange="All time"
            />
          </div>
        ) : (
          <EmpathyCard>
            <CardContent className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No Data Yet</h3>
              <p className="text-muted-foreground">
                Start by analyzing stories or creating SROI inputs to see the dashboard in action.
              </p>
            </CardContent>
          </EmpathyCard>
        )}

        {/* Example Components Section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">Component Examples</h2>

          {/* Story Arc Example */}
          <div>
            <h3 className="text-xl font-semibold mb-4">1. Story Arc Visualization</h3>
            <p className="text-muted-foreground mb-4">
              Visualizes the emotional journey through a story using sentiment analysis.
            </p>

            {narrativeArcs && narrativeArcs.length > 0 ? (
              <StoryArcVisualization
                arc={narrativeArcs[0]}
                variant="detailed"
                showMetrics={true}
              />
            ) : (
              <EmpathyCard variant="insight">
                <CardContent className="p-8">
                  <div className="text-center space-y-4">
                    <h4 className="font-semibold">Example: "Man in a Hole" Story Arc</h4>
                    <p className="text-sm text-muted-foreground">
                      This would show a line chart depicting an emotional journey that falls (struggle)
                      then rises (triumph). The visualization includes peak/valley markers, narrative
                      segments, and community validation indicators.
                    </p>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-xs">
                        <strong>To see live data:</strong> Analyze a story using the narrative-analysis service
                      </p>
                    </div>
                  </div>
                </CardContent>
              </EmpathyCard>
            )}
          </div>

          {/* SROI Example */}
          <div>
            <h3 className="text-xl font-semibold mb-4">2. SROI Analysis</h3>
            <p className="text-muted-foreground mb-4">
              Calculate and visualize Social Return on Investment following Social Value UK framework.
            </p>

            {sroiInputs && sroiOutcomes && sroiOutcomes.length > 0 ? (
              <SROIVisualization
                inputs={sroiInputs}
                outcomes={sroiOutcomes}
                calculation={sroiCalculation || undefined}
                variant="full"
              />
            ) : (
              <EmpathyCard variant="warmth">
                <CardContent className="p-8">
                  <div className="text-center space-y-4">
                    <h4 className="font-semibold">Example: $3.50 SROI Ratio</h4>
                    <p className="text-sm text-muted-foreground">
                      Shows $3.50 in social value for every $1 invested. Includes stakeholder pie charts,
                      sensitivity analysis (conservative/base/optimistic), and key findings with recommendations.
                    </p>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-xs">
                        <strong>To see live data:</strong> Create SROI inputs and outcomes using the sroi-calculator service
                      </p>
                    </div>
                  </div>
                </CardContent>
              </EmpathyCard>
            )}
          </div>

          {/* Ripple Effects Example */}
          <div>
            <h3 className="text-xl font-semibold mb-4">3. Ripple Effect Visualization</h3>
            <p className="text-muted-foreground mb-4">
              Track how impact spreads from storyteller → family → community → other communities → policy.
            </p>

            {rippleEffects && rippleEffects.length > 0 ? (
              <RippleEffectVisualization
                effects={rippleEffects}
                variant="detailed"
                allowReporting={true}
              />
            ) : (
              <EmpathyCard variant="connection">
                <CardContent className="p-8">
                  <div className="text-center space-y-4">
                    <h4 className="font-semibold">Example: 5-Level Ripple Model</h4>
                    <p className="text-sm text-muted-foreground">
                      Displays concentric circles showing impact spreading through 5 levels. Effect dots
                      are sized by people affected, with connection lines showing triggered effects.
                      Includes timeline view and community reporting form.
                    </p>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-xs">
                        <strong>To see live data:</strong> Add ripple effects via the community reporting form or API
                      </p>
                    </div>
                  </div>
                </CardContent>
              </EmpathyCard>
            )}
          </div>

          {/* Theme Evolution Example */}
          <div>
            <h3 className="text-xl font-semibold mb-4">4. Theme Evolution</h3>
            <p className="text-muted-foreground mb-4">
              Monitor how themes emerge, grow, and evolve over time with semantic shift analysis.
            </p>

            {themeEvolutions && themeEvolutions.length > 0 ? (
              <ThemeEvolutionVisualization
                evolutions={themeEvolutions}
                variant="full"
                showPredictions={true}
              />
            ) : (
              <EmpathyCard variant="heritage">
                <CardContent className="p-8">
                  <div className="text-center space-y-4">
                    <h4 className="font-semibold">Example: Theme Timeline</h4>
                    <p className="text-sm text-muted-foreground">
                      Shows stacked area chart of theme prominence over time, with status indicators
                      (emerging, growing, stable, declining). Includes semantic shift scatter plot
                      showing how theme meanings evolve.
                    </p>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-xs">
                        <strong>To see live data:</strong> Theme evolution is tracked automatically as stories are tagged
                      </p>
                    </div>
                  </div>
                </CardContent>
              </EmpathyCard>
            )}
          </div>

          {/* Participatory Evaluation Forms */}
          <div>
            <h3 className="text-xl font-semibold mb-4">5. Participatory Evaluation Tools</h3>
            <p className="text-muted-foreground mb-4">
              Community-led evaluation following Indigenous methodologies.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Community Interpretation Session Form */}
              <InterpretationSessionForm
                onSubmit={async (session) => {
                  'use server'
                  const supabase = await createClient()
                  await supabase
                    .from('community_interpretation_sessions')
                    .insert(session)
                }}
              />

              {/* Outcome Harvesting Form */}
              <OutcomeHarvestingForm
                onSubmit={async (outcome) => {
                  'use server'
                  const supabase = await createClient()
                  await supabase
                    .from('harvested_outcomes')
                    .insert(outcome)
                }}
              />
            </div>
          </div>
        </div>

        {/* Getting Started Guide */}
        <EmpathyCard variant="warmth">
          <CardHeader
            title="Getting Started"
            subtitle="How to use the impact analysis system"
          />
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">1. Analyze Stories</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Use the narrative analysis service to analyze story emotional arcs:
                </p>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`import { analyzeStoryNarrativeArc } from '@/services/narrative-analysis'

const arc = await analyzeStoryNarrativeArc(storyTranscript, {
  method: 'openai',
  model: 'gpt-4o'
})

// Save to database
await supabase.from('story_narrative_arcs').insert({
  story_id: storyId,
  ...arc
})`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2. Calculate SROI</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Measure social return on investment:
                </p>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`import { calculateSROI, FINANCIAL_PROXIES } from '@/services/sroi-calculator'

const result = calculateSROI(inputs, outcomes)
// result.sroi_ratio: 3.5 ($3.50 per $1 invested)`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3. Track Ripple Effects</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Document spreading impact through communities:
                </p>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`await supabase.from('ripple_effects').insert({
  story_id: storyId,
  ripple_level: 3, // Community level
  effect_description: 'Story shared at community gathering',
  people_affected: 50
})`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4. Voice Analysis (Optional)</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Analyze voice prosody and emotion from audio:
                </p>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`// Setup Python environment
cd src/services/voice-analysis
./setup.sh

// Analyze audio
import { analyzeAndSaveAudioProsody } from '@/services/voice-analysis'
const { prosodic, emotion } = await analyzeAndSaveAudioProsody(
  audioId,
  '/path/to/audio.wav',
  storyId
)`}
                </pre>
              </div>
            </div>
          </CardContent>
        </EmpathyCard>

        {/* Documentation Links */}
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold">Documentation</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/docs/IMPACT_ANALYSIS_README.md"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Complete Guide
            </a>
            <a
              href="/docs/IMPACT_ANALYSIS_STRATEGY.md"
              className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
            >
              Full Strategy (13,000 lines)
            </a>
            <a
              href="/docs/VISUALIZATION_QUICK_REFERENCE.md"
              className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-colors"
            >
              Quick Reference
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

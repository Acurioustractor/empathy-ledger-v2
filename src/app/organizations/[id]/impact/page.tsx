import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ImpactDashboard } from '@/components/impact/ImpactDashboard'
import { SROIVisualization } from '@/components/impact/SROIVisualization'
import { ThemeEvolutionVisualization } from '@/components/impact/ThemeEvolutionVisualization'
import {
  InterpretationSessionsList,
  HarvestedOutcomesList
} from '@/components/impact/ParticipatoryEvaluation'
import { EmpathyCard, CardContent, CardHeader } from '@/components/empathy-ledger'

/**
 * Organization Impact Dashboard
 *
 * Shows comprehensive impact analysis for an organization including:
 * - Overall impact dashboard
 * - SROI analysis
 * - Theme evolution
 * - Participatory evaluation results
 */

interface PageProps {
  params: {
    id: string
  }
}

export default async function OrganizationImpactPage({ params }: PageProps) {
  const supabase = await createClient()

  // Fetch organization
  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', params.id)
    .single()

  if (orgError || !organization) {
    notFound()
  }

  // Fetch all stories for this organization
  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('organization_id', params.id)

  const projectIds = projects?.map(p => p.id) || []

  const { data: stories } = await supabase
    .from('stories')
    .select('id')
    .in('project_id', projectIds)

  const storyIds = stories?.map(s => s.id) || []

  // Fetch impact data
  const { data: narrativeArcs } = await supabase
    .from('story_narrative_arcs')
    .select('*')
    .in('story_id', storyIds)

  const { data: themeEvolutions } = await supabase
    .from('theme_evolution')
    .select('*')
    .order('time_period_start', { ascending: false })
    .limit(100)

  const { data: conceptEvolutions } = await supabase
    .from('theme_concept_evolution')
    .select('*')
    .limit(50)

  const { data: rippleEffects } = await supabase
    .from('ripple_effects')
    .select('*')
    .in('project_id', projectIds)

  // SROI data
  const { data: sroiInputs } = await supabase
    .from('sroi_inputs')
    .select('*')
    .eq('organization_id', params.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const { data: sroiOutcomes } = await supabase
    .from('sroi_outcomes')
    .select('*')
    .eq('sroi_input_id', sroiInputs?.id || '')

  const { data: sroiCalculation } = await supabase
    .from('sroi_calculations')
    .select('*')
    .eq('sroi_input_id', sroiInputs?.id || '')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Participatory evaluation
  const { data: interpretationSessions } = await supabase
    .from('community_interpretation_sessions')
    .select('*')
    .in('story_id', storyIds)
    .order('session_date', { ascending: false })

  const { data: harvestedOutcomes } = await supabase
    .from('harvested_outcomes')
    .select('*')
    .in('project_id', projectIds)
    .order('harvested_date', { ascending: false })

  // Count totals
  const totalStories = stories?.length || 0
  const totalStorytellers = new Set(
    stories?.map(s => (s as any).storyteller_id).filter(Boolean)
  ).size

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{organization.name}</h1>
          <p className="text-lg text-muted-foreground">Impact Analysis</p>
        </div>

        <a
          href={`/organizations/${params.id}`}
          className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-colors"
        >
          ← Back to Organization
        </a>
      </div>

      {/* Main Dashboard */}
      {(narrativeArcs && narrativeArcs.length > 0) || (sroiInputs && sroiOutcomes) ? (
        <ImpactDashboard
          view="organization"
          organizationId={params.id}
          narrativeArcs={narrativeArcs || []}
          themeEvolutions={themeEvolutions || []}
          conceptEvolutions={conceptEvolutions || []}
          sroiInputs={sroiInputs || undefined}
          sroiOutcomes={sroiOutcomes || []}
          sroiCalculation={sroiCalculation || undefined}
          rippleEffects={rippleEffects || []}
          totalStories={totalStories}
          totalStorytellers={totalStorytellers}
          totalOrganizations={1}
          timeRange="All time"
        />
      ) : (
        <EmpathyCard>
          <CardContent className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No Impact Data Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start analyzing stories or creating SROI inputs to see your organization's impact.
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="#sroi-setup"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Set Up SROI
              </a>
            </div>
          </CardContent>
        </EmpathyCard>
      )}

      {/* SROI Analysis */}
      {sroiInputs && sroiOutcomes && sroiOutcomes.length > 0 && (
        <div id="sroi">
          <h2 className="text-2xl font-semibold mb-4">Social Return on Investment</h2>
          <SROIVisualization
            inputs={sroiInputs}
            outcomes={sroiOutcomes}
            calculation={sroiCalculation || undefined}
            projectName={organization.name}
            variant="full"
          />
        </div>
      )}

      {/* Theme Evolution */}
      {themeEvolutions && themeEvolutions.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Theme Evolution</h2>
          <ThemeEvolutionVisualization
            evolutions={themeEvolutions}
            conceptEvolutions={conceptEvolutions || []}
            variant="full"
            showPredictions={true}
          />

          {conceptEvolutions && conceptEvolutions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">Semantic Shifts</h3>
              <ThemeEvolutionVisualization
                evolutions={themeEvolutions}
                conceptEvolutions={conceptEvolutions}
                variant="semantic"
              />
            </div>
          )}
        </div>
      )}

      {/* Participatory Evaluation Results */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Interpretation Sessions */}
        {interpretationSessions && interpretationSessions.length > 0 && (
          <InterpretationSessionsList
            sessions={interpretationSessions}
          />
        )}

        {/* Harvested Outcomes */}
        {harvestedOutcomes && harvestedOutcomes.length > 0 && (
          <HarvestedOutcomesList
            outcomes={harvestedOutcomes}
          />
        )}
      </div>

      {/* SROI Setup (if not configured) */}
      {!sroiInputs && (
        <div id="sroi-setup">
          <h2 className="text-2xl font-semibold mb-4">Set Up SROI Analysis</h2>
          <EmpathyCard variant="warmth">
            <CardHeader
              title="Social Return on Investment"
              subtitle="Measure the social value your organization creates"
            />
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  SROI helps you demonstrate the social value your storytelling work creates.
                  Follow the Social Value UK framework to calculate how much social value
                  is generated for every dollar invested.
                </p>

                <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                  <h4 className="font-semibold">To get started:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Define your investment (staff time, equipment, funding)</li>
                    <li>Identify outcomes for each stakeholder group</li>
                    <li>Find financial proxies for each outcome</li>
                    <li>Apply discounting factors (deadweight, attribution)</li>
                    <li>Calculate total social value created</li>
                  </ol>
                </div>

                <div className="flex gap-4">
                  <a
                    href="/docs/IMPACT_ANALYSIS_README.md#sroi"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Read SROI Guide
                  </a>
                  <a
                    href={`/organizations/${params.id}/impact/sroi/new`}
                    className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
                  >
                    Create SROI Analysis
                  </a>
                </div>
              </div>
            </CardContent>
          </EmpathyCard>
        </div>
      )}

      {/* Export Report */}
      <div className="flex gap-4 justify-end">
        <button className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-colors">
          Export PDF Report
        </button>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          Share Impact Dashboard
        </button>
      </div>
    </div>
  )
}

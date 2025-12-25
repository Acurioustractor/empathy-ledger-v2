'use client'

/**
 * Participatory Evaluation Tools
 *
 * Community-led evaluation components following Indigenous methodologies:
 * - Community interpretation sessions
 * - Outcome harvesting
 * - Storytelling circles
 * - Collective meaning-making
 */

import { useState, useMemo } from 'react'
import {
  EmpathyCard,
  CardHeader,
  CardContent
} from '@/components/empathy-ledger'
import { EmpathyBadge } from '@/components/empathy-ledger/core/Badge'
import { MetricDisplay } from '@/components/empathy-ledger/data/MetricDisplay'
import {
  CommunityInterpretationSession,
  HarvestedOutcome,
  InterpretationType,
  OutcomeSignificance,
  ChangeType
} from '@/lib/database/types/impact-analysis'

// Community Interpretation Session Form
export interface InterpretationSessionFormProps {
  storyId?: string
  themeId?: string
  onSubmit: (session: Omit<CommunityInterpretationSession, 'id' | 'created_at' | 'updated_at'>) => void
  className?: string
}

export function InterpretationSessionForm({
  storyId,
  themeId,
  onSubmit,
  className
}: InterpretationSessionFormProps) {
  const [interpretationType, setInterpretationType] = useState<InterpretationType>('thematic')
  const [participantCount, setParticipantCount] = useState<number>(5)
  const [sessionNotes, setSessionNotes] = useState<string>('')
  const [keyInterpretations, setKeyInterpretations] = useState<string[]>([''])
  const [consensusPoints, setConsensusPoints] = useState<string[]>([''])
  const [divergentViews, setDivergentViews] = useState<string[]>([''])
  const [culturalContext, setCulturalContext] = useState<string>('')
  const [recommendations, setRecommendations] = useState<string[]>([''])

  const handleAddField = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, ''])
  }

  const handleUpdateField = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    setter(prev => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
  }

  const handleRemoveField = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    setter(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const session: Omit<CommunityInterpretationSession, 'id' | 'created_at' | 'updated_at'> = {
      story_id: storyId,
      theme_id: themeId,
      session_date: new Date().toISOString(),
      participant_count: participantCount,
      interpretation_type: interpretationType,
      session_notes: sessionNotes,
      key_interpretations: keyInterpretations.filter(k => k.trim() !== ''),
      consensus_points: consensusPoints.filter(c => c.trim() !== ''),
      divergent_views: divergentViews.filter(d => d.trim() !== ''),
      cultural_context: culturalContext || null,
      recommendations: recommendations.filter(r => r.trim() !== ''),
      facilitator_id: null // Will be set by backend
    }

    onSubmit(session)
  }

  return (
    <EmpathyCard variant="warmth" className={className}>
      <CardHeader
        title="Community Interpretation Session"
        subtitle="Document collective meaning-making"
      />

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Session metadata */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Interpretation Type
              </label>
              <select
                value={interpretationType}
                onChange={(e) => setInterpretationType(e.target.value as InterpretationType)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                required
              >
                <option value="thematic">Thematic Analysis</option>
                <option value="narrative">Narrative Interpretation</option>
                <option value="emotional">Emotional Journey</option>
                <option value="impact">Impact Assessment</option>
                <option value="cultural">Cultural Context</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Number of Participants
              </label>
              <input
                type="number"
                min="1"
                value={participantCount}
                onChange={(e) => setParticipantCount(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                required
              />
            </div>
          </div>

          {/* Session notes */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Session Notes
            </label>
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="General notes about the session, methodology, and context..."
              required
            />
          </div>

          {/* Key interpretations */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Key Interpretations
            </label>
            <div className="space-y-2">
              {keyInterpretations.map((interpretation, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={interpretation}
                    onChange={(e) => handleUpdateField(setKeyInterpretations, index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-background"
                    placeholder="What did the community understand from this story/theme?"
                  />
                  {keyInterpretations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveField(setKeyInterpretations, index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddField(setKeyInterpretations)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Add interpretation
              </button>
            </div>
          </div>

          {/* Consensus points */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Points of Consensus
            </label>
            <div className="space-y-2">
              {consensusPoints.map((point, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => handleUpdateField(setConsensusPoints, index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-background"
                    placeholder="What did participants agree on?"
                  />
                  {consensusPoints.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveField(setConsensusPoints, index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddField(setConsensusPoints)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Add consensus point
              </button>
            </div>
          </div>

          {/* Divergent views */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Divergent Views
              <span className="text-xs text-muted-foreground ml-2">
                (Healthy diversity of perspectives)
              </span>
            </label>
            <div className="space-y-2">
              {divergentViews.map((view, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={view}
                    onChange={(e) => handleUpdateField(setDivergentViews, index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-background"
                    placeholder="Where did interpretations differ?"
                  />
                  {divergentViews.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveField(setDivergentViews, index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddField(setDivergentViews)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Add divergent view
              </button>
            </div>
          </div>

          {/* Cultural context */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Cultural Context
            </label>
            <textarea
              value={culturalContext}
              onChange={(e) => setCulturalContext(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="Relevant cultural knowledge, protocols, or traditions that informed the interpretation..."
            />
          </div>

          {/* Recommendations */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Recommendations for Action
            </label>
            <div className="space-y-2">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={rec}
                    onChange={(e) => handleUpdateField(setRecommendations, index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-background"
                    placeholder="What should happen next based on this interpretation?"
                  />
                  {recommendations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveField(setRecommendations, index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddField(setRecommendations)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Add recommendation
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Save Interpretation Session
            </button>
          </div>
        </form>
      </CardContent>
    </EmpathyCard>
  )
}

// Outcome Harvesting Form
export interface OutcomeHarvestingFormProps {
  projectId?: string
  onSubmit: (outcome: Omit<HarvestedOutcome, 'id' | 'created_at' | 'updated_at'>) => void
  className?: string
}

export function OutcomeHarvestingForm({
  projectId,
  onSubmit,
  className
}: OutcomeHarvestingFormProps) {
  const [outcomeDescription, setOutcomeDescription] = useState<string>('')
  const [changeType, setChangeType] = useState<ChangeType>('behavioral')
  const [significance, setSignificance] = useState<OutcomeSignificance>('moderate')
  const [whoChanged, setWhoChanged] = useState<string>('')
  const [whatChanged, setWhatChanged] = useState<string>('')
  const [howMuchChanged, setHowMuchChanged] = useState<string>('')
  const [contributionNarrative, setContributionNarrative] = useState<string>('')
  const [evidenceSource, setEvidenceSource] = useState<string>('')
  const [evidenceQuotes, setEvidenceQuotes] = useState<string[]>([''])
  const [isUnexpected, setIsUnexpected] = useState<boolean>(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const outcome: Omit<HarvestedOutcome, 'id' | 'created_at' | 'updated_at'> = {
      project_id: projectId,
      story_id: null,
      outcome_description: outcomeDescription,
      change_type: changeType,
      significance_level: significance,
      who_changed: whoChanged,
      what_changed: whatChanged,
      how_much_changed: howMuchChanged || null,
      contribution_narrative: contributionNarrative,
      evidence_source: evidenceSource,
      evidence_quotes: evidenceQuotes.filter(q => q.trim() !== ''),
      is_unexpected: isUnexpected,
      harvested_by: null, // Will be set by backend
      harvested_date: new Date().toISOString(),
      community_validated: false,
      validated_by: null,
      validated_date: null
    }

    onSubmit(outcome)
  }

  return (
    <EmpathyCard variant="insight" className={className}>
      <CardHeader
        title="Harvest an Outcome"
        subtitle="Document emergent and unexpected changes"
      />

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Outcome description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Outcome Description
              <span className="text-xs text-muted-foreground ml-2">
                (What change occurred?)
              </span>
            </label>
            <textarea
              value={outcomeDescription}
              onChange={(e) => setOutcomeDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="Describe the observed change in detail..."
              required
            />
          </div>

          {/* Change type and significance */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Type of Change
              </label>
              <select
                value={changeType}
                onChange={(e) => setChangeType(e.target.value as ChangeType)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                required
              >
                <option value="behavioral">Behavioral</option>
                <option value="relational">Relational</option>
                <option value="attitudinal">Attitudinal</option>
                <option value="knowledge">Knowledge</option>
                <option value="policy">Policy</option>
                <option value="practice">Practice</option>
                <option value="systemic">Systemic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Significance Level
              </label>
              <select
                value={significance}
                onChange={(e) => setSignificance(e.target.value as OutcomeSignificance)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                required
              >
                <option value="transformative">Transformative</option>
                <option value="significant">Significant</option>
                <option value="moderate">Moderate</option>
                <option value="minor">Minor</option>
              </select>
            </div>
          </div>

          {/* Who, What, How Much */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-xl">
            <h4 className="font-medium text-sm">Outcome Details</h4>

            <div>
              <label className="block text-sm font-medium mb-2">
                Who changed?
              </label>
              <input
                type="text"
                value={whoChanged}
                onChange={(e) => setWhoChanged(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                placeholder="Which individuals, groups, or organizations?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                What changed?
              </label>
              <input
                type="text"
                value={whatChanged}
                onChange={(e) => setWhatChanged(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                placeholder="What aspect changed? (behavior, attitude, policy, etc.)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                How much changed?
                <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
              </label>
              <input
                type="text"
                value={howMuchChanged}
                onChange={(e) => setHowMuchChanged(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                placeholder="Quantify if possible (e.g., '20 people', 'policy affects 5,000 households')"
              />
            </div>
          </div>

          {/* Contribution narrative */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Contribution Narrative
              <span className="text-xs text-muted-foreground ml-2">
                (How did this project contribute to the change?)
              </span>
            </label>
            <textarea
              value={contributionNarrative}
              onChange={(e) => setContributionNarrative(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="Explain the plausible link between your project/story and this outcome..."
              required
            />
          </div>

          {/* Evidence */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Evidence Source
            </label>
            <input
              type="text"
              value={evidenceSource}
              onChange={(e) => setEvidenceSource(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="Where did you learn about this outcome? (interview, observation, document, etc.)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Evidence Quotes
            </label>
            <div className="space-y-2">
              {evidenceQuotes.map((quote, index) => (
                <div key={index} className="flex gap-2">
                  <textarea
                    value={quote}
                    onChange={(e) => {
                      const updated = [...evidenceQuotes]
                      updated[index] = e.target.value
                      setEvidenceQuotes(updated)
                    }}
                    rows={2}
                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-background"
                    placeholder="Direct quote from evidence source..."
                  />
                  {evidenceQuotes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setEvidenceQuotes(evidenceQuotes.filter((_, i) => i !== index))}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setEvidenceQuotes([...evidenceQuotes, ''])}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Add quote
              </button>
            </div>
          </div>

          {/* Unexpected flag */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is-unexpected"
              checked={isUnexpected}
              onChange={(e) => setIsUnexpected(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-border rounded focus:ring-primary-500"
            />
            <label htmlFor="is-unexpected" className="text-sm font-medium cursor-pointer">
              This outcome was unexpected or unplanned
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Harvest Outcome
            </button>
          </div>
        </form>
      </CardContent>
    </EmpathyCard>
  )
}

// Interpretation Sessions List
export interface InterpretationSessionsListProps {
  sessions: CommunityInterpretationSession[]
  className?: string
}

export function InterpretationSessionsList({
  sessions,
  className
}: InterpretationSessionsListProps) {
  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4">Community Interpretation Sessions</h3>

      {sessions.length === 0 ? (
        <EmpathyCard>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No interpretation sessions yet</p>
          </CardContent>
        </EmpathyCard>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <EmpathyCard key={session.id} variant="default">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <EmpathyBadge variant="primary">
                        {session.interpretation_type}
                      </EmpathyBadge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(session.session_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {session.participant_count} participants
                    </div>
                  </div>
                </div>

                {session.key_interpretations.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-sm font-medium mb-2">Key Interpretations:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {session.key_interpretations.slice(0, 3).map((interp, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">{interp}</li>
                      ))}
                      {session.key_interpretations.length > 3 && (
                        <li className="text-sm text-primary-600">
                          +{session.key_interpretations.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {session.recommendations.length > 0 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h5 className="text-sm font-medium mb-1">Recommendations:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {session.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </EmpathyCard>
          ))}
        </div>
      )}
    </div>
  )
}

// Harvested Outcomes List
export interface HarvestedOutcomesListProps {
  outcomes: HarvestedOutcome[]
  className?: string
}

export function HarvestedOutcomesList({
  outcomes,
  className
}: HarvestedOutcomesListProps) {
  const stats = useMemo(() => {
    const byType = new Map<string, number>()
    const bySignificance = new Map<string, number>()
    let unexpectedCount = 0

    outcomes.forEach(outcome => {
      byType.set(outcome.change_type, (byType.get(outcome.change_type) || 0) + 1)
      bySignificance.set(outcome.significance_level, (bySignificance.get(outcome.significance_level) || 0) + 1)
      if (outcome.is_unexpected) unexpectedCount++
    })

    return { byType, bySignificance, unexpectedCount }
  }, [outcomes])

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Harvested Outcomes</h3>
        <div className="flex gap-2">
          <EmpathyBadge variant="secondary">
            {outcomes.length} total
          </EmpathyBadge>
          {stats.unexpectedCount > 0 && (
            <EmpathyBadge variant="primary">
              {stats.unexpectedCount} unexpected
            </EmpathyBadge>
          )}
        </div>
      </div>

      {outcomes.length === 0 ? (
        <EmpathyCard>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No outcomes harvested yet</p>
          </CardContent>
        </EmpathyCard>
      ) : (
        <div className="space-y-4">
          {outcomes.map((outcome) => (
            <EmpathyCard key={outcome.id} variant="warmth">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <EmpathyBadge variant="primary">
                        {outcome.change_type}
                      </EmpathyBadge>
                      <EmpathyBadge
                        variant={
                          outcome.significance_level === 'transformative' ? 'success' :
                          outcome.significance_level === 'significant' ? 'primary' :
                          'secondary'
                        }
                      >
                        {outcome.significance_level}
                      </EmpathyBadge>
                      {outcome.is_unexpected && (
                        <EmpathyBadge variant="warning">Unexpected</EmpathyBadge>
                      )}
                      {outcome.community_validated && (
                        <EmpathyBadge variant="success">Validated</EmpathyBadge>
                      )}
                    </div>

                    <p className="text-sm mb-3">{outcome.outcome_description}</p>

                    <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Who</div>
                        <div className="font-medium">{outcome.who_changed}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">What</div>
                        <div className="font-medium">{outcome.what_changed}</div>
                      </div>
                      {outcome.how_much_changed && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">How Much</div>
                          <div className="font-medium">{outcome.how_much_changed}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {outcome.contribution_narrative && (
                  <div className="mb-3 p-3 bg-primary-50 dark:bg-primary-950/20 rounded-lg">
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      How we contributed:
                    </div>
                    <div className="text-sm">{outcome.contribution_narrative}</div>
                  </div>
                )}

                {outcome.evidence_quotes.length > 0 && (
                  <div className="border-l-2 border-primary-600 pl-3">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Evidence:</div>
                    <div className="text-sm italic">"{outcome.evidence_quotes[0]}"</div>
                    {outcome.evidence_quotes.length > 1 && (
                      <div className="text-xs text-primary-600 mt-1">
                        +{outcome.evidence_quotes.length - 1} more quotes
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </EmpathyCard>
          ))}
        </div>
      )}
    </div>
  )
}

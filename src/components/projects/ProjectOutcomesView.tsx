'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, TrendingUp, CheckCircle2, AlertCircle, Quote } from 'lucide-react'

interface ProjectOutcome {
  category: string
  description: string
  evidence_found: string[]
  storytellers_mentioning: string[]
  strength: 'not_mentioned' | 'mentioned' | 'described' | 'demonstrated'
  score: number
}

interface ProjectOutcomesData {
  project_name: string
  outcomes: ProjectOutcome[]
  overall_progress_summary: string
  key_wins: string[]
  gaps_or_opportunities: string[]
}

interface ProjectOutcomesViewProps {
  outcomes: ProjectOutcomesData
}

export function ProjectOutcomesView({ outcomes }: ProjectOutcomesViewProps) {

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'demonstrated': return 'bg-green-100 text-green-800 border-green-300'
      case 'described': return 'bg-sage-100 text-sage-800 border-sage-300'
      case 'mentioned': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default: return 'bg-stone-100 text-stone-600 border-stone-300'
    }
  }

  const getStrengthLabel = (strength: string) => {
    switch (strength) {
      case 'demonstrated': return 'Strong Evidence'
      case 'described': return 'Some Evidence'
      case 'mentioned': return 'Mentioned'
      default: return 'Not Found'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 76) return 'text-green-600'
    if (score >= 51) return 'text-sage-600'
    if (score >= 26) return 'text-yellow-600'
    return 'text-stone-400'
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Project Outcomes Tracker
          </CardTitle>
          <CardDescription>
            Evidence of progress toward {outcomes.project_name}'s defined success outcomes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none text-stone-700">
            <p>{outcomes.overall_progress_summary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Key Wins */}
      {outcomes.key_wins && outcomes.key_wins.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              Key Wins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {outcomes.key_wins.map((win, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-stone-700">{win}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Individual Outcomes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {outcomes.outcomes.map((outcome, index) => (
          <Card key={index} className="border-l-4" style={{
            borderLeftColor: outcome.score >= 76 ? '#10B981' :
                             outcome.score >= 51 ? '#3B82F6' :
                             outcome.score >= 26 ? '#F59E0B' : '#9CA3AF'
          }}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg">{outcome.category}</CardTitle>
                  <CardDescription className="mt-1">{outcome.description}</CardDescription>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-3xl font-bold ${getScoreColor(outcome.score)}`}>
                    {outcome.score}
                  </div>
                  <div className="text-xs text-stone-500 mt-1">out of 100</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Strength Badge */}
              <div>
                <Badge variant="outline" className={`${getStrengthColor(outcome.strength)}`}>
                  {getStrengthLabel(outcome.strength)}
                </Badge>
              </div>

              {/* Storytellers */}
              {outcome.storytellers_mentioning.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-stone-500 mb-2">
                    Mentioned by {outcome.storytellers_mentioning.length} storyteller{outcome.storytellers_mentioning.length !== 1 ? 's' : ''}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {outcome.storytellers_mentioning.slice(0, 5).map((storyteller, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {storyteller}
                      </Badge>
                    ))}
                    {outcome.storytellers_mentioning.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{outcome.storytellers_mentioning.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Evidence Quotes */}
              {outcome.evidence_found.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-stone-500 flex items-center gap-1">
                    <Quote className="w-3 h-3" />
                    Evidence from interviews
                  </div>
                  <div className="space-y-2">
                    {outcome.evidence_found.slice(0, 2).map((quote, i) => (
                      <div key={i} className="text-sm italic text-stone-600 border-l-2 border-stone-300 pl-3 py-1">
                        "{quote.length > 150 ? quote.substring(0, 150) + '...' : quote}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Evidence Message */}
              {outcome.evidence_found.length === 0 && (
                <div className="text-sm text-stone-500 italic flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  No specific evidence found in transcripts yet
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gaps & Opportunities */}
      {outcomes.gaps_or_opportunities && outcomes.gaps_or_opportunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sage-700">
              <TrendingUp className="w-5 h-5" />
              Opportunities for Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {outcomes.gaps_or_opportunities.map((gap, i) => (
                <li key={i} className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-sage-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-stone-700">{gap}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

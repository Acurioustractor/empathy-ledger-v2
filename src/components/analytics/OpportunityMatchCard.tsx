'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Target,
  CheckCircle,
  AlertCircle,
  Briefcase,
  DollarSign,
  Calendar,
  ExternalLink,
  Users,
  Globe,
  Star,
  Lightbulb,
  Clock,
  Heart
} from 'lucide-react'

interface CareerRecommendation {
  title: string;
  organisation: string;
  match_score: number;
  required_skills: string[];
  storyteller_skills: string[];
  gap_analysis: string[];
  application_strategy: string;
  cultural_fit: string;
  salary_range?: string;
  application_deadline?: string;
  url?: string;
}

interface GrantOpportunity {
  title: string;
  organisation: string;
  funding_amount: string;
  match_score: number;
  required_criteria: string[];
  storyteller_qualifications: string[];
  suggested_project: string;
  cultural_focus: boolean;
  community_impact_potential: string;
  application_deadline?: string;
  url?: string;
}

interface OpportunityMatchCardProps {
  opportunity: CareerRecommendation | GrantOpportunity;
  type: 'career' | 'grant';
  onApply?: () => void;
  onSaveForLater?: () => void;
  showDetails?: boolean;
}

export function OpportunityMatchCard({ 
  opportunity, 
  type, 
  onApply, 
  onSaveForLater,
  showDetails = true 
}: OpportunityMatchCardProps) {
  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 border-green-200'
    if (score >= 60) return 'text-sage-600 bg-sage-100 border-sage-200'
    if (score >= 40) return 'text-yellow-600 bg-yellow-100 border-yellow-200'
    return 'text-red-600 bg-red-100 border-red-200'
  }

  const getMatchScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match'
    if (score >= 60) return 'Good Match'
    if (score >= 40) return 'Fair Match'
    return 'Developing Match'
  }

  const isCareer = (opp: any): opp is CareerRecommendation => type === 'career'
  const isGrant = (opp: any): opp is GrantOpportunity => type === 'grant'

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1 flex items-center gap-2">
              {type === 'career' ? (
                <Briefcase className="h-4 w-4 text-sage-600" />
              ) : (
                <DollarSign className="h-4 w-4 text-green-600" />
              )}
              {opportunity.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              {type === 'career' ? (
                <Users className="h-3 w-3" />
              ) : (
                <Globe className="h-3 w-3" />
              )}
              {opportunity.organisation}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={`${getMatchScoreColor(opportunity.match_score)} font-bold border`}>
              {opportunity.match_score}% Match
            </Badge>
            {isGrant(opportunity) && opportunity.cultural_focus && (
              <Badge variant="outline" className="text-clay-700 border-clay-700">
                <Heart className="h-3 w-3 mr-1" />
                Cultural Focus
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Grant Funding Amount */}
          {isGrant(opportunity) && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-bold text-green-800">{opportunity.funding_amount}</span>
              <span className="text-sm text-green-600">Available Funding</span>
            </div>
          )}

          {/* Match Score Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Match Quality</span>
              <span className="text-sm text-stone-500">
                {getMatchScoreLabel(opportunity.match_score)}
              </span>
            </div>
            <Progress value={opportunity.match_score} className="h-2" />
          </div>

          {showDetails && (
            <>
              {/* Skills/Qualifications Match */}
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  {type === 'career' ? 'Your Matching Skills' : 'Your Qualifications'} 
                  ({isCareer(opportunity) ? opportunity.storyteller_skills.length : opportunity.storyteller_qualifications.length})
                </h4>
                <div className="flex flex-wrap gap-1 mb-3">
                  {(isCareer(opportunity) ? opportunity.storyteller_skills : opportunity.storyteller_qualifications)
                    .slice(0, 6)
                    .map((skill, i) => (
                    <Badge key={i} variant="outline" className="text-xs text-green-700 border-green-700">
                      {skill}
                    </Badge>
                  ))}
                  {(isCareer(opportunity) ? opportunity.storyteller_skills.length : opportunity.storyteller_qualifications.length) > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{(isCareer(opportunity) ? opportunity.storyteller_skills.length : opportunity.storyteller_qualifications.length) - 6} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Skills Gap for Careers */}
              {isCareer(opportunity) && opportunity.gap_analysis.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 text-yellow-500" />
                    Skills to Develop
                  </h4>
                  <div className="space-y-1">
                    {opportunity.gap_analysis.slice(0, 3).map((gap, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Lightbulb className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-xs text-stone-600">{gap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Application Strategy for Careers */}
              {isCareer(opportunity) && (
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Target className="h-3 w-3 text-sage-500" />
                    Application Strategy
                  </h4>
                  <p className="text-xs text-stone-600 bg-sage-50 p-3 rounded border-l-2 border-sage-500">
                    {opportunity.application_strategy}
                  </p>
                </div>
              )}

              {/* Suggested Project for Grants */}
              {isGrant(opportunity) && (
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Lightbulb className="h-3 w-3 text-sage-500" />
                    Suggested Project Approach
                  </h4>
                  <p className="text-xs text-stone-600 bg-sage-50 p-3 rounded border-l-2 border-sage-500">
                    {opportunity.suggested_project}
                  </p>
                </div>
              )}

              {/* Cultural Fit for Careers */}
              {isCareer(opportunity) && (
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Heart className="h-3 w-3 text-clay-500" />
                    Cultural Alignment
                  </h4>
                  <p className="text-xs text-stone-600 bg-clay-50 p-3 rounded border-l-2 border-clay-500">
                    {opportunity.cultural_fit}
                  </p>
                </div>
              )}

              {/* Community Impact for Grants */}
              {isGrant(opportunity) && (
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Users className="h-3 w-3 text-clay-500" />
                    Community Impact Potential
                  </h4>
                  <p className="text-xs text-stone-600 bg-clay-50 p-3 rounded border-l-2 border-clay-500">
                    {opportunity.community_impact_potential}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Footer with deadline and actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4 text-xs text-stone-500">
              {isCareer(opportunity) && opportunity.salary_range && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {opportunity.salary_range}
                </div>
              )}
              {opportunity.application_deadline && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {opportunity.application_deadline}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {onSaveForLater && (
                <Button size="sm" variant="ghost" onClick={onSaveForLater}>
                  <Star className="h-3 w-3" />
                </Button>
              )}
              
              {opportunity.url ? (
                <Button size="sm" variant="outline" asChild>
                  <a href={opportunity.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {type === 'career' ? 'Apply' : 'Learn More'}
                  </a>
                </Button>
              ) : onApply && (
                <Button size="sm" onClick={onApply}>
                  {type === 'career' ? 'Apply' : 'Learn More'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
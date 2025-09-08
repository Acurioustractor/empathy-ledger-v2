'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Star, 
  Trophy, 
  Users, 
  Clock, 
  Globe, 
  CheckCircle, 
  Target, 
  FileText, 
  Award, 
  BookOpen, 
  MessageSquare,
  Eye,
  Copy,
  ExternalLink
} from 'lucide-react'

interface ImpactStory {
  title: string;
  description: string;
  measurable_outcomes: string[];
  beneficiaries: string[];
  timeframe: string;
  cultural_significance: string;
  suitable_for: ('resume' | 'grant_application' | 'interview' | 'portfolio')[];
}

interface ImpactStoriesGridProps {
  stories: ImpactStory[];
  onStorySelect?: (story: ImpactStory) => void;
  selectedUsage?: string;
  maxStories?: number;
}

export function ImpactStoriesGrid({ 
  stories, 
  onStorySelect,
  selectedUsage,
  maxStories 
}: ImpactStoriesGridProps) {
  const [hoveredStory, setHoveredStory] = useState<number | null>(null)

  const getUsageIcon = (usage: string) => {
    switch (usage) {
      case 'resume': return <FileText className="h-3 w-3" />
      case 'grant_application': return <Award className="h-3 w-3" />
      case 'interview': return <MessageSquare className="h-3 w-3" />
      case 'portfolio': return <BookOpen className="h-3 w-3" />
      default: return <Star className="h-3 w-3" />
    }
  }

  const getUsageColor = (usage: string) => {
    switch (usage) {
      case 'resume': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'grant_application': return 'text-green-600 bg-green-50 border-green-200'
      case 'interview': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'portfolio': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  // Filter stories based on selectedUsage if provided
  const filteredStories = selectedUsage 
    ? stories.filter(story => story.suitable_for.includes(selectedUsage as any))
    : stories

  const displayStories = maxStories 
    ? filteredStories.slice(0, maxStories)
    : filteredStories

  if (displayStories.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {selectedUsage ? 'No Stories Found' : 'No Impact Stories Available'}
        </h3>
        <p className="text-gray-600">
          {selectedUsage 
            ? `No stories suitable for ${selectedUsage.replace('_', ' ')} found.`
            : 'Generate an analysis to discover your impact stories.'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {displayStories.map((story, index) => (
        <Card 
          key={index} 
          className={`h-fit transition-all duration-200 ${
            hoveredStory === index ? 'shadow-lg scale-105' : 'hover:shadow-md'
          } ${onStorySelect ? 'cursor-pointer' : ''}`}
          onMouseEnter={() => setHoveredStory(index)}
          onMouseLeave={() => setHoveredStory(null)}
          onClick={() => onStorySelect?.(story)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg flex-1">{story.title}</CardTitle>
              <Badge variant="outline" className="ml-2 flex-shrink-0 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {story.timeframe}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2">
              {story.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Key Achievements */}
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Trophy className="h-3 w-3 text-yellow-500" />
                  Key Achievements ({story.measurable_outcomes.length})
                </h4>
                <div className="space-y-1">
                  {story.measurable_outcomes.slice(0, 2).map((outcome, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-xs text-gray-700 line-clamp-2">{outcome}</span>
                    </div>
                  ))}
                  {story.measurable_outcomes.length > 2 && (
                    <div className="text-xs text-gray-500 pl-5">
                      +{story.measurable_outcomes.length - 2} more outcomes
                    </div>
                  )}
                </div>
              </div>

              {/* Beneficiaries */}
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Users className="h-3 w-3 text-blue-500" />
                  Impact Reach
                </h4>
                <div className="flex flex-wrap gap-1">
                  {story.beneficiaries.slice(0, 3).map((beneficiary, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {beneficiary}
                    </Badge>
                  ))}
                  {story.beneficiaries.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{story.beneficiaries.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Cultural Significance Preview */}
              <div>
                <h4 className="font-medium text-sm mb-1 flex items-center gap-2">
                  <Globe className="h-3 w-3 text-purple-500" />
                  Cultural Context
                </h4>
                <p className="text-xs text-gray-600 bg-purple-50 p-2 rounded line-clamp-2">
                  {story.cultural_significance}
                </p>
              </div>

              {/* Professional Applications */}
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Target className="h-3 w-3 text-green-500" />
                  Best Used For
                </h4>
                <div className="grid grid-cols-2 gap-1">
                  {story.suitable_for.map((use, i) => (
                    <div 
                      key={i} 
                      className={`flex items-center gap-1 p-1.5 rounded text-xs font-medium ${getUsageColor(use)}`}
                    >
                      {getUsageIcon(use)}
                      <span className="capitalize">
                        {use.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              {onStorySelect && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      onStorySelect(story)
                    }}
                    className="flex-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Copy story title and description to clipboard
                      navigator.clipboard.writeText(`${story.title}: ${story.description}`)
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {maxStories && filteredStories.length > maxStories && (
        <div className="lg:col-span-2 text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            Showing {maxStories} of {filteredStories.length} impact stories
          </p>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-3 w-3 mr-1" />
            View All Stories
          </Button>
        </div>
      )}
    </div>
  )
}
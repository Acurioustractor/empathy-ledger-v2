'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Target,
  Clock,
  CheckCircle,
  Trophy,
  BookOpen,
  Users,
  Lightbulb,
  Calendar,
  Star,
  TrendingUp,
  Award,
  Heart,
  GraduationCap,
  MessageCircle
} from 'lucide-react'

interface Goal {
  title: string;
  description: string;
  timeline: string;
  success_metrics: string[];
  required_skills: string[];
  resources_needed: string[];
  cultural_considerations?: string;
  progress?: number; // 0-100
  status?: 'not_started' | 'in_progress' | 'completed';
}

interface SkillPath {
  skill: string;
  current_level: string;
  target_level: string;
  learning_resources: string[];
  practice_opportunities: string[];
  timeline: string;
  cultural_context?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface DevelopmentPlan {
  storyteller_id: string;
  short_term_goals: Goal[];
  long_term_goals: Goal[];
  skill_development_path: SkillPath[];
  networking_recommendations: string[];
  educational_opportunities: string[];
  cultural_preservation_opportunities: string[];
  mentorship_suggestions: string[];
  created_at: string;
}

interface PersonalDevelopmentPlanProps {
  plan: DevelopmentPlan;
  onUpdateGoal?: (goalType: 'short_term' | 'long_term', goalIndex: number, updates: Partial<Goal>) => void;
  onUpdateSkillPath?: (skillIndex: number, updates: Partial<SkillPath>) => void;
  storytellerName?: string;
}

export function PersonalDevelopmentPlan({ 
  plan, 
  onUpdateGoal, 
  onUpdateSkillPath,
  storytellerName = "Storyteller"
}: PersonalDevelopmentPlanProps) {
  const [selectedTab, setSelectedTab] = useState('goals')

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'text-green-600 bg-green-100'
      case 'advanced': return 'text-blue-600 bg-blue-100'
      case 'intermediate': return 'text-yellow-600 bg-yellow-100'
      case 'beginner': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-100 border-green-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'not_started': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const calculateOverallProgress = () => {
    const allGoals = [...plan.short_term_goals, ...plan.long_term_goals]
    const totalProgress = allGoals.reduce((sum, goal) => sum + (goal.progress || 0), 0)
    return allGoals.length > 0 ? Math.round(totalProgress / allGoals.length) : 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Personal Development Plan
          </CardTitle>
          <CardDescription>
            Comprehensive growth strategy for {storytellerName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm font-medium">Overall Progress</span>
              <p className="text-xs text-gray-500">
                Based on goals completion
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-blue-600">{calculateOverallProgress()}%</span>
              <p className="text-xs text-gray-500">Complete</p>
            </div>
          </div>
          <Progress value={calculateOverallProgress()} className="h-2" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{plan.short_term_goals.length}</div>
              <p className="text-xs text-gray-500">Short-term Goals</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{plan.long_term_goals.length}</div>
              <p className="text-xs text-gray-500">Long-term Goals</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{plan.skill_development_path.length}</div>
              <p className="text-xs text-gray-500">Skills to Develop</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{plan.mentorship_suggestions.length}</div>
              <p className="text-xs text-gray-500">Mentorship Areas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="networking">Network</TabsTrigger>
          <TabsTrigger value="cultural">Cultural</TabsTrigger>
        </TabsList>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          {/* Short-term Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Short-term Goals (6 months - 1 year)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plan.short_term_goals.map((goal, index) => (
                  <Card key={index} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{goal.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getStatusColor(goal.status || 'not_started')}>
                            {goal.status?.replace('_', ' ') || 'Not Started'}
                          </Badge>
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            {goal.timeline}
                          </Badge>
                        </div>
                      </div>

                      {goal.progress !== undefined && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{goal.progress}%</span>
                          </div>
                          <Progress value={goal.progress} className="h-2" />
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <Trophy className="h-3 w-3 text-yellow-500" />
                            Success Metrics
                          </h5>
                          <ul className="space-y-1">
                            {goal.success_metrics.map((metric, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                                <span className="text-xs">{metric}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <BookOpen className="h-3 w-3 text-blue-500" />
                            Resources Needed
                          </h5>
                          <div className="space-y-1">
                            {goal.resources_needed.map((resource, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-xs text-gray-600">{resource}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {goal.cultural_considerations && (
                        <div className="mt-3 p-3 bg-purple-50 rounded border-l-2 border-purple-500">
                          <h5 className="font-medium text-sm mb-1 flex items-center gap-2">
                            <Heart className="h-3 w-3 text-purple-500" />
                            Cultural Considerations
                          </h5>
                          <p className="text-xs text-gray-600">{goal.cultural_considerations}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Long-term Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Long-term Goals (2-5 years)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plan.long_term_goals.map((goal, index) => (
                  <Card key={index} className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{goal.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                        </div>
                        <Badge variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          {goal.timeline}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <Award className="h-3 w-3 text-yellow-500" />
                            Required Skills
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {goal.required_skills.map((skill, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <Target className="h-3 w-3 text-green-500" />
                            Success Indicators
                          </h5>
                          <ul className="space-y-1">
                            {goal.success_metrics.slice(0, 2).map((metric, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <Star className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                                <span className="text-xs">{metric}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {plan.skill_development_path.map((skillPath, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{skillPath.skill}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className={getSkillLevelColor(skillPath.current_level)}>
                        {skillPath.current_level}
                      </Badge>
                      <span className="text-gray-400">→</span>
                      <Badge className={getSkillLevelColor(skillPath.target_level)}>
                        {skillPath.target_level}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Timeline: {skillPath.timeline} | 
                    {skillPath.priority && (
                      <Badge className={`ml-2 ${getPriorityColor(skillPath.priority)}`}>
                        {skillPath.priority} priority
                      </Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <BookOpen className="h-3 w-3 text-blue-500" />
                        Learning Resources
                      </h5>
                      <div className="space-y-1">
                        {skillPath.learning_resources.map((resource, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <GraduationCap className="h-3 w-3 text-blue-500 mt-1 flex-shrink-0" />
                            <span className="text-xs text-gray-700">{resource}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Users className="h-3 w-3 text-green-500" />
                        Practice Opportunities
                      </h5>
                      <div className="space-y-1">
                        {skillPath.practice_opportunities.map((opportunity, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Target className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                            <span className="text-xs text-gray-700">{opportunity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {skillPath.cultural_context && (
                      <div className="p-3 bg-purple-50 rounded border-l-2 border-purple-500">
                        <h5 className="font-medium text-sm mb-1 flex items-center gap-2">
                          <Heart className="h-3 w-3 text-purple-500" />
                          Cultural Context
                        </h5>
                        <p className="text-xs text-gray-600">{skillPath.cultural_context}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Networking Tab */}
        <TabsContent value="networking" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Networking Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plan.networking_recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <MessageCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-1" />
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-green-600" />
                  Educational Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plan.educational_opportunities.map((opp, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <BookOpen className="h-4 w-4 text-green-600 flex-shrink-0 mt-1" />
                      <span className="text-sm">{opp}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Mentorship Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plan.mentorship_suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <Star className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-1" />
                      <span className="text-sm">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cultural Tab */}
        <TabsContent value="cultural" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-purple-600" />
                Cultural Preservation & Development
              </CardTitle>
              <CardDescription>
                Opportunities to preserve culture while advancing professionally
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plan.cultural_preservation_opportunities.map((opportunity, index) => (
                  <div key={index} className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                    <div className="flex items-start gap-3">
                      <Heart className="h-5 w-5 text-purple-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">{opportunity}</p>
                        <p className="text-xs text-gray-600">
                          This opportunity allows you to maintain cultural connections while developing professional skills.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration Approach</CardTitle>
              <CardDescription>
                How to balance cultural identity with professional development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Honor Your Heritage</h4>
                  <p className="text-xs text-gray-600">
                    Use your cultural background as a strength in professional settings. Your unique perspective is valuable.
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Bridge Building</h4>
                  <p className="text-xs text-gray-600">
                    Look for opportunities to connect different communities through your work and storytelling.
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Knowledge Sharing</h4>
                  <p className="text-xs text-gray-600">
                    Consider mentoring others from your community as you advance in your career.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
'use client'

import React from 'react'
import Link from 'next/link'
import {
  Mic, FileText, Sparkles, BookOpen, Users, Quote,
  ArrowRight, CheckCircle2, Clock, AlertCircle, TrendingUp,
  Play, Zap, ChevronRight
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface InterviewPipelineData {
  totalInterviews: number
  analyzedInterviews: number
  pendingAnalysis: number
  storiesGenerated: number
  uniqueThemesDiscovered: number
  wisdomMomentsExtracted: number
  voicesPreserved: number
  averageConfidence: number
  recentAnalyses: Array<{
    id: string
    title: string
    storyteller: string
    analyzedAt: string
    themes: string[]
    keyMomentsCount: number
  }>
  themesBySource: {
    fromTranscripts: number
    fromStories: number
  }
}

interface InterviewPipelineDashboardProps {
  data: InterviewPipelineData | null
  loading: boolean
}

export function InterviewPipelineDashboard({ data, loading }: InterviewPipelineDashboardProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-3/4 mb-2" />
                <div className="h-8 bg-stone-200 dark:bg-stone-800 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No pipeline data available
        </CardContent>
      </Card>
    )
  }

  const analysisProgress = data.totalInterviews > 0
    ? Math.round((data.analyzedInterviews / data.totalInterviews) * 100)
    : 0

  const storyProgress = data.analyzedInterviews > 0
    ? Math.round((data.storiesGenerated / data.analyzedInterviews) * 100)
    : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <Badge variant="outline" className="mb-4 text-clay-600 border-clay-300">
          <Zap className="w-3 h-3 mr-1" />
          Interview to Insight Pipeline
        </Badge>
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          How Every Interview Creates Impact
        </h2>
        <p className="text-muted-foreground">
          Watch how stories flow from interview to insight. Each conversation
          contributes themes, wisdom, and voices to our collective understanding.
        </p>
      </div>

      {/* Pipeline Flow Visualization */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
            <PipelineStage
              icon={<Mic className="w-6 h-6" />}
              title="Interviews"
              count={data.totalInterviews}
              description="Conversations recorded"
              color="from-sage-500 to-terracotta-600"
              status="complete"
            />
            <PipelineStage
              icon={<Sparkles className="w-6 h-6" />}
              title="Analyzed"
              count={data.analyzedInterviews}
              description="Insights extracted"
              color="from-clay-500 to-pink-600"
              status={data.pendingAnalysis > 0 ? 'in-progress' : 'complete'}
              progress={analysisProgress}
            />
            <PipelineStage
              icon={<BookOpen className="w-6 h-6" />}
              title="Stories"
              count={data.storiesGenerated}
              description="Narratives created"
              color="from-amber-500 to-orange-600"
              status={storyProgress < 100 ? 'in-progress' : 'complete'}
              progress={storyProgress}
            />
            <PipelineStage
              icon={<TrendingUp className="w-6 h-6" />}
              title="Insights"
              count={data.uniqueThemesDiscovered}
              description="Themes discovered"
              color="from-green-500 to-emerald-600"
              status="growing"
            />
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <MetricCard
          icon={<Users className="w-5 h-5" />}
          value={data.voicesPreserved}
          label="Voices Preserved"
          description="Unique storytellers with analyzed interviews"
          color="text-sage-600"
        />
        <MetricCard
          icon={<Quote className="w-5 h-5" />}
          value={data.wisdomMomentsExtracted}
          label="Wisdom Moments"
          description="Key quotes and insights captured"
          color="text-clay-600"
        />
        <MetricCard
          icon={<Sparkles className="w-5 h-5" />}
          value={`${data.averageConfidence}%`}
          label="Analysis Confidence"
          description="Accuracy in theme extraction"
          color="text-green-600"
        />
      </div>

      {/* Theme Sources Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-clay-500" />
              Theme Discovery Sources
            </CardTitle>
            <CardDescription>
              Where our themes come from
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>From Transcript Analysis</span>
                <span className="font-medium">{data.themesBySource.fromTranscripts}</span>
              </div>
              <Progress
                value={data.themesBySource.fromTranscripts > 0 ? 100 : 0}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Themes automatically discovered from interview transcripts
              </p>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>From Published Stories</span>
                <span className="font-medium">{data.themesBySource.fromStories}</span>
              </div>
              <Progress
                value={data.themesBySource.fromStories > 0 ? 100 : 0}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Themes tagged on published stories
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Pipeline Status
            </CardTitle>
            <CardDescription>
              Current processing state
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusItem
              label="Awaiting Analysis"
              count={data.pendingAnalysis}
              icon={data.pendingAnalysis > 0 ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              status={data.pendingAnalysis > 0 ? 'warning' : 'success'}
            />
            <StatusItem
              label="Analysis Complete"
              count={data.analyzedInterviews}
              icon={<CheckCircle2 className="w-4 h-4" />}
              status="success"
            />
            <StatusItem
              label="Stories Generated"
              count={data.storiesGenerated}
              icon={<BookOpen className="w-4 h-4" />}
              status="info"
            />
            {data.pendingAnalysis > 0 && (
              <Link href="/admin/transcripts">
                <Button variant="outline" size="sm" className="w-full mt-2">
                  Process Pending Transcripts
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Analyses */}
      {data.recentAnalyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Play className="w-5 h-5 text-green-500" />
              Recent Interview Analyses
            </CardTitle>
            <CardDescription>
              Latest interviews processed through our insight pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentAnalyses.map((analysis, index) => (
                <div
                  key={analysis.id}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg",
                    "bg-stone-50 dark:bg-stone-900/50"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{analysis.title}</span>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {analysis.keyMomentsCount} moments
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      by {analysis.storyteller}
                    </p>
                    {analysis.themes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {analysis.themes.slice(0, 3).map(theme => (
                          <Badge key={theme} variant="outline" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                        {analysis.themes.length > 3 && (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            +{analysis.themes.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {new Date(analysis.analyzedAt).toLocaleDateString()}
                    </p>
                    <Link href={`/admin/transcripts/${analysis.id}`}>
                      <Button variant="ghost" size="sm" className="mt-1">
                        View <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card className="bg-gradient-to-br from-clay-50 to-sage-50 dark:from-clay-950/30 dark:to-sage-950/30 border-clay-200 dark:border-clay-800">
        <CardHeader>
          <CardTitle className="text-lg">How Every Interview Creates Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <WorkflowStep
              number={1}
              title="Record"
              description="Conduct and record an interview with a storyteller"
            />
            <WorkflowStep
              number={2}
              title="Transcribe"
              description="Upload audio/video to generate a transcript"
            />
            <WorkflowStep
              number={3}
              title="Analyze"
              description="Extract themes, key moments, and wisdom"
            />
            <WorkflowStep
              number={4}
              title="Share"
              description="Generate a story and add to the World Tour"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PipelineStage({
  icon,
  title,
  count,
  description,
  color,
  status,
  progress
}: {
  icon: React.ReactNode
  title: string
  count: number
  description: string
  color: string
  status: 'complete' | 'in-progress' | 'growing'
  progress?: number
}) {
  return (
    <div className="p-6 text-center relative">
      <div className={cn(
        "w-12 h-12 mx-auto rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-3",
        color
      )}>
        {icon}
      </div>
      <p className="text-3xl font-bold mb-1">{count.toLocaleString()}</p>
      <p className="font-medium text-sm">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
      {progress !== undefined && progress < 100 && (
        <div className="mt-3">
          <Progress value={progress} className="h-1" />
          <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
        </div>
      )}
      {status === 'growing' && (
        <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">
          <TrendingUp className="w-3 h-3 mr-1" />
          Growing
        </Badge>
      )}
    </div>
  )
}

function MetricCard({
  icon,
  value,
  label,
  description,
  color
}: {
  icon: React.ReactNode
  value: number | string
  label: string
  description: string
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className={cn("p-2 w-fit rounded-lg bg-stone-100 dark:bg-stone-800 mb-3", color)}>
          {icon}
        </div>
        <p className="text-3xl font-bold mb-1">{value}</p>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

function StatusItem({
  label,
  count,
  icon,
  status
}: {
  label: string
  count: number
  icon: React.ReactNode
  status: 'success' | 'warning' | 'info'
}) {
  const colors = {
    success: 'text-green-600',
    warning: 'text-amber-600',
    info: 'text-sage-600'
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={colors[status]}>{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-medium">{count}</span>
    </div>
  )
}

function WorkflowStep({
  number,
  title,
  description
}: {
  number: number
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <div className="w-8 h-8 rounded-full bg-clay-600 text-white flex items-center justify-center mx-auto mb-2 text-sm font-bold">
        {number}
      </div>
      <p className="font-medium mb-1">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

export default InterviewPipelineDashboard

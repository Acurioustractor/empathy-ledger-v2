'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Sparkles,
  PlayCircle,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  MessageSquareQuote,
  TrendingUp,
  Languages,
  Shield,
  AlertCircle
} from 'lucide-react'
import { ThemeExtractor } from './ThemeExtractor'
import { QuoteHighlighter } from './QuoteHighlighter'
import { LanguageAnalyzer } from './LanguageAnalyzer'
import { SentimentAnalysis } from './SentimentAnalysis'
import { AISettingsPanel } from './AISettingsPanel'

interface AIAnalysisDashboardProps {
  organizationId: string
  storyId?: string
}

interface AnalysisJob {
  id: string
  job_type: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  total_stories: number
  processed_count: number
  created_at: string
}

export function AIAnalysisDashboard({ organizationId, storyId }: AIAnalysisDashboardProps) {
  const [jobs, setJobs] = useState<AnalysisJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('themes')

  useEffect(() => {
    loadJobs()
    const interval = setInterval(loadJobs, 5000) // Poll every 5s
    return () => clearInterval(interval)
  }, [organizationId])

  const loadJobs = async () => {
    try {
      const response = await fetch(`/api/ai/jobs?organizationId=${organizationId}`)
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs || [])
      }
    } catch (err) {
      console.error('Error loading jobs:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartAnalysis = async (type: string) => {
    try {
      const response = await fetch('/api/ai/analyze/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          storyIds: storyId ? [storyId] : 'all',
          analysisType: type
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Analysis job started: ${data.jobId}`)
        loadJobs()
      } else {
        throw new Error('Failed to start analysis')
      }
    } catch (err) {
      console.error('Error starting analysis:', err)
      alert('Failed to start analysis. Please try again.')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'processing':
        return <Clock className="h-5 w-5 text-amber-500 animate-spin" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'processing': return 'bg-amber-100 text-amber-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            AI Analysis Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Extract themes, quotes, and insights using AI
          </p>
        </div>

        <Button variant="outline" onClick={() => setSelectedTab('settings')}>
          <Shield className="h-4 w-4 mr-2" />
          AI Settings
        </Button>
      </div>

      {/* Cultural Safety Notice */}
      <Card className="border-sage-200 bg-sage-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-sage-600 mt-0.5" />
            <div>
              <p className="font-medium text-sage-900">AI with Cultural Respect</p>
              <p className="text-sm text-sage-700 mt-1">
                AI analysis respects sacred content exclusions and cultural protocols.
                Stories marked as sacred are never processed. All suggestions require
                Elder or storyteller approval before being applied.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Button
          onClick={() => handleStartAnalysis('themes')}
          className="h-auto py-4 flex-col gap-2"
        >
          <BookOpen className="h-5 w-5" />
          <span>Extract Themes</span>
        </Button>

        <Button
          onClick={() => handleStartAnalysis('quotes')}
          className="h-auto py-4 flex-col gap-2"
          variant="outline"
        >
          <MessageSquareQuote className="h-5 w-5" />
          <span>Find Quotes</span>
        </Button>

        <Button
          onClick={() => handleStartAnalysis('sentiment')}
          className="h-auto py-4 flex-col gap-2"
          variant="outline"
        >
          <TrendingUp className="h-5 w-5" />
          <span>Analyze Sentiment</span>
        </Button>

        <Button
          onClick={() => handleStartAnalysis('language')}
          className="h-auto py-4 flex-col gap-2"
          variant="outline"
        >
          <Languages className="h-5 w-5" />
          <span>Detect Language</span>
        </Button>
      </div>

      {/* Analysis Jobs Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Analysis Jobs</span>
            <Badge variant="secondary">{jobs.length} jobs</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No analysis jobs yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Click a button above to start AI analysis
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map(job => (
                <div
                  key={job.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  {getStatusIcon(job.status)}

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 capitalize">
                        {job.job_type} Extraction
                      </h4>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>

                    {job.status === 'processing' && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{job.processed_count} / {job.total_stories}</span>
                        </div>
                        <Progress
                          value={(job.processed_count / job.total_stories) * 100}
                          className="h-2"
                        />
                      </div>
                    )}

                    <p className="text-sm text-gray-600 mt-1">
                      Started {new Date(job.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    {job.status === 'completed' && (
                      <Button size="sm" variant="outline">
                        View Results
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="language">Language</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="themes" className="mt-6">
          <ThemeExtractor organizationId={organizationId} storyId={storyId} />
        </TabsContent>

        <TabsContent value="quotes" className="mt-6">
          <QuoteHighlighter organizationId={organizationId} storyId={storyId} />
        </TabsContent>

        <TabsContent value="sentiment" className="mt-6">
          <SentimentAnalysis organizationId={organizationId} storyId={storyId} />
        </TabsContent>

        <TabsContent value="language" className="mt-6">
          <LanguageAnalyzer organizationId={organizationId} storyId={storyId} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <AISettingsPanel organizationId={organizationId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

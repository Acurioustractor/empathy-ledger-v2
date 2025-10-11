'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Sparkles, FileText, MessageSquare, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProjectContextManagerProps {
  projectId: string
  projectName: string
  currentContext?: {
    model: 'none' | 'quick' | 'full'
    description?: string
    updatedAt?: string
  }
}

export function ProjectContextManager({ projectId, projectName, currentContext }: ProjectContextManagerProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'quick' | 'full'>('quick')
  const [isLoading, setIsLoading] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Quick setup state
  const [quickDescription, setQuickDescription] = useState(currentContext?.description || '')

  // Full setup state
  const [seedInterview, setSeedInterview] = useState('')
  const [interviewedBy, setInterviewedBy] = useState('')

  useEffect(() => {
    if (currentContext?.description) {
      setQuickDescription(currentContext.description)
    }
  }, [currentContext])

  const handleQuickSave = async () => {
    if (!quickDescription.trim()) {
      setMessage({ type: 'error', text: 'Please enter a project description' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/projects/${projectId}/context`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'quick',
          description: quickDescription.trim()
        })
      })

      if (!response.ok) throw new Error('Failed to save context')

      setMessage({
        type: 'success',
        text: 'Project context saved! Future analysis will use this context to find relevant quotes and themes.'
      })

      // Refresh the page to show updated context
      router.refresh()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFullSave = async () => {
    if (!seedInterview.trim()) {
      setMessage({ type: 'error', text: 'Please enter the seed interview transcript' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/projects/${projectId}/context/seed-interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interview_transcript: seedInterview.trim(),
          interviewed_by: interviewedBy.trim() || undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process seed interview')
      }

      const result = await response.json()

      setMessage({
        type: 'success',
        text: `Full project profile created! AI extracted ${result.profile?.primary_goals?.length || 0} goals and ${result.profile?.outcome_categories?.length || 0} outcome categories.`
      })

      // Clear the form
      setSeedInterview('')
      setInterviewedBy('')

      // Refresh the page
      router.refresh()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerateAnalysis = async () => {
    setIsRegenerating(true)
    setMessage(null)

    try {
      // Clear cache
      const clearResponse = await fetch(`/api/projects/${projectId}/analysis/clear-cache`, {
        method: 'POST'
      })

      if (!clearResponse.ok) {
        throw new Error('Failed to clear analysis cache')
      }

      setMessage({
        type: 'success',
        text: 'Analysis cache cleared! The next time you view analysis, it will regenerate with the updated context.'
      })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Context Setup
        </CardTitle>
        <CardDescription>
          Configure how AI analyzes transcripts for this project. Add context about your goals and outcomes to get more relevant quotes and themes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <Alert className={`mb-4 ${message.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {currentContext?.model !== 'none' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  <strong>Context Active:</strong> {currentContext.model === 'quick' ? 'Quick Setup' : 'Full Profile'}
                  {currentContext.updatedAt && (
                    <span className="text-blue-600 ml-2">
                      (Updated {new Date(currentContext.updatedAt).toLocaleDateString()})
                    </span>
                  )}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRegenerateAnalysis}
                disabled={isRegenerating}
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Clear Cache & Regenerate
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'quick' | 'full')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quick" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Quick Setup
            </TabsTrigger>
            <TabsTrigger value="full" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Full Setup (Seed Interview)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Project Overview & Goals
              </label>
              <p className="text-xs text-grey-500 mb-3">
                Describe your project's mission, goals, and what success looks like. This helps AI find quotes that demonstrate your specific outcomes.
              </p>
              <Textarea
                placeholder={`Example for ${projectName}:

This project supports grassroots community organizations across Australia.

Our approach focuses on:
- Trust-based relationships
- Flexible funding
- Building peer networks
- Strengthening organizational capacity

Success for us means:
- Organizations feeling genuinely supported and validated
- Strong peer networks forming with authentic collaborations
- Financial sustainability allowing long-term impact
- Increased organizational confidence and leadership
- Communities thriving through locally-led initiatives`}
                value={quickDescription}
                onChange={(e) => setQuickDescription(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-grey-500 mt-2">
                {quickDescription.length} characters · AI will extract goals and outcomes from this description
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleQuickSave}
                disabled={isLoading || !quickDescription.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Save Quick Context
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="full" className="space-y-4 mt-4">
            <Alert>
              <MessageSquare className="h-4 w-4" />
              <AlertDescription>
                <strong>Full Setup Process:</strong> Conduct a seed interview with the project lead using these questions:
                <ol className="mt-2 ml-4 space-y-1 text-sm">
                  <li>1. What is this project trying to achieve?</li>
                  <li>2. What does success look like for your community?</li>
                  <li>3. What outcomes are you hoping to see in people's lives?</li>
                  <li>4. What values guide your approach?</li>
                  <li>5. How will you know when you've made a difference?</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Seed Interview Transcript
              </label>
              <Textarea
                placeholder="Paste the full interview transcript here. AI will extract project goals, outcomes, success indicators, and cultural values..."
                value={seedInterview}
                onChange={(e) => setSeedInterview(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Interviewed By (Optional)
              </label>
              <input
                type="text"
                placeholder="Your name"
                value={interviewedBy}
                onChange={(e) => setInterviewedBy(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleFullSave}
                disabled={isLoading || !seedInterview.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Interview...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Process Seed Interview
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

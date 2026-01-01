'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Sparkles } from 'lucide-react'

interface SeedInterviewQuestion {
  id: string
  text: string
  section: string
  required: boolean
  help_text?: string
}

interface SeedInterviewTemplate {
  template_type: 'project_full_setup'
  questions: SeedInterviewQuestion[]
}

interface ProjectSeedInterviewWizardProps {
  projectId: string
  open: boolean
  onClose: () => void
  onComplete: () => void
}

export default function ProjectSeedInterviewWizard({
  projectId,
  open,
  onClose,
  onComplete
}: ProjectSeedInterviewWizardProps) {
  const [template, setTemplate] = useState<SeedInterviewTemplate | null>(null)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extractionResult, setExtractionResult] = useState<{
    quality_score: number
    warnings?: string[]
  } | null>(null)
  const [showCompletion, setShowCompletion] = useState(false)

  useEffect(() => {
    if (open) {
      fetchTemplate()
    }
  }, [open, projectId])

  const fetchTemplate = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/projects/${projectId}/context/seed-interview`)

      if (!response.ok) {
        throw new Error('Failed to fetch seed interview template')
      }

      const data = await response.json()
      setTemplate(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load template')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!template) return

    // Check required questions
    const unansweredRequired = template.questions.filter(
      q => q.required && !responses[q.id]?.trim()
    )

    if (unansweredRequired.length > 0) {
      setError(`Please answer all required questions (${unansweredRequired.length} remaining)`)
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const response = await fetch(`/api/projects/${projectId}/context/seed-interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process seed interview')
      }

      const result = await response.json()
      setExtractionResult(result)
      setShowCompletion(true)

      // Auto-close and refresh after 3 seconds
      setTimeout(() => {
        onComplete()
        onClose()
        // Reset state
        setResponses({})
        setCurrentStep(0)
        setShowCompletion(false)
        setExtractionResult(null)
      }, 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit responses')
    } finally {
      setSubmitting(false)
    }
  }

  if (!template || loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading seed interview...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const currentQuestion = template.questions[currentStep]
  const progress = ((currentStep + 1) / template.questions.length) * 100
  const answeredCount = Object.keys(responses).filter(key => responses[key]?.trim()).length
  const requiredUnanswered = template.questions.filter(
    q => q.required && !responses[q.id]?.trim()
  ).length

  if (showCompletion && extractionResult) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-8">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <CheckCircle className="h-20 w-20 text-green-500 animate-bounce" />
                <Sparkles className="h-8 w-8 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-2">Project Context Created!</h2>
            <p className="text-gray-600 mb-6">
              AI has extracted your project context from the seed interview.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-sm font-medium text-blue-900">Extraction Quality</span>
                <Badge
                  variant={extractionResult.quality_score >= 80 ? 'default' :
                          extractionResult.quality_score >= 60 ? 'secondary' : 'destructive'}
                >
                  {extractionResult.quality_score}/100
                </Badge>
              </div>

              {extractionResult.warnings && extractionResult.warnings.length > 0 && (
                <div className="mt-3 text-left">
                  <p className="text-xs text-yellow-700 font-medium mb-1">Suggestions:</p>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {extractionResult.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-500">
              Closing automatically...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Project Seed Interview
          </DialogTitle>
          <DialogDescription>
            Answer these questions to help AI understand your project's context and expected outcomes.
            This will enable project-specific impact analysis.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Question {currentStep + 1} of {template.questions.length}
            </span>
            <span className="text-gray-600">
              {answeredCount} answered
              {requiredUnanswered > 0 && (
                <span className="text-red-600 ml-2">
                  ({requiredUnanswered} required remaining)
                </span>
              )}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Overview */}
        <div className="flex flex-wrap gap-2 py-2 border-y">
          {template.questions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => setCurrentStep(index)}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                transition-all duration-200
                ${index === currentStep
                  ? 'bg-blue-600 text-white ring-2 ring-blue-300 scale-110'
                  : responses[q.id]?.trim()
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
              title={q.text}
            >
              {responses[q.id]?.trim() ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </button>
          ))}
        </div>

        {/* Current Question */}
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-1">
              {currentQuestion.section}
            </Badge>
            {currentQuestion.required && (
              <Badge variant="destructive" className="mt-1">
                Required
              </Badge>
            )}
          </div>

          <div>
            <Label className="text-base font-semibold">
              {currentQuestion.text}
            </Label>
            {currentQuestion.help_text && (
              <p className="text-sm text-gray-600 mt-1">
                {currentQuestion.help_text}
              </p>
            )}
          </div>

          <Textarea
            value={responses[currentQuestion.id] || ''}
            onChange={(e) => {
              setResponses(prev => ({
                ...prev,
                [currentQuestion.id]: e.target.value
              }))
              setError(null)
            }}
            placeholder="Type your response here..."
            className="min-h-[150px]"
          />

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {responses[currentQuestion.id]?.trim()
                ? `${responses[currentQuestion.id].split(/\s+/).filter(w => w).length} words`
                : 'Not answered yet'
              }
            </span>
            {responses[currentQuestion.id]?.length >= 50 && (
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Good detail
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0 || submitting}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStep < template.questions.length - 1 ? (
              <Button
                onClick={() => setCurrentStep(prev => Math.min(template.questions.length - 1, prev + 1))}
                disabled={submitting}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting || requiredUnanswered > 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-1" />
                    Complete Interview
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-900 font-medium mb-1">Tips for better results:</p>
          <ul className="text-xs text-blue-800 space-y-0.5">
            <li>• Be specific about your project's unique approach and expected outcomes</li>
            <li>• Include concrete examples and measurable indicators</li>
            <li>• Explain your cultural frameworks and community engagement methods</li>
            <li>• Describe both short-term and long-term outcomes you're tracking</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Sparkles,
  MessageSquare
} from 'lucide-react'

interface Question {
  id: string
  section: string
  question: string
  help_text?: string
  type: string
  required: boolean
  order: number
}

interface SeedInterviewTemplate {
  id: string
  name: string
  description: string
  template_type: 'organization' | 'project'
  questions: Question[]
}

interface SeedInterviewWizardProps {
  organizationId: string
  open: boolean
  onClose: () => void
  onComplete: () => void
}

export default function SeedInterviewWizard({
  organizationId,
  open,
  onClose,
  onComplete
}: SeedInterviewWizardProps) {
  const [template, setTemplate] = useState<SeedInterviewTemplate | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extractionResult, setExtractionResult] = useState<any>(null)

  useEffect(() => {
    if (open) {
      fetchTemplate()
    }
  }, [open, organizationId])

  const fetchTemplate = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/organizations/${organizationId}/context/seed-interview`)
      const data = await response.json()
      setTemplate(data.template)
    } catch (err) {
      setError('Failed to load seed interview template')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }))
  }

  const canGoNext = () => {
    if (!template) return false
    const currentQuestion = template.questions[currentStep]
    if (currentQuestion.required) {
      return responses[currentQuestion.id]?.trim().length > 0
    }
    return true
  }

  const handleNext = () => {
    if (template && currentStep < template.questions.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!template) return

    try {
      setProcessing(true)
      setError(null)

      // Format responses for API
      const formattedResponses = template.questions.map(q => ({
        question_id: q.id,
        question: q.question,
        answer: responses[q.id] || ''
      }))

      const response = await fetch(`/api/organizations/${organizationId}/context/seed-interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses: formattedResponses })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process seed interview')
      }

      const data = await response.json()
      setExtractionResult(data)

      // Show success for a moment, then complete
      setTimeout(() => {
        onComplete()
        handleClose()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process seed interview')
    } finally {
      setProcessing(false)
    }
  }

  const handleClose = () => {
    setCurrentStep(0)
    setResponses({})
    setExtractionResult(null)
    setError(null)
    onClose()
  }

  if (!template || loading) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const currentQuestion = template.questions[currentStep]
  const progress = ((currentStep + 1) / template.questions.length) * 100
  const answeredCount = Object.keys(responses).filter(key => responses[key]?.trim()).length
  const totalQuestions = template.questions.length
  const requiredUnanswered = template.questions.filter(
    q => q.required && !responses[q.id]?.trim()
  ).length

  // Group questions by section for overview
  const sections = template.questions.reduce((acc, q) => {
    if (!acc[q.section]) {
      acc[q.section] = []
    }
    acc[q.section].push(q)
    return {}
  }, {} as Record<string, Question[]>)

  if (extractionResult) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-green-100 p-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <DialogTitle>Seed Interview Complete!</DialogTitle>
                <DialogDescription>
                  AI is extracting structured context from your responses...
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-sage-600 animate-pulse" />
              <span className="text-sm">
                Extracted {extractionResult.extracted?.extraction_quality_score || 0}% of possible context
              </span>
            </div>
            <Progress value={100} className="h-2" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {template.name}
          </DialogTitle>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-600">
              Question {currentStep + 1} of {totalQuestions}
            </span>
            <span className="text-stone-600">
              {answeredCount} answered • {requiredUnanswered} required remaining
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Question */}
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-1">{currentQuestion.section}</Badge>
            {currentQuestion.required && (
              <Badge variant="destructive" className="mt-1">Required</Badge>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="answer" className="text-lg font-semibold">
              {currentQuestion.question}
            </Label>
            {currentQuestion.help_text && (
              <p className="text-sm text-stone-600">{currentQuestion.help_text}</p>
            )}
            <Textarea
              id="answer"
              value={responses[currentQuestion.id] || ''}
              onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
              placeholder="Your answer..."
              className="min-h-[200px] text-base"
              autoFocus
            />
            <p className="text-xs text-stone-500">
              {responses[currentQuestion.id]?.length || 0} characters
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || processing}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleClose} disabled={processing}>
              Save Draft & Exit
            </Button>

            {currentStep < template.questions.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!canGoNext() || processing}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={requiredUnanswered > 0 || processing}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Complete Interview
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Question Overview Sidebar (Optional) */}
        {totalQuestions <= 15 && (
          <div className="mt-6 pt-4 border-t">
            <p className="text-sm font-medium text-stone-700 mb-3">Question Progress</p>
            <div className="flex flex-wrap gap-2">
              {template.questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentStep(index)}
                  disabled={processing}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    transition-all
                    ${index === currentStep
                      ? 'bg-sage-600 text-white ring-2 ring-blue-300'
                      : responses[q.id]?.trim()
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : q.required
                          ? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          : 'bg-stone-50 text-stone-400 hover:bg-stone-100'
                    }
                    ${processing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  `}
                  title={`${q.section}: ${q.question.substring(0, 50)}...`}
                >
                  {responses[q.id]?.trim() ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

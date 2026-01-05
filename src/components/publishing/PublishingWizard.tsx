'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PublishingChecklist } from './PublishingChecklist'
import { PreviewModal } from './PreviewModal'
import { PublishConfirmation } from './PublishConfirmation'
import { CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PublishingWizardProps {
  storyId: string
  story: any
  onComplete: () => void
  onCancel: () => void
}

type Step = 'checklist' | 'preview' | 'confirm' | 'publishing' | 'complete'

export function PublishingWizard({ storyId, story, onComplete, onCancel }: PublishingWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('checklist')
  const [checklistComplete, setChecklistComplete] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePublish = async () => {
    setPublishing(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/stories/${storyId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to publish story')
      }

      setStep('complete')
      
      // Redirect after short delay
      setTimeout(() => {
        onComplete()
        router.push(`/stories/${storyId}`)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish')
      setPublishing(false)
    }
  }

  const steps = [
    { id: 'checklist', label: 'Pre-publish Check', icon: CheckCircle },
    { id: 'preview', label: 'Preview Story', icon: CheckCircle },
    { id: 'confirm', label: 'Confirm & Publish', icon: CheckCircle }
  ]

  const currentStepIndex = steps.findIndex(s => s.id === step)

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Publish Story</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          {steps.map((s, index) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                index <= currentStepIndex
                  ? "border-[#D97757] bg-[#D97757] text-white"
                  : "border-[#2C2C2C]/20 text-[#2C2C2C]/40"
              )}>
                {index < currentStepIndex ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </div>
              <span className={cn(
                "text-sm font-medium",
                index <= currentStepIndex ? "text-[#2C2C2C]" : "text-[#2C2C2C]/40"
              )}>
                {s.label}
              </span>
              {index < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 mx-3 text-[#2C2C2C]/20" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'checklist' && (
            <PublishingChecklist
              story={story}
              onComplete={(isComplete) => setChecklistComplete(isComplete)}
            />
          )}

          {step === 'preview' && (
            <PreviewModal story={story} />
          )}

          {step === 'confirm' && (
            <PublishConfirmation story={story} />
          )}

          {step === 'complete' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#2C2C2C] mb-2">
                Story Published!
              </h3>
              <p className="text-[#2C2C2C]/70">
                Your story is now live and visible to the community.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Publishing Failed</p>
                <p className="text-sm text-red-800 mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center p-4 border-t">
          <Button
            variant="ghost"
            onClick={() => {
              if (step === 'preview') setStep('checklist')
              else if (step === 'confirm') setStep('preview')
              else onCancel()
            }}
            disabled={publishing || step === 'complete'}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {step === 'checklist' ? 'Cancel' : 'Back'}
          </Button>

          <div className="flex gap-2">
            {step === 'checklist' && (
              <Button
                onClick={() => setStep('preview')}
                disabled={!checklistComplete}
                className="bg-[#D97757] hover:bg-[#D97757]/90"
              >
                Preview Story
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}

            {step === 'preview' && (
              <Button
                onClick={() => setStep('confirm')}
                className="bg-[#D97757] hover:bg-[#D97757]/90"
              >
                Continue to Publish
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}

            {step === 'confirm' && (
              <Button
                onClick={handlePublish}
                disabled={publishing}
                className="bg-[#2D5F4F] hover:bg-[#2D5F4F]/90"
              >
                {publishing ? 'Publishing...' : 'Publish Story'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

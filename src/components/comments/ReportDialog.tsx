'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Flag, Loader2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  commentId: string
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or advertising', description: 'Unwanted promotional content' },
  { value: 'harassment', label: 'Harassment or hate speech', description: 'Abusive or threatening content' },
  { value: 'misinformation', label: 'Misinformation', description: 'False or misleading information' },
  { value: 'cultural-insensitivity', label: 'Cultural insensitivity', description: 'Disrespectful to cultural protocols' },
  { value: 'inappropriate', label: 'Inappropriate content', description: 'Offensive or unsuitable content' },
  { value: 'other', label: 'Other', description: 'Another reason not listed here' },
]

export function ReportDialog({ open, onOpenChange, commentId }: ReportDialogProps) {
  const [reason, setReason] = useState<string>('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason) return

    try {
      setSubmitting(true)

      const response = await fetch(`/api/comments/${commentId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason,
          details: details.trim() || null
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit report')
      }

      setSubmitted(true)

      // Close dialog after short delay
      setTimeout(() => {
        onOpenChange(false)
        // Reset form
        setTimeout(() => {
          setReason('')
          setDetails('')
          setSubmitted(false)
        }, 300)
      }, 2000)
    } catch (error) {
      console.error('Failed to report comment:', error)
      alert('Failed to submit report. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-600" />
            Report Comment
          </DialogTitle>
          <DialogDescription>
            Help us maintain a respectful and safe community. All reports are reviewed by community
            moderators.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h3 className="text-lg font-semibold text-[#2C2C2C] mb-2">
              Report Submitted
            </h3>
            <p className="text-sm text-[#2C2C2C]/70">
              Thank you for helping keep our community safe. We'll review this report shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reason selection */}
            <div className="space-y-3">
              <Label>Why are you reporting this comment?</Label>
              <RadioGroup value={reason} onValueChange={setReason}>
                {REPORT_REASONS.map((item) => (
                  <div
                    key={item.value}
                    className={cn(
                      "flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors",
                      reason === item.value
                        ? "border-[#D97757] bg-[#D97757]/5"
                        : "border-[#2C2C2C]/10 hover:border-[#D97757]/30"
                    )}
                    onClick={() => setReason(item.value)}
                  >
                    <RadioGroupItem value={item.value} id={item.value} className="mt-0.5" />
                    <Label
                      htmlFor={item.value}
                      className="flex-1 cursor-pointer space-y-1"
                    >
                      <div className="font-medium text-sm text-[#2C2C2C]">
                        {item.label}
                      </div>
                      <div className="text-xs text-[#2C2C2C]/60">
                        {item.description}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Additional details */}
            <div className="space-y-2">
              <Label htmlFor="details">
                Additional details (optional)
              </Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide any additional context that might help us review this report..."
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-[#2C2C2C]/60">
                {details.length} / 500 characters
              </p>
            </div>

            {/* Cultural note */}
            <div className="p-3 bg-[#2D5F4F]/5 border border-[#2D5F4F]/20 rounded-lg">
              <p className="text-xs text-[#2C2C2C]/70 leading-relaxed">
                <strong className="text-[#2D5F4F]">Cultural Safety:</strong> We take reports of
                cultural insensitivity seriously. All such reports are reviewed by community Elders
                who understand cultural protocols and context.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!reason || submitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Flag className="w-4 h-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

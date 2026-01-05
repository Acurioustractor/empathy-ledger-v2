'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  Flag,
  Shield,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { ConcernCategories } from './ConcernCategories'

interface ApprovalWorkflowProps {
  storyId: string
  elderId: string
  elderName: string
  onReviewCompleted: () => void
}

export function ApprovalWorkflow({ storyId, elderId, elderName, onReviewCompleted }: ApprovalWorkflowProps) {
  const { toast } = useToast()
  const [decision, setDecision] = useState<'approve' | 'reject' | 'request_changes' | 'escalate' | null>(null)
  const [culturalGuidance, setCulturalGuidance] = useState('')
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([])
  const [requestedChanges, setRequestedChanges] = useState('')
  const [escalationReason, setEscalationReason] = useState('')
  const [notifyStoryteller, setNotifyStoryteller] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!decision) {
      toast({
        title: 'Decision Required',
        description: 'Please select a review decision before submitting.',
        variant: 'destructive'
      })
      return
    }

    // Validation based on decision
    if (decision === 'reject' && selectedConcerns.length === 0) {
      toast({
        title: 'Concerns Required',
        description: 'Please select at least one concern category when rejecting a story.',
        variant: 'destructive'
      })
      return
    }

    if (decision === 'request_changes' && !requestedChanges.trim()) {
      toast({
        title: 'Changes Required',
        description: 'Please describe what changes are needed.',
        variant: 'destructive'
      })
      return
    }

    if (decision === 'escalate' && !escalationReason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for escalating to the Elder Council.',
        variant: 'destructive'
      })
      return
    }

    try {
      setSubmitting(true)

      const reviewData = {
        story_id: storyId,
        elder_id: elderId,
        elder_name: elderName,
        decision,
        cultural_guidance: culturalGuidance.trim() || undefined,
        concerns: selectedConcerns.length > 0 ? selectedConcerns : undefined,
        requested_changes: requestedChanges.trim() || undefined,
        escalation_reason: escalationReason.trim() || undefined,
        notify_storyteller: notifyStoryteller,
        reviewed_at: new Date().toISOString()
      }

      const response = await fetch('/api/elder/review-queue/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(reviewData)
      })

      if (!response.ok) {
        throw new Error('Failed to submit review')
      }

      const result = await response.json()

      toast({
        title: 'Review Submitted',
        description: getSuccessMessage(decision),
        variant: 'default'
      })

      onReviewCompleted()
    } catch (error) {
      console.error('Failed to submit review:', error)
      toast({
        title: 'Submission Failed',
        description: 'Unable to submit review. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getSuccessMessage = (decision: string) => {
    switch (decision) {
      case 'approve':
        return 'Story has been approved and will be published.'
      case 'reject':
        return 'Story has been rejected. The storyteller will be notified.'
      case 'request_changes':
        return 'Change request sent to storyteller.'
      case 'escalate':
        return 'Story escalated to Elder Council for review.'
      default:
        return 'Review submitted successfully.'
    }
  }

  return (
    <div className="space-y-6">
      {/* Decision Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-600" />
            Review Decision
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={decision || ''} onValueChange={(value) => setDecision(value as any)}>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-sage-50 cursor-pointer">
                <RadioGroupItem value="approve" id="approve" />
                <Label htmlFor="approve" className="flex-1 cursor-pointer flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-sage-600" />
                  <div>
                    <div className="font-medium">Approve Story</div>
                    <div className="text-sm text-muted-foreground">Story is culturally safe and ready to publish</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-clay-50 cursor-pointer">
                <RadioGroupItem value="request_changes" id="request_changes" />
                <Label htmlFor="request_changes" className="flex-1 cursor-pointer flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-clay-600" />
                  <div>
                    <div className="font-medium">Request Changes</div>
                    <div className="text-sm text-muted-foreground">Story needs modifications before approval</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-ember-50 cursor-pointer">
                <RadioGroupItem value="reject" id="reject" />
                <Label htmlFor="reject" className="flex-1 cursor-pointer flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-ember-600" />
                  <div>
                    <div className="font-medium">Reject Story</div>
                    <div className="text-sm text-muted-foreground">Story has cultural safety concerns</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-sky-50 cursor-pointer">
                <RadioGroupItem value="escalate" id="escalate" />
                <Label htmlFor="escalate" className="flex-1 cursor-pointer flex items-center gap-2">
                  <Flag className="h-5 w-5 text-sky-600" />
                  <div>
                    <div className="font-medium">Escalate to Elder Council</div>
                    <div className="text-sm text-muted-foreground">Requires additional cultural guidance</div>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Conditional Fields Based on Decision */}
      {decision === 'reject' && (
        <ConcernCategories
          selectedConcerns={selectedConcerns}
          onConcernsChange={setSelectedConcerns}
        />
      )}

      {decision === 'request_changes' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Requested Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="changes">Describe what changes are needed</Label>
              <Textarea
                id="changes"
                value={requestedChanges}
                onChange={(e) => setRequestedChanges(e.target.value)}
                placeholder="Please explain what modifications the storyteller should make..."
                rows={4}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Be specific and respectful. The storyteller will receive this feedback.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {decision === 'escalate' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Escalation Reason</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="escalation">Why are you escalating this to the Elder Council?</Label>
              <Textarea
                id="escalation"
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                placeholder="Describe the cultural considerations that require council review..."
                rows={4}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                The Elder Council will review your concerns and provide guidance.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cultural Guidance (Optional for all decisions) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cultural Guidance Notes (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="guidance">Provide cultural context or guidance for the storyteller</Label>
            <Textarea
              id="guidance"
              value={culturalGuidance}
              onChange={(e) => setCulturalGuidance(e.target.value)}
              placeholder="Share wisdom, cultural protocols, or guidance that may help the storyteller..."
              rows={4}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Your cultural wisdom helps storytellers honor protocols and share safely.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="notify"
              checked={notifyStoryteller}
              onCheckedChange={(checked) => setNotifyStoryteller(checked === true)}
            />
            <Label htmlFor="notify" className="text-sm cursor-pointer">
              Notify storyteller of this review decision
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          {decision && (
            <div className="flex items-center gap-2">
              <span>Selected:</span>
              <Badge variant="outline">{decision.replace('_', ' ')}</Badge>
            </div>
          )}
        </div>
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!decision || submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Submit Review
            </>
          )}
        </Button>
      </div>

      {/* Cultural Reminder */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-medium">Remember: Your decision protects our community</p>
              <p className="mt-1">
                As an Elder, you are entrusted with maintaining cultural safety and honoring sacred knowledge.
                Take the time you need to make the right decision. When in doubt, escalate to the council.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

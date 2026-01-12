'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Flag,
  Calendar,
  Eye,
  EyeOff,
  Send
} from 'lucide-react'

interface ReviewActionPanelProps {
  storyId: string
  onSubmit: (decision: ReviewDecision) => void
  onCancel: () => void
  loading?: boolean
}

export interface ReviewDecision {
  decision: 'approve' | 'approve_with_conditions' | 'request_changes' | 'escalate' | 'reject'
  notes?: string
  cultural_guidance?: string
  concerns?: string[]
  requested_changes?: Change[]
  visibility_override?: 'public' | 'community' | 'organization' | 'private'
  escalation_reason?: string
  escalate_to_elder?: string
  publish_immediately?: boolean
  scheduled_publish_at?: string
  notify_storyteller?: boolean
}

interface Change {
  category: string
  description: string
  required: boolean
}

export function ReviewActionPanel({ storyId, onSubmit, onCancel, loading }: ReviewActionPanelProps) {
  const [decision, setDecision] = useState<ReviewDecision['decision']>('approve')
  const [notes, setNotes] = useState('')
  const [culturalGuidance, setCulturalGuidance] = useState('')
  const [concerns, setConcerns] = useState<string[]>([])
  const [newConcern, setNewConcern] = useState('')
  const [requestedChanges, setRequestedChanges] = useState<Change[]>([])
  const [visibilityOverride, setVisibilityOverride] = useState<string>('')
  const [escalationReason, setEscalationReason] = useState('')
  const [publishImmediately, setPublishImmediately] = useState(true)
  const [notifyStoryteller, setNotifyStoryteller] = useState(true)

  const addConcern = () => {
    if (newConcern.trim()) {
      setConcerns([...concerns, newConcern.trim()])
      setNewConcern('')
    }
  }

  const removeConcern = (index: number) => {
    setConcerns(concerns.filter((_, i) => i !== index))
  }

  const addChange = () => {
    setRequestedChanges([...requestedChanges, { category: '', description: '', required: true }])
  }

  const updateChange = (index: number, field: keyof Change, value: any) => {
    const updated = [...requestedChanges]
    updated[index] = { ...updated[index], [field]: value }
    setRequestedChanges(updated)
  }

  const removeChange = (index: number) => {
    setRequestedChanges(requestedChanges.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    const reviewDecision: ReviewDecision = {
      decision,
      notes: notes || undefined,
      cultural_guidance: culturalGuidance || undefined,
      concerns: concerns.length > 0 ? concerns : undefined,
      requested_changes: requestedChanges.length > 0 ? requestedChanges : undefined,
      visibility_override: visibilityOverride ? visibilityOverride as any : undefined,
      escalation_reason: escalationReason || undefined,
      publish_immediately: publishImmediately,
      notify_storyteller: notifyStoryteller
    }
    onSubmit(reviewDecision)
  }

  return (
    <div className="space-y-4">
      {/* Decision Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Review Decision</CardTitle>
          <CardDescription>Choose how to proceed with this story</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button
              variant={decision === 'approve' ? 'default' : 'outline'}
              className={decision === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              onClick={() => setDecision('approve')}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>

            <Button
              variant={decision === 'approve_with_conditions' ? 'default' : 'outline'}
              className={decision === 'approve_with_conditions' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              onClick={() => setDecision('approve_with_conditions')}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve with Conditions
            </Button>

            <Button
              variant={decision === 'request_changes' ? 'default' : 'outline'}
              className={decision === 'request_changes' ? 'bg-amber-600 hover:bg-amber-700' : ''}
              onClick={() => setDecision('request_changes')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Request Changes
            </Button>

            <Button
              variant={decision === 'escalate' ? 'default' : 'outline'}
              className={decision === 'escalate' ? 'bg-purple-600 hover:bg-purple-700' : ''}
              onClick={() => setDecision('escalate')}
            >
              <Flag className="h-4 w-4 mr-2" />
              Escalate to Elder
            </Button>

            <Button
              variant={decision === 'reject' ? 'default' : 'outline'}
              className={decision === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
              onClick={() => setDecision('reject')}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Approve Panel */}
      {decision === 'approve' && (
        <Card>
          <CardHeader>
            <CardTitle>Approval Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Cultural Guidance (Optional)</Label>
              <Textarea
                placeholder="Provide cultural context or guidance for readers..."
                value={culturalGuidance}
                onChange={(e) => setCulturalGuidance(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Reviewer Notes (Private)</Label>
              <Textarea
                placeholder="Internal notes about this review..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="publish-immediately"
                checked={publishImmediately}
                onCheckedChange={(checked) => setPublishImmediately(checked as boolean)}
              />
              <Label htmlFor="publish-immediately" className="cursor-pointer">
                Publish immediately
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify"
                checked={notifyStoryteller}
                onCheckedChange={(checked) => setNotifyStoryteller(checked as boolean)}
              />
              <Label htmlFor="notify" className="cursor-pointer">
                Notify storyteller
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approve with Conditions Panel */}
      {decision === 'approve_with_conditions' && (
        <Card>
          <CardHeader>
            <CardTitle>Approval Conditions</CardTitle>
            <CardDescription>Approve with specific visibility or usage restrictions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Visibility Override</Label>
              <Select value={visibilityOverride} onValueChange={setVisibilityOverride}>
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="organization">Organization Only</SelectItem>
                  <SelectItem value="community">Community Only</SelectItem>
                  <SelectItem value="private">Private (Elder Review Team)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Restrict who can view this story despite approval
              </p>
            </div>

            <div className="space-y-2">
              <Label>Cultural Guidance (Required)</Label>
              <Textarea
                placeholder="Explain the conditions and why they're necessary..."
                value={culturalGuidance}
                onChange={(e) => setCulturalGuidance(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify-conditions"
                checked={notifyStoryteller}
                onCheckedChange={(checked) => setNotifyStoryteller(checked as boolean)}
              />
              <Label htmlFor="notify-conditions" className="cursor-pointer">
                Notify storyteller of conditions
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request Changes Panel */}
      {decision === 'request_changes' && (
        <Card>
          <CardHeader>
            <CardTitle>Requested Changes</CardTitle>
            <CardDescription>Specify what needs to be changed before approval</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {requestedChanges.map((change, index) => (
                <div key={index} className="border rounded p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <Label className="text-xs">Change #{index + 1}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeChange(index)}
                    >
                      Remove
                    </Button>
                  </div>

                  <Select
                    value={change.category}
                    onValueChange={(value) => updateChange(index, 'category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cultural">Cultural Sensitivity</SelectItem>
                      <SelectItem value="accuracy">Factual Accuracy</SelectItem>
                      <SelectItem value="privacy">Privacy Concern</SelectItem>
                      <SelectItem value="consent">Consent Issue</SelectItem>
                      <SelectItem value="language">Language/Clarity</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  <Textarea
                    placeholder="Describe what needs to change..."
                    value={change.description}
                    onChange={(e) => updateChange(index, 'description', e.target.value)}
                    rows={2}
                  />

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`required-${index}`}
                      checked={change.required}
                      onCheckedChange={(checked) => updateChange(index, 'required', checked)}
                    />
                    <Label htmlFor={`required-${index}`} className="text-xs cursor-pointer">
                      Required (vs suggested)
                    </Label>
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={addChange} className="w-full">
                + Add Change Request
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Additional Notes for Storyteller</Label>
              <Textarea
                placeholder="Provide context and guidance..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Escalate Panel */}
      {decision === 'escalate' && (
        <Card>
          <CardHeader>
            <CardTitle>Escalation to Elder</CardTitle>
            <CardDescription>Request elder review for cultural matters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Escalation Reason (Required)</Label>
              <Textarea
                placeholder="Explain why elder review is needed and what specific cultural concerns should be addressed..."
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Cultural Concerns</Label>
              <div className="space-y-2">
                {concerns.map((concern, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="outline" className="flex-1">{concern}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeConcern(index)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a concern..."
                    value={newConcern}
                    onChange={(e) => setNewConcern(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addConcern()}
                  />
                  <Button onClick={addConcern}>Add</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reject Panel */}
      {decision === 'reject' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Rejection Reason</CardTitle>
            <CardDescription>This story will be archived and not published</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Reason for Rejection (Required)</Label>
              <Textarea
                placeholder="Clearly explain why this story cannot be published..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                required
              />
              <p className="text-xs text-muted-foreground">
                This will be shared with the storyteller
              </p>
            </div>

            <div className="space-y-2">
              <Label>Cultural or Privacy Concerns</Label>
              <div className="space-y-2">
                {concerns.map((concern, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="outline" className="flex-1 border-red-600 text-red-600">
                      {concern}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeConcern(index)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a concern..."
                    value={newConcern}
                    onChange={(e) => setNewConcern(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addConcern()}
                  />
                  <Button onClick={addConcern}>Add</Button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify-reject"
                checked={notifyStoryteller}
                onCheckedChange={(checked) => setNotifyStoryteller(checked as boolean)}
              />
              <Label htmlFor="notify-reject" className="cursor-pointer">
                Notify storyteller of rejection
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Review
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

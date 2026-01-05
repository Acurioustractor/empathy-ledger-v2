'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { XCircle, Shield, AlertTriangle } from 'lucide-react'

interface Consent {
  id: string
  type: string
  content_title?: string
  purpose: string
}

interface WithdrawalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  consent: Consent
  onWithdrawalCompleted: () => void
}

export function WithdrawalDialog({ open, onOpenChange, consent, onWithdrawalCompleted }: WithdrawalDialogProps) {
  const { toast } = useToast()
  const [reason, setReason] = useState('')
  const [understanding, setUnderstanding] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleWithdraw = async () => {
    if (!understanding) {
      toast({
        title: 'Confirmation Required',
        description: 'Please confirm you understand the consequences of withdrawal.',
        variant: 'destructive'
      })
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch(`/api/consent/${consent.id}/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          reason: reason.trim() || undefined,
          withdrawn_at: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to withdraw consent')
      }

      toast({
        title: 'Consent Withdrawn',
        description: 'Your consent has been withdrawn. The content will be removed or restricted as appropriate.',
      })

      onWithdrawalCompleted()
    } catch (error) {
      console.error('Failed to withdraw consent:', error)
      toast({
        title: 'Withdrawal Failed',
        description: 'Unable to withdraw consent. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-ember-600" />
            Withdraw Consent
          </DialogTitle>
          <DialogDescription>
            Withdraw your consent for {consent.content_title || consent.purpose}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Consent Info */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium capitalize">{consent.type}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Purpose:</span>
              <span className="font-medium">{consent.purpose}</span>
            </div>
          </div>

          {/* What Will Happen */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              What happens when you withdraw consent
            </h4>
            <ul className="space-y-2 text-sm text-amber-800">
              {consent.type === 'story' && (
                <>
                  <li>• Your story will be removed from public view</li>
                  <li>• The story will be marked as "consent withdrawn"</li>
                  <li>• You can restore consent later if you change your mind</li>
                </>
              )}
              {consent.type === 'photo' && (
                <>
                  <li>• Photos/videos will be removed from public galleries</li>
                  <li>• Media will be retained in private storage per GDPR</li>
                  <li>• You can request full deletion separately</li>
                </>
              )}
              {consent.type === 'ai' && (
                <>
                  <li>• AI processing of your content will stop immediately</li>
                  <li>• Existing analysis results will be archived</li>
                  <li>• New analysis can resume if you re-consent</li>
                </>
              )}
              {consent.type === 'sharing' && (
                <>
                  <li>• External sites will lose access immediately</li>
                  <li>• Embed tokens will be revoked</li>
                  <li>• Content remains on Empathy Ledger</li>
                </>
              )}
            </ul>
          </div>

          {/* Optional Reason */}
          <div>
            <Label htmlFor="reason">Reason for Withdrawal (Optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Help us understand why you're withdrawing consent (optional)..."
              rows={3}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Your feedback helps us improve our consent processes and cultural protocols.
            </p>
          </div>

          {/* Understanding Checkbox */}
          <div className="flex items-start space-x-3 p-4 bg-ember-50 border border-ember-200 rounded-lg">
            <Checkbox
              id="understand"
              checked={understanding}
              onCheckedChange={(checked) => setUnderstanding(checked === true)}
              className="mt-1"
            />
            <Label htmlFor="understand" className="text-sm cursor-pointer">
              I understand that withdrawing this consent will result in the changes described above.
              I can re-grant consent at any time in the future.
            </Label>
          </div>

          {/* OCAP Affirmation */}
          <div className="flex items-start gap-3 p-4 bg-sage-50 border border-sage-200 rounded-lg">
            <Shield className="h-5 w-5 text-sage-600 mt-0.5" />
            <div className="text-sm text-sage-900">
              <p className="font-medium">✨ You are in control</p>
              <p className="mt-1 text-sage-700">
                Withdrawing consent is your right under both GDPR and OCAP principles.
                This platform respects your decision without question. You can always
                re-grant consent if circumstances change.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Keep Consent Active
            </Button>
            <Button
              variant="destructive"
              onClick={handleWithdraw}
              disabled={!understanding || submitting}
            >
              {submitting ? 'Withdrawing...' : 'Withdraw Consent'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

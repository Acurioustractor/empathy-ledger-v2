'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle, Calendar, Shield } from 'lucide-react'

interface Consent {
  id: string
  type: string
  content_title?: string
  purpose: string
  expires_at?: string
}

interface RenewalWorkflowProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  consent: Consent
  onRenewalCompleted: () => void
}

export function RenewalWorkflow({ open, onOpenChange, consent, onRenewalCompleted }: RenewalWorkflowProps) {
  const { toast } = useToast()
  const [renewalPeriod, setRenewalPeriod] = useState<'1year' | '2years' | '5years' | 'indefinite'>('1year')
  const [acknowledgment, setAcknowledgment] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleRenew = async () => {
    if (!acknowledgment) {
      toast({
        title: 'Acknowledgment Required',
        description: 'Please confirm you understand the renewal terms.',
        variant: 'destructive'
      })
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch(`/api/consent/${consent.id}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          renewal_period: renewalPeriod,
          renewed_at: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to renew consent')
      }

      toast({
        title: 'Consent Renewed',
        description: `Your ${consent.type} consent has been renewed for ${getPeriodLabel(renewalPeriod)}.`,
      })

      onRenewalCompleted()
    } catch (error) {
      console.error('Failed to renew consent:', error)
      toast({
        title: 'Renewal Failed',
        description: 'Unable to renew consent. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '1year': return '1 year'
      case '2years': return '2 years'
      case '5years': return '5 years'
      case 'indefinite': return 'indefinitely (until withdrawn)'
      default: return period
    }
  }

  const getNewExpiryDate = (period: string) => {
    if (period === 'indefinite') return 'Never (until you withdraw consent)'

    const date = new Date()
    const years = parseInt(period.replace('years', '').replace('year', ''))
    date.setFullYear(date.getFullYear() + years)
    return date.toLocaleDateString()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-sage-600" />
            Renew Consent
          </DialogTitle>
          <DialogDescription>
            Renew your consent for {consent.content_title || consent.purpose}
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
            {consent.expires_at && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Expiry:</span>
                <span className="font-medium text-ember-600">
                  {new Date(consent.expires_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Renewal Period Selection */}
          <div>
            <Label className="text-base mb-3 block">Select Renewal Period</Label>
            <RadioGroup value={renewalPeriod} onValueChange={(value) => setRenewalPeriod(value as any)}>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-sage-50 cursor-pointer">
                  <RadioGroupItem value="1year" id="1year" className="mt-1" />
                  <Label htmlFor="1year" className="flex-1 cursor-pointer">
                    <div className="font-medium">1 Year</div>
                    <div className="text-sm text-muted-foreground">
                      Expires: {getNewExpiryDate('1year')}
                    </div>
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-sage-50 cursor-pointer">
                  <RadioGroupItem value="2years" id="2years" className="mt-1" />
                  <Label htmlFor="2years" className="flex-1 cursor-pointer">
                    <div className="font-medium">2 Years</div>
                    <div className="text-sm text-muted-foreground">
                      Expires: {getNewExpiryDate('2years')}
                    </div>
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-sage-50 cursor-pointer">
                  <RadioGroupItem value="5years" id="5years" className="mt-1" />
                  <Label htmlFor="5years" className="flex-1 cursor-pointer">
                    <div className="font-medium">5 Years (Recommended)</div>
                    <div className="text-sm text-muted-foreground">
                      Expires: {getNewExpiryDate('5years')}
                    </div>
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-sky-50 cursor-pointer">
                  <RadioGroupItem value="indefinite" id="indefinite" className="mt-1" />
                  <Label htmlFor="indefinite" className="flex-1 cursor-pointer">
                    <div className="font-medium">Indefinite (Until Withdrawn)</div>
                    <div className="text-sm text-muted-foreground">
                      No expiry date - you can withdraw anytime
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Acknowledgment */}
          <div className="flex items-start space-x-3 p-4 bg-sky-50 border border-sky-200 rounded-lg">
            <Checkbox
              id="acknowledge"
              checked={acknowledgment}
              onCheckedChange={(checked) => setAcknowledgment(checked === true)}
              className="mt-1"
            />
            <Label htmlFor="acknowledge" className="text-sm cursor-pointer">
              I understand that by renewing this consent, I am agreeing to the continued use of my
              {consent.type === 'story' && ' story'}
              {consent.type === 'photo' && ' photo/video'}
              {consent.type === 'ai' && ' data for AI processing'}
              {consent.type === 'sharing' && ' content for external sharing'}
              {' '}for {getPeriodLabel(renewalPeriod)}. I can withdraw this consent at any time.
            </Label>
          </div>

          {/* OCAP Reminder */}
          <div className="flex items-start gap-3 p-4 bg-sage-50 border border-sage-200 rounded-lg">
            <Shield className="h-5 w-5 text-sage-600 mt-0.5" />
            <div className="text-sm text-sage-900">
              <p className="font-medium">Your Rights Under OCAP</p>
              <ul className="mt-1 space-y-1 text-sage-700">
                <li>• <strong>Ownership:</strong> You own your story and data</li>
                <li>• <strong>Control:</strong> You control how it's used</li>
                <li>• <strong>Access:</strong> You can see who accessed it</li>
                <li>• <strong>Possession:</strong> You can withdraw consent anytime</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRenew}
              disabled={!acknowledgment || submitting}
            >
              {submitting ? 'Renewing...' : 'Renew Consent'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

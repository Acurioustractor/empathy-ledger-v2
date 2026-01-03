'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2, AlertTriangle, Loader2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DeleteAccountDialogProps {
  storytellerId: string
  storytellerEmail: string
  className?: string
}

type DeletionStatus = 'idle' | 'confirming' | 'processing' | 'requested' | 'error'

interface DeletionOptions {
  deleteStories: boolean
  deleteMedia: boolean
  deleteTranscripts: boolean
  anonymizeInstead: boolean
}

export function DeleteAccountDialog({
  storytellerId,
  storytellerEmail,
  className
}: DeleteAccountDialogProps) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<DeletionStatus>('idle')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [understood, setUnderstood] = useState(false)
  const [options, setOptions] = useState<DeletionOptions>({
    deleteStories: true,
    deleteMedia: true,
    deleteTranscripts: true,
    anonymizeInstead: false,
  })

  const emailMatches = confirmEmail.toLowerCase() === storytellerEmail.toLowerCase()
  const textMatches = confirmText.toUpperCase() === 'DELETE MY ACCOUNT'
  const canProceed = emailMatches && textMatches && understood && status !== 'processing'

  const handleSubmit = async () => {
    if (!canProceed) return

    setStatus('processing')

    try {
      const response = await fetch('/api/user/deletion-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storytellerId,
          options,
        }),
      })

      if (!response.ok) {
        throw new Error('Deletion request failed')
      }

      setStatus('requested')

      // Reset after showing success
      setTimeout(() => {
        setOpen(false)
        // Redirect to confirmation page or logout
        window.location.href = '/account-deletion-requested'
      }, 3000)
    } catch (error) {
      console.error('Deletion error:', error)
      setStatus('error')
    }
  }

  const toggleOption = (key: keyof DeletionOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className={cn('gap-2', className)}>
          <Trash2 className="h-4 w-4" />
          Delete My Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Your Account
          </DialogTitle>
          <DialogDescription>
            This action will permanently delete your account and associated data. Please read carefully.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {status === 'requested' ? (
            // Success State
            <div className="space-y-4 p-6 bg-green-50 border border-green-200 rounded-lg text-green-800">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-2">Deletion Request Received</h3>
                  <p className="text-sm mb-3">
                    Your account deletion request has been submitted. You will receive an email confirmation shortly.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Processing Time:</strong> 30 days</p>
                    <p><strong>Cancel Window:</strong> You have 30 days to cancel this request</p>
                    <p><strong>Next Steps:</strong> Check your email for confirmation and cancellation instructions</p>
                  </div>
                </div>
              </div>
            </div>
          ) : status === 'error' ? (
            // Error State
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-medium">Deletion request failed</p>
                  <p className="text-sm">Please try again or contact support at privacy@empathyledger.com</p>
                </div>
              </div>
            </div>
          ) : (
            // Confirmation Form
            <>
              {/* Warning Notice */}
              <div className="p-4 bg-ember-50 border border-ember-200 rounded-lg text-ember-800">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  This action cannot be undone
                </h3>
                <p className="text-sm">
                  Deleting your account is permanent. We cannot recover your data after the 30-day processing window.
                </p>
              </div>

              {/* What Will Be Deleted */}
              <div className="space-y-3">
                <Label>What will be deleted:</Label>
                <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                  {[
                    { key: 'deleteStories' as const, label: 'All Stories', desc: 'Published and draft stories will be permanently removed', required: true },
                    { key: 'deleteMedia' as const, label: 'All Media', desc: 'Photos, audio, and video files will be permanently deleted', required: true },
                    { key: 'deleteTranscripts' as const, label: 'All Transcripts', desc: 'Oral history transcripts and recordings will be removed', required: true },
                  ].map(({ key, label, desc, required }) => (
                    <div key={key} className="flex items-start space-x-3">
                      <Checkbox
                        id={key}
                        checked={options[key]}
                        onCheckedChange={() => !required && toggleOption(key)}
                        disabled={required}
                      />
                      <div className="flex-1">
                        <Label htmlFor={key} className="font-medium cursor-pointer">
                          {label} {required && <span className="text-red-600">*</span>}
                        </Label>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternative: Anonymize */}
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="anonymizeInstead"
                    checked={options.anonymizeInstead}
                    onCheckedChange={() => toggleOption('anonymizeInstead')}
                  />
                  <div className="flex-1">
                    <Label htmlFor="anonymizeInstead" className="font-medium cursor-pointer">
                      Anonymize my stories instead of deleting them
                    </Label>
                    <p className="text-sm text-sky-800 mt-1">
                      Your stories will remain on the platform but your name and personal information will be removed.
                      This preserves cultural knowledge while protecting your privacy.
                    </p>
                  </div>
                </div>
              </div>

              {/* GDPR Notice */}
              <div className="p-4 bg-clay-50 border border-clay-200 rounded-lg text-clay-800 text-sm">
                <p className="font-medium mb-1">Your Right to Erasure (GDPR Article 17)</p>
                <p>
                  You have the right to request deletion of your personal data. We will process your request within 30 days.
                  You can cancel this request anytime during the 30-day window.
                </p>
              </div>

              {/* Confirmation Fields */}
              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label htmlFor="confirmEmail">
                    Confirm your email address
                  </Label>
                  <Input
                    id="confirmEmail"
                    type="email"
                    placeholder={storytellerEmail}
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    className={cn(
                      confirmEmail && !emailMatches && 'border-red-500 focus-visible:ring-red-500'
                    )}
                  />
                  {confirmEmail && !emailMatches && (
                    <p className="text-sm text-red-600">Email does not match</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmText">
                    Type <strong>DELETE MY ACCOUNT</strong> to confirm
                  </Label>
                  <Input
                    id="confirmText"
                    type="text"
                    placeholder="DELETE MY ACCOUNT"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className={cn(
                      confirmText && !textMatches && 'border-red-500 focus-visible:ring-red-500'
                    )}
                  />
                  {confirmText && !textMatches && (
                    <p className="text-sm text-red-600">Text does not match exactly</p>
                  )}
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="understood"
                    checked={understood}
                    onCheckedChange={(checked) => setUnderstood(!!checked)}
                  />
                  <Label htmlFor="understood" className="font-normal cursor-pointer text-sm">
                    I understand this action is permanent and cannot be undone after 30 days.
                    I have exported my data if needed.
                  </Label>
                </div>
              </div>
            </>
          )}
        </div>

        {status !== 'requested' && (
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={status === 'processing'}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmit}
              disabled={!canProceed || status === 'processing'}
              className="gap-2"
            >
              {status === 'processing' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  {options.anonymizeInstead ? 'Anonymize & Delete Account' : 'Delete My Account'}
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

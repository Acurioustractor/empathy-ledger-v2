'use client'

import React, { useState } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, EyeOff, Loader2 } from 'lucide-react'

interface UnpublishDialogProps {
  storyId: string
  storyTitle: string
  isOpen: boolean
  onClose: () => void
  onUnpublished: () => void
}

export function UnpublishDialog({
  storyId,
  storyTitle,
  isOpen,
  onClose,
  onUnpublished
}: UnpublishDialogProps) {
  const [reason, setReason] = useState('')
  const [unpublishing, setUnpublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUnpublish = async () => {
    setUnpublishing(true)
    setError(null)

    try {
      const response = await fetch(`/api/stories/${storyId}/unpublish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() || null })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to unpublish story')
      }

      onUnpublished()
      onClose()
    } catch (error: any) {
      console.error('Error unpublishing story:', error)
      setError(error.message)
    } finally {
      setUnpublishing(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-amber-600" />
            Unpublish Story?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Are you sure you want to unpublish <strong>{storyTitle}</strong>?
            </p>

            <Alert>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription>
                <strong>What happens when you unpublish:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Story will no longer be visible to the public</li>
                  <li>Existing links will show "Story unavailable"</li>
                  <li>Comments will be hidden but preserved</li>
                  <li>You can republish anytime from your drafts</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for unpublishing (optional)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Needs revision, cultural protocol review, seasonal restrictions..."
                rows={3}
              />
              <p className="text-xs text-[#2C2C2C]/60">
                This will be recorded in your story history for reference
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose} disabled={unpublishing}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleUnpublish}
            disabled={unpublishing}
          >
            {unpublishing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Unpublishing...
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Unpublish Story
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

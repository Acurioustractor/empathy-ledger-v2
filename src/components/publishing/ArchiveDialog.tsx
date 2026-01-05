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
import { Archive, AlertTriangle, Loader2 } from 'lucide-react'

interface ArchiveDialogProps {
  storyId: string
  storyTitle: string
  isPublished: boolean
  isOpen: boolean
  onClose: () => void
  onArchived: () => void
}

export function ArchiveDialog({
  storyId,
  storyTitle,
  isPublished,
  isOpen,
  onClose,
  onArchived
}: ArchiveDialogProps) {
  const [reason, setReason] = useState('')
  const [archiving, setArchiving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleArchive = async () => {
    setArchiving(true)
    setError(null)

    try {
      const response = await fetch(`/api/stories/${storyId}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() || null })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to archive story')
      }

      onArchived()
      onClose()
    } catch (error: any) {
      console.error('Error archiving story:', error)
      setError(error.message)
    } finally {
      setArchiving(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-[#2C2C2C]" />
            Archive Story?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Are you sure you want to archive <strong>{storyTitle}</strong>?
            </p>

            {isPublished && (
              <Alert>
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription>
                  This story is currently <strong>published</strong>. Archiving will automatically
                  unpublish it and remove it from public view.
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertDescription>
                <strong>What happens when you archive:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Story is removed from active drafts</li>
                  <li>Story is moved to your archive for safekeeping</li>
                  <li>All content and metadata is preserved</li>
                  <li>You can restore from archive anytime</li>
                  {isPublished && <li className="text-amber-600">Story will be unpublished</li>}
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for archiving (optional)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Outdated content, completed project, seasonal relevance ended..."
                rows={3}
              />
              <p className="text-xs text-[#2C2C2C]/60">
                This helps you remember why the story was archived
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
          <Button variant="outline" onClick={onClose} disabled={archiving}>
            Cancel
          </Button>
          <Button
            onClick={handleArchive}
            disabled={archiving}
            className="bg-[#2C2C2C] hover:bg-[#2C2C2C]/90"
          >
            {archiving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Archiving...
              </>
            ) : (
              <>
                <Archive className="w-4 h-4 mr-2" />
                Archive Story
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

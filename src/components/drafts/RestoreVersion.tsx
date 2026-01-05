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
import { RotateCcw, AlertTriangle, Loader2, Info } from 'lucide-react'

interface StoryVersion {
  id: string
  version_number: number
  title: string
  created_by: {
    full_name: string
  }
  created_at: string
}

interface RestoreVersionProps {
  storyId: string
  version: StoryVersion
  currentVersionNumber: number
  isOpen: boolean
  onClose: () => void
  onRestored: () => void
}

export function RestoreVersion({
  storyId,
  version,
  currentVersionNumber,
  isOpen,
  onClose,
  onRestored
}: RestoreVersionProps) {
  const [reason, setReason] = useState('')
  const [restoring, setRestoring] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRestore = async () => {
    setRestoring(true)
    setError(null)

    try {
      const response = await fetch(`/api/stories/${storyId}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version_id: version.id,
          reason: reason.trim() || null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to restore version')
      }

      onRestored()
      onClose()
    } catch (error: any) {
      console.error('Error restoring version:', error)
      setError(error.message)
    } finally {
      setRestoring(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[#D97757]" />
            Restore Version?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Are you sure you want to restore <strong>Version {version.version_number}</strong>?
            </p>

            <Alert>
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <strong>What happens when you restore:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Current content will be saved as Version {currentVersionNumber + 1}</li>
                  <li>Version {version.version_number} content will become active</li>
                  <li>All version history is preserved</li>
                  <li>This action can be undone by restoring another version</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="p-3 bg-[#F8F6F1] rounded border">
              <p className="text-xs text-[#2C2C2C]/60 mb-1">Restoring version created by:</p>
              <p className="text-sm font-medium">{version.created_by.full_name}</p>
              <p className="text-xs text-[#2C2C2C]/60 mt-1">
                {new Date(version.created_at).toLocaleString()}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for restoring (optional)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Reverting unwanted changes, returning to approved version..."
                rows={3}
              />
              <p className="text-xs text-[#2C2C2C]/60">
                This will be recorded in your version history
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
          <Button variant="outline" onClick={onClose} disabled={restoring}>
            Cancel
          </Button>
          <Button
            onClick={handleRestore}
            disabled={restoring}
            className="bg-[#D97757] hover:bg-[#D97757]/90"
          >
            {restoring ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Restoring...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore Version
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

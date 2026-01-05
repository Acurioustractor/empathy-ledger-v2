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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react'

interface MediaAsset {
  id: string
  url: string
  type: 'image' | 'audio' | 'video' | 'document'
  title?: string
  usage_count?: number
  cultural_sensitivity?: 'public' | 'sensitive' | 'sacred'
}

interface MediaDeleteProps {
  media: MediaAsset
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => void
}

export function MediaDelete({ media, isOpen, onClose, onDelete }: MediaDeleteProps) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasUsage = (media.usage_count || 0) > 0
  const isSacred = media.cultural_sensitivity === 'sacred'

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/media/${media.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete media')
      }

      onDelete(media.id)
      onClose()
    } catch (error: any) {
      console.error('Error deleting media:', error)
      setError(error.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Delete Media?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Are you sure you want to delete <strong>{media.title || 'this media'}</strong>?
              This action cannot be undone.
            </p>

            {hasUsage && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> This media is currently used in {media.usage_count}
                  {media.usage_count === 1 ? ' story' : ' stories'}.
                  Deleting it will remove the media from those stories.
                </AlertDescription>
              </Alert>
            )}

            {isSacred && (
              <Alert>
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription>
                  This is <strong>sacred content</strong>. Please ensure you have proper authority
                  to delete this media and that all cultural protocols are being respected.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Media
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

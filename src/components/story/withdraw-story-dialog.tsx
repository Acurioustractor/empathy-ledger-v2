'use client'

import React, { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertTriangle, Check, X } from 'lucide-react'

interface WithdrawStoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storyId: string
  storyTitle: string
  shareLinkCount: number
  onSuccess?: () => void
}

export default function WithdrawStoryDialog({
  open,
  onOpenChange,
  storyId,
  storyTitle,
  shareLinkCount,
  onSuccess,
}: WithdrawStoryDialogProps) {
  const [withdrawing, setWithdrawing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleWithdraw = async () => {
    setWithdrawing(true)
    setError(null)

    try {
      const response = await fetch(`/api/stories/${storyId}/withdraw`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to withdraw story')
      }

      // Success - close dialog and refresh
      onSuccess?.()
    } catch (error) {
      console.error('Error withdrawing story:', error)
      setError('Failed to withdraw story. Please try again.')
    } finally {
      setWithdrawing(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-xl">
                Withdraw "{storyTitle}"?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base mt-1">
                This will immediately stop all share links from working.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* What Will Happen */}
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">What will happen:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-foreground">
                  All {shareLinkCount} share link{shareLinkCount !== 1 ? 's' : ''} will
                  stop working within seconds
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-foreground">
                  People with the link will see "Story has been withdrawn by the
                  storyteller"
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-foreground">
                  You can re-publish your story later if you change your mind
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-foreground">
                  You'll receive an email confirmation
                </p>
              </div>
            </div>
          </div>

          {/* What We Can't Control */}
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">
              What we can't control:
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <X className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">
                  People who already saw your story might have taken screenshots
                </p>
              </div>
              <div className="flex items-start gap-2">
                <X className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">
                  We can't remove copies if someone saved your story elsewhere
                </p>
              </div>
              <div className="flex items-start gap-2">
                <X className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">
                  Browser caches will gradually clear (usually within 24-48 hours)
                </p>
              </div>
            </div>
          </div>

          {/* Honesty Statement */}
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-foreground">
              <strong>We believe in being honest:</strong> Once something is on the internet,
              we can't guarantee 100% removal. But we <em>can</em> guarantee that we'll stop
              anyone new from seeing it through our platform, and we'll stop all the links
              we control within seconds.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={withdrawing}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleWithdraw()
            }}
            disabled={withdrawing}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {withdrawing ? 'Withdrawing...' : 'Yes, Withdraw My Story'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

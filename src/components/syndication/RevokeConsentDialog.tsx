'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface RevokeConsentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  consentId: string
  siteName: string
  storyTitle: string
  onRevoked?: () => void
}

export function RevokeConsentDialog({
  open,
  onOpenChange,
  consentId,
  siteName,
  storyTitle,
  onRevoked
}: RevokeConsentDialogProps) {
  const [reason, setReason] = useState('')
  const [isRevoking, setIsRevoking] = useState(false)
  const { toast } = useToast()

  const handleRevoke = async () => {
    setIsRevoking(true)

    try {
      const response = await fetch(`/api/syndication/consent/${consentId}/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          reason: reason.trim() || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to revoke consent')
      }

      toast({
        title: 'Consent revoked',
        description: `${siteName} no longer has access to "${storyTitle}"`
      })

      onOpenChange(false)
      setReason('')
      onRevoked?.()
    } catch (error) {
      console.error('Error revoking consent:', error)
      toast({
        title: 'Failed to revoke consent',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setIsRevoking(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-ember-900">
            Revoke Consent for {siteName}?
          </DialogTitle>
          <DialogDescription>
            This will immediately remove {siteName}'s access to "{storyTitle}".
            They will no longer be able to display it on their platform.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Cultural affirmation message */}
          <div className="rounded-lg bg-sky-50 p-4 border border-sky-200">
            <p className="text-sm text-sky-900 font-medium">
              ✨ You maintain full control
            </p>
            <p className="text-sm text-sky-700 mt-1">
              Your story remains on Empathy Ledger. You can grant consent
              again at any time.
            </p>
          </div>

          {/* Optional reason input */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for revoking (optional)</Label>
            <Textarea
              id="reason"
              placeholder="E.g., Story needs updating, not ready for external sharing..."
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isRevoking}
            />
            <p className="text-xs text-muted-foreground">
              This helps us improve the platform and may be shared anonymously
              with {siteName} to improve their service.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRevoking}
          >
            Keep Consent
          </Button>
          <Button
            variant="destructive"
            onClick={handleRevoke}
            disabled={isRevoking}
          >
            {isRevoking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Revoking...
              </>
            ) : (
              'Revoke Access'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

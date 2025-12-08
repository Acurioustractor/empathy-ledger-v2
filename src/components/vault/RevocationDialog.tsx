'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Ban,
  AlertTriangle,
  Code2,
  Share2,
  Webhook,
  Archive,
  ShieldOff,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRevocation, RevocationScope, RevocationPreview } from '@/lib/hooks/useRevocation'

interface RevocationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storyId: string
  storyTitle?: string
  onSuccess?: () => void
}

export function RevocationDialog({
  open,
  onOpenChange,
  storyId,
  storyTitle,
  onSuccess
}: RevocationDialogProps) {
  const [scope, setScope] = useState<RevocationScope>('all')
  const [reason, setReason] = useState('')
  const [archiveStory, setArchiveStory] = useState(true)
  const [disableSharing, setDisableSharing] = useState(true)
  const [notifyWebhooks, setNotifyWebhooks] = useState(true)
  const [confirmed, setConfirmed] = useState(false)
  const [currentPreview, setCurrentPreview] = useState<RevocationPreview | null>(null)

  const {
    preview,
    isLoadingPreview,
    isRevoking,
    revocationResult,
    error,
    revoke,
    getPreview
  } = useRevocation(storyId)

  // Load preview when scope changes
  useEffect(() => {
    if (open && storyId) {
      getPreview(scope).then(p => setCurrentPreview(p))
    }
  }, [open, storyId, scope, getPreview])

  // Use fetched preview or loaded preview
  const activePreview = currentPreview || preview

  const handleRevoke = async () => {
    if (!confirmed) return

    const result = await revoke({
      scope,
      reason: reason || undefined,
      archiveStory: scope === 'all' ? archiveStory : undefined,
      disableSharing,
      notifyWebhooks
    })

    if (result) {
      onSuccess?.()
      // Keep dialog open to show success state briefly
      setTimeout(() => {
        onOpenChange(false)
        // Reset state
        setScope('all')
        setReason('')
        setArchiveStory(true)
        setDisableSharing(true)
        setNotifyWebhooks(true)
        setConfirmed(false)
      }, 2000)
    }
  }

  const handleClose = () => {
    if (!isRevoking) {
      onOpenChange(false)
    }
  }

  // Success state
  if (revocationResult) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent size="lg">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-success mb-4" />
            <DialogTitle className="text-xl mb-2">Revocation Complete</DialogTitle>
            <DialogDescription className="space-y-2">
              <p>Successfully revoked access to "{storyTitle}"</p>
              <div className="flex justify-center gap-4 mt-4 text-sm">
                <Badge variant="secondary">
                  <Code2 className="mr-1 h-3 w-3" />
                  {revocationResult.embedsRevoked} embeds
                </Badge>
                <Badge variant="secondary">
                  <Share2 className="mr-1 h-3 w-3" />
                  {revocationResult.distributionsRevoked} distributions
                </Badge>
                {revocationResult.webhooksSent > 0 && (
                  <Badge variant="secondary">
                    <Webhook className="mr-1 h-3 w-3" />
                    {revocationResult.webhooksSent} webhooks sent
                  </Badge>
                )}
              </div>
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="lg" cultural>
        <DialogHeader cultural>
          <DialogTitle cultural className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-destructive" />
            Revoke Story Access
          </DialogTitle>
          <DialogDescription cultural>
            {storyTitle
              ? `Revoke external access to "${storyTitle}". This action will remove the story from all external platforms.`
              : 'Revoke external access to this story. This action will remove the story from all external platforms.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Scope selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">What to Revoke</Label>
            <RadioGroup
              value={scope}
              onValueChange={(value) => setScope(value as RevocationScope)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="flex-1 cursor-pointer">
                  <div className="font-medium">Everything</div>
                  <div className="text-sm text-muted-foreground">
                    Revoke all embeds and distributions, optionally archive story
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="embeds" id="embeds" />
                <Label htmlFor="embeds" className="flex-1 cursor-pointer">
                  <div className="font-medium">Embeds Only</div>
                  <div className="text-sm text-muted-foreground">
                    Revoke embed tokens, external embeds will stop working
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="distributions" id="distributions" />
                <Label htmlFor="distributions" className="flex-1 cursor-pointer">
                  <div className="font-medium">Distributions Only</div>
                  <div className="text-sm text-muted-foreground">
                    Revoke tracked distributions and send takedown notifications
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Impact preview */}
          {activePreview && (
            <Alert className="bg-warning/10 border-warning/30">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <AlertDescription className="space-y-2">
                <p className="font-medium">This will affect:</p>
                <ul className="text-sm space-y-1">
                  {activePreview.estimatedActions.map((action, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                      {action}
                    </li>
                  ))}
                </ul>
                {activePreview.totalViews > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Total views that will be cut off: {activePreview.totalViews.toLocaleString()}
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {isLoadingPreview && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading preview...</span>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Options</Label>
            <div className="space-y-2">
              {scope === 'all' && (
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id="archive"
                    checked={archiveStory}
                    onCheckedChange={(checked) => setArchiveStory(checked as boolean)}
                  />
                  <Label htmlFor="archive" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Archive className="h-4 w-4 text-muted-foreground" />
                      Archive story after revocation
                    </div>
                  </Label>
                </div>
              )}
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id="disable-sharing"
                  checked={disableSharing}
                  onCheckedChange={(checked) => setDisableSharing(checked as boolean)}
                />
                <Label htmlFor="disable-sharing" className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <ShieldOff className="h-4 w-4 text-muted-foreground" />
                    Disable future sharing
                  </div>
                </Label>
              </div>
              {activePreview && activePreview.webhooksConfigured > 0 && (
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id="notify-webhooks"
                    checked={notifyWebhooks}
                    onCheckedChange={(checked) => setNotifyWebhooks(checked as boolean)}
                  />
                  <Label htmlFor="notify-webhooks" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Webhook className="h-4 w-4 text-muted-foreground" />
                      Send webhook notifications ({activePreview.webhooksConfigured} configured)
                    </div>
                  </Label>
                </div>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">Reason (optional)</Label>
            <Textarea
              id="reason"
              placeholder="Why are you revoking access?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Confirmation */}
          <div className="flex items-center space-x-3 p-3 border-2 border-destructive/30 rounded-lg bg-destructive/5">
            <Checkbox
              id="confirm"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked as boolean)}
            />
            <Label htmlFor="confirm" className="cursor-pointer text-sm">
              I understand this action cannot be undone and external embeds will immediately stop working
            </Label>
          </div>

          {/* Error display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter cultural>
          <Button variant="outline" onClick={handleClose} disabled={isRevoking}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRevoke}
            disabled={!confirmed || isRevoking}
          >
            {isRevoking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Revoking...
              </>
            ) : (
              <>
                <Ban className="mr-2 h-4 w-4" />
                Revoke Access
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RevocationDialog

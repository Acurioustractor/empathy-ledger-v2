'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Image,
  MessageSquare,
  BarChart3,
  Shield,
  Loader2
} from 'lucide-react'

interface Story {
  id: string
  title: string
}

interface SyndicationSite {
  id: string
  slug: string
  name: string
  description?: string
}

interface CreateConsentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  story: Story
  sites: SyndicationSite[]
  onSuccess?: (consent: any) => void
}

export function CreateConsentDialog({
  open,
  onOpenChange,
  story,
  sites,
  onSuccess
}: CreateConsentDialogProps) {
  const [selectedSite, setSelectedSite] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Permissions
  const [allowFullContent, setAllowFullContent] = useState(true)
  const [allowExcerptOnly, setAllowExcerptOnly] = useState(false)
  const [allowMediaAssets, setAllowMediaAssets] = useState(true)
  const [allowComments, setAllowComments] = useState(false)
  const [allowAnalytics, setAllowAnalytics] = useState(true)

  // Cultural safety
  const [culturalPermissionLevel, setCulturalPermissionLevel] = useState<string>('public')
  const [requiresElderApproval, setRequiresElderApproval] = useState(false)

  // Request context
  const [requestReason, setRequestReason] = useState('')

  const handleSubmit = async () => {
    if (!selectedSite) {
      setError('Please select a syndication site')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/syndication/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId: story.id,
          siteSlug: selectedSite,
          permissions: {
            allowFullContent,
            allowExcerptOnly,
            allowMediaAssets,
            allowComments,
            allowAnalytics
          },
          culturalPermissionLevel,
          requiresElderApproval,
          requestReason: requestReason || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create consent')
      }

      onSuccess?.(data.consent)
      onOpenChange(false)

      // Reset form
      setSelectedSite('')
      setRequestReason('')
      setAllowFullContent(true)
      setAllowExcerptOnly(false)
      setAllowMediaAssets(true)
      setAllowComments(false)
      setAllowAnalytics(true)
      setCulturalPermissionLevel('public')
      setRequiresElderApproval(false)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create consent')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExcerptToggle = (checked: boolean) => {
    setAllowExcerptOnly(checked)
    if (checked) {
      setAllowFullContent(false)
    }
  }

  const handleFullContentToggle = (checked: boolean) => {
    setAllowFullContent(checked)
    if (checked) {
      setAllowExcerptOnly(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-sage-600" />
            Grant Syndication Consent
          </DialogTitle>
          <DialogDescription>
            Grant permission to share "{story.title}" on an external platform.
            You can revoke this consent at any time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Site Selection */}
          <div className="space-y-2">
            <Label>Select Platform *</Label>
            <Select value={selectedSite} onValueChange={setSelectedSite}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a platform..." />
              </SelectTrigger>
              <SelectContent>
                {sites.map((site) => (
                  <SelectItem key={site.id} value={site.slug}>
                    <div className="flex flex-col">
                      <span className="font-medium">{site.name}</span>
                      {site.description && (
                        <span className="text-xs text-muted-foreground">
                          {site.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content Permissions */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Content Permissions
            </Label>

            <div className="grid grid-cols-2 gap-4 pl-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fullContent"
                  checked={allowFullContent}
                  onCheckedChange={handleFullContentToggle}
                />
                <label
                  htmlFor="fullContent"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Full story content
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="excerptOnly"
                  checked={allowExcerptOnly}
                  onCheckedChange={handleExcerptToggle}
                />
                <label
                  htmlFor="excerptOnly"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Excerpt only
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mediaAssets"
                  checked={allowMediaAssets}
                  onCheckedChange={(checked) => setAllowMediaAssets(checked as boolean)}
                />
                <label
                  htmlFor="mediaAssets"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
                >
                  <Image className="h-3 w-3" />
                  Media assets
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="comments"
                  checked={allowComments}
                  onCheckedChange={(checked) => setAllowComments(checked as boolean)}
                />
                <label
                  htmlFor="comments"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
                >
                  <MessageSquare className="h-3 w-3" />
                  Allow comments
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="analytics"
                  checked={allowAnalytics}
                  onCheckedChange={(checked) => setAllowAnalytics(checked as boolean)}
                />
                <label
                  htmlFor="analytics"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
                >
                  <BarChart3 className="h-3 w-3" />
                  Analytics tracking
                </label>
              </div>
            </div>
          </div>

          {/* Cultural Permission Level */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Cultural Permission Level
            </Label>
            <Select value={culturalPermissionLevel} onValueChange={setCulturalPermissionLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700">Public</Badge>
                    <span className="text-sm">- Open to all</span>
                  </div>
                </SelectItem>
                <SelectItem value="community">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">Community</Badge>
                    <span className="text-sm">- Community members only</span>
                  </div>
                </SelectItem>
                <SelectItem value="restricted">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Restricted</Badge>
                    <span className="text-sm">- Limited access</span>
                  </div>
                </SelectItem>
                <SelectItem value="sacred">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-purple-50 text-purple-700">Sacred</Badge>
                    <span className="text-sm">- Cultural gatekeepers only</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Elder Approval */}
          <div className="flex items-center space-x-2 pl-1">
            <Checkbox
              id="elderApproval"
              checked={requiresElderApproval}
              onCheckedChange={(checked) => setRequiresElderApproval(checked as boolean)}
            />
            <label
              htmlFor="elderApproval"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Requires Elder/Cultural Authority Approval
            </label>
          </div>

          {requiresElderApproval && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-800">
                This consent will be pending until approved by a designated Elder or cultural authority.
                You will be notified when a decision is made.
              </p>
            </div>
          )}

          {/* Request Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Sharing (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Why do you want to share this story on this platform?"
              value={requestReason}
              onChange={(e) => setRequestReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedSite}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Granting Consent...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Grant Consent
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

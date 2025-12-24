'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import {
  Share2,
  Copy,
  Eye,
  Clock,
  LinkIcon,
  Trash2,
  Check,
  ExternalLink,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShareLink {
  id: string
  shareUrl: string
  purpose: string
  sharedTo: string[]
  viewCount: number
  maxViews: number | null
  expiresAt: string
  revoked: boolean
  createdAt: string
  lastAccessedAt: string | null
  isActive: boolean
}

interface ShareLinkManagerProps {
  storyId: string
  storyTitle: string
}

export default function ShareLinkManager({ storyId, storyTitle }: ShareLinkManagerProps) {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [linkToRevoke, setLinkToRevoke] = useState<string | null>(null)

  // Form state for new share link
  const [newLinkForm, setNewLinkForm] = useState({
    expiresIn: '604800', // 7 days
    maxViews: '',
    purpose: 'direct-share',
    sharedTo: [] as string[],
  })

  useEffect(() => {
    fetchShareLinks()
  }, [storyId])

  const fetchShareLinks = async () => {
    try {
      const response = await fetch(`/api/stories/${storyId}/share-link`)
      if (response.ok) {
        const data = await response.json()
        setShareLinks(data.shareLinks || [])
      }
    } catch (error) {
      console.error('Error fetching share links:', error)
    } finally {
      setLoading(false)
    }
  }

  const createShareLink = async () => {
    setCreating(true)
    try {
      const response = await fetch(`/api/stories/${storyId}/share-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expiresIn: parseInt(newLinkForm.expiresIn),
          maxViews: newLinkForm.maxViews ? parseInt(newLinkForm.maxViews) : null,
          purpose: newLinkForm.purpose,
          sharedTo: newLinkForm.sharedTo,
        }),
      })

      if (response.ok) {
        await fetchShareLinks()
        // Reset form
        setNewLinkForm({
          expiresIn: '604800',
          maxViews: '',
          purpose: 'direct-share',
          sharedTo: [],
        })
      }
    } catch (error) {
      console.error('Error creating share link:', error)
    } finally {
      setCreating(false)
    }
  }

  const revokeShareLink = async (tokenId: string) => {
    try {
      const response = await fetch(`/api/stories/${storyId}/share-link?token=${tokenId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchShareLinks()
        setRevokeDialogOpen(false)
        setLinkToRevoke(null)
      }
    } catch (error) {
      console.error('Error revoking share link:', error)
    }
  }

  const copyToClipboard = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)

    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`
    return 'Less than 1 hour'
  }

  const getExpiryStatus = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilExpiry < 0) return { status: 'expired', color: 'text-destructive' }
    if (hoursUntilExpiry < 24) return { status: 'expiring soon', color: 'text-amber-500' }
    return { status: 'active', color: 'text-green-500' }
  }

  const activeLinks = shareLinks.filter((link) => link.isActive && !link.revoked)
  const inactiveLinks = shareLinks.filter((link) => !link.isActive || link.revoked)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Share Links</h2>
          <p className="text-muted-foreground mt-1">
            Create time-limited, revocable links to share this story. You maintain full control.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Share2 className="w-4 h-4 mr-2" />
              Create Share Link
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Share Link</DialogTitle>
              <DialogDescription>
                Generate a time-limited link to share "{storyTitle}". You can revoke it at any time.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Expiration */}
              <div className="space-y-2">
                <Label htmlFor="expiresIn">Link Expires In</Label>
                <Select
                  value={newLinkForm.expiresIn}
                  onValueChange={(value) =>
                    setNewLinkForm({ ...newLinkForm, expiresIn: value })
                  }
                >
                  <SelectTrigger id="expiresIn">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3600">1 hour</SelectItem>
                    <SelectItem value="86400">24 hours</SelectItem>
                    <SelectItem value="259200">3 days</SelectItem>
                    <SelectItem value="604800">7 days (recommended)</SelectItem>
                    <SelectItem value="2592000">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Max Views */}
              <div className="space-y-2">
                <Label htmlFor="maxViews">Max Views (Optional)</Label>
                <Input
                  id="maxViews"
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={newLinkForm.maxViews}
                  onChange={(e) =>
                    setNewLinkForm({ ...newLinkForm, maxViews: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Link will stop working after this many views
                </p>
              </div>

              {/* Purpose */}
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Select
                  value={newLinkForm.purpose}
                  onValueChange={(value) =>
                    setNewLinkForm({ ...newLinkForm, purpose: value })
                  }
                >
                  <SelectTrigger id="purpose">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct-share">Direct Share</SelectItem>
                    <SelectItem value="social-media">Social Media</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="embed">Embed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={createShareLink} disabled={creating} className="w-full">
                {creating ? 'Creating...' : 'Generate Link'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Links */}
      {activeLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Share Links</CardTitle>
            <CardDescription>These links are currently accessible</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeLinks.map((link) => {
              const expiry = getExpiryStatus(link.expiresAt)
              const isCopied = copiedId === link.id

              return (
                <div
                  key={link.id}
                  className="flex items-start gap-3 p-4 border border-border rounded-lg bg-card hover:bg-accent/5 transition-colors"
                >
                  <LinkIcon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />

                  <div className="flex-1 min-w-0 space-y-2">
                    {/* URL */}
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono truncate flex-1">
                        {link.shareUrl}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(link.shareUrl, link.id)}
                        className="flex-shrink-0"
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        asChild
                        className="flex-shrink-0"
                      >
                        <a href={link.shareUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <Badge variant="secondary" className="capitalize">
                        {link.purpose}
                      </Badge>

                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>
                          {link.viewCount}
                          {link.maxViews && ` / ${link.maxViews}`} views
                        </span>
                      </div>

                      <div className={cn('flex items-center gap-1', expiry.color)}>
                        <Clock className="w-3 h-3" />
                        <span>Expires {formatDate(link.expiresAt)}</span>
                      </div>

                      {link.lastAccessedAt && (
                        <span>Last used {formatDate(link.lastAccessedAt)}</span>
                      )}
                    </div>
                  </div>

                  {/* Revoke Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    onClick={() => {
                      setLinkToRevoke(link.id)
                      setRevokeDialogOpen(true)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Inactive Links */}
      {inactiveLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inactive Links</CardTitle>
            <CardDescription>Expired or revoked share links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {inactiveLinks.slice(0, 5).map((link) => (
              <div
                key={link.id}
                className="flex items-start gap-3 p-4 border border-border rounded-lg bg-muted/30 opacity-60"
              >
                <LinkIcon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />

                <div className="flex-1 min-w-0 space-y-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono truncate block">
                    {link.shareUrl}
                  </code>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="capitalize">
                      {link.purpose}
                    </Badge>
                    <span>{link.viewCount} views</span>
                    {link.revoked ? (
                      <span className="text-destructive">Revoked</span>
                    ) : (
                      <span className="text-amber-500">Expired</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && shareLinks.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Share2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Share Links Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first share link to start sharing this story.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Info Banner */}
      <div className="flex gap-3 p-4 bg-sage-50 dark:bg-sage-950/20 border border-sage-200 dark:border-sage-900 rounded-lg">
        <AlertCircle className="w-5 h-5 text-sage-600 dark:text-sage-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-sage-900 dark:text-sage-100 space-y-1">
          <p className="font-semibold">You maintain full control</p>
          <p className="text-sage-700 dark:text-sage-300">
            All share links can be revoked at any time. When you withdraw this story, all links
            immediately stop working.
          </p>
        </div>
      </div>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Share Link?</AlertDialogTitle>
            <AlertDialogDescription>
              This link will immediately stop working. Anyone with this link will no longer be able
              to access your story.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => linkToRevoke && revokeShareLink(linkToRevoke)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Revoke Link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

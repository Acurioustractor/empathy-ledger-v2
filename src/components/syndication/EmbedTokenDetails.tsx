'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  Key,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  Globe,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Loader2
} from 'lucide-react'

export interface EmbedToken {
  id: string
  token: string
  tokenType: 'bearer' | 'jwt'
  storyId: string
  tenantId: string
  allowedDomains: string[]
  expiresAt: Date | string | null
  status: 'active' | 'revoked' | 'expired'
  usageCount: number
  lastUsedAt: Date | string | null
}

interface EmbedTokenDetailsProps {
  token: EmbedToken
  storyTitle?: string
  siteName?: string
  onRevoke?: (tokenId: string) => Promise<void>
  onRefresh?: (tokenId: string) => Promise<void>
  showFullToken?: boolean
}

export function EmbedTokenDetails({
  token,
  storyTitle,
  siteName,
  onRevoke,
  onRefresh,
  showFullToken = false
}: EmbedTokenDetailsProps) {
  const [copied, setCopied] = useState(false)
  const [showRevokeDialog, setShowRevokeDialog] = useState(false)
  const [isRevoking, setIsRevoking] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [tokenVisible, setTokenVisible] = useState(showFullToken)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(token.token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleRevoke = async () => {
    if (!onRevoke) return
    setIsRevoking(true)
    try {
      await onRevoke(token.id)
      setShowRevokeDialog(false)
    } catch (error) {
      console.error('Failed to revoke token:', error)
    } finally {
      setIsRevoking(false)
    }
  }

  const handleRefresh = async () => {
    if (!onRefresh) return
    setIsRefreshing(true)
    try {
      await onRefresh(token.id)
    } catch (error) {
      console.error('Failed to refresh token:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Never'
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isExpired = () => {
    if (!token.expiresAt) return false
    const expiry = typeof token.expiresAt === 'string' ? new Date(token.expiresAt) : token.expiresAt
    return expiry < new Date()
  }

  const getDaysUntilExpiry = () => {
    if (!token.expiresAt) return null
    const expiry = typeof token.expiresAt === 'string' ? new Date(token.expiresAt) : token.expiresAt
    const now = new Date()
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusBadge = () => {
    if (token.status === 'revoked') {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Revoked
        </Badge>
      )
    }
    if (token.status === 'expired' || isExpired()) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3" />
          Expired
        </Badge>
      )
    }
    const daysLeft = getDaysUntilExpiry()
    if (daysLeft !== null && daysLeft <= 7) {
      return (
        <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-300">
          <AlertTriangle className="h-3 w-3" />
          Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-300">
        <CheckCircle2 className="h-3 w-3" />
        Active
      </Badge>
    )
  }

  const maskedToken = tokenVisible
    ? token.token
    : token.token.slice(0, 8) + '...' + token.token.slice(-4)

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-sage-600" />
              <CardTitle className="text-lg">Embed Token</CardTitle>
            </div>
            {getStatusBadge()}
          </div>
          {(storyTitle || siteName) && (
            <CardDescription>
              {storyTitle && <span>Story: {storyTitle}</span>}
              {storyTitle && siteName && <span> • </span>}
              {siteName && <span>Site: {siteName}</span>}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Token Value */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Token</Label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={maskedToken}
                readOnly
                className="font-mono text-sm bg-muted"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTokenVisible(!tokenVisible)}
                disabled={token.status !== 'active'}
              >
                {tokenVisible ? 'Hide' : 'Show'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={token.status !== 'active'}
                className="gap-1"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Token Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <Label className="text-muted-foreground">Expires</Label>
              <p className="font-medium">{formatDate(token.expiresAt)}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Last Used</Label>
              <p className="font-medium">{formatDate(token.lastUsedAt)}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                Total Requests
              </Label>
              <p className="font-medium">{token.usageCount.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Token Type</Label>
              <p className="font-medium capitalize">{token.tokenType}</p>
            </div>
          </div>

          {/* Allowed Domains */}
          {token.allowedDomains && token.allowedDomains.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Globe className="h-4 w-4" />
                Allowed Domains
              </Label>
              <div className="flex flex-wrap gap-2">
                {token.allowedDomains.map((domain) => (
                  <Badge key={domain} variant="secondary" className="font-mono text-xs">
                    {domain}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Embed Code Example */}
          {token.status === 'active' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <ExternalLink className="h-4 w-4" />
                Embed Code
              </Label>
              <div className="bg-muted p-3 rounded-md font-mono text-xs overflow-x-auto">
                <pre>{`<iframe
  src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed/story/${token.storyId}?token=${token.token}"
  width="100%"
  height="400"
  frameborder="0"
  allowfullscreen
></iframe>`}</pre>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            {onRefresh && token.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-1"
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh Token
              </Button>
            )}
            {onRevoke && token.status === 'active' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowRevokeDialog(true)}
                className="gap-1"
              >
                <XCircle className="h-4 w-4" />
                Revoke Token
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Embed Token?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately invalidate this token. Any external sites using this token
              will no longer be able to display your content. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevoking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              disabled={isRevoking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRevoking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Revoking...
                </>
              ) : (
                'Revoke Token'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

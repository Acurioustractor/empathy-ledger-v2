'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Copy,
  CheckCircle2,
  RefreshCw,
  Mail,
  QrCode,
  Clock,
  ExternalLink,
  Smartphone
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface InvitationQRCodeProps {
  invitation: {
    id: string
    storyId: string
    storytellerName: string
    magicLinkUrl: string
    qrCodeData: string
    expiresAt: string
    sentVia: string
  }
  storyTitle?: string
  onRefresh?: () => void
  onSendEmail?: () => void
  size?: 'sm' | 'md' | 'lg'
  showActions?: boolean
  className?: string
}

export function InvitationQRCode({
  invitation,
  storyTitle,
  onRefresh,
  onSendEmail,
  size = 'md',
  showActions = true,
  className = ''
}: InvitationQRCodeProps) {
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string>('')

  // Calculate time remaining
  useEffect(() => {
    function updateTimeLeft() {
      const expiresAt = new Date(invitation.expiresAt)
      const now = new Date()

      if (expiresAt <= now) {
        setTimeLeft('Expired')
      } else {
        setTimeLeft(formatDistanceToNow(expiresAt, { addSuffix: true }))
      }
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [invitation.expiresAt])

  const qrSizes = {
    sm: 150,
    md: 200,
    lg: 280
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(invitation.magicLinkUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const isExpired = new Date(invitation.expiresAt) <= new Date()

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <QrCode className="h-5 w-5 text-sage-600" />
              Storyteller Invitation
            </CardTitle>
            <CardDescription>
              {storyTitle ? `For "${storyTitle}"` : 'Scan to access story'}
            </CardDescription>
          </div>
          <Badge variant={isExpired ? 'destructive' : 'secondary'}>
            <Clock className="h-3 w-3 mr-1" />
            {timeLeft}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Storyteller name */}
        <div className="text-center">
          <p className="text-sm text-stone-500 dark:text-stone-400">Invitation for</p>
          <p className="text-lg font-semibold text-earth-800 dark:text-earth-200">
            {invitation.storytellerName}
          </p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center p-4">
          <div className={`bg-white p-4 rounded-xl shadow-lg ${isExpired ? 'opacity-50' : ''}`}>
            <QRCodeSVG
              value={invitation.qrCodeData}
              size={qrSizes[size]}
              level="M"
              includeMargin
              bgColor="#ffffff"
              fgColor="#1a1a1a"
            />
          </div>
        </div>

        {isExpired && (
          <div className="text-center text-red-600 dark:text-red-400 text-sm font-medium">
            This invitation has expired
          </div>
        )}

        {/* Instructions */}
        {!isExpired && (
          <div className="bg-stone-50 dark:bg-stone-800/50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Smartphone className="h-5 w-5 text-sage-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-stone-600 dark:text-stone-300">
                <p className="font-medium">How to use:</p>
                <ol className="list-decimal list-inside mt-1 space-y-1 text-stone-500 dark:text-stone-400">
                  <li>Show this QR code to {invitation.storytellerName}</li>
                  <li>They scan with their phone camera</li>
                  <li>They sign in with their email</li>
                  <li>They can now view and manage their story</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              disabled={isExpired}
              className="flex-1 min-w-[120px]"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>

            {onSendEmail && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSendEmail}
                disabled={isExpired}
                className="flex-1 min-w-[120px]"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            )}

            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="flex-1 min-w-[120px]"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                New Link
              </Button>
            )}
          </div>
        )}

        {/* Direct link (collapsible for mobile) */}
        {!isExpired && (
          <details className="text-sm">
            <summary className="cursor-pointer text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200">
              Show direct link
            </summary>
            <div className="mt-2 p-2 bg-stone-100 dark:bg-stone-800 rounded text-xs break-all font-mono">
              {invitation.magicLinkUrl}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Compact QR code display for inline use
 */
export function InvitationQRCodeCompact({
  qrCodeData,
  size = 120
}: {
  qrCodeData: string
  size?: number
}) {
  return (
    <div className="bg-white p-2 rounded-lg shadow inline-block">
      <QRCodeSVG
        value={qrCodeData}
        size={size}
        level="M"
        includeMargin={false}
        bgColor="#ffffff"
        fgColor="#1a1a1a"
      />
    </div>
  )
}

/**
 * Full-screen QR code modal for showing to storyteller
 */
export function InvitationQRCodeFullScreen({
  invitation,
  storyTitle,
  onClose
}: {
  invitation: {
    storytellerName: string
    qrCodeData: string
    expiresAt: string
  }
  storyTitle?: string
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 bg-white dark:bg-stone-950 z-50 flex flex-col items-center justify-center p-8"
      onClick={onClose}
    >
      <div className="max-w-md w-full text-center space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-earth-800 dark:text-earth-200">
            {invitation.storytellerName}
          </h2>
          {storyTitle && (
            <p className="text-stone-500 dark:text-stone-400 mt-1">
              Scan to access your story
            </p>
          )}
        </div>

        {/* Giant QR Code */}
        <div className="flex justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-2xl">
            <QRCodeSVG
              value={invitation.qrCodeData}
              size={280}
              level="H"
              includeMargin
              bgColor="#ffffff"
              fgColor="#1a1a1a"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="text-stone-600 dark:text-stone-300 space-y-2">
          <p className="text-lg">Point your phone camera at this code</p>
          <p className="text-sm text-stone-400">Tap anywhere to close</p>
        </div>

        {/* Empathy Ledger branding */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <p className="text-xs text-stone-400">
            Powered by Empathy Ledger
          </p>
        </div>
      </div>
    </div>
  )
}

export default InvitationQRCode

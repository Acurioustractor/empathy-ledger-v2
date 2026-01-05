'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Link2, Copy, Check, Sparkles, QrCode, Mail, MessageSquare, Clock, Shield } from 'lucide-react'

interface MagicLinkGeneratorProps {
  organizationId: string
  projectId?: string
  onLinkGenerated: () => void
}

interface MagicLink {
  id: string
  url: string
  token: string
  channel: 'email' | 'sms' | 'standalone'
  recipient_name?: string
  recipient_contact?: string
  expires_at: string
  created_at: string
  used: boolean
  used_at?: string
}

export function MagicLinkGenerator({
  organizationId,
  projectId,
  onLinkGenerated
}: MagicLinkGeneratorProps) {
  const { toast } = useToast()
  const [recipientName, setRecipientName] = useState('')
  const [recipientContact, setRecipientContact] = useState('')
  const [channel, setChannel] = useState<'email' | 'sms' | 'standalone'>('standalone')
  const [expiryDays, setExpiryDays] = useState('7')
  const [requireConsent, setRequireConsent] = useState(true)
  const [assignToProject, setAssignToProject] = useState(!!projectId)
  const [generating, setGenerating] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<MagicLink | null>(null)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)

  const handleGenerateLink = async () => {
    try {
      setGenerating(true)

      const response = await fetch('/api/recruitment/magic-links/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          organization_id: organizationId,
          project_id: assignToProject ? projectId : undefined,
          channel,
          recipient_name: recipientName.trim() || undefined,
          recipient_contact: recipientContact.trim() || undefined,
          expiry_days: parseInt(expiryDays),
          require_consent: requireConsent,
          created_at: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate magic link')
      }

      const result = await response.json()

      setGeneratedLink(result.link)
      toast({
        title: 'Magic Link Generated',
        description: 'Passwordless authentication link created successfully.',
      })

      onLinkGenerated()
    } catch (error) {
      console.error('Failed to generate magic link:', error)
      toast({
        title: 'Generation Failed',
        description: 'Unable to create magic link. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleCopyToClipboard = async () => {
    if (!generatedLink) return

    try {
      await navigator.clipboard.writeText(generatedLink.url)
      setCopiedToClipboard(true)
      toast({
        title: 'Copied!',
        description: 'Magic link copied to clipboard.',
      })

      setTimeout(() => setCopiedToClipboard(false), 3000)
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Unable to copy to clipboard.',
        variant: 'destructive'
      })
    }
  }

  const handleSendViaChannel = async () => {
    if (!generatedLink || !recipientContact) return

    try {
      const response = await fetch('/api/recruitment/magic-links/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          link_id: generatedLink.id,
          channel: generatedLink.channel,
          recipient_contact: recipientContact,
          recipient_name: recipientName || undefined
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send magic link')
      }

      toast({
        title: 'Link Sent',
        description: `Magic link sent via ${generatedLink.channel}.`,
      })
    } catch (error) {
      toast({
        title: 'Send Failed',
        description: 'Unable to send magic link.',
        variant: 'destructive'
      })
    }
  }

  const handleReset = () => {
    setGeneratedLink(null)
    setRecipientName('')
    setRecipientContact('')
    setCopiedToClipboard(false)
  }

  const ChannelIcon = channel === 'email' ? Mail : channel === 'sms' ? MessageSquare : Link2

  return (
    <div className="space-y-6">
      {/* Cultural Reminder */}
      <Card className="bg-gradient-to-r from-sky-50 to-sage-50 border-sky-200">
        <CardContent className="py-6">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-sky-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sky-900">Passwordless Onboarding</h3>
              <p className="text-sm text-sky-800 mt-1">
                Magic links make it easy for storytellers to join without remembering passwords.
                They can click once and start sharing their stories immediately, with full control
                and consent every step of the way.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!generatedLink ? (
        <>
          {/* Generate Link Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-sky-600" />
                Generate Magic Link
              </CardTitle>
              <CardDescription>
                Create a passwordless authentication link for a storyteller
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Recipient Name (Optional)</Label>
                  <Input
                    id="name"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g., Elder Grace"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="contact">
                    {channel === 'email' ? 'Email' : channel === 'sms' ? 'Phone' : 'Contact'} (Optional)
                  </Label>
                  <Input
                    id="contact"
                    value={recipientContact}
                    onChange={(e) => setRecipientContact(e.target.value)}
                    placeholder={
                      channel === 'email'
                        ? 'storyteller@example.com'
                        : channel === 'sms'
                        ? '+1 (555) 123-4567'
                        : 'For tracking purposes'
                    }
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="channel">Delivery Channel</Label>
                <Select value={channel} onValueChange={(value: any) => setChannel(value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standalone">
                      <div className="flex items-center gap-2">
                        <Link2 className="h-4 w-4" />
                        <span>Standalone Link (copy & share manually)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="sms">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>SMS</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expiry">Link Expiry</Label>
                <Select value={expiryDays} onValueChange={setExpiryDays}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days (Recommended)</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consent"
                  checked={requireConsent}
                  onCheckedChange={(checked) => setRequireConsent(checked === true)}
                />
                <Label htmlFor="consent" className="text-sm cursor-pointer">
                  Require consent form acceptance before onboarding
                </Label>
              </div>

              {projectId && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="assign"
                    checked={assignToProject}
                    onCheckedChange={(checked) => setAssignToProject(checked === true)}
                  />
                  <Label htmlFor="assign" className="text-sm cursor-pointer">
                    Automatically assign to current project
                  </Label>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleGenerateLink}
              disabled={generating}
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Magic Link
                </>
              )}
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Generated Link Display */}
          <Card className="border-sky-200 bg-sky-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Check className="h-5 w-5 text-sage-600" />
                Magic Link Generated
              </CardTitle>
              <CardDescription>
                {generatedLink.recipient_name && `For ${generatedLink.recipient_name} - `}
                Expires {new Date(generatedLink.expires_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Link URL</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={generatedLink.url}
                    readOnly
                    className="font-mono text-sm bg-white"
                  />
                  <Button
                    onClick={handleCopyToClipboard}
                    variant={copiedToClipboard ? 'default' : 'outline'}
                  >
                    {copiedToClipboard ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-white rounded border border-sky-200">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <ChannelIcon className="h-4 w-4" />
                    <span>Channel</span>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {generatedLink.channel}
                  </Badge>
                </div>

                <div className="p-3 bg-white rounded border border-sky-200">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    <span>Status</span>
                  </div>
                  <Badge variant="outline" className={generatedLink.used ? 'border-sage-600 text-sage-600' : 'border-amber-600 text-amber-600'}>
                    {generatedLink.used ? 'Used' : 'Active'}
                  </Badge>
                </div>

                <div className="p-3 bg-white rounded border border-sky-200">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Shield className="h-4 w-4" />
                    <span>Consent Required</span>
                  </div>
                  <Badge variant="outline">
                    {requireConsent ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>

              {generatedLink.used && generatedLink.used_at && (
                <div className="p-3 bg-white rounded border border-sage-200">
                  <p className="text-sm text-sage-700">
                    ✓ Link was used on {new Date(generatedLink.used_at).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
            >
              Generate Another Link
            </Button>

            <div className="flex gap-3">
              {generatedLink.channel !== 'standalone' && recipientContact && !generatedLink.used && (
                <Button
                  onClick={handleSendViaChannel}
                >
                  <ChannelIcon className="h-4 w-4 mr-2" />
                  Send via {generatedLink.channel}
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  // This would open a dialog with QR code
                  toast({
                    title: 'QR Code',
                    description: 'QR code generation coming soon.',
                  })
                }}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Show QR Code
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

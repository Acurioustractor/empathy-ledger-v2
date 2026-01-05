'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { Mail, MessageSquare, Plus, X, Send, Loader2, Users } from 'lucide-react'

interface InvitationManagerProps {
  organizationId: string
  projectId?: string
  channel: 'email' | 'sms'
  onInvitationSent: () => void
}

interface Recipient {
  id: string
  value: string // email or phone
  name?: string
}

export function InvitationManager({
  organizationId,
  projectId,
  channel,
  onInvitationSent
}: InvitationManagerProps) {
  const { toast } = useToast()
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [newRecipient, setNewRecipient] = useState('')
  const [newRecipientName, setNewRecipientName] = useState('')
  const [message, setMessage] = useState('')
  const [expiryDays, setExpiryDays] = useState('7')
  const [requireConsent, setRequireConsent] = useState(true)
  const [assignToProject, setAssignToProject] = useState(!!projectId)
  const [sending, setSending] = useState(false)

  const defaultMessages = {
    email: `You're invited to share your story on the Empathy Ledger platform.\n\nWe believe your experiences and wisdom are valuable to our community. This platform honors cultural protocols and gives you complete control over your stories.\n\nClick the link below to get started (no password required).`,
    sms: `You're invited to join Empathy Ledger and share your story. Click the link to get started (no password needed). Your story, your control.`
  }

  const addRecipient = () => {
    if (!newRecipient.trim()) return

    // Basic validation
    if (channel === 'email' && !newRecipient.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive'
      })
      return
    }

    if (channel === 'sms' && !/^\+?[\d\s-()]+$/.test(newRecipient)) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid phone number.',
        variant: 'destructive'
      })
      return
    }

    const recipient: Recipient = {
      id: Math.random().toString(36).substr(2, 9),
      value: newRecipient.trim(),
      name: newRecipientName.trim() || undefined
    }

    setRecipients([...recipients, recipient])
    setNewRecipient('')
    setNewRecipientName('')
  }

  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter(r => r.id !== id))
  }

  const handleBulkImport = () => {
    // TODO: Open bulk import dialog (CSV/Excel upload)
    toast({
      title: 'Bulk Import',
      description: 'Bulk import feature coming soon.',
    })
  }

  const handleSendInvitations = async () => {
    if (recipients.length === 0) {
      toast({
        title: 'No Recipients',
        description: `Please add at least one ${channel === 'email' ? 'email address' : 'phone number'}.`,
        variant: 'destructive'
      })
      return
    }

    if (!message.trim()) {
      toast({
        title: 'Message Required',
        description: 'Please enter a message for your invitation.',
        variant: 'destructive'
      })
      return
    }

    try {
      setSending(true)

      const response = await fetch('/api/recruitment/send-invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          organization_id: organizationId,
          project_id: assignToProject ? projectId : undefined,
          channel,
          recipients: recipients.map(r => ({
            value: r.value,
            name: r.name
          })),
          message: message.trim(),
          expiry_days: parseInt(expiryDays),
          require_consent: requireConsent,
          sent_at: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send invitations')
      }

      const result = await response.json()

      toast({
        title: 'Invitations Sent',
        description: `${result.sent} invitation${result.sent > 1 ? 's' : ''} sent successfully via ${channel}.`,
      })

      // Reset form
      setRecipients([])
      setMessage('')
      onInvitationSent()
    } catch (error) {
      console.error('Failed to send invitations:', error)
      toast({
        title: 'Send Failed',
        description: `Unable to send ${channel} invitations. Please try again.`,
        variant: 'destructive'
      })
    } finally {
      setSending(false)
    }
  }

  const Icon = channel === 'email' ? Mail : MessageSquare

  return (
    <div className="space-y-6">
      {/* Add Recipients */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon className="h-5 w-5" />
            Add Recipients
          </CardTitle>
          <CardDescription>
            Enter {channel === 'email' ? 'email addresses' : 'phone numbers'} one at a time or import in bulk
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                value={newRecipientName}
                onChange={(e) => setNewRecipientName(e.target.value)}
                placeholder="e.g., Elder Grace"
                className="mt-2"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="recipient">
                {channel === 'email' ? 'Email Address' : 'Phone Number'}
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="recipient"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                  placeholder={channel === 'email' ? 'storyteller@example.com' : '+1 (555) 123-4567'}
                  className="flex-1"
                />
                <Button onClick={addRecipient}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {recipients.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Recipients ({recipients.length})</Label>
                <Button variant="ghost" size="sm" onClick={() => setRecipients([])}>
                  Clear All
                </Button>
              </div>
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                {recipients.map((recipient) => (
                  <div key={recipient.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {recipient.name && <strong>{recipient.name}</strong>}
                        {recipient.name && ' - '}
                        {recipient.value}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRecipient(recipient.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button variant="outline" onClick={handleBulkImport} className="w-full">
            <Users className="h-4 w-4 mr-2" />
            Import from CSV/Excel
          </Button>
        </CardContent>
      </Card>

      {/* Message */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invitation Message</CardTitle>
          <CardDescription>
            Personalize your invitation message
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={defaultMessages[channel]}
              rows={channel === 'email' ? 8 : 4}
              className="mt-2"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-muted-foreground">
                {channel === 'sms' && `${message.length}/160 characters`}
                {channel === 'email' && 'Use a warm, respectful tone'}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMessage(defaultMessages[channel])}
              >
                Use Default
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invitation Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="expiry">Link Expiry</Label>
            <Select value={expiryDays} onValueChange={setExpiryDays}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="7">7 days (Recommended)</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
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

      {/* Send Button */}
      <div className="flex justify-end gap-3">
        <Button
          size="lg"
          onClick={handleSendInvitations}
          disabled={recipients.length === 0 || !message.trim() || sending}
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send {recipients.length} Invitation{recipients.length > 1 ? 's' : ''}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { QrCode, Download, Printer, Users, Calendar, MapPin, Sparkles } from 'lucide-react'

interface QRCodeGeneratorProps {
  organizationId: string
  projectId?: string
  onQRCodeGenerated: () => void
}

interface QRCodeConfig {
  id: string
  name: string
  event_name?: string
  event_date?: string
  event_location?: string
  url: string
  qr_code_data: string // Base64 encoded QR code image
  size: number
  expiry_days: number
  expires_at: string
  require_consent: boolean
  scans: number
  created_at: string
}

export function QRCodeGenerator({
  organizationId,
  projectId,
  onQRCodeGenerated
}: QRCodeGeneratorProps) {
  const { toast } = useToast()
  const [qrName, setQrName] = useState('')
  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventLocation, setEventLocation] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [qrSize, setQrSize] = useState('256')
  const [expiryDays, setExpiryDays] = useState('30')
  const [requireConsent, setRequireConsent] = useState(true)
  const [assignToProject, setAssignToProject] = useState(!!projectId)
  const [generating, setGenerating] = useState(false)
  const [generatedQR, setGeneratedQR] = useState<QRCodeConfig | null>(null)

  const handleGenerateQR = async () => {
    if (!qrName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter a name for this QR code.',
        variant: 'destructive'
      })
      return
    }

    try {
      setGenerating(true)

      const response = await fetch('/api/recruitment/qr-codes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          organization_id: organizationId,
          project_id: assignToProject ? projectId : undefined,
          name: qrName.trim(),
          event_name: eventName.trim() || undefined,
          event_date: eventDate || undefined,
          event_location: eventLocation.trim() || undefined,
          additional_info: additionalInfo.trim() || undefined,
          size: parseInt(qrSize),
          expiry_days: parseInt(expiryDays),
          require_consent: requireConsent,
          created_at: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate QR code')
      }

      const result = await response.json()

      setGeneratedQR(result.qr_code)
      toast({
        title: 'QR Code Generated',
        description: 'QR code created successfully. Ready to download or print.',
      })

      onQRCodeGenerated()
    } catch (error) {
      console.error('Failed to generate QR code:', error)
      toast({
        title: 'Generation Failed',
        description: 'Unable to create QR code. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedQR) return

    // Create download link
    const link = document.createElement('a')
    link.href = generatedQR.qr_code_data
    link.download = `${generatedQR.name.replace(/\s+/g, '-').toLowerCase()}-qr-code.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: 'Downloaded',
      description: 'QR code image saved to your device.',
    })
  }

  const handlePrint = () => {
    if (!generatedQR) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast({
        title: 'Print Blocked',
        description: 'Please allow popups to print QR code.',
        variant: 'destructive'
      })
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${generatedQR.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 2rem;
            }
            h1 {
              font-size: 1.5rem;
              margin-bottom: 0.5rem;
            }
            .event-info {
              margin: 1rem 0;
              color: #666;
            }
            img {
              max-width: 400px;
              margin: 2rem auto;
              border: 2px solid #ddd;
              padding: 1rem;
            }
            .instructions {
              margin-top: 2rem;
              font-size: 0.9rem;
              color: #666;
            }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${generatedQR.name}</h1>
          ${generatedQR.event_name ? `<div class="event-info"><strong>${generatedQR.event_name}</strong></div>` : ''}
          ${generatedQR.event_date ? `<div class="event-info">${new Date(generatedQR.event_date).toLocaleDateString()}</div>` : ''}
          ${generatedQR.event_location ? `<div class="event-info">${generatedQR.event_location}</div>` : ''}
          <img src="${generatedQR.qr_code_data}" alt="QR Code" />
          <div class="instructions">
            <p><strong>Scan this QR code to share your story</strong></p>
            <p>No password needed - just scan and start</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  const handleReset = () => {
    setGeneratedQR(null)
    setQrName('')
    setEventName('')
    setEventDate('')
    setEventLocation('')
    setAdditionalInfo('')
  }

  return (
    <div className="space-y-6">
      {/* Cultural Reminder */}
      <Card className="bg-gradient-to-r from-amber-50 to-sage-50 border-amber-200">
        <CardContent className="py-6">
          <div className="flex items-start gap-3">
            <Users className="h-6 w-6 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900">Event-Based Recruitment</h3>
              <p className="text-sm text-amber-800 mt-1">
                QR codes are perfect for community gatherings, Elder circles, and cultural events.
                Print them on posters, handouts, or display them on screens. Anyone can scan and
                join - no app download required.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!generatedQR ? (
        <>
          {/* Generate QR Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <QrCode className="h-5 w-5 text-amber-600" />
                Generate QR Code
              </CardTitle>
              <CardDescription>
                Create a scannable QR code for event-based storyteller recruitment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="qr-name">QR Code Name *</Label>
                <Input
                  id="qr-name"
                  value={qrName}
                  onChange={(e) => setQrName(e.target.value)}
                  placeholder="e.g., Community Gathering Sept 2026"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  For your internal tracking (not shown to users)
                </p>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">Event Information (Optional)</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="event-name">Event Name</Label>
                    <Input
                      id="event-name"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      placeholder="e.g., Annual Storytelling Circle"
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event-date">Event Date</Label>
                      <Input
                        id="event-date"
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="event-location">Event Location</Label>
                      <Input
                        id="event-location"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        placeholder="e.g., Community Center"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="additional-info">Additional Information</Label>
                    <Textarea
                      id="additional-info"
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      placeholder="Any additional context that will appear on the landing page..."
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">QR Code Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="qr-size">QR Code Size</Label>
                    <Select value={qrSize} onValueChange={setQrSize}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="128">Small (128x128) - Digital only</SelectItem>
                        <SelectItem value="256">Medium (256x256) - Recommended</SelectItem>
                        <SelectItem value="512">Large (512x512) - Print quality</SelectItem>
                        <SelectItem value="1024">Extra Large (1024x1024) - Posters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="qr-expiry">Link Expiry</Label>
                    <Select value={expiryDays} onValueChange={setExpiryDays}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="30">30 days (Recommended)</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">6 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="qr-consent"
                  checked={requireConsent}
                  onCheckedChange={(checked) => setRequireConsent(checked === true)}
                />
                <Label htmlFor="qr-consent" className="text-sm cursor-pointer">
                  Require consent form acceptance before onboarding
                </Label>
              </div>

              {projectId && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="qr-assign"
                    checked={assignToProject}
                    onCheckedChange={(checked) => setAssignToProject(checked === true)}
                  />
                  <Label htmlFor="qr-assign" className="text-sm cursor-pointer">
                    Automatically assign to current project
                  </Label>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleGenerateQR}
              disabled={generating || !qrName.trim()}
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate QR Code
                </>
              )}
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Generated QR Display */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-base">{generatedQR.name}</CardTitle>
              <CardDescription>
                {generatedQR.event_name && `${generatedQR.event_name} - `}
                Expires {new Date(generatedQR.expires_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* QR Code Image */}
              <div className="flex justify-center p-6 bg-white rounded-lg border-2 border-amber-200">
                <img
                  src={generatedQR.qr_code_data}
                  alt="QR Code"
                  className="max-w-full h-auto"
                  style={{ width: `${generatedQR.size}px` }}
                />
              </div>

              {/* Event Details */}
              {(generatedQR.event_name || generatedQR.event_date || generatedQR.event_location) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {generatedQR.event_name && (
                    <div className="p-3 bg-white rounded border border-amber-200">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        <span>Event</span>
                      </div>
                      <p className="font-medium text-sm">{generatedQR.event_name}</p>
                    </div>
                  )}
                  {generatedQR.event_date && (
                    <div className="p-3 bg-white rounded border border-amber-200">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        <span>Date</span>
                      </div>
                      <p className="font-medium text-sm">
                        {new Date(generatedQR.event_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {generatedQR.event_location && (
                    <div className="p-3 bg-white rounded border border-amber-200">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <MapPin className="h-4 w-4" />
                        <span>Location</span>
                      </div>
                      <p className="font-medium text-sm">{generatedQR.event_location}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded border border-amber-200">
                  <div className="text-sm text-muted-foreground mb-1">Total Scans</div>
                  <p className="text-2xl font-bold text-amber-900">{generatedQR.scans}</p>
                </div>
                <div className="p-3 bg-white rounded border border-amber-200">
                  <div className="text-sm text-muted-foreground mb-1">Link URL</div>
                  <a
                    href={generatedQR.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-sky-600 hover:underline truncate block"
                  >
                    {generatedQR.url}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
            >
              Generate Another QR Code
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PNG
              </Button>

              <Button
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

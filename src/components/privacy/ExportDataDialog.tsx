'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Download, FileJson, FileText, Loader2, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExportDataDialogProps {
  storytellerId: string
  className?: string
}

type ExportFormat = 'json' | 'pdf'
type ExportStatus = 'idle' | 'preparing' | 'ready' | 'error'

interface ExportOptions {
  includeProfile: boolean
  includeStories: boolean
  includeMedia: boolean
  includeTranscripts: boolean
  includeConsent: boolean
  includeActivity: boolean
}

export function ExportDataDialog({ storytellerId, className }: ExportDataDialogProps) {
  const [open, setOpen] = useState(false)
  const [format, setFormat] = useState<ExportFormat>('json')
  const [status, setStatus] = useState<ExportStatus>('idle')
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [options, setOptions] = useState<ExportOptions>({
    includeProfile: true,
    includeStories: true,
    includeMedia: true,
    includeTranscripts: true,
    includeConsent: true,
    includeActivity: true,
  })

  const handleExport = async () => {
    setStatus('preparing')

    try {
      const response = await fetch('/api/user/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storytellerId,
          format,
          options,
        }),
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      setDownloadUrl(url)
      setStatus('ready')
    } catch (error) {
      console.error('Export error:', error)
      setStatus('error')
    }
  }

  const handleDownload = () => {
    if (!downloadUrl) return

    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `empathy-ledger-data-${new Date().toISOString()}.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Cleanup
    window.URL.revokeObjectURL(downloadUrl)
    setDownloadUrl(null)
    setStatus('idle')
    setOpen(false)
  }

  const toggleOption = (key: keyof ExportOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const allSelected = Object.values(options).every(v => v)
  const toggleAll = () => {
    const newValue = !allSelected
    setOptions({
      includeProfile: newValue,
      includeStories: newValue,
      includeMedia: newValue,
      includeTranscripts: newValue,
      includeConsent: newValue,
      includeActivity: newValue,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={cn('gap-2', className)}>
          <Download className="h-4 w-4" />
          Export My Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Export Your Data</DialogTitle>
          <DialogDescription>
            Download a complete copy of your personal data. This is your right under GDPR Article 15 (Right to Access).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="json" id="json" />
                <div className="flex-1">
                  <Label htmlFor="json" className="font-normal cursor-pointer flex items-center gap-2">
                    <FileJson className="h-4 w-4 text-blue-600" />
                    JSON (Machine-readable)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Structured data format. Best for importing into other platforms or technical analysis.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="pdf" id="pdf" />
                <div className="flex-1">
                  <Label htmlFor="pdf" className="font-normal cursor-pointer flex items-center gap-2">
                    <FileText className="h-4 w-4 text-red-600" />
                    PDF (Human-readable)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Formatted document. Best for reviewing or printing your data.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Data Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>What to Include</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAll}
                className="h-auto py-1 px-2 text-xs"
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
              {[
                { key: 'includeProfile' as const, label: 'Profile Information', desc: 'Name, bio, cultural affiliations, contact details' },
                { key: 'includeStories' as const, label: 'Stories', desc: 'All your published and draft stories' },
                { key: 'includeMedia' as const, label: 'Media Files', desc: 'Photos, audio, and video linked to your stories' },
                { key: 'includeTranscripts' as const, label: 'Transcripts', desc: 'Oral history transcripts and recordings' },
                { key: 'includeConsent' as const, label: 'Consent Records', desc: 'History of consent given and withdrawn' },
                { key: 'includeActivity' as const, label: 'Activity Log', desc: 'Your account activity and audit trail' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-start space-x-3">
                  <Checkbox
                    id={key}
                    checked={options[key]}
                    onCheckedChange={() => toggleOption(key)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={key} className="font-medium cursor-pointer">
                      {label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Messages */}
          {status === 'preparing' && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
              <Loader2 className="h-5 w-5 animate-spin" />
              <div>
                <p className="font-medium">Preparing your export...</p>
                <p className="text-sm">This may take a moment for large datasets.</p>
              </div>
            </div>
          )}

          {status === 'ready' && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              <Check className="h-5 w-5" />
              <div>
                <p className="font-medium">Export ready!</p>
                <p className="text-sm">Click Download below to save your data.</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Export failed</p>
                <p className="text-sm">Please try again or contact support if the problem persists.</p>
              </div>
            </div>
          )}

          {/* Data Sovereignty Notice */}
          <div className="p-4 bg-clay-50 border border-clay-200 rounded-lg text-clay-800 text-sm">
            <p className="font-medium mb-1">Your Data, Your Control</p>
            <p>
              You own your stories and data. This export includes everything we have about you.
              You can use this to move your stories to another platform or keep a personal archive.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={status === 'preparing'}>
            Cancel
          </Button>
          {status === 'ready' ? (
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download File
            </Button>
          ) : (
            <Button
              onClick={handleExport}
              disabled={status === 'preparing' || !Object.values(options).some(v => v)}
              className="gap-2"
            >
              {status === 'preparing' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  <FileJson className="h-4 w-4" />
                  Prepare Export
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

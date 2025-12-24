'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Upload,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Info
} from 'lucide-react'

interface DocumentImportDialogProps {
  organizationId?: string
  projectId?: string
  open: boolean
  onClose: () => void
  onComplete: () => void
  type: 'organization' | 'project'
}

const DOCUMENT_TYPES = {
  organization: [
    { value: 'theory_of_change', label: 'Theory of Change' },
    { value: 'strategic_plan', label: 'Strategic Plan' },
    { value: 'impact_report', label: 'Impact Report' },
    { value: 'annual_report', label: 'Annual Report' },
    { value: 'website_about', label: 'Website About Page' },
    { value: 'other', label: 'Other Document' }
  ],
  project: [
    { value: 'logic_model', label: 'Logic Model' },
    { value: 'project_plan', label: 'Project Plan' },
    { value: 'project_proposal', label: 'Project Proposal' },
    { value: 'grant_application', label: 'Grant Application' },
    { value: 'evaluation_plan', label: 'Evaluation Plan' },
    { value: 'other', label: 'Other Document' }
  ]
}

export default function DocumentImportDialog({
  organizationId,
  projectId,
  open,
  onClose,
  onComplete,
  type
}: DocumentImportDialogProps) {
  const [documentText, setDocumentText] = useState('')
  const [documentType, setDocumentType] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extractionResult, setExtractionResult] = useState<any>(null)

  const targetId = type === 'organization' ? organizationId : projectId
  const documentTypes = DOCUMENT_TYPES[type]

  const handleSubmit = async () => {
    if (!targetId) return

    try {
      setProcessing(true)
      setError(null)

      const endpoint = type === 'organization'
        ? `/api/organizations/${targetId}/context/import`
        : `/api/projects/${targetId}/context/import`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_text: documentText,
          document_type: documentType
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to import document')
      }

      const data = await response.json()
      setExtractionResult(data)

      // Show success for a moment, then complete
      setTimeout(() => {
        onComplete()
        handleClose()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import document')
    } finally {
      setProcessing(false)
    }
  }

  const handleClose = () => {
    setDocumentText('')
    setDocumentType('')
    setExtractionResult(null)
    setError(null)
    onClose()
  }

  const wordCount = documentText.trim().split(/\s+/).filter(w => w).length
  const charCount = documentText.length
  const isValid = charCount >= 100 && charCount <= 50000 && documentType

  if (extractionResult) {
    const qualityScore = extractionResult.extracted?.extraction_quality_score || 0
    const hasWarnings = extractionResult.warnings && extractionResult.warnings.length > 0

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className={`rounded-full p-2 ${qualityScore >= 60 ? 'bg-green-100' : 'bg-yellow-100'}`}>
                <CheckCircle className={`h-6 w-6 ${qualityScore >= 60 ? 'text-green-600' : 'text-yellow-600'}`} />
              </div>
              <div>
                <DialogTitle>Document Import Complete!</DialogTitle>
                <DialogDescription>
                  Context extracted and saved
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-600">Extraction Quality</span>
              <Badge variant={qualityScore >= 80 ? 'default' : qualityScore >= 60 ? 'secondary' : 'destructive'}>
                {qualityScore}%
              </Badge>
            </div>
            {hasWarnings && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {extractionResult.warnings.join('. ')}
                </AlertDescription>
              </Alert>
            )}
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <Sparkles className="h-4 w-4 text-sage-600" />
              <span>You can now review and edit the extracted context</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Import {type === 'organization' ? 'Organization' : 'Project'} Document
          </DialogTitle>
          <DialogDescription>
            Paste text from your existing documents and AI will extract structured context
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6 py-4">
          {/* Document Type */}
          <div className="space-y-2">
            <Label htmlFor="document-type">Document Type</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger id="document-type">
                <SelectValue placeholder="Select document type..." />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((docType) => (
                  <SelectItem key={docType.value} value={docType.value}>
                    {docType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="document-text">Document Text</Label>
              <div className="text-xs text-stone-500">
                {wordCount} words • {charCount} characters
              </div>
            </div>
            <Textarea
              id="document-text"
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              placeholder={`Paste your document text here...\n\nFor example:\n- Copy from your Theory of Change document\n- Copy your organization's About page\n- Copy sections from strategic plans or impact reports\n\nMinimum 100 characters, maximum 50,000 characters.`}
              className="min-h-[400px] font-mono text-sm"
            />
            {charCount > 0 && (
              <div className="flex items-center gap-2 text-xs">
                {charCount < 100 && (
                  <span className="text-red-600">
                    Need {100 - charCount} more characters (minimum 100)
                  </span>
                )}
                {charCount > 50000 && (
                  <span className="text-red-600">
                    {charCount - 50000} characters over limit (maximum 50,000)
                  </span>
                )}
                {charCount >= 100 && charCount <= 50000 && (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Valid length
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Tips */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-2">Tips for best results:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Include sections about mission, vision, and values</li>
                <li>Include information about your approach and methods</li>
                <li>Include cultural frameworks and principles you follow</li>
                <li>Include how you measure impact and success</li>
                <li>Remove headers, footers, and formatting that might confuse AI</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || processing}
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Extracting Context...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Import & Extract
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

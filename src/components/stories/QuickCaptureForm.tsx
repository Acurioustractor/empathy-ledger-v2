'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Camera,
  User,
  Mail,
  Phone,
  FileText,
  Loader2,
  ArrowRight,
  ArrowLeft,
  QrCode,
  CheckCircle2,
  Smartphone,
  Mic,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send
} from 'lucide-react'
import { InvitationQRCode, InvitationQRCodeFullScreen } from '@/components/invitations/InvitationQRCode'
import { AudioRecorder } from '@/components/capture/AudioRecorder'

interface QuickCaptureFormProps {
  projectId?: string
  projectName?: string
  organizationId?: string
  guestSessionId?: string // For guest/field worker mode
  onSuccess?: (data: CaptureResult) => void
  onCancel?: () => void
}

interface CaptureResult {
  storyId: string
  storytellerId: string
  storytellerName: string
  hasAudioRecording: boolean
  transcriptId?: string
  invitation: {
    id: string
    magicLinkUrl: string
    qrCodeData: string
    expiresAt: string
  }
}

type Step = 'info' | 'record' | 'qr-display'

export function QuickCaptureForm({
  projectId,
  projectName,
  organizationId,
  guestSessionId,
  onSuccess,
  onCancel
}: QuickCaptureFormProps) {
  const [step, setStep] = useState<Step>('info')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CaptureResult | null>(null)
  const [showFullscreenQR, setShowFullscreenQR] = useState(false)
  const [isSendingSMS, setIsSendingSMS] = useState(false)
  const [smsSent, setSMSSent] = useState(false)
  const [smsError, setSMSError] = useState<string | null>(null)

  // Form fields
  const [storytellerName, setStorytellerName] = useState('')
  const [storytellerEmail, setStorytellerEmail] = useState('')
  const [storytellerPhone, setStorytellerPhone] = useState('')
  const [storyTitle, setStoryTitle] = useState('')
  const [storyNotes, setStoryNotes] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Audio recording
  const [showAudioRecorder, setShowAudioRecorder] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioDuration, setAudioDuration] = useState<number>(0)
  const [audioUploaded, setAudioUploaded] = useState(false)
  const [transcriptId, setTranscriptId] = useState<string | null>(null)

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    setAudioBlob(blob)
    setAudioDuration(duration)
  }

  // Format duration for display
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate
    if (!storytellerName.trim()) {
      setError('Please enter the storyteller\'s name')
      return
    }

    setIsSubmitting(true)

    try {
      // Step 1: Create the story as a draft
      const storyFormData = new FormData()
      storyFormData.append('title', storyTitle || `Story by ${storytellerName}`)
      storyFormData.append('storyteller_name', storytellerName)
      storyFormData.append('status', 'draft')
      storyFormData.append('is_public', 'false')
      if (storyNotes) storyFormData.append('notes', storyNotes)
      if (projectId) storyFormData.append('project_id', projectId)
      if (organizationId) storyFormData.append('organization_id', organizationId)
      if (photo) storyFormData.append('featured_image', photo)
      if (guestSessionId) storyFormData.append('guest_session_id', guestSessionId)

      const storyRes = await fetch('/api/stories/quick-create', {
        method: 'POST',
        body: storyFormData
      })

      if (!storyRes.ok) {
        const storyError = await storyRes.json()
        throw new Error(storyError.error || 'Failed to create story')
      }

      const storyData = await storyRes.json()

      // Step 2: Create the invitation with QR code
      const inviteRes = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId: storyData.story.id,
          storytellerName,
          storytellerEmail: storytellerEmail || undefined,
          storytellerPhone: storytellerPhone || undefined,
          sendEmail: false, // Don't send email yet
          expiresInDays: 7
        })
      })

      if (!inviteRes.ok) {
        const inviteError = await inviteRes.json()
        throw new Error(inviteError.error || 'Failed to create invitation')
      }

      const inviteData = await inviteRes.json()

      // Step 3: Upload audio if recorded
      let uploadedTranscriptId: string | undefined
      if (audioBlob) {
        const audioFormData = new FormData()
        audioFormData.append('audio', audioBlob, `recording-${Date.now()}.webm`)
        audioFormData.append('story_id', storyData.story.id)
        audioFormData.append('duration', audioDuration.toString())

        const audioRes = await fetch('/api/stories/upload-audio', {
          method: 'POST',
          body: audioFormData
        })

        if (audioRes.ok) {
          const audioData = await audioRes.json()
          uploadedTranscriptId = audioData.transcriptId
          setTranscriptId(audioData.transcriptId)
          setAudioUploaded(true)
        } else {
          console.error('Audio upload failed, but story created successfully')
        }
      }

      // Success!
      const captureResult: CaptureResult = {
        storyId: storyData.story.id,
        storytellerId: storyData.storyteller?.id || '',
        storytellerName,
        hasAudioRecording: !!audioBlob,
        transcriptId: uploadedTranscriptId,
        invitation: {
          id: inviteData.invitation.id,
          magicLinkUrl: inviteData.invitation.magicLinkUrl,
          qrCodeData: inviteData.invitation.qrCodeData,
          expiresAt: inviteData.invitation.expiresAt
        }
      }

      setResult(captureResult)
      setStep('qr-display')

      if (onSuccess) {
        onSuccess(captureResult)
      }
    } catch (err: any) {
      console.error('Quick capture error:', err)
      setError(err.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendSMS = async () => {
    if (!result || !storytellerPhone) return

    setIsSendingSMS(true)
    setSMSError(null)

    try {
      const response = await fetch('/api/invitations/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationId: result.invitation.id,
          phoneNumber: storytellerPhone
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send SMS')
      }

      setSMSSent(true)
    } catch (err: unknown) {
      console.error('SMS send error:', err)
      setSMSError(err instanceof Error ? err.message : 'Failed to send SMS')
    } finally {
      setIsSendingSMS(false)
    }
  }

  const handleAddAnother = () => {
    // Reset form
    setStorytellerName('')
    setStorytellerEmail('')
    setStorytellerPhone('')
    setStoryTitle('')
    setStoryNotes('')
    setPhoto(null)
    setPhotoPreview(null)
    setAudioBlob(null)
    setAudioDuration(0)
    setAudioUploaded(false)
    setTranscriptId(null)
    setShowAudioRecorder(false)
    setSMSSent(false)
    setSMSError(null)
    setResult(null)
    setStep('info')
  }

  // QR Display Step
  if (step === 'qr-display' && result) {
    return (
      <>
        <div className="space-y-6">
          {/* Success header */}
          <div className="flex items-center gap-3 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
            <span className="text-lg font-medium">Story captured!</span>
          </div>

          {/* Audio status */}
          {result.hasAudioRecording && (
            <div className="bg-sage-50 dark:bg-sage-900/20 rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2 text-sage-700 dark:text-sage-300">
                <Mic className="h-4 w-4" />
                <span>Audio recording saved ({formatDuration(audioDuration)})</span>
              </div>
              {result.transcriptId && (
                <p className="text-sage-600 dark:text-sage-400 mt-1 text-xs">
                  Transcription in progress...
                </p>
              )}
            </div>
          )}

          {/* QR Code Card */}
          <InvitationQRCode
            invitation={{
              id: result.invitation.id,
              storyId: result.storyId,
              storytellerName: result.storytellerName,
              magicLinkUrl: result.invitation.magicLinkUrl,
              qrCodeData: result.invitation.qrCodeData,
              expiresAt: result.invitation.expiresAt,
              sentVia: 'qr'
            }}
            storyTitle={storyTitle || `Story by ${storytellerName}`}
            onRefresh={undefined} // Could add regenerate functionality
            showActions
          />

          {/* Show fullscreen button for mobile */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowFullscreenQR(true)}
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Show Full Screen QR
          </Button>

          {/* SMS Option */}
          {storytellerPhone && (
            <div className="space-y-2">
              {smsError && (
                <Alert variant="destructive">
                  <AlertDescription>{smsError}</AlertDescription>
                </Alert>
              )}

              {smsSent ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Link sent to {storytellerPhone}</span>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSendSMS}
                  disabled={isSendingSMS}
                >
                  {isSendingSMS ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Link via SMS to {storytellerPhone}
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleAddAnother} className="flex-1">
              Add Another Story
            </Button>
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Done
              </Button>
            )}
          </div>
        </div>

        {/* Fullscreen QR Modal */}
        {showFullscreenQR && (
          <InvitationQRCodeFullScreen
            invitation={{
              storytellerName: result.storytellerName,
              qrCodeData: result.invitation.qrCodeData,
              expiresAt: result.invitation.expiresAt
            }}
            storyTitle={storyTitle}
            onClose={() => setShowFullscreenQR(false)}
          />
        )}
      </>
    )
  }

  // Step indicator component
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
        step === 'info' ? 'bg-sage-600 text-white' : 'bg-sage-100 text-sage-600'
      }`}>
        1
      </div>
      <div className={`w-12 h-1 rounded ${step === 'info' ? 'bg-stone-200' : 'bg-sage-600'}`} />
      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
        step === 'record' ? 'bg-sage-600 text-white' : step === 'info' ? 'bg-stone-200 text-stone-400' : 'bg-sage-100 text-sage-600'
      }`}>
        2
      </div>
    </div>
  )

  // STEP 1: Basic Info
  if (step === 'info') {
    return (
      <div className="space-y-6">
        <StepIndicator />

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Photo capture - large and prominent */}
        <div className="space-y-2">
          <div className="relative">
            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-stone-100">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-3 right-3"
                  onClick={() => {
                    setPhoto(null)
                    setPhotoPreview(null)
                  }}
                >
                  <Camera className="h-4 w-4 mr-1" />
                  Retake
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full aspect-[4/3] border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors bg-stone-50 dark:bg-stone-800/30">
                <div className="p-4 rounded-full bg-sage-100 dark:bg-sage-900/50 mb-3">
                  <Camera className="h-10 w-10 text-sage-600" />
                </div>
                <span className="text-base font-medium text-stone-700 dark:text-stone-300">Take a photo</span>
                <span className="text-sm text-stone-500 mt-1">Capture the storyteller</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoCapture}
                />
              </label>
            )}
          </div>
        </div>

        {/* Name - large input */}
        <div className="space-y-2">
          <Label htmlFor="storytellerName" className="text-base">
            What's their name?
          </Label>
          <Input
            id="storytellerName"
            placeholder="Enter their name"
            value={storytellerName}
            onChange={(e) => setStorytellerName(e.target.value)}
            className="text-lg h-12"
            autoFocus
          />
        </div>

        {/* Phone - for sending link */}
        <div className="space-y-2">
          <Label htmlFor="storytellerPhone" className="text-base">
            Phone number <span className="text-stone-400 font-normal">(to send them the link)</span>
          </Label>
          <Input
            id="storytellerPhone"
            type="tel"
            placeholder="0400 000 000"
            value={storytellerPhone}
            onChange={(e) => setStorytellerPhone(e.target.value)}
            className="text-lg h-12"
          />
        </div>

        {/* Next button */}
        <Button
          type="button"
          className="w-full h-12 text-base bg-sage-600 hover:bg-sage-700"
          disabled={!storytellerName.trim()}
          onClick={() => setStep('record')}
        >
          Next: Record Interview
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </div>
    )
  }

  // STEP 2: Record Interview
  if (step === 'record') {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <StepIndicator />

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Summary of who we're recording */}
        <div className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
          {photoPreview ? (
            <img src={photoPreview} alt={storytellerName} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center">
              <User className="h-6 w-6 text-sage-600" />
            </div>
          )}
          <div>
            <p className="font-medium text-stone-800 dark:text-stone-200">{storytellerName}</p>
            {storytellerPhone && (
              <p className="text-sm text-stone-500">{storytellerPhone}</p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => setStep('info')}
          >
            Edit
          </Button>
        </div>

        {/* Audio Recorder - prominent */}
        <div className="space-y-3">
          <Label className="text-base flex items-center gap-2">
            <Mic className="h-5 w-5 text-sage-600" />
            Record the interview
          </Label>
          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            maxDurationSeconds={3600}
          />
        </div>

        {/* Recording status */}
        {audioBlob && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">{formatDuration(audioDuration)} recorded</span>
          </div>
        )}

        {/* Optional fields - collapsed */}
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer text-sm text-stone-500 hover:text-stone-700">
            <span>Add more details (optional)</span>
            <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="mt-4 space-y-4 pt-4 border-t border-stone-200 dark:border-stone-700">
            <div className="space-y-2">
              <Label htmlFor="storytellerEmail">Email</Label>
              <Input
                id="storytellerEmail"
                type="email"
                placeholder="email@example.com"
                value={storytellerEmail}
                onChange={(e) => setStorytellerEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storyTitle">Story Title</Label>
              <Input
                id="storyTitle"
                placeholder={`Story by ${storytellerName}`}
                value={storyTitle}
                onChange={(e) => setStoryTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storyNotes">Notes</Label>
              <Textarea
                id="storyNotes"
                placeholder="Any context about the story..."
                rows={2}
                value={storyNotes}
                onChange={(e) => setStoryNotes(e.target.value)}
              />
            </div>
          </div>
        </details>

        {/* Project indicator */}
        {projectName && (
          <div className="text-sm text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/50 rounded-lg p-3">
            Adding to project: <span className="font-medium">{projectName}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3 pt-2">
          <Button
            type="submit"
            className="w-full h-12 text-base bg-sage-600 hover:bg-sage-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Save & Get QR Code
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setStep('info')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </form>
    )
  }

  // Fallback (shouldn't reach here)
  return (
    <div className="space-y-6">
      <StepIndicator />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Photo capture - prominent on mobile */}
      <div className="space-y-2">
        <Label>Photo (optional)</Label>
        <div className="relative">
          {photoPreview ? (
            <div className="relative rounded-lg overflow-hidden aspect-video bg-stone-100">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute bottom-2 right-2"
                onClick={() => {
                  setPhoto(null)
                  setPhotoPreview(null)
                }}
              >
                Change Photo
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-lg cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
              <Camera className="h-8 w-8 text-stone-400 mb-2" />
              <span className="text-sm text-stone-500">Tap to take photo</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoCapture}
              />
            </label>
          )}
        </div>
      </div>

      {/* Storyteller name - required */}
      <div className="space-y-2">
        <Label htmlFor="storytellerName">
          <User className="h-4 w-4 inline mr-1" />
          Storyteller Name *
        </Label>
        <Input
          id="storytellerName"
          placeholder="Enter their name"
          value={storytellerName}
          onChange={(e) => setStorytellerName(e.target.value)}
          required
          autoFocus
        />
      </div>

      {/* Contact info - optional but helpful */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="storytellerEmail">
            <Mail className="h-4 w-4 inline mr-1" />
            Email
          </Label>
          <Input
            id="storytellerEmail"
            type="email"
            placeholder="email@example.com"
            value={storytellerEmail}
            onChange={(e) => setStorytellerEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="storytellerPhone">
            <Phone className="h-4 w-4 inline mr-1" />
            Phone
          </Label>
          <Input
            id="storytellerPhone"
            type="tel"
            placeholder="0400 000 000"
            value={storytellerPhone}
            onChange={(e) => setStorytellerPhone(e.target.value)}
          />
        </div>
      </div>

      {/* Story title - optional */}
      <div className="space-y-2">
        <Label htmlFor="storyTitle">
          <FileText className="h-4 w-4 inline mr-1" />
          Story Title (optional)
        </Label>
        <Input
          id="storyTitle"
          placeholder={`Story by ${storytellerName || 'Storyteller'}`}
          value={storyTitle}
          onChange={(e) => setStoryTitle(e.target.value)}
        />
      </div>

      {/* Quick notes - optional */}
      <div className="space-y-2">
        <Label htmlFor="storyNotes">Quick Notes (optional)</Label>
        <Textarea
          id="storyNotes"
          placeholder="Any context about the story, location, themes..."
          rows={2}
          value={storyNotes}
          onChange={(e) => setStoryNotes(e.target.value)}
        />
      </div>

      {/* Audio Recording Section */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowAudioRecorder(!showAudioRecorder)}
          className="flex items-center justify-between w-full text-left"
        >
          <Label className="cursor-pointer flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Record Interview
            {audioBlob && (
              <span className="text-xs bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full">
                {formatDuration(audioDuration)} recorded
              </span>
            )}
          </Label>
          {showAudioRecorder ? (
            <ChevronUp className="h-4 w-4 text-stone-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-stone-400" />
          )}
        </button>
      </div>
    </div>
  )
}

export default QuickCaptureForm

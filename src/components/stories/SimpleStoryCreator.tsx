'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth.context'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Mic,
  MicOff,
  Camera,
  Image as ImageIcon,
  ChevronRight,
  Check,
  Sparkles,
  Lock,
  Users,
  Globe,
  Loader2,
  ArrowLeft,
  PartyPopper,
  HelpCircle,
  X,
  Clock,
  FileEdit,
  RefreshCw,
  Star
} from 'lucide-react'
import Link from 'next/link'

type Step = 'write' | 'title' | 'photo' | 'privacy' | 'complete'

interface DraftData {
  id?: string
  content: string
  title?: string
  photoUrl?: string
  updated_at: string
}

interface SimpleStoryCreatorProps {
  onComplete?: (storyId: string) => void
}

export function SimpleStoryCreator({ onComplete }: SimpleStoryCreatorProps) {
  const router = useRouter()
  const { user } = useAuth()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Story data
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [suggestedTitle, setSuggestedTitle] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [visibility, setVisibility] = useState<'private' | 'community' | 'public'>('community')

  // UI state
  const [step, setStep] = useState<Step>('write')
  const [isRecording, setIsRecording] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [showDraftModal, setShowDraftModal] = useState(false)
  const [savedDraft, setSavedDraft] = useState<DraftData | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  // Voice recording
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)

  // Prompts for when users get stuck
  const prompts = [
    "What moment stands out most to you?",
    "How did this experience change you?",
    "What would you want others to understand?",
    "Who was involved in this story?",
    "What feelings come up when you think about this?"
  ]
  const [currentPrompt, setCurrentPrompt] = useState(() => prompts[Math.floor(Math.random() * prompts.length)])

  // Word count milestone tracking
  const [lastCelebratedMilestone, setLastCelebratedMilestone] = useState(0)
  const [showMilestone, setShowMilestone] = useState(false)
  const [milestoneMessage, setMilestoneMessage] = useState('')

  // Typing animation trigger
  const [hasStartedTyping, setHasStartedTyping] = useState(false)

  // Screen reader announcements
  const [announcement, setAnnouncement] = useState('')

  // Announce step changes for screen readers
  useEffect(() => {
    const stepMessages: Record<Step, string> = {
      write: 'Step 1 of 4: Write your story',
      title: 'Step 2 of 4: Add a title',
      photo: 'Step 3 of 4: Add a photo',
      privacy: 'Step 4 of 4: Choose who can see your story',
      complete: 'Story submitted successfully!'
    }
    setAnnouncement(stepMessages[step])
  }, [step])

  // Check for saved draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('simple-story-draft')
    if (draft) {
      try {
        const parsed = JSON.parse(draft) as DraftData
        if (parsed.content && parsed.content.length > 10) {
          // Show modal to let user choose
          setSavedDraft(parsed)
          setShowDraftModal(true)
        }
      } catch (e) {
        console.error('Error loading draft:', e)
      }
    }
  }, [])

  // Handle draft recovery choice
  const continueDraft = () => {
    if (savedDraft) {
      setContent(savedDraft.content)
      setTitle(savedDraft.title || '')
      setDraftId(savedDraft.id || null)
      if (savedDraft.photoUrl) {
        setPhotoUrl(savedDraft.photoUrl)
      }
    }
    setShowDraftModal(false)
  }

  const startFresh = () => {
    localStorage.removeItem('simple-story-draft')
    setSavedDraft(null)
    setShowDraftModal(false)
  }

  // Format relative time for draft
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  // Auto-save to localStorage
  useEffect(() => {
    if (content.length > 10) {
      const draft: DraftData = {
        id: draftId || undefined,
        content,
        title,
        photoUrl: photoUrl || undefined,
        updated_at: new Date().toISOString()
      }
      localStorage.setItem('simple-story-draft', JSON.stringify(draft))
      setIsSaved(true)

      // Reset saved indicator after a moment
      const timer = setTimeout(() => setIsSaved(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [content, title, draftId, photoUrl])

  // Photo upload handler
  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be smaller than 10MB')
      return
    }

    setPhotoFile(file)
    setIsUploadingPhoto(true)

    try {
      // Create preview URL immediately for better UX
      const previewUrl = URL.createObjectURL(file)
      setPhotoUrl(previewUrl)

      // If user is authenticated, upload to storage
      if (user) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'story-photo')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const { url } = await response.json()
          // Revoke preview URL and use real URL
          URL.revokeObjectURL(previewUrl)
          setPhotoUrl(url)
        }
      }
      // For guests, keep the preview URL (will be uploaded on save)
    } catch (error) {
      console.error('Error uploading photo:', error)
      // Keep preview URL on error
    } finally {
      setIsUploadingPhoto(false)
    }

    // Trigger haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }

  // Remove photo
  const removePhoto = () => {
    if (photoUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(photoUrl)
    }
    setPhotoUrl(null)
    setPhotoFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Word count milestone celebrations
  useEffect(() => {
    const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length
    const milestones = [
      { count: 25, message: "Great start! Keep going..." },
      { count: 50, message: "You're doing amazing!" },
      { count: 100, message: "100 words! Your story is taking shape." },
      { count: 150, message: "150 words! What a wonderful story." },
      { count: 200, message: "200 words! You're a natural storyteller." }
    ]

    const milestone = milestones.find(m => wordCount >= m.count && m.count > lastCelebratedMilestone)
    if (milestone) {
      setLastCelebratedMilestone(milestone.count)
      setMilestoneMessage(milestone.message)
      setShowMilestone(true)

      // Haptic feedback for celebration
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50, 30, 50])
      }

      // Hide after 3 seconds
      setTimeout(() => setShowMilestone(false), 3000)
    }
  }, [content, lastCelebratedMilestone])

  // Detect when user starts typing
  useEffect(() => {
    if (content.length > 0 && !hasStartedTyping) {
      setHasStartedTyping(true)
    }
  }, [content, hasStartedTyping])

  // Show prompt if user pauses for 30 seconds with little content
  useEffect(() => {
    if (content.length < 50 && step === 'write') {
      const timer = setTimeout(() => setShowPrompt(true), 30000)
      return () => clearTimeout(timer)
    }
    setShowPrompt(false)
  }, [content, step])

  // Rotate prompts when dismissed
  const rotatePrompt = () => {
    const currentIndex = prompts.indexOf(currentPrompt)
    const nextIndex = (currentIndex + 1) % prompts.length
    setCurrentPrompt(prompts[nextIndex])
    setShowPrompt(false)
  }

  // Generate AI title suggestion
  const generateTitle = useCallback(async () => {
    if (content.length < 50) return

    setIsGeneratingTitle(true)
    try {
      // For now, create a simple title from first line
      // TODO: See issue #6 in empathy-ledger-v2: Replace with AI generation
      const firstLine = content.split('\n')[0].slice(0, 50)
      const suggestion = firstLine.length > 40
        ? firstLine.slice(0, 40) + '...'
        : firstLine || 'My Story'
      setSuggestedTitle(suggestion)
    } catch (error) {
      console.error('Error generating title:', error)
      setSuggestedTitle('My Story')
    } finally {
      setIsGeneratingTitle(false)
    }
  }, [content])

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        // TODO: See issue #7 in empathy-ledger-v2: Send to transcription service
        console.log('Recording complete:', blob)
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)

      // Track recording time
      const startTime = Date.now()
      const interval = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)

      // Store interval ID for cleanup
      recorder.addEventListener('stop', () => clearInterval(interval))
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setIsRecording(false)
      setRecordingTime(0)
    }
  }

  // Handle moving to next step
  const nextStep = async () => {
    switch (step) {
      case 'write':
        await generateTitle()
        setStep('title')
        break
      case 'title':
        setStep('photo')
        break
      case 'photo':
        setStep('privacy')
        break
      case 'privacy':
        await saveStory()
        break
    }
  }

  // Save the story to database
  const saveStory = async () => {
    setIsSaving(true)
    try {
      // If user is not authenticated, save locally and prompt to create account
      if (!user) {
        // Save complete draft locally
        const guestDraft: DraftData = {
          content,
          title: title || suggestedTitle || 'Untitled Story',
          photoUrl: photoUrl || undefined,
          updated_at: new Date().toISOString()
        }
        localStorage.setItem('simple-story-guest-complete', JSON.stringify(guestDraft))
        localStorage.removeItem('simple-story-draft')

        // Show completion with account prompt
        setStep('complete')
        return
      }

      // Upload photo if it's still a blob URL
      let finalPhotoUrl = photoUrl
      if (photoUrl?.startsWith('blob:') && photoFile) {
        const formData = new FormData()
        formData.append('file', photoFile)
        formData.append('type', 'story-photo')

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json()
          finalPhotoUrl = url
        }
      }

      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || suggestedTitle || 'Untitled Story',
          content,
          media_urls: finalPhotoUrl ? [finalPhotoUrl] : [],
          visibility,
          status: 'published',
          storyteller_id: user.id
        })
      })

      if (!response.ok) throw new Error('Failed to save story')

      const story = await response.json()

      // Clear draft
      localStorage.removeItem('simple-story-draft')

      setStep('complete')
      onComplete?.(story.id)
    } catch (error) {
      console.error('Error saving story:', error)
      alert('There was a problem saving your story. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Render current step
  const renderStep = () => {
    switch (step) {
      case 'write':
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold">Share Your Story</h1>
              <p className="text-muted-foreground">
                What would you like to share today?
              </p>
            </div>

            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing here... Just a few sentences is fine."
                className={`min-h-[200px] text-lg resize-none transition-all duration-300 ${
                  hasStartedTyping ? 'border-primary/50' : ''
                }`}
                autoFocus
                aria-label="Write your story"
                aria-describedby="story-helper-text"
              />

              {/* Save indicator with animation */}
              {content.length > 10 && (
                <div className="absolute bottom-2 right-2 text-sm text-muted-foreground">
                  {isSaved ? (
                    <span className="flex items-center gap-1 text-green-600 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <Check className="w-3 h-3" /> Saved
                    </span>
                  ) : (
                    <span className="animate-pulse">Auto-saving...</span>
                  )}
                </div>
              )}
            </div>

            {/* Milestone celebration */}
            {showMilestone && (
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 animate-in slide-in-from-top-2 duration-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-green-600 animate-in spin-in-180 duration-500" />
                    <p className="text-sm font-medium text-green-800">
                      {milestoneMessage}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prompt helper with rotation */}
            {showPrompt && content.length < 50 && (
              <Card className="bg-amber-50 border-amber-200 animate-in slide-in-from-bottom-2 duration-300">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-amber-800">
                      <HelpCircle className="w-4 h-4 inline-block mr-1" />
                      <strong>{currentPrompt}</strong>
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={rotatePrompt}
                      className="h-6 px-2 text-amber-700 hover:text-amber-900 hover:bg-amber-100"
                      aria-label="Show different prompt"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Voice recording button */}
            <div className="flex justify-center">
              <Button
                variant={isRecording ? "destructive" : "outline"}
                size="lg"
                onClick={() => {
                  // Haptic feedback
                  if ('vibrate' in navigator) {
                    navigator.vibrate(isRecording ? [50, 30, 50] : 50)
                  }
                  isRecording ? stopRecording() : startRecording()
                }}
                className="gap-2 min-h-[48px] px-6 active:scale-95 transition-transform touch-manipulation"
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-5 h-5" />
                    Stop Recording ({recordingTime}s)
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    Or speak your story
                  </>
                )}
              </Button>
            </div>

            {/* Word count - encouraging, not limiting */}
            <p id="story-helper-text" className="text-center text-sm text-muted-foreground" aria-live="polite">
              {(() => {
                const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length
                if (wordCount === 0) return "Just start typing..."
                if (wordCount < 25) return `${wordCount} word${wordCount !== 1 ? 's' : ''} - Keep going...`
                if (wordCount < 50) return `${wordCount} words - You're doing great!`
                if (wordCount < 100) return `${wordCount} words - Beautiful so far!`
                return `${wordCount} words - Wonderful story!`
              })()}
            </p>

            <Button
              onClick={() => {
                if ('vibrate' in navigator) navigator.vibrate(50)
                nextStep()
              }}
              disabled={content.length < 20}
              className="w-full min-h-[52px] text-base active:scale-[0.98] transition-transform touch-manipulation"
              size="lg"
            >
              Continue <ChevronRight className="ml-2 w-5 h-5" />
            </Button>

            {/* Help link - larger touch target */}
            <div className="text-center">
              <Link
                href="/storyteller/help"
                className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 py-3 px-4"
              >
                <HelpCircle className="w-4 h-4" />
                Need help or have questions?
              </Link>
            </div>
          </div>
        )

      case 'title':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300 delay-150">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold">Story saved!</h1>
              <p className="text-muted-foreground">
                Want to give it a title?
              </p>
            </div>

            {isGeneratingTitle ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <>
                {suggestedTitle && (
                  <Card className="bg-clay-50 border-clay-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-clay-600" />
                        <span className="text-sm font-medium text-clay-800">AI Suggestion</span>
                      </div>
                      <p className="text-lg font-medium">{suggestedTitle}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setTitle(suggestedTitle)}
                      >
                        Use This Title
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label>Or write your own:</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="My story title..."
                    className="text-lg"
                  />
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep('write')}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={nextStep} className="flex-1">
                {title ? 'Continue' : 'Skip for now'} <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )

      case 'photo':
        return (
          <div className="space-y-6">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
              aria-label="Upload photo"
            />

            <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 mx-auto bg-sage-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300 delay-150">
                <Camera className="w-8 h-8 text-sage-600" />
              </div>
              <h1 className="text-2xl font-bold">Add a photo?</h1>
              <p className="text-muted-foreground">
                Photos help bring stories to life (optional)
              </p>
            </div>

            {/* Photo preview or upload buttons */}
            {photoUrl ? (
              <div className="relative">
                <img
                  src={photoUrl}
                  alt="Story photo"
                  className="w-full h-48 object-cover rounded-lg"
                />
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={removePhoto}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-24 flex-col gap-2 active:scale-95 transition-transform touch-manipulation"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.setAttribute('capture', 'environment')
                      fileInputRef.current.click()
                    }
                  }}
                  disabled={isUploadingPhoto}
                >
                  <Camera className="w-6 h-6" />
                  Take Photo
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-24 flex-col gap-2 active:scale-95 transition-transform touch-manipulation"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.removeAttribute('capture')
                      fileInputRef.current.click()
                    }
                  }}
                  disabled={isUploadingPhoto}
                >
                  <ImageIcon className="w-6 h-6" />
                  Choose Photo
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep('title')}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={nextStep} className="flex-1">
                {photoUrl ? 'Continue' : 'Skip for now'} <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )

      case 'privacy':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 mx-auto bg-clay-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300 delay-150">
                <Lock className="w-8 h-8 text-clay-600" />
              </div>
              <h1 className="text-2xl font-bold">Who should see your story?</h1>
              <p className="text-muted-foreground">
                You can change this anytime
              </p>
            </div>

            <RadioGroup
              value={visibility}
              onValueChange={(v) => setVisibility(v as typeof visibility)}
              className="space-y-3"
              aria-label="Story visibility settings"
            >
              <div
                className={`flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-all min-h-[72px] touch-manipulation ${
                  visibility === 'private' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                role="button"
                tabIndex={0}
                onClick={() => setVisibility('private')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setVisibility('private')
                  }
                }}
              >
                <RadioGroupItem value="private" id="private" />
                <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <Label htmlFor="private" className="flex-1 cursor-pointer">
                  <div className="font-medium">Just me</div>
                  <div className="text-sm text-muted-foreground">Private, only you can see</div>
                </Label>
              </div>

              <div
                className={`flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-all min-h-[72px] touch-manipulation ${
                  visibility === 'community' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                role="button"
                tabIndex={0}
                onClick={() => setVisibility('community')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setVisibility('community')
                  }
                }}
              >
                <RadioGroupItem value="community" id="community" />
                <Users className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <Label htmlFor="community" className="flex-1 cursor-pointer">
                  <div className="font-medium">My community</div>
                  <div className="text-sm text-muted-foreground">Shared with your community (recommended)</div>
                </Label>
              </div>

              <div
                className={`flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-all min-h-[72px] touch-manipulation ${
                  visibility === 'public' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                role="button"
                tabIndex={0}
                onClick={() => setVisibility('public')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setVisibility('public')
                  }
                }}
              >
                <RadioGroupItem value="public" id="public" />
                <Globe className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <Label htmlFor="public" className="flex-1 cursor-pointer">
                  <div className="font-medium">Everyone</div>
                  <div className="text-sm text-muted-foreground">Public, anyone can view</div>
                </Label>
              </div>
            </RadioGroup>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep('photo')}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                onClick={nextStep}
                className="flex-1"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save My Story <Check className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )

      case 'complete':
        return (
          <div className="space-y-6 text-center animate-in fade-in zoom-in duration-700">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-500 delay-200">
              <PartyPopper className="w-10 h-10 text-yellow-600" />
            </div>
            <div className="animate-in slide-in-from-bottom-4 duration-500 delay-300">
              <h1 className="text-3xl font-bold">Your story has been saved!</h1>
              <p className="text-muted-foreground text-lg mt-2">
                Thank you for sharing. Your voice matters.
              </p>
            </div>

            {/* Guest user prompt */}
            {!user ? (
              <div className="space-y-4 pt-4">
                <Card className="bg-sage-50 border-sage-200 text-left">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sage-900 mb-2">
                      Create an account to publish
                    </h3>
                    <p className="text-sm text-sage-800 mb-3">
                      Your story is saved on this device. Create a free account to:
                    </p>
                    <ul className="text-sm text-sage-800 space-y-1 ml-4 list-disc">
                      <li>Publish your story for others to see</li>
                      <li>Access your stories from any device</li>
                      <li>Connect with your community</li>
                    </ul>
                  </CardContent>
                </Card>

                <Button
                  onClick={() => router.push('/auth/signup?returnTo=/stories/share')}
                  className="w-full"
                  size="lg"
                >
                  Create Free Account
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/auth/signin?returnTo=/stories/share')}
                  className="w-full"
                >
                  Already have an account? Sign in
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setContent('')
                    setTitle('')
                    setPhotoUrl(null)
                    setStep('write')
                  }}
                  className="w-full"
                >
                  Share Another Story
                </Button>
              </div>
            ) : (
              <>
                {/* What happens next - for authenticated users */}
                <div className="text-left space-y-3 pt-4 border-t">
                  <h3 className="font-medium text-center">What happens next?</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Check className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Story is saved</p>
                        <p className="text-xs text-muted-foreground">You can edit or update anytime</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Users className="w-5 h-5 text-sage-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Visible to {visibility === 'private' ? 'only you' : visibility === 'community' ? 'your community' : 'everyone'}</p>
                        <p className="text-xs text-muted-foreground">Change privacy settings anytime</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Button
                    onClick={() => router.push('/storyteller/dashboard')}
                    className="w-full"
                    size="lg"
                  >
                    Go to My Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setContent('')
                      setTitle('')
                      setPhotoUrl(null)
                      setStep('write')
                    }}
                    className="w-full"
                    size="lg"
                  >
                    Share Another Story
                  </Button>
                  <Link href="/storyteller/help" className="block">
                    <Button
                      variant="ghost"
                      className="w-full gap-2"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Need Help?
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        )
    }
  }

  // Progress indicator
  const steps: Step[] = ['write', 'title', 'photo', 'privacy', 'complete']
  const currentStepIndex = steps.indexOf(step)

  return (
    <div className="min-h-screen bg-background">
      {/* Screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {/* Draft Recovery Modal */}
      <Dialog open={showDraftModal} onOpenChange={setShowDraftModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileEdit className="w-5 h-5 text-sage-500" />
              Welcome back!
            </DialogTitle>
            <DialogDescription>
              You have an unfinished story.
            </DialogDescription>
          </DialogHeader>

          {savedDraft && (
            <div className="space-y-4">
              {/* Draft preview */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <p className="text-sm line-clamp-3">{savedDraft.content}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Started {formatRelativeTime(savedDraft.updated_at)}
                  </div>
                </CardContent>
              </Card>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={startFresh}
                  className="w-full sm:w-auto"
                >
                  Start Fresh
                </Button>
                <Button
                  onClick={continueDraft}
                  className="w-full sm:w-auto"
                >
                  Continue Story
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Progress bar */}
      {step !== 'complete' && (
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
      )}

      {/* Main content */}
      <div className="container max-w-lg mx-auto px-4 py-8">
        {renderStep()}
      </div>
    </div>
  )
}

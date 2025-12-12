'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Mic,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Heart,
  Shield,
  Phone,
  User,
  AlertCircle,
  KeyRound
} from 'lucide-react'
import { AudioRecorder } from '@/components/capture/AudioRecorder'
import { BottomNav } from '@/components/layout/BottomNav'
import { cn } from '@/lib/utils'

type PageState = 'intro' | 'details' | 'recording' | 'submitting' | 'success' | 'error'

interface RecordingData {
  name: string
  phone?: string
  email?: string
  audioBlob?: Blob
  audioDuration?: number
}

export default function SelfRecordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for organization PIN mode or invite token
  const orgPin = searchParams?.get('pin') ?? null
  const inviteToken = searchParams?.get('token') ?? null

  const [state, setState] = useState<PageState>('intro')
  const [error, setError] = useState<string | null>(null)
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null)
  const [orgName, setOrgName] = useState<string | null>(null)
  const [data, setData] = useState<RecordingData>({
    name: '',
    phone: '',
    email: ''
  })
  const [storyResult, setStoryResult] = useState<{
    id: string
    accessUrl?: string
  } | null>(null)

  // Validate PIN on mount if provided
  useEffect(() => {
    if (orgPin) {
      validatePin(orgPin)
    }
  }, [orgPin])

  async function validatePin(pin: string) {
    try {
      const res = await fetch('/api/auth/guest-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      })

      const result = await res.json()

      if (res.ok && result.success) {
        setGuestSessionId(result.session.id)
        setOrgName(result.session.organization_name)
      } else {
        setError('Invalid organization PIN. Please check and try again.')
      }
    } catch (err) {
      console.error('PIN validation error:', err)
      setError('Could not validate PIN. Please try again.')
    }
  }

  function handleRecordingComplete(audioBlob: Blob, duration: number) {
    setData(prev => ({
      ...prev,
      audioBlob,
      audioDuration: duration
    }))
  }

  async function handleSubmit() {
    if (!data.name.trim()) {
      setError('Please enter your name')
      return
    }

    if (!data.audioBlob) {
      setError('Please record your story first')
      return
    }

    setState('submitting')
    setError(null)

    try {
      // First upload audio
      const audioFormData = new FormData()
      audioFormData.append('file', data.audioBlob, 'recording.webm')

      const uploadRes = await fetch('/api/upload/audio', {
        method: 'POST',
        body: audioFormData
      })

      let audioUrl = null
      if (uploadRes.ok) {
        const uploadResult = await uploadRes.json()
        audioUrl = uploadResult.url
      }

      // Create story
      const storyFormData = new FormData()
      storyFormData.append('title', `Story by ${data.name}`)
      storyFormData.append('storyteller_name', data.name)
      if (data.phone) storyFormData.append('storyteller_phone', data.phone)
      if (data.email) storyFormData.append('storyteller_email', data.email)
      if (guestSessionId) storyFormData.append('guest_session_id', guestSessionId)
      if (inviteToken) storyFormData.append('self_record_token', inviteToken)

      const res = await fetch('/api/stories/quick-create', {
        method: 'POST',
        body: storyFormData
      })

      const result = await res.json()

      if (res.ok) {
        setStoryResult({
          id: result.story.id,
          accessUrl: result.accessUrl
        })
        setState('success')
      } else {
        throw new Error(result.error || 'Failed to save story')
      }
    } catch (err: any) {
      console.error('Submit error:', err)
      setError(err.message || 'Something went wrong. Please try again.')
      setState('error')
    }
  }

  // Intro screen - explain the process
  if (state === 'intro') {
    return (
      <div className="min-h-screen bg-background">
        <main className="px-4 py-8 max-w-lg mx-auto mb-bottom-nav md:mb-0">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mic className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Share Your Story</h1>
            <p className="text-muted-foreground">
              {orgName ? `Recording for ${orgName}` : 'Your voice matters. Share your experience.'}
            </p>
          </div>

          {/* Error state */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* PIN entry if not provided */}
          {!orgPin && !inviteToken && !guestSessionId && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-primary" />
                  Organization PIN
                </CardTitle>
                <CardDescription>
                  Enter the PIN provided by your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter PIN"
                    maxLength={6}
                    className="input-mobile text-center text-xl tracking-widest"
                    onChange={(e) => {
                      if (e.target.value.length >= 4) {
                        validatePin(e.target.value)
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* How it works */}
          <div className="space-y-4 mb-8">
            <h2 className="font-semibold text-foreground">How it works</h2>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Enter your details</p>
                <p className="text-sm text-muted-foreground">Just your name and optional contact info</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Record your story</p>
                <p className="text-sm text-muted-foreground">Speak naturally - share what matters to you</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Submit & get your link</p>
                <p className="text-sm text-muted-foreground">You'll receive a link to access your story anytime</p>
              </div>
            </div>
          </div>

          {/* Privacy notice */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 mb-8">
            <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">Your story, your control</p>
              <p className="text-sm text-green-700 dark:text-green-300">
                You maintain control over how your story is shared and used.
              </p>
            </div>
          </div>

          <Button
            className="w-full btn-mobile-lg"
            onClick={() => setState('details')}
            disabled={!guestSessionId && !inviteToken}
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          {!guestSessionId && !inviteToken && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Need a PIN? Contact your organization administrator.
            </p>
          )}
        </main>

        <BottomNav />
      </div>
    )
  }

  // Details entry screen
  if (state === 'details') {
    return (
      <div className="min-h-screen bg-background">
        <main className="px-4 py-8 max-w-lg mx-auto mb-bottom-nav md:mb-0">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Your Details</h1>
            <p className="text-muted-foreground">Tell us a bit about yourself</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-medium">
                Your Name *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={data.name}
                onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
                className="input-mobile"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Phone (optional)
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Your phone number"
                value={data.phone}
                onChange={(e) => setData(prev => ({ ...prev, phone: e.target.value }))}
                className="input-mobile"
              />
              <p className="text-xs text-muted-foreground">
                We'll send you a link to access your story
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium">
                Email (optional)
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={data.email}
                onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))}
                className="input-mobile"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <Button
              variant="outline"
              className="flex-1 btn-mobile"
              onClick={() => setState('intro')}
            >
              Back
            </Button>
            <Button
              className="flex-1 btn-mobile"
              onClick={() => {
                if (!data.name.trim()) {
                  setError('Please enter your name')
                  return
                }
                setError(null)
                setState('recording')
              }}
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </main>

        <BottomNav />
      </div>
    )
  }

  // Recording screen
  if (state === 'recording') {
    return (
      <div className="min-h-screen bg-background">
        <main className="px-4 py-8 max-w-lg mx-auto mb-bottom-nav md:mb-0">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Record Your Story</h1>
            <p className="text-muted-foreground">Hi {data.name}, we're ready when you are</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            maxDurationSeconds={1800}
            className="mb-6"
          />

          {/* Tips */}
          <div className="space-y-3 mb-8">
            <h3 className="font-medium text-foreground">Recording tips</h3>
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <Heart className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span>Speak from the heart - there's no right or wrong way to share</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <Mic className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span>Find a quiet space and hold the phone steady</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 btn-mobile"
              onClick={() => setState('details')}
            >
              Back
            </Button>
            <Button
              className="flex-1 btn-mobile"
              onClick={handleSubmit}
              disabled={!data.audioBlob}
            >
              Submit Story
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </main>

        <BottomNav />
      </div>
    )
  }

  // Submitting state
  if (state === 'submitting') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Saving Your Story</h1>
          <p className="text-muted-foreground">This will just take a moment...</p>
        </div>
      </div>
    )
  }

  // Success state
  if (state === 'success') {
    return (
      <div className="min-h-screen bg-background">
        <main className="px-4 py-8 max-w-lg mx-auto text-center mb-bottom-nav md:mb-0">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Thank You, {data.name}!</h1>
          <p className="text-muted-foreground mb-8">
            Your story has been saved successfully.
          </p>

          <Card className="mb-8 text-left">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                What happens next?
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Your recording is being transcribed</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>You'll receive a link to view your story</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>You control how your story is shared</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Button
            className="w-full btn-mobile"
            onClick={() => router.push('/')}
          >
            Done
          </Button>
        </main>

        <BottomNav />
      </div>
    )
  }

  // Error state
  if (state === 'error') {
    return (
      <div className="min-h-screen bg-background">
        <main className="px-4 py-8 max-w-lg mx-auto text-center mb-bottom-nav md:mb-0">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Something Went Wrong</h1>
          <p className="text-muted-foreground mb-8">
            {error || "We couldn't save your story. Please try again."}
          </p>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 btn-mobile"
              onClick={() => router.push('/')}
            >
              Go Home
            </Button>
            <Button
              className="flex-1 btn-mobile"
              onClick={() => {
                setError(null)
                setState('recording')
              }}
            >
              Try Again
            </Button>
          </div>
        </main>

        <BottomNav />
      </div>
    )
  }

  return null
}

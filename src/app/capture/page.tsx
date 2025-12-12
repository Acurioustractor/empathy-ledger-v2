'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mic, FolderOpen, Loader2, Building2, Heart, ChevronDown, HelpCircle, X, LogIn, User, KeyRound, UserPlus, Shield } from 'lucide-react'
import { QuickCaptureForm } from '@/components/stories/QuickCaptureForm'
import { BottomNav } from '@/components/layout/BottomNav'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/context/auth.context'

type CaptureMode = 'select' | 'admin' | 'guest' | 'storyteller'

interface Project {
  id: string
  name: string
  organization_id: string
  organization_name?: string
}

interface Organization {
  id: string
  name: string
}

export default function CapturePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, isLoading: authLoading, isAdmin, isSuperAdmin } = useAuth()

  const preSelectedProjectId = searchParams?.get('project') ?? null
  const preSelectedOrgId = searchParams?.get('org') ?? null
  const modeParam = searchParams?.get('mode') as CaptureMode | null

  const [captureMode, setCaptureMode] = useState<CaptureMode>(modeParam || 'select')
  const [isLoading, setIsLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>(preSelectedProjectId || '')
  const [selectedOrgId, setSelectedOrgId] = useState<string>(preSelectedOrgId || '')
  const [showSettings, setShowSettings] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [guestPin, setGuestPin] = useState('')
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null)
  const [guestOrgId, setGuestOrgId] = useState<string | null>(null)
  const [guestOrgName, setGuestOrgName] = useState<string | null>(null)
  const [pinError, setPinError] = useState<string | null>(null)

  // Load user's projects and organizations (only if authenticated)
  useEffect(() => {
    async function loadData() {
      if (!isAuthenticated) {
        setIsLoading(false)
        return
      }

      try {
        // Load organizations
        const orgRes = await fetch('/api/organisations')
        if (orgRes.ok) {
          const orgData = await orgRes.json()
          setOrganizations(orgData.organizations || [])

          // Auto-select first org if only one
          if (orgData.organizations?.length === 1 && !preSelectedOrgId) {
            setSelectedOrgId(orgData.organizations[0].id)
          }
        }

        // Load projects - this endpoint may not exist, so handle gracefully
        try {
          const projectRes = await fetch('/api/projects')
          if (projectRes.ok) {
            const projectData = await projectRes.json()
            setProjects(projectData.projects || [])

            // Auto-select project if pre-selected
            if (preSelectedProjectId) {
              setSelectedProjectId(preSelectedProjectId)
            }
          }
        } catch (e) {
          // Projects endpoint might not exist, that's fine
          console.log('Projects endpoint not available')
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Wait for auth to finish loading before fetching data
    if (!authLoading) {
      loadData()
    }
  }, [preSelectedProjectId, preSelectedOrgId, isAuthenticated, authLoading])

  // Auto-select capture mode based on auth status
  useEffect(() => {
    if (!authLoading && captureMode === 'select') {
      if (isAuthenticated && (isAdmin || isSuperAdmin)) {
        setCaptureMode('admin')
      }
    }
  }, [authLoading, isAuthenticated, isAdmin, isSuperAdmin, captureMode])

  // Validate guest PIN
  async function validateGuestPin() {
    if (!guestPin || guestPin.length < 4) {
      setPinError('Please enter a valid PIN')
      return
    }

    setPinError(null)
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/guest-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: guestPin })
      })

      const result = await res.json()

      if (res.ok && result.success) {
        setGuestSessionId(result.session.id)
        setGuestOrgId(result.session.organization_id)
        setGuestOrgName(result.session.organization_name)
        setSelectedOrgId(result.session.organization_id) // Set for the form
        setCaptureMode('guest')
      } else {
        setPinError(result.error || 'Invalid PIN')
      }
    } catch (err) {
      console.error('PIN validation error:', err)
      setPinError('Could not validate PIN. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter projects by selected org
  const filteredProjects = selectedOrgId
    ? projects.filter(p => p.organization_id === selectedOrgId)
    : projects

  const selectedProject = projects.find(p => p.id === selectedProjectId)
  const selectedOrg = organizations.find(o => o.id === selectedOrgId)

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center touch-target haptic hover:bg-secondary"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Mic className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Capture</span>
          </div>

          <button
            onClick={() => setShowHelp(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center touch-target haptic hover:bg-secondary"
          >
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mb-bottom-nav md:mb-0 px-4 py-6 max-w-lg mx-auto">
        {/* Mode Selection - Show when not authenticated and no mode selected */}
        {captureMode === 'select' && !isAuthenticated && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">How would you like to capture?</h1>
              <p className="text-muted-foreground">Choose the option that best fits your role</p>
            </div>

            {/* Admin/Staff Option */}
            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => router.push('/auth/signin?redirect=/capture')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">I'm an Admin or Staff</CardTitle>
                    <CardDescription>Sign in to capture stories for your organization</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Field Worker Option */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <KeyRound className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">I'm a Field Worker</CardTitle>
                    <CardDescription>Enter your organization's PIN to start</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter PIN"
                    maxLength={6}
                    value={guestPin}
                    onChange={(e) => {
                      setGuestPin(e.target.value)
                      setPinError(null)
                    }}
                    className="input-mobile text-center text-xl tracking-widest"
                    onKeyDown={(e) => e.key === 'Enter' && validateGuestPin()}
                  />
                  <Button onClick={validateGuestPin} className="btn-mobile px-6">
                    Go
                  </Button>
                </div>
                {pinError && (
                  <p className="text-sm text-destructive mt-2">{pinError}</p>
                )}
              </CardContent>
            </Card>

            {/* Storyteller Option */}
            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => router.push('/record')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">I want to share my story</CardTitle>
                    <CardDescription>Record your own story with a simple process</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <p className="text-center text-sm text-muted-foreground">
              Don't have a PIN?{' '}
              <Link href="/auth/signin" className="text-primary font-medium">
                Sign in
              </Link>{' '}
              or contact your organization.
            </p>
          </div>
        )}

        {/* Guest mode header */}
        {captureMode === 'guest' && guestOrgName && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 gap-1.5">
                  <KeyRound className="w-3 h-3" />
                  Guest Mode
                </Badge>
                <span className="text-sm font-medium text-foreground">{guestOrgName}</span>
              </div>
              <button
                onClick={() => {
                  setGuestSessionId(null)
                  setGuestOrgId(null)
                  setGuestOrgName(null)
                  setSelectedOrgId('')
                  setCaptureMode('select')
                }}
                className="text-sm text-amber-700 dark:text-amber-300 font-medium"
              >
                Exit
              </button>
            </div>
          </div>
        )}

        {/* Context Bar - Show selected org/project (for admin mode) */}
        {captureMode === 'admin' && (selectedOrg || selectedProject) && (
          <div className="mb-6 p-4 rounded-2xl bg-secondary/50 border border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedOrg && (
                  <Badge variant="outline" className="gap-1.5">
                    <Building2 className="w-3 h-3" />
                    {selectedOrg.name}
                  </Badge>
                )}
                {selectedProject && (
                  <Badge variant="secondary" className="gap-1.5">
                    <FolderOpen className="w-3 h-3" />
                    {selectedProject.name}
                  </Badge>
                )}
              </div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-sm text-primary font-medium touch-target haptic"
              >
                Change
              </button>
            </div>

            {/* Settings Expanded */}
            {showSettings && (
              <div className="mt-4 pt-4 border-t border-border/50 space-y-4 animate-fade-up">
                {/* Organization selector */}
                {organizations.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      Organization
                    </label>
                    <Select
                      value={selectedOrgId}
                      onValueChange={(value) => {
                        setSelectedOrgId(value)
                        setSelectedProjectId('')
                      }}
                    >
                      <SelectTrigger className="input-mobile">
                        <SelectValue placeholder="Select organization" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id} className="py-3">
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Project selector */}
                {filteredProjects.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                      Project (optional)
                    </label>
                    <Select
                      value={selectedProjectId}
                      onValueChange={setSelectedProjectId}
                    >
                      <SelectTrigger className="input-mobile">
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="" className="py-3">No project</SelectItem>
                        {filteredProjects.map((project) => (
                          <SelectItem key={project.id} value={project.id} className="py-3">
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button
                  variant="secondary"
                  className="w-full btn-mobile"
                  onClick={() => setShowSettings(false)}
                >
                  Done
                </Button>
              </div>
            )}
          </div>
        )}

        {/* No org/project selected - Show simple selector (admin mode only) */}
        {captureMode === 'admin' && !selectedOrg && !selectedProject && organizations.length > 0 && (
          <div className="mb-6 mobile-card p-5">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Select Organization
            </h3>
            <div className="space-y-2">
              {organizations.slice(0, 3).map((org) => (
                <button
                  key={org.id}
                  onClick={() => setSelectedOrgId(org.id)}
                  className="w-full text-left p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all touch-target haptic"
                >
                  <span className="font-medium text-foreground">{org.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Old Sign In Required block - now hidden since we have mode selection */}
        {false && !isAuthenticated && !authLoading && (
          <div className="mobile-card p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">
              To capture and save stories, you need to be signed in to your account.
            </p>
            <div className="space-y-3">
              <Link href="/auth/signin?redirect=/capture" className="block">
                <Button className="w-full btn-mobile">
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup?redirect=/capture" className="block">
                <Button variant="outline" className="w-full btn-mobile">
                  <User className="w-5 h-5 mr-2" />
                  Create Account
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              Already have an account with an organization? Ask your admin for an invite link.
            </p>
          </div>
        )}

        {/* Quick Capture Form - Show for admin mode (authenticated) or guest mode */}
        {(captureMode === 'admin' || captureMode === 'guest') && (
          <div className="mobile-card p-6">
            <QuickCaptureForm
              projectId={selectedProjectId || undefined}
              projectName={selectedProject?.name}
              organizationId={selectedOrgId || undefined}
              guestSessionId={guestSessionId || undefined}
              onSuccess={(result) => {
                console.log('Story captured:', result)
              }}
              onCancel={() => router.back()}
            />
          </div>
        )}

        {/* Quick Tips - Show for admin or guest mode */}
        {(captureMode === 'admin' || captureMode === 'guest') && (
          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Take a photo</p>
                <p className="text-sm text-muted-foreground">Capture the storyteller's face or moment</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Record the interview</p>
                <p className="text-sm text-muted-foreground">Press record and let them share their story</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Share the QR code</p>
                <p className="text-sm text-muted-foreground">They scan it to access and manage their story</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowHelp(false)}
          />
          <div className="relative w-full max-w-lg bg-card rounded-t-3xl md:rounded-3xl p-6 pb-safe animate-slide-up shadow-soft-lg mx-4 md:mx-0 mb-0 md:mb-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">How to Capture</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center touch-target haptic"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mic className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Record Interview</h3>
                  <p className="text-sm text-muted-foreground">
                    Use the audio recorder to capture the storyteller's voice. The recording will be automatically transcribed.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Consent First</h3>
                  <p className="text-sm text-muted-foreground">
                    Always get verbal consent before recording. The storyteller maintains control over their story.
                  </p>
                </div>
              </div>
            </div>

            <Button
              className="w-full btn-mobile mt-6"
              onClick={() => setShowHelp(false)}
            >
              Got it
            </Button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

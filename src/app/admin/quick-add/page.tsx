'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, User, FileText, Video, FolderOpen, Upload, Plus, X } from 'lucide-react'
import { useOrganizationContext } from '@/lib/contexts/OrganizationContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

export default function QuickAddPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { selectedOrgId, setSelectedOrgId } = useOrganizationContext()

  // Get org ID from URL parameter
  const urlOrgId = searchParams.get('org')

  // Use URL org ID if available, otherwise use context
  const effectiveOrgId = urlOrgId || selectedOrgId

  // Form state
  const [storytellerMode, setStorytellerMode] = useState<'existing' | 'new'>('new')
  const [selectedStoryteller, setSelectedStoryteller] = useState('')
  const [newStorytellerName, setNewStorytellerName] = useState('')
  const [newStorytellerEmail, setNewStorytellerEmail] = useState('')
  const [newStorytellerBio, setNewStorytellerBio] = useState('')

  const [transcriptText, setTranscriptText] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [transcriptTitle, setTranscriptTitle] = useState('')

  const [selectedProject, setSelectedProject] = useState('')

  // Optional fields
  const [showOptional, setShowOptional] = useState(false)
  const [location, setLocation] = useState('')
  const [tags, setTags] = useState('')
  const [culturalBackground, setCulturalBackground] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)

  // Data loading
  const [storytellers, setStorytellers] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Success state
  const [success, setSuccess] = useState(false)
  const [createdStory, setCreatedStory] = useState<any>(null)

  // Set context org ID if URL param is provided
  useEffect(() => {
    if (urlOrgId && setSelectedOrgId) {
      setSelectedOrgId(urlOrgId)
    }
  }, [urlOrgId])

  // Load storytellers and projects (always load, org is optional)
  useEffect(() => {
    fetchStorytellers()
    if (effectiveOrgId && effectiveOrgId !== 'all') {
      fetchProjects()
    }
  }, [effectiveOrgId])

  // Auto-select first project when projects load
  useEffect(() => {
    if (projects.length === 1 && !selectedProject) {
      setSelectedProject(projects[0].id)
      console.log('Auto-selected project:', projects[0].name)
    }
  }, [projects])

  const fetchStorytellers = async () => {
    try {
      const params = new URLSearchParams({
        limit: '100',
        sort: 'name'
      })

      // Always fetch all storytellers (for existing storyteller selection)
      const url = (effectiveOrgId && effectiveOrgId !== 'all')
        ? `/api/admin/storytellers?organization_id=${effectiveOrgId}&${params}`
        : `/api/admin/storytellers?${params}`

      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch storytellers')

      const data = await response.json()
      setStorytellers(data.storytellers || [])
    } catch (error) {
      console.error('Error fetching storytellers:', error)
    }
  }

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams({
        limit: '100',
        status: 'active'
      })

      const url = effectiveOrgId === 'all'
        ? `/api/admin/projects?${params}`
        : `/api/admin/projects?organization_id=${effectiveOrgId}&${params}`

      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch projects')

      const data = await response.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleSubmit = async (saveAndAddAnother: boolean = false) => {
    // Validation - only name and transcript are truly required
    if (storytellerMode === 'new' && !newStorytellerName.trim()) {
      alert('Please enter storyteller name')
      return
    }
    if (storytellerMode === 'existing' && !selectedStoryteller) {
      alert('Please select a storyteller')
      return
    }
    if (!transcriptText.trim()) {
      alert('Please paste the transcript')
      return
    }
    // Video URL is now optional
    // Organization is now optional - storytellers can exist independently
    // Project is now optional

    try {
      setSaving(true)

      const formData = new FormData()

      // Storyteller data
      if (storytellerMode === 'new') {
        formData.append('storyteller_mode', 'new')
        formData.append('storyteller_name', newStorytellerName)
        if (newStorytellerEmail) formData.append('storyteller_email', newStorytellerEmail)
        if (newStorytellerBio) formData.append('storyteller_bio', newStorytellerBio)
      } else {
        formData.append('storyteller_mode', 'existing')
        formData.append('storyteller_id', selectedStoryteller)
      }

      // Transcript data
      formData.append('transcript_text', transcriptText)
      if (videoUrl) formData.append('video_url', videoUrl)
      if (transcriptTitle) formData.append('transcript_title', transcriptTitle)

      // Project (optional)
      if (selectedProject) formData.append('project_id', selectedProject)

      // Organization (if specific org selected)
      if (effectiveOrgId !== 'all') {
        formData.append('organization_id', effectiveOrgId)
      }

      // Optional fields
      if (location) formData.append('location', location)
      if (tags) formData.append('tags', tags)
      if (culturalBackground) formData.append('cultural_background', culturalBackground)
      if (photo) formData.append('photo', photo)

      const response = await fetch('/api/admin/quick-add', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save')
      }

      const result = await response.json()
      console.log('Created:', result)

      if (saveAndAddAnother) {
        // Reset form but keep project selected
        setNewStorytellerName('')
        setNewStorytellerEmail('')
        setNewStorytellerBio('')
        setTranscriptText('')
        setVideoUrl('')
        setTranscriptTitle('')
        setLocation('')
        setTags('')
        setCulturalBackground('')
        setPhoto(null)

        // Show brief success message
        const message = document.createElement('div')
        message.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
        message.textContent = '✅ Story added! Add another...'
        document.body.appendChild(message)
        setTimeout(() => message.remove(), 3000)
      } else {
        // Save and Done - redirect to storyteller profile
        setSuccess(true)
        setCreatedStory(result)

        // Redirect to the storyteller's profile page after a brief delay
        setTimeout(() => {
          router.push(`/storytellers/${result.storyteller_id}`)
        }, 500)
      }

    } catch (error) {
      console.error('Error saving:', error)
      alert(`Failed to save: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0])
    }
  }

  if (success && createdStory) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">✅ Story Added Successfully!</CardTitle>
            <CardDescription>Redirecting to storyteller profile...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-medium">Created:</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>✓ Storyteller profile</li>
                <li>✓ Transcript ({createdStory.transcript_id?.substring(0, 8)}...)</li>
                {createdStory.story_id && <li>✓ Story ({createdStory.story_id?.substring(0, 8)}...)</li>}
              </ul>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => router.push(`/storytellers/${createdStory.storyteller_id}`)}>
                View Storyteller Profile
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin')}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Quick Add: Storyteller & Transcript</h1>
          <p className="text-grey-600">Fast workflow for adding stories with Descript videos</p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(false) }}>

        {/* Organization Context Info */}
        {effectiveOrgId && effectiveOrgId !== 'all' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Adding to:</strong> {projects.length > 0 ? projects[0]?.organization_name || 'Current Organization' : 'Current Organization'}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              The storyteller will be automatically linked to this organization
            </p>
          </div>
        )}

        {(!effectiveOrgId || effectiveOrgId === 'all') && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Adding as Community Storyteller</strong>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              This storyteller will be added to the community. You can optionally link them to an organization later.
            </p>
          </div>
        )}

        {/* 1. Storyteller Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              1. Storyteller (Required)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={storytellerMode} onValueChange={(v) => setStorytellerMode(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="existing" id="existing" />
                <Label htmlFor="existing">Select Existing Storyteller</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new">Add New Storyteller</Label>
              </div>
            </RadioGroup>

            {storytellerMode === 'existing' ? (
              <div>
                <Label>Select Storyteller</Label>
                <Select value={selectedStoryteller} onValueChange={setSelectedStoryteller}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a storyteller..." />
                  </SelectTrigger>
                  <SelectContent>
                    {storytellers.map((st) => (
                      <SelectItem key={st.id} value={st.id}>
                        {st.display_name || st.full_name || st.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newStorytellerName}
                    onChange={(e) => setNewStorytellerName(e.target.value)}
                    placeholder="John Smith"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStorytellerEmail}
                    onChange={(e) => setNewStorytellerEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="storyteller-photo">Profile Image (optional)</Label>
                  <Input
                    id="storyteller-photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                  {photo && (
                    <p className="text-sm text-green-600 mt-1">✓ Selected: {photo.name}</p>
                  )}
                  <p className="text-xs text-grey-500 mt-1">
                    Upload a profile photo for the storyteller
                  </p>
                </div>
                <div>
                  <Label htmlFor="location">Location (optional)</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Melbourne, VIC"
                  />
                  <p className="text-xs text-grey-500 mt-1">City, State (e.g., Sydney, NSW)</p>
                </div>
                <div>
                  <Label htmlFor="bio">Bio (optional)</Label>
                  <Textarea
                    id="bio"
                    value={newStorytellerBio}
                    onChange={(e) => setNewStorytellerBio(e.target.value)}
                    placeholder="Community elder with 30 years of experience..."
                    rows={2}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. Transcript Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              2. Transcript (Required)
            </CardTitle>
            <CardDescription>Paste the full transcript text from Descript or your notes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="transcript">Transcript Text *</Label>
              <Textarea
                id="transcript"
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                placeholder="Paste the full transcript here... (just paste - no formatting needed)"
                rows={12}
                className="font-mono text-sm"
                required
              />
              <p className="text-sm text-grey-500 mt-1">
                {transcriptText.length} characters • ~{Math.ceil(transcriptText.split(/\s+/).filter(Boolean).length / 150)} minutes
              </p>
            </div>

            <div>
              <Label htmlFor="title">Transcript Title (optional)</Label>
              <Input
                id="title"
                value={transcriptTitle}
                onChange={(e) => setTranscriptTitle(e.target.value)}
                placeholder="Auto-generated from storyteller name if left empty"
              />
            </div>
          </CardContent>
        </Card>

        {/* 3. Video Section (Optional) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              3. Descript Video Link (Optional)
            </CardTitle>
            <CardDescription>Paste the share link from Descript if you have one</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="video">Video URL</Label>
            <Input
              id="video"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://share.descript.com/view/..."
            />
            {videoUrl && (
              <div className="mt-2 text-sm">
                {videoUrl.includes('descript.com') ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    ✓ Valid Descript link
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    Other video link detected
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 4. Project Section (Optional - only show if org selected) */}
        {effectiveOrgId && effectiveOrgId !== 'all' && projects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                4. Project (Optional)
              </CardTitle>
              <CardDescription>Link this story to a specific project</CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="project">Select Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="No project (community story)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No project (community story)</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* 5. Optional Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>5. Optional Details</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowOptional(!showOptional)}
              >
                {showOptional ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showOptional ? 'Hide' : 'Show'}
              </Button>
            </div>
          </CardHeader>
          {showOptional && (
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="cultural">Cultural Background</Label>
                <Input
                  id="cultural"
                  value={culturalBackground}
                  onChange={(e) => setCulturalBackground(e.target.value)}
                  placeholder="Wiradjuri, Yolngu, etc."
                />
                <p className="text-xs text-grey-500 mt-1">Cultural or Indigenous heritage</p>
              </div>

              <div>
                <Label htmlFor="tags">Story Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="youth, leadership, empowerment, resilience"
                />
                <p className="text-xs text-grey-500 mt-1">Keywords to help categorize this story</p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit(true)}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save & Add Another'}
          </Button>
          <Button
            type="submit"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save & Done'}
          </Button>
        </div>
      </form>
    </div>
  )
}

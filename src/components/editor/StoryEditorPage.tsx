'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { RichTextEditor } from './RichTextEditor'
import { StoryMetadataPanel } from './StoryMetadataPanel'
import { CulturalProtocolsSelector } from './CulturalProtocolsSelector'
import { PrivacySettingsPanel } from './PrivacySettingsPanel'
import { EditorPreview } from './EditorPreview'
import {
  ArrowLeft,
  Save,
  Eye,
  MoreVertical,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface StoryEditorPageProps {
  storyId?: string
  mode: 'create' | 'edit'
}

interface StoryData {
  id?: string
  title: string
  content: string
  excerpt: string
  featured_image_url?: string
  story_type: 'text' | 'audio' | 'video' | 'mixed'
  cultural_tags: string[]
  cultural_protocols: string[]
  sensitivity_level: 'public' | 'sensitive' | 'sacred'
  is_public: boolean
  allow_comments: boolean
  requires_moderation: boolean
  status: 'draft' | 'published' | 'archived'
}

export function StoryEditorPage({ storyId, mode }: StoryEditorPageProps) {
  const router = useRouter()

  const [story, setStory] = useState<StoryData>({
    title: '',
    content: '',
    excerpt: '',
    story_type: 'text',
    cultural_tags: [],
    cultural_protocols: [],
    sensitivity_level: 'public',
    is_public: true,
    allow_comments: true,
    requires_moderation: false,
    status: 'draft'
  })

  const [loading, setLoading] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [activePanel, setActivePanel] = useState<'metadata' | 'protocols' | 'privacy'>('metadata')

  // Load existing story for editing
  useEffect(() => {
    if (mode === 'edit' && storyId) {
      loadStory()
    }
  }, [storyId, mode])

  const loadStory = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/stories/${storyId}/edit`)
      if (!response.ok) throw new Error('Failed to load story')

      const data = await response.json()
      setStory(data.story)
    } catch (error) {
      console.error('Error loading story:', error)
      alert('Failed to load story')
    } finally {
      setLoading(false)
    }
  }

  // Autosave functionality
  useEffect(() => {
    if (!hasUnsavedChanges) return

    const timer = setTimeout(() => {
      handleSave(true) // silent autosave
    }, 30000) // 30 seconds

    return () => clearTimeout(timer)
  }, [story, hasUnsavedChanges])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const handleSave = async (silent = false) => {
    try {
      if (!silent) setSaving(true)

      const endpoint = story.id
        ? `/api/stories/${story.id}`
        : '/api/stories/create'

      const method = story.id ? 'PATCH' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(story)
      })

      if (!response.ok) throw new Error('Failed to save story')

      const data = await response.json()

      setStory(prev => ({ ...prev, id: data.story.id }))
      setLastSaved(new Date())
      setHasUnsavedChanges(false)

      if (!silent) {
        // Show success toast
        console.log('Story saved successfully')
      }
    } catch (error) {
      console.error('Error saving story:', error)
      if (!silent) {
        alert('Failed to save story')
      }
    } finally {
      if (!silent) setSaving(false)
    }
  }

  const handleContentChange = useCallback((content: string) => {
    setStory(prev => ({ ...prev, content }))
    setHasUnsavedChanges(true)
  }, [])

  const handleMetadataChange = useCallback((updates: Partial<StoryData>) => {
    setStory(prev => ({ ...prev, ...updates }))
    setHasUnsavedChanges(true)
  }, [])

  const handlePublish = () => {
    router.push(`/stories/${story.id}/publish`)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/stories/${story.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete story')

      router.push('/storytellers/me/stories')
    } catch (error) {
      console.error('Error deleting story:', error)
      alert('Failed to delete story')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-[#D97757] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#2C2C2C]/60">Loading story...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-[#2C2C2C]/10">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Left: Back button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="hover:bg-[#D97757]/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Stories
          </Button>

          {/* Center: Status */}
          <div className="flex items-center gap-3 text-sm">
            {saving ? (
              <div className="flex items-center gap-2 text-[#D97757]">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </div>
            ) : hasUnsavedChanges ? (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="w-4 h-4" />
                <span>Unsaved changes</span>
              </div>
            ) : lastSaved ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Saved {formatTimeAgo(lastSaved)}</span>
              </div>
            ) : null}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="border-[#2C2C2C]/20 hover:bg-[#D97757]/5"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Edit' : 'Preview'}
            </Button>

            <Button
              onClick={() => handleSave(false)}
              disabled={!hasUnsavedChanges || saving}
              className="bg-[#D97757] hover:bg-[#D97757]/90"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>

            {story.status === 'draft' && (
              <Button
                onClick={handlePublish}
                disabled={!story.id || hasUnsavedChanges}
                className="bg-[#2D5F4F] hover:bg-[#2D5F4F]/90"
              >
                Publish
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/stories/${story.id}/versions`)}>
                  View Version History
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/stories/${story.id}/collaborators`)}>
                  Manage Collaborators
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  Delete Story
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6 p-6">
          {/* Left Sidebar */}
          <div className="space-y-4">
            {/* Panel Tabs */}
            <div className="bg-white rounded-lg border-2 border-[#2C2C2C]/10 p-2">
              <div className="space-y-1">
                <button
                  onClick={() => setActivePanel('metadata')}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    activePanel === 'metadata'
                      ? "bg-[#D97757]/10 text-[#D97757]"
                      : "hover:bg-[#F8F6F1] text-[#2C2C2C]/70"
                  )}
                >
                  Story Details
                </button>
                <button
                  onClick={() => setActivePanel('protocols')}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    activePanel === 'protocols'
                      ? "bg-[#D97757]/10 text-[#D97757]"
                      : "hover:bg-[#F8F6F1] text-[#2C2C2C]/70"
                  )}
                >
                  Cultural Protocols
                </button>
                <button
                  onClick={() => setActivePanel('privacy')}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    activePanel === 'privacy'
                      ? "bg-[#D97757]/10 text-[#D97757]"
                      : "hover:bg-[#F8F6F1] text-[#2C2C2C]/70"
                  )}
                >
                  Privacy & Sharing
                </button>
              </div>
            </div>

            {/* Active Panel Content */}
            {activePanel === 'metadata' && (
              <StoryMetadataPanel
                story={story}
                onChange={handleMetadataChange}
              />
            )}

            {activePanel === 'protocols' && (
              <CulturalProtocolsSelector
                story={story}
                onChange={handleMetadataChange}
              />
            )}

            {activePanel === 'privacy' && (
              <PrivacySettingsPanel
                story={story}
                onChange={handleMetadataChange}
              />
            )}
          </div>

          {/* Main Editor Area */}
          <div className="bg-white rounded-lg border-2 border-[#2C2C2C]/10 overflow-hidden">
            {showPreview ? (
              <EditorPreview story={story} />
            ) : (
              <RichTextEditor
                content={story.content}
                onChange={handleContentChange}
                placeholder="Begin your story..."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper to format time ago
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 120) return '1 minute ago'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 7200) return '1 hour ago'
  return `${Math.floor(seconds / 3600)} hours ago`
}

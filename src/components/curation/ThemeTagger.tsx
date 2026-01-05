'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { Tag, Sparkles, Plus, X, Search, BookOpen } from 'lucide-react'

interface Story {
  id: string
  title: string
  storyteller_name: string
  current_themes: string[]
  excerpt?: string
  ai_suggested_themes?: string[]
}

interface ThemeTaggerProps {
  organizationId: string
  projectId?: string
  onTaggingComplete: () => void
}

// Common themes for Indigenous storytelling
const COMMON_THEMES = [
  'Land & Territory',
  'Cultural Identity',
  'Family & Community',
  'Traditional Knowledge',
  'Language Revitalization',
  'Healing & Wellness',
  'Resilience',
  'Intergenerational Wisdom',
  'Connection to Nature',
  'Ceremony & Protocol',
  'Justice & Rights',
  'Education',
  'Reconciliation',
  'Self-Determination',
  'Climate & Environment',
  'Art & Expression',
  'Food Sovereignty',
  'Economic Development',
  'Youth Empowerment',
  'Elder Teachings'
]

export function ThemeTagger({ organizationId, projectId, onTaggingComplete }: ThemeTaggerProps) {
  const { toast } = useToast()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [selectedThemes, setSelectedThemes] = useState<Set<string>>(new Set())
  const [customTheme, setCustomTheme] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({ organization_id: organizationId })
        if (projectId) params.set('project_id', projectId)

        const response = await fetch(`/api/curation/stories?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setStories(data.stories || [])
        }
      } catch (error) {
        console.error('Failed to fetch stories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStories()
  }, [organizationId, projectId])

  const handleStorySelect = (story: Story) => {
    setSelectedStory(story)
    setSelectedThemes(new Set(story.current_themes || []))
    setCustomTheme('')
  }

  const toggleTheme = (theme: string) => {
    const newThemes = new Set(selectedThemes)
    if (newThemes.has(theme)) {
      newThemes.delete(theme)
    } else {
      newThemes.add(theme)
    }
    setSelectedThemes(newThemes)
  }

  const addCustomTheme = () => {
    if (!customTheme.trim()) return

    const newThemes = new Set(selectedThemes)
    newThemes.add(customTheme.trim())
    setSelectedThemes(newThemes)
    setCustomTheme('')
  }

  const removeTheme = (theme: string) => {
    const newThemes = new Set(selectedThemes)
    newThemes.delete(theme)
    setSelectedThemes(newThemes)
  }

  const handleSaveThemes = async () => {
    if (!selectedStory) return

    try {
      setSaving(true)

      const response = await fetch('/api/curation/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          story_id: selectedStory.id,
          themes: Array.from(selectedThemes)
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save themes')
      }

      toast({
        title: 'Themes Saved',
        description: `${selectedThemes.size} themes applied to "${selectedStory.title}".`,
      })

      // Update local state
      setStories(stories.map(s =>
        s.id === selectedStory.id
          ? { ...s, current_themes: Array.from(selectedThemes) }
          : s
      ))

      onTaggingComplete()
    } catch (error) {
      console.error('Failed to save themes:', error)
      toast({
        title: 'Save Failed',
        description: 'Unable to save themes. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const filteredStories = stories.filter(story =>
    searchTerm === '' ||
    story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.storyteller_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredCommonThemes = COMMON_THEMES.filter(theme =>
    !selectedThemes.has(theme)
  )

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading stories...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Story Selection */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Story to Tag</CardTitle>
            <CardDescription>
              Choose a story to add or edit themes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-[500px] overflow-y-auto space-y-2">
              {filteredStories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No stories found</p>
                </div>
              ) : (
                filteredStories.map(story => (
                  <Card
                    key={story.id}
                    className={`cursor-pointer transition-colors ${
                      selectedStory?.id === story.id
                        ? 'border-amber-600 bg-amber-50'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => handleStorySelect(story)}
                  >
                    <CardContent className="p-3">
                      <h4 className="font-medium mb-1">{story.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {story.storyteller_name}
                      </p>
                      {story.current_themes && story.current_themes.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {story.current_themes.length} {story.current_themes.length === 1 ? 'theme' : 'themes'}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Theme Tagging */}
      <div className="space-y-4">
        {!selectedStory ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No Story Selected</p>
              <p className="text-sm mt-1">Select a story from the list to add themes</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Selected Story Info */}
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-1">{selectedStory.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  by {selectedStory.storyteller_name}
                </p>
                {selectedStory.excerpt && (
                  <p className="text-sm text-muted-foreground italic">
                    "{selectedStory.excerpt}..."
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Current Themes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="h-5 w-5 text-amber-600" />
                  Applied Themes ({selectedThemes.size})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedThemes.size === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No themes applied yet
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {Array.from(selectedThemes).map(theme => (
                      <Badge
                        key={theme}
                        variant="default"
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        {theme}
                        <button
                          onClick={() => removeTheme(theme)}
                          className="ml-2 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Suggested Themes */}
            {selectedStory.ai_suggested_themes && selectedStory.ai_suggested_themes.length > 0 && (
              <Card className="bg-gradient-to-r from-sky-50 to-sage-50 border-sky-200">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-sky-600" />
                    AI Suggested Themes
                  </CardTitle>
                  <CardDescription>
                    Click to add suggested themes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedStory.ai_suggested_themes
                      .filter(theme => !selectedThemes.has(theme))
                      .map(theme => (
                        <Badge
                          key={theme}
                          variant="outline"
                          className="cursor-pointer border-sky-600 text-sky-600 hover:bg-sky-100"
                          onClick={() => toggleTheme(theme)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {theme}
                        </Badge>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Common Themes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Common Themes</CardTitle>
                <CardDescription>
                  Click to add themes to this story
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {filteredCommonThemes.map(theme => (
                    <Badge
                      key={theme}
                      variant="outline"
                      className="cursor-pointer hover:bg-amber-100"
                      onClick={() => toggleTheme(theme)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {theme}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Custom Theme */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Add Custom Theme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter custom theme..."
                    value={customTheme}
                    onChange={(e) => setCustomTheme(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomTheme()}
                  />
                  <Button onClick={addCustomTheme} disabled={!customTheme.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                size="lg"
                onClick={handleSaveThemes}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Tag className="h-4 w-4 mr-2" />
                    Save Themes
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

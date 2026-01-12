'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Check,
  X,
  Plus,
  Tag,
  AlertTriangle,
  Shield,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TagOption {
  id: string
  name: string
  slug: string
  category: string
  culturalSensitivityLevel: string
  requiresElderApproval: boolean
  usageCount: number
}

export interface SelectedTag extends TagOption {
  source?: 'manual' | 'ai_verified' | 'ai_suggested'
  confidence?: number
}

export interface AITagSuggestion {
  name: string
  confidence: number
  category: string
}

interface TagAutocompleteProps {
  selectedTags: SelectedTag[]
  onTagsChange: (tags: SelectedTag[]) => void
  aiSuggestions?: AITagSuggestion[]
  onAcceptAISuggestion?: (suggestion: AITagSuggestion) => void
  onRejectAISuggestion?: (suggestion: AITagSuggestion) => void
  placeholder?: string
  disabled?: boolean
  maxTags?: number
  allowCreate?: boolean
  showCategoryFilter?: boolean
  className?: string
}

const CATEGORY_COLORS: Record<string, string> = {
  project: 'bg-blue-100 text-blue-800 border-blue-200',
  theme: 'bg-green-100 text-green-800 border-green-200',
  cultural: 'bg-purple-100 text-purple-800 border-purple-200',
  event: 'bg-orange-100 text-orange-800 border-orange-200',
  location: 'bg-teal-100 text-teal-800 border-teal-200',
  person: 'bg-pink-100 text-pink-800 border-pink-200',
  general: 'bg-stone-100 text-stone-800 border-stone-200',
}

const SENSITIVITY_ICONS: Record<string, React.ReactNode> = {
  public: null,
  sensitive: <AlertTriangle className="h-3 w-3 text-amber-500" />,
  sacred: <Shield className="h-3 w-3 text-purple-600" />,
}

export function TagAutocomplete({
  selectedTags,
  onTagsChange,
  aiSuggestions = [],
  onAcceptAISuggestion,
  onRejectAISuggestion,
  placeholder = 'Search or add tags...',
  disabled = false,
  maxTags = 20,
  allowCreate = true,
  showCategoryFilter = false,
  className,
}: TagAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [availableTags, setAvailableTags] = useState<TagOption[]>([])
  const [loading, setLoading] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [creatingTag, setCreatingTag] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Fetch tags from API
  const fetchTags = useCallback(async (searchTerm: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: categoryFilter }),
      })

      const response = await fetch(`/api/tags?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableTags(data.tags || [])
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    } finally {
      setLoading(false)
    }
  }, [categoryFilter])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      fetchTags(search)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [search, fetchTags])

  // Initial load
  useEffect(() => {
    if (open) {
      fetchTags('')
    }
  }, [open, fetchTags])

  // Add a tag
  const addTag = (tag: TagOption) => {
    if (selectedTags.length >= maxTags) return
    if (selectedTags.some(t => t.id === tag.id)) return

    onTagsChange([...selectedTags, { ...tag, source: 'manual' }])
    setSearch('')
  }

  // Remove a tag
  const removeTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(t => t.id !== tagId))
  }

  // Create new tag
  const createTag = async (name: string) => {
    if (!name.trim() || !allowCreate) return

    setCreatingTag(true)
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), category: 'general' }),
      })

      if (response.ok) {
        const data = await response.json()
        addTag(data.tag)
      } else if (response.status === 409) {
        // Tag already exists
        const data = await response.json()
        if (data.existingTag) {
          // Find it in available tags and add
          const existing = availableTags.find(t => t.id === data.existingTag.id)
          if (existing) addTag(existing)
        }
      }
    } catch (error) {
      console.error('Failed to create tag:', error)
    } finally {
      setCreatingTag(false)
      setSearch('')
    }
  }

  // Handle Enter key for quick create
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && search.trim() && allowCreate) {
      e.preventDefault()
      // Check if search matches any available tag
      const match = availableTags.find(
        t => t.name.toLowerCase() === search.toLowerCase()
      )
      if (match) {
        addTag(match)
      } else {
        createTag(search)
      }
    }
  }

  // Filter out already selected tags
  const filteredTags = availableTags.filter(
    tag => !selectedTags.some(st => st.id === tag.id)
  )

  // Unhandled AI suggestions (not yet accepted/rejected)
  const pendingAISuggestions = aiSuggestions.filter(
    s => !selectedTags.some(t => t.name.toLowerCase() === s.name.toLowerCase())
  )

  return (
    <div className={cn('space-y-3', className)}>
      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 min-h-[32px]">
        {selectedTags.map(tag => (
          <Badge
            key={tag.id}
            variant="outline"
            className={cn(
              'flex items-center gap-1.5 pr-1',
              CATEGORY_COLORS[tag.category] || CATEGORY_COLORS.general
            )}
          >
            {SENSITIVITY_ICONS[tag.culturalSensitivityLevel]}
            {tag.source === 'ai_verified' && (
              <Sparkles className="h-3 w-3 text-amber-500" />
            )}
            <span>{tag.name}</span>
            <button
              onClick={() => removeTag(tag.id)}
              className="ml-1 p-0.5 rounded-full hover:bg-black/10"
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {selectedTags.length === 0 && (
          <span className="text-sm text-stone-400 italic">No tags added</span>
        )}
      </div>

      {/* AI Suggestions */}
      {pendingAISuggestions.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
            <Sparkles className="h-4 w-4" />
            AI Suggestions
          </div>
          <div className="flex flex-wrap gap-2">
            {pendingAISuggestions.map((suggestion, i) => (
              <div
                key={i}
                className="flex items-center gap-1 px-2 py-1 bg-white border border-amber-200 rounded-md text-sm"
              >
                <span>{suggestion.name}</span>
                <span className="text-xs text-stone-400">
                  ({Math.round(suggestion.confidence * 100)}%)
                </span>
                <button
                  onClick={() => onAcceptAISuggestion?.(suggestion)}
                  className="p-0.5 hover:bg-green-100 rounded text-green-600"
                  title="Accept"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onRejectAISuggestion?.(suggestion)}
                  className="p-0.5 hover:bg-red-100 rounded text-red-600"
                  title="Reject"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tag Search Popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-stone-500"
            disabled={disabled || selectedTags.length >= maxTags}
          >
            <Tag className="h-4 w-4 mr-2" />
            {placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              ref={inputRef}
              placeholder="Search tags..."
              value={search}
              onValueChange={setSearch}
              onKeyDown={handleKeyDown}
            />
            <CommandList>
              {loading ? (
                <div className="py-6 text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-stone-400" />
                </div>
              ) : (
                <>
                  <CommandEmpty>
                    {search.trim() && allowCreate ? (
                      <button
                        onClick={() => createTag(search)}
                        className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-stone-100 w-full text-left"
                        disabled={creatingTag}
                      >
                        {creatingTag ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                        Create tag "{search}"
                      </button>
                    ) : (
                      <span>No tags found</span>
                    )}
                  </CommandEmpty>

                  {/* Category filters */}
                  {showCategoryFilter && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-medium text-stone-500">
                        Filter by category
                      </div>
                      <div className="flex flex-wrap gap-1 px-2 pb-2">
                        {['project', 'theme', 'cultural', 'event', 'general'].map(cat => (
                          <button
                            key={cat}
                            onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                            className={cn(
                              'px-2 py-0.5 text-xs rounded-full border',
                              categoryFilter === cat
                                ? CATEGORY_COLORS[cat]
                                : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                      <CommandSeparator />
                    </>
                  )}

                  {/* Popular/Recent tags */}
                  {filteredTags.length > 0 && (
                    <CommandGroup heading="Tags">
                      {filteredTags.slice(0, 15).map(tag => (
                        <CommandItem
                          key={tag.id}
                          value={tag.slug}
                          onSelect={() => addTag(tag)}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            {SENSITIVITY_ICONS[tag.culturalSensitivityLevel]}
                            <span>{tag.name}</span>
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[10px] px-1.5',
                                CATEGORY_COLORS[tag.category]
                              )}
                            >
                              {tag.category}
                            </Badge>
                          </div>
                          <span className="text-xs text-stone-400">
                            {tag.usageCount} uses
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {/* Create new option */}
                  {search.trim() && allowCreate && !filteredTags.some(
                    t => t.name.toLowerCase() === search.toLowerCase()
                  ) && (
                    <>
                      <CommandSeparator />
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => createTag(search)}
                          className="text-blue-600"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create tag "{search}"
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Tag count */}
      <div className="text-xs text-stone-400">
        {selectedTags.length} / {maxTags} tags
      </div>
    </div>
  )
}

export default TagAutocomplete

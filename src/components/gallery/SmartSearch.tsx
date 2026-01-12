'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Search,
  Filter,
  X,
  Image as ImageIcon,
  Video,
  MapPin,
  Users,
  Tag,
  Calendar as CalendarIcon,
  FolderKanban,
  Sparkles,
  ChevronDown,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface SearchFilters {
  query: string
  mediaTypes: string[]
  projects: string[]
  tags: string[]
  storytellers: string[]
  locations: string[]
  dateRange: {
    from?: Date
    to?: Date
  }
  sensitivityLevels: string[]
  statusFilters: {
    untagged?: boolean
    needsReview?: boolean
    pendingConsent?: boolean
  }
}

interface SearchResult {
  id: string
  title: string
  description?: string
  fileType: string
  thumbnailUrl: string
  cdnUrl: string
  createdAt: string
  project?: string
  location?: {
    placeName?: string
    locality?: string
    country?: string
    indigenousTerritory?: string
  }
  tags: Array<{ id: string; name: string; category: string }>
  storytellers: Array<{ id: string; name: string; imageUrl?: string }>
}

interface ParsedQuery {
  mediaTypes: string[]
  projects: string[]
  themes: string[]
  locationTerms: string[]
  storytellerNames: string[]
  timeRange: any
  sensitivityLevels: string[]
  statusFilters: Record<string, boolean>
}

interface SmartSearchProps {
  onResultSelect?: (mediaId: string) => void
  initialQuery?: string
}

// Project options
const PROJECTS = [
  { value: 'empathy-ledger', label: 'Empathy Ledger' },
  { value: 'justicehub', label: 'JusticeHub' },
  { value: 'act-farm', label: 'ACT Farm' },
  { value: 'harvest', label: 'The Harvest' },
  { value: 'goods', label: 'Goods on Country' },
  { value: 'placemat', label: 'ACT Placemat' },
  { value: 'studio', label: 'ACT Studio' }
]

const SENSITIVITY_LEVELS = [
  { value: 'public', label: 'Public' },
  { value: 'sensitive', label: 'Sensitive' },
  { value: 'sacred', label: 'Sacred' }
]

// Example search suggestions
const SEARCH_SUGGESTIONS = [
  'photos from last month',
  'videos with Maria',
  'ACT Farm content',
  'untagged photos needing review',
  'sacred ceremony content',
  'photos in Sydney',
  'community gatherings',
  'storytelling videos'
]

export function SmartSearch({ onResultSelect, initialQuery = '' }: SmartSearchProps) {
  const [query, setQuery] = useState(initialQuery)
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    mediaTypes: [],
    projects: [],
    tags: [],
    storytellers: [],
    locations: [],
    dateRange: {},
    sensitivityLevels: [],
    statusFilters: {}
  })
  const [results, setResults] = useState<SearchResult[]>([])
  const [parsedQuery, setParsedQuery] = useState<ParsedQuery | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [availableTags, setAvailableTags] = useState<Array<{ id: string; name: string; category: string }>>([])
  const [availableStorytellers, setAvailableStorytellers] = useState<Array<{ id: string; name: string }>>([])

  const searchInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Fetch available tags and storytellers for filters
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch tags
        const tagsRes = await fetch('/api/tags?limit=100')
        if (tagsRes.ok) {
          const tagsData = await tagsRes.json()
          setAvailableTags(tagsData.tags || [])
        }

        // Fetch storytellers
        const storytellersRes = await fetch('/api/storytellers?limit=100')
        if (storytellersRes.ok) {
          const storytellersData = await storytellersRes.json()
          setAvailableStorytellers(
            (storytellersData.storytellers || []).map((s: any) => ({
              id: s.id,
              name: s.display_name
            }))
          )
        }
      } catch (err) {
        console.error('Error fetching filter options:', err)
      }
    }
    fetchFilterOptions()
  }, [])

  // Perform search
  const performSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilters) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()

      if (searchQuery) {
        params.set('q', searchQuery)
      }

      // Add direct filter params
      if (searchFilters.mediaTypes.length === 1) {
        params.set('type', searchFilters.mediaTypes[0])
      }
      if (searchFilters.projects.length > 0) {
        params.set('project', searchFilters.projects[0])
      }
      if (searchFilters.dateRange.from) {
        params.set('from', searchFilters.dateRange.from.toISOString())
      }
      if (searchFilters.dateRange.to) {
        params.set('to', searchFilters.dateRange.to.toISOString())
      }
      if (searchFilters.sensitivityLevels.length > 0) {
        params.set('sensitivity', searchFilters.sensitivityLevels[0])
      }

      const response = await fetch(`/api/media/search?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Search failed')
      }

      setResults(data.results || [])
      setParsedQuery(data.query?.parsed || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search on query change
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      if (query.length >= 2 || hasActiveFilters(filters)) {
        performSearch(query, filters)
      } else if (query.length === 0 && !hasActiveFilters(filters)) {
        setResults([])
        setParsedQuery(null)
      }
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, filters, performSearch])

  const hasActiveFilters = (f: SearchFilters) => {
    return (
      f.mediaTypes.length > 0 ||
      f.projects.length > 0 ||
      f.tags.length > 0 ||
      f.storytellers.length > 0 ||
      f.locations.length > 0 ||
      f.dateRange.from ||
      f.dateRange.to ||
      f.sensitivityLevels.length > 0 ||
      Object.values(f.statusFilters).some(Boolean)
    )
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      mediaTypes: [],
      projects: [],
      tags: [],
      storytellers: [],
      locations: [],
      dateRange: {},
      sensitivityLevels: [],
      statusFilters: {}
    })
    setQuery('')
  }

  const toggleMediaType = (type: string) => {
    setFilters(prev => ({
      ...prev,
      mediaTypes: prev.mediaTypes.includes(type)
        ? prev.mediaTypes.filter(t => t !== type)
        : [...prev.mediaTypes, type]
    }))
  }

  const toggleProject = (project: string) => {
    setFilters(prev => ({
      ...prev,
      projects: prev.projects.includes(project)
        ? prev.projects.filter(p => p !== project)
        : [...prev.projects, project]
    }))
  }

  const toggleTag = (tagId: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId]
    }))
  }

  const toggleSensitivity = (level: string) => {
    setFilters(prev => ({
      ...prev,
      sensitivityLevels: prev.sensitivityLevels.includes(level)
        ? prev.sensitivityLevels.filter(l => l !== level)
        : [...prev.sensitivityLevels, level]
    }))
  }

  const activeFilterCount = [
    filters.mediaTypes.length,
    filters.projects.length,
    filters.tags.length,
    filters.storytellers.length,
    filters.sensitivityLevels.length,
    filters.dateRange.from ? 1 : 0,
    filters.dateRange.to ? 1 : 0,
    Object.values(filters.statusFilters).filter(Boolean).length
  ].reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search naturally: 'photos of Maria in Sydney from last month'..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Search Suggestions */}
          {!query && !hasActiveFilters(filters) && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Try:</span>
              {SEARCH_SUGGESTIONS.slice(0, 4).map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant="outline"
                  className="cursor-pointer hover:bg-sage-50"
                  onClick={() => setQuery(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          )}

          {/* Parsed Query Display */}
          {parsedQuery && Object.values(parsedQuery).some(v =>
            Array.isArray(v) ? v.length > 0 : v && Object.keys(v).length > 0
          ) && (
            <div className="mt-3 p-2 bg-sage-50 rounded-lg text-sm">
              <div className="flex items-center gap-2 text-sage-700">
                <Sparkles className="h-4 w-4" />
                <span>Searching for:</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {parsedQuery.mediaTypes?.map(t => (
                  <Badge key={t} variant="secondary">{t}s</Badge>
                ))}
                {parsedQuery.projects?.map(p => (
                  <Badge key={p} className="bg-clay-100 text-clay-700">{p}</Badge>
                ))}
                {parsedQuery.themes?.map(t => (
                  <Badge key={t} className="bg-purple-100 text-purple-700">{t}</Badge>
                ))}
                {parsedQuery.locationTerms?.map(l => (
                  <Badge key={l} className="bg-sage-100 text-sage-700">in {l}</Badge>
                ))}
                {parsedQuery.storytellerNames?.map(n => (
                  <Badge key={n} className="bg-earth-100 text-earth-700">with {n}</Badge>
                ))}
                {parsedQuery.timeRange?.relative && (
                  <Badge className="bg-amber-100 text-amber-700">{parsedQuery.timeRange.relative}</Badge>
                )}
                {parsedQuery.statusFilters?.untagged && (
                  <Badge variant="outline">untagged</Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Advanced Filters</CardTitle>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Media Type */}
            <div>
              <Label className="text-sm font-medium">Media Type</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={filters.mediaTypes.includes('image') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleMediaType('image')}
                  className="gap-1"
                >
                  <ImageIcon className="h-4 w-4" />
                  Photos
                </Button>
                <Button
                  variant={filters.mediaTypes.includes('video') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleMediaType('video')}
                  className="gap-1"
                >
                  <Video className="h-4 w-4" />
                  Videos
                </Button>
              </div>
            </div>

            <Separator />

            {/* Projects */}
            <div>
              <Label className="text-sm font-medium">Projects</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {PROJECTS.map((project) => (
                  <Button
                    key={project.value}
                    variant={filters.projects.includes(project.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleProject(project.value)}
                  >
                    {project.label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">From Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal mt-2',
                        !filters.dateRange.from && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.from ? format(filters.dateRange.from, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.from}
                      onSelect={(date) => setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, from: date }
                      }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="text-sm font-medium">To Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal mt-2',
                        !filters.dateRange.to && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.to ? format(filters.dateRange.to, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.to}
                      onSelect={(date) => setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, to: date }
                      }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Separator />

            {/* Cultural Sensitivity */}
            <div>
              <Label className="text-sm font-medium">Cultural Sensitivity</Label>
              <div className="flex gap-2 mt-2">
                {SENSITIVITY_LEVELS.map((level) => (
                  <Button
                    key={level.value}
                    variant={filters.sensitivityLevels.includes(level.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleSensitivity(level.value)}
                  >
                    {level.label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Status Filters */}
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="untagged"
                    checked={filters.statusFilters.untagged || false}
                    onCheckedChange={(checked) => setFilters(prev => ({
                      ...prev,
                      statusFilters: { ...prev.statusFilters, untagged: checked as boolean }
                    }))}
                  />
                  <label htmlFor="untagged" className="text-sm">Untagged</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="needsReview"
                    checked={filters.statusFilters.needsReview || false}
                    onCheckedChange={(checked) => setFilters(prev => ({
                      ...prev,
                      statusFilters: { ...prev.statusFilters, needsReview: checked as boolean }
                    }))}
                  />
                  <label htmlFor="needsReview" className="text-sm">Needs Review</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="pendingConsent"
                    checked={filters.statusFilters.pendingConsent || false}
                    onCheckedChange={(checked) => setFilters(prev => ({
                      ...prev,
                      statusFilters: { ...prev.statusFilters, pendingConsent: checked as boolean }
                    }))}
                  />
                  <label htmlFor="pendingConsent" className="text-sm">Pending Consent</label>
                </div>
              </div>
            </div>

            {/* Tags (if available) */}
            {availableTags.length > 0 && (
              <>
                <Separator />
                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  <ScrollArea className="h-32 mt-2 border rounded-lg p-2">
                    <div className="flex flex-wrap gap-1">
                      {availableTags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant={filters.tags.includes(tag.id) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggleTag(tag.id)}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {loading ? 'Searching...' : `${results.length} Results`}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-destructive">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {query || hasActiveFilters(filters)
                ? 'No results found. Try adjusting your search or filters.'
                : 'Start typing to search your media library'}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-stone-200 cursor-pointer hover:border-sage-400 transition-colors"
                  onClick={() => onResultSelect?.(result.id)}
                >
                  <img
                    src={result.thumbnailUrl}
                    alt={result.title}
                    className="w-full h-full object-cover"
                  />
                  {result.fileType === 'video' && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-xs">
                        <Video className="h-3 w-3 mr-1" />
                        Video
                      </Badge>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-sm font-medium truncate">
                        {result.title}
                      </p>
                      {result.location?.placeName && (
                        <p className="text-white/80 text-xs flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {result.location.placeName}
                        </p>
                      )}
                    </div>
                  </div>
                  {result.storytellers.length > 0 && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {result.storytellers.length}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

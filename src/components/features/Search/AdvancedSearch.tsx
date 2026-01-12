'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, X, Calendar, User, Building2, Tag, MapPin, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePicker } from '@/components/ui/date-picker'
import { Slider } from '@/components/ui/slider'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { cn } from '@/lib/utils'

export interface SearchFilters {
  query: string
  type: 'all' | 'stories' | 'storytellers' | 'organisations' | 'projects'
  status?: string[]
  dateRange?: {
    from: Date | undefined
    to: Date | undefined
  }
  locations?: string[]
  organisations?: string[]
  tags?: string[]
  culturalBackground?: string[]
  engagementRange?: [number, number]
  sortBy?: 'relevance' | 'date' | 'popularity' | 'alphabetical'
  sortOrder?: 'asc' | 'desc'
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  initialFilters?: Partial<SearchFilters>
  showFilters?: boolean
  placeholder?: string
  className?: string
}

export default function AdvancedSearch({
  onSearch,
  initialFilters = {},
  showFilters = true,
  placeholder = 'Search stories, storytellers, organisations...',
  className
}: AdvancedSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: initialFilters.query || searchParams.get('q') || '',
    type: initialFilters.type || 'all',
    status: initialFilters.status || [],
    dateRange: initialFilters.dateRange,
    locations: initialFilters.locations || [],
    organisations: initialFilters.organisations || [],
    tags: initialFilters.tags || [],
    culturalBackground: initialFilters.culturalBackground || [],
    engagementRange: initialFilters.engagementRange || [0, 100],
    sortBy: initialFilters.sortBy || 'relevance',
    sortOrder: initialFilters.sortOrder || 'desc'
  })
  
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeFilterCount, setActiveFilterCount] = useState(0)
  
  const debouncedQuery = useDebounce(filters.query, 300)
  
  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (filters.query) params.set('q', filters.query)
    if (filters.type !== 'all') params.set('type', filters.type)
    if (filters.sortBy !== 'relevance') params.set('sort', filters.sortBy)
    if (filters.sortOrder !== 'desc') params.set('order', filters.sortOrder)
    
    // Add array filters
    if (filters.status?.length) params.set('status', filters.status.join(','))
    if (filters.locations?.length) params.set('locations', filters.locations.join(','))
    if (filters.organisations?.length) params.set('orgs', filters.organisations.join(','))
    if (filters.tags?.length) params.set('tags', filters.tags.join(','))
    
    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, '', newUrl)
  }, [filters])
  
  // Count active filters
  useEffect(() => {
    let count = 0
    if (filters.type !== 'all') count++
    if (filters.status?.length) count++
    if (filters.dateRange?.from || filters.dateRange?.to) count++
    if (filters.locations?.length) count++
    if (filters.organisations?.length) count++
    if (filters.tags?.length) count++
    if (filters.culturalBackground?.length) count++
    if (filters.engagementRange?.[0] !== 0 || filters.engagementRange?.[1] !== 100) count++
    setActiveFilterCount(count)
  }, [filters])
  
  // Trigger search when debounced query changes
  useEffect(() => {
    onSearch(filters)
  }, [debouncedQuery, filters.type, filters.status, filters.dateRange, filters.locations, 
      filters.organisations, filters.tags, filters.sortBy, filters.sortOrder])
  
  const updateFilter = useCallback(<K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])
  
  const toggleArrayFilter = useCallback((
    key: keyof SearchFilters,
    value: string
  ) => {
    setFilters(prev => {
      const current = prev[key] as string[] || []
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, [key]: updated }
    })
  }, [])
  
  const clearFilters = useCallback(() => {
    setFilters({
      query: '',
      type: 'all',
      status: [],
      dateRange: undefined,
      locations: [],
      organisations: [],
      tags: [],
      culturalBackground: [],
      engagementRange: [0, 100],
      sortBy: 'relevance',
      sortOrder: 'desc'
    })
  }, [])
  
  const FilterSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <Collapsible defaultOpen className="space-y-2">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-grey-50 rounded">
        <span className="font-medium text-sm">{title}</span>
        <ChevronDown className="h-4 w-4" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 px-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-grey-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            className="pl-10 pr-4"
          />
          {filters.query && (
            <button
              onClick={() => updateFilter('query', '')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-grey-400 hover:text-grey-600" />
            </button>
          )}
        </div>
        
        {showFilters && (
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-96">
              <SheetHeader>
                <SheetTitle>Advanced Filters</SheetTitle>
                <SheetDescription>
                  Refine your search with additional filters
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Content Type */}
                <FilterSection title="Content Type">
                  <RadioGroup
                    value={filters.type}
                    onValueChange={(value) => updateFilter('type', value as SearchFilters['type'])}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="type-all" />
                      <Label htmlFor="type-all">All</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="stories" id="type-stories" />
                      <Label htmlFor="type-stories">Stories</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="storytellers" id="type-storytellers" />
                      <Label htmlFor="type-storytellers">Storytellers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="organisations" id="type-organisations" />
                      <Label htmlFor="type-organisations">Organizations</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="projects" id="type-projects" />
                      <Label htmlFor="type-projects">Projects</Label>
                    </div>
                  </RadioGroup>
                </FilterSection>
                
                {/* Status Filter */}
                <FilterSection title="Status">
                  <div className="space-y-2">
                    {['Published', 'Draft', 'Under Review', 'Archived'].map(status => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status}`}
                          checked={filters.status?.includes(status)}
                          onCheckedChange={() => toggleArrayFilter('status', status)}
                        />
                        <Label htmlFor={`status-${status}`}>{status}</Label>
                      </div>
                    ))}
                  </div>
                </FilterSection>
                
                {/* Date Range */}
                <FilterSection title="Date Range">
                  <div className="space-y-2">
                    <div>
                      <Label>From</Label>
                      <DatePicker
                        date={filters.dateRange?.from}
                        onSelect={(date) => updateFilter('dateRange', {
                          ...filters.dateRange,
                          from: date
                        })}
                      />
                    </div>
                    <div>
                      <Label>To</Label>
                      <DatePicker
                        date={filters.dateRange?.to}
                        onSelect={(date) => updateFilter('dateRange', {
                          ...filters.dateRange,
                          to: date
                        })}
                      />
                    </div>
                  </div>
                </FilterSection>
                
                {/* Engagement Range */}
                <FilterSection title="Engagement Score">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{filters.engagementRange?.[0]}%</span>
                      <span>{filters.engagementRange?.[1]}%</span>
                    </div>
                    <Slider
                      value={filters.engagementRange}
                      onValueChange={(value) => updateFilter('engagementRange', value as [number, number])}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </FilterSection>
                
                {/* Sort Options */}
                <FilterSection title="Sort By">
                  <Select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onValueChange={(value) => {
                      const [sortBy, sortOrder] = value.split('-')
                      updateFilter('sortBy', sortBy as SearchFilters['sortBy'])
                      updateFilter('sortOrder', sortOrder as SearchFilters['sortOrder'])
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance-desc">Most Relevant</SelectItem>
                      <SelectItem value="date-desc">Newest First</SelectItem>
                      <SelectItem value="date-asc">Oldest First</SelectItem>
                      <SelectItem value="popularity-desc">Most Popular</SelectItem>
                      <SelectItem value="alphabetical-asc">A to Z</SelectItem>
                      <SelectItem value="alphabetical-desc">Z to A</SelectItem>
                    </SelectContent>
                  </Select>
                </FilterSection>
              </div>
              
              {/* Filter Actions */}
              <div className="flex gap-2 mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex-1"
                >
                  Clear All
                </Button>
                <Button
                  onClick={() => {
                    onSearch(filters)
                    setIsFilterOpen(false)
                  }}
                  className="flex-1"
                >
                  Apply Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
      
      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.type !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Type: {filters.type}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('type', 'all')}
              />
            </Badge>
          )}
          {filters.status?.map(status => (
            <Badge key={status} variant="secondary" className="gap-1">
              {status}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleArrayFilter('status', status)}
              />
            </Badge>
          ))}
          {filters.tags?.map(tag => (
            <Badge key={tag} variant="secondary" className="gap-1">
              <Tag className="h-3 w-3" />
              {tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleArrayFilter('tags', tag)}
              />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-6 text-xs"
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  )
}

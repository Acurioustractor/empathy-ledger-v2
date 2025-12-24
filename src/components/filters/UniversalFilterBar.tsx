'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Crown,
  Star,
  MapPin,
  Tag,
  Users,
  BookOpen,
  Globe,
  Filter,
  RotateCcw
} from 'lucide-react'
import {
  THEME_CATEGORIES,
  CULTURAL_BACKGROUNDS,
  SPECIALTIES,
  STORY_TYPES,
  SENSITIVITY_LEVELS,
  STORYTELLER_SORT_OPTIONS,
  STORY_SORT_OPTIONS,
  formatThemeLabel,
  getThemeColor
} from '@/lib/constants/themes'

// Filter state interface
export interface FilterState {
  search: string
  themes: string[]
  culturalBackground: string
  specialty: string
  storyType: string
  sensitivity: string
  elderStatus: 'all' | 'true' | 'false'
  featured: 'all' | 'true' | 'false'
  status: 'all' | 'active' | 'inactive' | 'pending'
  sortBy: string
}

export const defaultFilters: FilterState = {
  search: '',
  themes: [],
  culturalBackground: 'all',
  specialty: 'all',
  storyType: 'all',
  sensitivity: 'all',
  elderStatus: 'all',
  featured: 'all',
  status: 'all',
  sortBy: 'name'
}

interface UniversalFilterBarProps {
  type: 'storyteller' | 'story'
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  showThemeFilter?: boolean
  showCulturalFilter?: boolean
  showSpecialtyFilter?: boolean
  showStoryTypeFilter?: boolean
  showSensitivityFilter?: boolean
  showElderFilter?: boolean
  showFeaturedFilter?: boolean
  showStatusFilter?: boolean
  className?: string
}

export function UniversalFilterBar({
  type,
  filters,
  onFilterChange,
  showThemeFilter = true,
  showCulturalFilter = true,
  showSpecialtyFilter = type === 'storyteller',
  showStoryTypeFilter = type === 'story',
  showSensitivityFilter = type === 'story',
  showElderFilter = true,
  showFeaturedFilter = true,
  showStatusFilter = false,
  className
}: UniversalFilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [themePopoverOpen, setThemePopoverOpen] = useState(false)

  const sortOptions = type === 'storyteller' ? STORYTELLER_SORT_OPTIONS : STORY_SORT_OPTIONS

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFilterChange({ ...filters, [key]: value })
  }, [filters, onFilterChange])

  const toggleTheme = useCallback((theme: string) => {
    const newThemes = filters.themes.includes(theme)
      ? filters.themes.filter(t => t !== theme)
      : [...filters.themes, theme]
    updateFilter('themes', newThemes)
  }, [filters.themes, updateFilter])

  const clearFilters = useCallback(() => {
    onFilterChange({
      ...defaultFilters,
      sortBy: filters.sortBy // Preserve sort
    })
  }, [onFilterChange, filters.sortBy])

  // Count active filters
  const activeFilterCount = [
    filters.search ? 1 : 0,
    filters.themes.length,
    filters.culturalBackground !== 'all' ? 1 : 0,
    filters.specialty !== 'all' ? 1 : 0,
    filters.storyType !== 'all' ? 1 : 0,
    filters.sensitivity !== 'all' ? 1 : 0,
    filters.elderStatus !== 'all' ? 1 : 0,
    filters.featured !== 'all' ? 1 : 0,
    filters.status !== 'all' ? 1 : 0
  ].reduce((a, b) => a + b, 0)

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Search and Filter Toggle Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={type === 'storyteller'
              ? "Search storytellers by name, bio, or background..."
              : "Search stories by title, content, or author..."
            }
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10 bg-background"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => updateFilter('search', '')}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center gap-2 min-w-[120px]",
            isExpanded && "bg-muted border-primary/30"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <Badge className="ml-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5">
              {activeFilterCount}
            </Badge>
          )}
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform",
            isExpanded && "rotate-180"
          )} />
        </Button>

        {/* Sort Select */}
        <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Expanded Filter Panel */}
      {isExpanded && (
        <Card className="p-4 bg-card border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Theme Filter (Multi-select) */}
            {showThemeFilter && (
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Themes
                </label>
                <Popover open={themePopoverOpen} onOpenChange={setThemePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between text-left font-normal"
                    >
                      {filters.themes.length > 0
                        ? `${filters.themes.length} selected`
                        : "Select themes..."
                      }
                      <ChevronDown className="w-4 h-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
                    <div className="p-3 border-b border-border">
                      <p className="text-sm font-medium">Select Themes</p>
                      <p className="text-xs text-muted-foreground">Choose one or more themes to filter by</p>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto p-2">
                      {Object.entries(THEME_CATEGORIES).map(([categoryKey, category]) => (
                        <div key={categoryKey} className="mb-3">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1">
                            {category.label}
                          </p>
                          <div className="space-y-1">
                            {category.themes.map((theme) => (
                              <div
                                key={theme}
                                className="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                                onClick={() => toggleTheme(theme)}
                              >
                                <Checkbox
                                  checked={filters.themes.includes(theme)}
                                  onCheckedChange={() => toggleTheme(theme)}
                                />
                                <span className="text-sm">{formatThemeLabel(theme)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {filters.themes.length > 0 && (
                      <div className="p-2 border-t border-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => updateFilter('themes', [])}
                        >
                          Clear themes
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Cultural Background Filter */}
            {showCulturalFilter && (
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Cultural Background
                </label>
                <Select
                  value={filters.culturalBackground}
                  onValueChange={(value) => updateFilter('culturalBackground', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All backgrounds" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Backgrounds</SelectItem>
                    {CULTURAL_BACKGROUNDS.map((bg) => (
                      <SelectItem key={bg.value} value={bg.value}>
                        {bg.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Specialty Filter (Storytellers) */}
            {showSpecialtyFilter && (
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Specialty
                </label>
                <Select
                  value={filters.specialty}
                  onValueChange={(value) => updateFilter('specialty', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {SPECIALTIES.map((spec) => (
                      <SelectItem key={spec.value} value={spec.value}>
                        {spec.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Story Type Filter (Stories) */}
            {showStoryTypeFilter && (
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Story Type
                </label>
                <Select
                  value={filters.storyType}
                  onValueChange={(value) => updateFilter('storyType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {STORY_TYPES.map((st) => (
                      <SelectItem key={st.value} value={st.value}>
                        {st.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Sensitivity Filter (Stories) */}
            {showSensitivityFilter && (
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Sensitivity
                </label>
                <Select
                  value={filters.sensitivity}
                  onValueChange={(value) => updateFilter('sensitivity', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {SENSITIVITY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Elder Status Filter */}
            {showElderFilter && (
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2 flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Elder Status
                </label>
                <Select
                  value={filters.elderStatus}
                  onValueChange={(value) => updateFilter('elderStatus', value as FilterState['elderStatus'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All {type === 'storyteller' ? 'Storytellers' : 'Stories'}</SelectItem>
                    <SelectItem value="true">{type === 'storyteller' ? 'Elders Only' : 'Elder Approved'}</SelectItem>
                    <SelectItem value="false">{type === 'storyteller' ? 'Non-Elders' : 'Not Elder Approved'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Featured Filter */}
            {showFeaturedFilter && (
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Featured
                </label>
                <Select
                  value={filters.featured}
                  onValueChange={(value) => updateFilter('featured', value as FilterState['featured'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Featured Only</SelectItem>
                    <SelectItem value="false">Non-Featured</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Status Filter (Admin) */}
            {showStatusFilter && (
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Status
                </label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => updateFilter('status', value as FilterState['status'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Active Filters Summary & Clear */}
          {activeFilterCount > 0 && (
            <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>

              {/* Theme badges */}
              {filters.themes.map((theme) => (
                <Badge
                  key={theme}
                  variant="secondary"
                  className="flex items-center gap-1 cursor-pointer hover:bg-destructive/20"
                  onClick={() => toggleTheme(theme)}
                >
                  {formatThemeLabel(theme)}
                  <X className="w-3 h-3" />
                </Badge>
              ))}

              {/* Other active filters */}
              {filters.culturalBackground !== 'all' && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 cursor-pointer hover:bg-destructive/20"
                  onClick={() => updateFilter('culturalBackground', 'all')}
                >
                  {CULTURAL_BACKGROUNDS.find(b => b.value === filters.culturalBackground)?.label}
                  <X className="w-3 h-3" />
                </Badge>
              )}

              {filters.elderStatus !== 'all' && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 cursor-pointer hover:bg-destructive/20"
                  onClick={() => updateFilter('elderStatus', 'all')}
                >
                  {filters.elderStatus === 'true' ? 'Elders' : 'Non-Elders'}
                  <X className="w-3 h-3" />
                </Badge>
              )}

              {filters.featured !== 'all' && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 cursor-pointer hover:bg-destructive/20"
                  onClick={() => updateFilter('featured', 'all')}
                >
                  {filters.featured === 'true' ? 'Featured' : 'Non-Featured'}
                  <X className="w-3 h-3" />
                </Badge>
              )}

              {/* Clear All Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="ml-auto text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Clear All
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Selected Themes Display (when collapsed) */}
      {!isExpanded && filters.themes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.themes.slice(0, 5).map((theme) => (
            <Badge
              key={theme}
              variant="outline"
              className={cn(
                "flex items-center gap-1 cursor-pointer",
                `bg-${getThemeColor(theme)}-50 text-${getThemeColor(theme)}-700 border-${getThemeColor(theme)}-200`,
                "dark:bg-${getThemeColor(theme)}-900/30 dark:text-${getThemeColor(theme)}-300"
              )}
              onClick={() => toggleTheme(theme)}
            >
              {formatThemeLabel(theme)}
              <X className="w-3 h-3" />
            </Badge>
          ))}
          {filters.themes.length > 5 && (
            <Badge variant="outline" className="text-muted-foreground">
              +{filters.themes.length - 5} more
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

// Export a simplified hook for filter management
export function useFilters(initialFilters: Partial<FilterState> = {}) {
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters
  })

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters
  }
}

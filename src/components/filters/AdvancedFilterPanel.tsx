'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Filter,
  X,
  Calendar,
  Users,
  Palette,
  Languages,
  Tag,
  Image,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

export interface AdvancedFilters {
  // Content Type
  contentTypes: string[]

  // Date Filters
  dateFrom?: string
  dateTo?: string
  datePreset?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all'

  // Cultural Filters
  culturalGroups: string[]
  languages: string[]
  protocols: string[]

  // Thematic Filters
  themes: string[]
  themesOperator: 'AND' | 'OR'

  // Media Filters
  mediaTypes: string[]
  hasMedia: boolean | null

  // Quality Filters
  minStoryLength?: number
  hasTranscript: boolean | null
  hasAnalysis: boolean | null

  // Status Filters
  publishStatus: string[]
  consentStatus: string[]

  // Engagement Filters
  minViews?: number
  isFeatured: boolean | null
}

interface AdvancedFilterPanelProps {
  filters: AdvancedFilters
  onFiltersChange: (filters: AdvancedFilters) => void
  organizationId: string
}

export function AdvancedFilterPanel({
  filters,
  onFiltersChange,
  organizationId
}: AdvancedFilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['contentType', 'date'])
  )
  const [availableOptions, setAvailableOptions] = useState<{
    culturalGroups: string[]
    languages: string[]
    themes: string[]
    protocols: string[]
  }>({
    culturalGroups: [],
    languages: [],
    themes: [],
    protocols: []
  })

  useEffect(() => {
    fetchFilterOptions()
  }, [organizationId])

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch(`/api/filters/options?organization_id=${organizationId}`)
      const data = await response.json()
      setAvailableOptions(data.options || {})
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const updateFilter = (key: keyof AdvancedFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleArrayValue = (key: keyof AdvancedFilters, value: string) => {
    const currentArray = filters[key] as string[]
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value]
    updateFilter(key, newArray)
  }

  const clearAllFilters = () => {
    onFiltersChange({
      contentTypes: [],
      datePreset: 'all',
      culturalGroups: [],
      languages: [],
      protocols: [],
      themes: [],
      themesOperator: 'OR',
      mediaTypes: [],
      hasMedia: null,
      hasTranscript: null,
      hasAnalysis: null,
      publishStatus: [],
      consentStatus: [],
      isFeatured: null
    })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.contentTypes.length > 0) count++
    if (filters.datePreset && filters.datePreset !== 'all') count++
    if (filters.culturalGroups.length > 0) count++
    if (filters.languages.length > 0) count++
    if (filters.protocols.length > 0) count++
    if (filters.themes.length > 0) count++
    if (filters.mediaTypes.length > 0) count++
    if (filters.hasMedia !== null) count++
    if (filters.hasTranscript !== null) count++
    if (filters.hasAnalysis !== null) count++
    if (filters.publishStatus.length > 0) count++
    if (filters.consentStatus.length > 0) count++
    if (filters.minStoryLength) count++
    if (filters.minViews) count++
    if (filters.isFeatured !== null) count++
    return count
  }

  const FilterSection = ({ id, title, icon, children }: any) => {
    const isExpanded = expandedSections.has(id)
    return (
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection(id)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-semibold text-sm">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        {isExpanded && <div className="p-4 pt-0 border-t border-gray-100">{children}</div>}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              Advanced Filters
            </CardTitle>
            <CardDescription>
              Refine your search with powerful filtering options
            </CardDescription>
          </div>
          {getActiveFilterCount() > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {getActiveFilterCount()} active
              </Badge>
              <Button size="sm" variant="ghost" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Content Type */}
        <FilterSection
          id="contentType"
          title="Content Type"
          icon={<Tag className="w-4 h-4 text-blue-600" />}
        >
          <div className="flex flex-wrap gap-2">
            {['story', 'transcript', 'media', 'storyteller'].map(type => (
              <Button
                key={type}
                size="sm"
                variant={filters.contentTypes.includes(type) ? 'default' : 'outline'}
                onClick={() => toggleArrayValue('contentTypes', type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </FilterSection>

        {/* Date Range */}
        <FilterSection
          id="date"
          title="Date Range"
          icon={<Calendar className="w-4 h-4 text-green-600" />}
        >
          <div className="space-y-3">
            <Select
              value={filters.datePreset || 'all'}
              onValueChange={(value) => updateFilter('datePreset', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">From</Label>
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => updateFilter('dateFrom', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">To</Label>
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => updateFilter('dateTo', e.target.value)}
                />
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Cultural Filters */}
        <FilterSection
          id="cultural"
          title="Cultural Context"
          icon={<Users className="w-4 h-4 text-purple-600" />}
        >
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-2 block">Cultural Groups</Label>
              <div className="flex flex-wrap gap-2">
                {availableOptions.culturalGroups.map(group => (
                  <Button
                    key={group}
                    size="sm"
                    variant={filters.culturalGroups.includes(group) ? 'default' : 'outline'}
                    onClick={() => toggleArrayValue('culturalGroups', group)}
                  >
                    {group}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs mb-2 block">Languages</Label>
              <div className="flex flex-wrap gap-2">
                {availableOptions.languages.map(lang => (
                  <Button
                    key={lang}
                    size="sm"
                    variant={filters.languages.includes(lang) ? 'default' : 'outline'}
                    onClick={() => toggleArrayValue('languages', lang)}
                  >
                    {lang}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs mb-2 block">Cultural Protocols</Label>
              <div className="flex flex-wrap gap-2">
                {availableOptions.protocols.map(protocol => (
                  <Button
                    key={protocol}
                    size="sm"
                    variant={filters.protocols.includes(protocol) ? 'default' : 'outline'}
                    onClick={() => toggleArrayValue('protocols', protocol)}
                  >
                    {protocol}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Themes */}
        <FilterSection
          id="themes"
          title="Themes"
          icon={<Palette className="w-4 h-4 text-orange-600" />}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-xs">Match</Label>
              <Button
                size="sm"
                variant={filters.themesOperator === 'OR' ? 'default' : 'outline'}
                onClick={() => updateFilter('themesOperator', 'OR')}
              >
                Any
              </Button>
              <Button
                size="sm"
                variant={filters.themesOperator === 'AND' ? 'default' : 'outline'}
                onClick={() => updateFilter('themesOperator', 'AND')}
              >
                All
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableOptions.themes.slice(0, 15).map(theme => (
                <Button
                  key={theme}
                  size="sm"
                  variant={filters.themes.includes(theme) ? 'default' : 'outline'}
                  onClick={() => toggleArrayValue('themes', theme)}
                >
                  {theme}
                </Button>
              ))}
            </div>
          </div>
        </FilterSection>

        {/* Media */}
        <FilterSection
          id="media"
          title="Media & Assets"
          icon={<Image className="w-4 h-4 text-pink-600" />}
        >
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-2 block">Media Types</Label>
              <div className="flex flex-wrap gap-2">
                {['image', 'video', 'audio', 'document'].map(type => (
                  <Button
                    key={type}
                    size="sm"
                    variant={filters.mediaTypes.includes(type) ? 'default' : 'outline'}
                    onClick={() => toggleArrayValue('mediaTypes', type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.hasMedia === true}
                  onChange={(e) => updateFilter('hasMedia', e.target.checked ? true : null)}
                />
                Has media attachments
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.hasTranscript === true}
                  onChange={(e) => updateFilter('hasTranscript', e.target.checked ? true : null)}
                />
                Has transcript
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.hasAnalysis === true}
                  onChange={(e) => updateFilter('hasAnalysis', e.target.checked ? true : null)}
                />
                Has AI analysis
              </label>
            </div>
          </div>
        </FilterSection>

        {/* Quality & Engagement */}
        <FilterSection
          id="quality"
          title="Quality & Engagement"
          icon={<Tag className="w-4 h-4 text-cyan-600" />}
        >
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-2 block">Minimum Story Length (words)</Label>
              <Input
                type="number"
                placeholder="e.g., 100"
                value={filters.minStoryLength || ''}
                onChange={(e) => updateFilter('minStoryLength', parseInt(e.target.value) || undefined)}
              />
            </div>

            <div>
              <Label className="text-xs mb-2 block">Minimum Views</Label>
              <Input
                type="number"
                placeholder="e.g., 10"
                value={filters.minViews || ''}
                onChange={(e) => updateFilter('minViews', parseInt(e.target.value) || undefined)}
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.isFeatured === true}
                onChange={(e) => updateFilter('isFeatured', e.target.checked ? true : null)}
              />
              Featured content only
            </label>
          </div>
        </FilterSection>

        {/* Status */}
        <FilterSection
          id="status"
          title="Status & Permissions"
          icon={<Tag className="w-4 h-4 text-gray-600" />}
        >
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-2 block">Publish Status</Label>
              <div className="flex flex-wrap gap-2">
                {['draft', 'published', 'archived'].map(status => (
                  <Button
                    key={status}
                    size="sm"
                    variant={filters.publishStatus.includes(status) ? 'default' : 'outline'}
                    onClick={() => toggleArrayValue('publishStatus', status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs mb-2 block">Consent Status</Label>
              <div className="flex flex-wrap gap-2">
                {['pending', 'approved', 'restricted'].map(status => (
                  <Button
                    key={status}
                    size="sm"
                    variant={filters.consentStatus.includes(status) ? 'default' : 'outline'}
                    onClick={() => toggleArrayValue('consentStatus', status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </FilterSection>
      </CardContent>
    </Card>
  )
}

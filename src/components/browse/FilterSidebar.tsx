'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeFilter } from './ThemeFilter'
import { CulturalGroupFilter } from './CulturalGroupFilter'
import { MediaTypeFilter } from './MediaTypeFilter'
import { LanguageFilter } from './LanguageFilter'
import { X } from 'lucide-react'

interface FilterState {
  themes: string[]
  culturalGroups: string[]
  mediaTypes: string[]
  languages: string[]
}

interface FilterSidebarProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  onClearFilters: () => void
  activeFilterCount: number
}

export function FilterSidebar({
  filters,
  onFilterChange,
  onClearFilters,
  activeFilterCount
}: FilterSidebarProps) {
  const handleThemeChange = (themes: string[]) => {
    onFilterChange({ ...filters, themes })
  }

  const handleCulturalGroupChange = (culturalGroups: string[]) => {
    onFilterChange({ ...filters, culturalGroups })
  }

  const handleMediaTypeChange = (mediaTypes: string[]) => {
    onFilterChange({ ...filters, mediaTypes })
  }

  const handleLanguageChange = (languages: string[]) => {
    onFilterChange({ ...filters, languages })
  }

  const removeFilter = (category: keyof FilterState, value: string) => {
    onFilterChange({
      ...filters,
      [category]: filters[category].filter(v => v !== value)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4 bg-white border-2 border-[#2C2C2C]/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-bold text-[#2C2C2C]">
            Filters
          </h2>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-[#D97757] hover:text-[#D97757]/80 hover:bg-[#D97757]/5"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-[#2C2C2C]/60 uppercase tracking-wide">
              Active Filters ({activeFilterCount})
            </p>
            <div className="flex flex-wrap gap-2">
              {filters.themes.map(theme => (
                <Badge
                  key={theme}
                  variant="secondary"
                  className="bg-[#D97757]/10 text-[#D97757] hover:bg-[#D97757]/20"
                >
                  {theme}
                  <button
                    onClick={() => removeFilter('themes', theme)}
                    className="ml-1 hover:text-[#D97757]/80"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.culturalGroups.map(group => (
                <Badge
                  key={group}
                  variant="secondary"
                  className="bg-[#2D5F4F]/10 text-[#2D5F4F] hover:bg-[#2D5F4F]/20"
                >
                  {group}
                  <button
                    onClick={() => removeFilter('culturalGroups', group)}
                    className="ml-1 hover:text-[#2D5F4F]/80"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.mediaTypes.map(type => (
                <Badge
                  key={type}
                  variant="secondary"
                  className="bg-[#D4A373]/10 text-[#D4A373] hover:bg-[#D4A373]/20"
                >
                  {type}
                  <button
                    onClick={() => removeFilter('mediaTypes', type)}
                    className="ml-1 hover:text-[#D4A373]/80"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.languages.map(lang => (
                <Badge
                  key={lang}
                  variant="secondary"
                  className="bg-[#2D5F4F]/10 text-[#2D5F4F] hover:bg-[#2D5F4F]/20"
                >
                  {lang}
                  <button
                    onClick={() => removeFilter('languages', lang)}
                    className="ml-1 hover:text-[#2D5F4F]/80"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Filter Sections */}
      <ThemeFilter
        selectedThemes={filters.themes}
        onChange={handleThemeChange}
      />

      <CulturalGroupFilter
        selectedGroups={filters.culturalGroups}
        onChange={handleCulturalGroupChange}
      />

      <MediaTypeFilter
        selectedTypes={filters.mediaTypes}
        onChange={handleMediaTypeChange}
      />

      <LanguageFilter
        selectedLanguages={filters.languages}
        onChange={handleLanguageChange}
      />
    </div>
  )
}

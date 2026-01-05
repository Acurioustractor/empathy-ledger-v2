'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThemeFilterProps {
  selectedThemes: string[]
  onChange: (themes: string[]) => void
}

const INDIGENOUS_THEMES = [
  { value: 'land-territory', label: 'Land & Territory', count: 0 },
  { value: 'elders-wisdom', label: 'Elders & Wisdom', count: 0 },
  { value: 'language-culture', label: 'Language & Culture', count: 0 },
  { value: 'healing-wellness', label: 'Healing & Wellness', count: 0 },
  { value: 'ceremony-tradition', label: 'Ceremony & Tradition', count: 0 },
  { value: 'water-rivers', label: 'Water & Rivers', count: 0 },
  { value: 'seasons-cycles', label: 'Seasons & Cycles', count: 0 },
  { value: 'dreams-spirit', label: 'Dreams & Spirit', count: 0 },
  { value: 'plants-medicine', label: 'Plants & Medicine', count: 0 },
  { value: 'animals-birds', label: 'Animals & Birds', count: 0 },
  { value: 'family-kinship', label: 'Family & Kinship', count: 0 },
  { value: 'forest-trees', label: 'Forest & Trees', count: 0 },
  { value: 'hunting-fishing', label: 'Hunting & Fishing', count: 0 },
  { value: 'storytelling', label: 'Storytelling Tradition', count: 0 },
  { value: 'art-crafts', label: 'Art & Crafts', count: 0 },
  { value: 'music-song', label: 'Music & Song', count: 0 },
  { value: 'dance', label: 'Dance & Movement', count: 0 },
  { value: 'food-gathering', label: 'Food & Gathering', count: 0 },
  { value: 'governance', label: 'Governance & Leadership', count: 0 },
  { value: 'youth-education', label: 'Youth & Education', count: 0 }
]

export function ThemeFilter({ selectedThemes, onChange }: ThemeFilterProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showAll, setShowAll] = useState(false)

  const displayedThemes = showAll ? INDIGENOUS_THEMES : INDIGENOUS_THEMES.slice(0, 8)

  const handleToggle = (themeValue: string) => {
    if (selectedThemes.includes(themeValue)) {
      onChange(selectedThemes.filter(t => t !== themeValue))
    } else {
      onChange([...selectedThemes, themeValue])
    }
  }

  return (
    <Card className="p-4 bg-white border-2 border-[#2C2C2C]/10">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-3"
      >
        <h3 className="font-serif text-lg font-bold text-[#2C2C2C]">
          Themes
        </h3>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-[#2C2C2C]/60" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#2C2C2C]/60" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="space-y-2">
          {displayedThemes.map((theme) => (
            <label
              key={theme.value}
              className="flex items-center gap-3 py-1.5 px-2 -mx-2 rounded hover:bg-[#F8F6F1] cursor-pointer group"
            >
              <Checkbox
                checked={selectedThemes.includes(theme.value)}
                onCheckedChange={() => handleToggle(theme.value)}
                className="border-[#2C2C2C]/30"
              />
              <span className="flex-1 text-sm text-[#2C2C2C] group-hover:text-[#D97757]">
                {theme.label}
              </span>
              {theme.count > 0 && (
                <span className="text-xs text-[#2C2C2C]/40">
                  {theme.count}
                </span>
              )}
            </label>
          ))}

          {/* Show More/Less */}
          {INDIGENOUS_THEMES.length > 8 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full text-sm text-[#D97757] hover:text-[#D97757]/80 py-2 font-medium"
            >
              {showAll ? 'Show Less' : `Show All (${INDIGENOUS_THEMES.length})`}
            </button>
          )}
        </div>
      )}
    </Card>
  )
}

'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface LanguageFilterProps {
  selectedLanguages: string[]
  onChange: (languages: string[]) => void
}

const LANGUAGES = [
  { value: 'english', label: 'English', count: 0 },
  { value: 'french', label: 'French', count: 0 },
  { value: 'cree', label: 'Cree', count: 0 },
  { value: 'ojibwe', label: 'Ojibwe', count: 0 },
  { value: 'inuktitut', label: 'Inuktitut', count: 0 },
  { value: 'mohawk', label: 'Mohawk', count: 0 },
  { value: 'mikmaq', label: "Mi'kmaq", count: 0 },
  { value: 'dakota', label: 'Dakota', count: 0 },
  { value: 'blackfoot', label: 'Blackfoot', count: 0 },
  { value: 'other-indigenous', label: 'Other Indigenous Languages', count: 0 },
  { value: 'multilingual', label: 'Multilingual', count: 0 }
]

export function LanguageFilter({ selectedLanguages, onChange }: LanguageFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const displayedLanguages = showAll ? LANGUAGES : LANGUAGES.slice(0, 6)

  const handleToggle = (langValue: string) => {
    if (selectedLanguages.includes(langValue)) {
      onChange(selectedLanguages.filter(l => l !== langValue))
    } else {
      onChange([...selectedLanguages, langValue])
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
          Languages
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
          {displayedLanguages.map((language) => (
            <label
              key={language.value}
              className="flex items-center gap-3 py-1.5 px-2 -mx-2 rounded hover:bg-[#F8F6F1] cursor-pointer group"
            >
              <Checkbox
                checked={selectedLanguages.includes(language.value)}
                onCheckedChange={() => handleToggle(language.value)}
                className="border-[#2C2C2C]/30"
              />
              <span className="flex-1 text-sm text-[#2C2C2C] group-hover:text-[#2D5F4F]">
                {language.label}
              </span>
              {language.count > 0 && (
                <span className="text-xs text-[#2C2C2C]/40">
                  {language.count}
                </span>
              )}
            </label>
          ))}

          {/* Show More/Less */}
          {LANGUAGES.length > 6 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full text-sm text-[#D97757] hover:text-[#D97757]/80 py-2 font-medium"
            >
              {showAll ? 'Show Less' : `Show All (${LANGUAGES.length})`}
            </button>
          )}
        </div>
      )}
    </Card>
  )
}

'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronDown, ChevronUp, FileText, Play, Image, Film } from 'lucide-react'

interface MediaTypeFilterProps {
  selectedTypes: string[]
  onChange: (types: string[]) => void
}

const MEDIA_TYPES = [
  { value: 'text', label: 'Text Stories', icon: FileText, count: 0 },
  { value: 'audio', label: 'Audio Recordings', icon: Play, count: 0 },
  { value: 'video', label: 'Video Stories', icon: Film, count: 0 },
  { value: 'mixed', label: 'Mixed Media', icon: Image, count: 0 }
]

export function MediaTypeFilter({ selectedTypes, onChange }: MediaTypeFilterProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleToggle = (typeValue: string) => {
    if (selectedTypes.includes(typeValue)) {
      onChange(selectedTypes.filter(t => t !== typeValue))
    } else {
      onChange([...selectedTypes, typeValue])
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
          Media Type
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
          {MEDIA_TYPES.map((type) => {
            const Icon = type.icon
            return (
              <label
                key={type.value}
                className="flex items-center gap-3 py-1.5 px-2 -mx-2 rounded hover:bg-[#F8F6F1] cursor-pointer group"
              >
                <Checkbox
                  checked={selectedTypes.includes(type.value)}
                  onCheckedChange={() => handleToggle(type.value)}
                  className="border-[#2C2C2C]/30"
                />
                <Icon className="w-4 h-4 text-[#D4A373]" />
                <span className="flex-1 text-sm text-[#2C2C2C] group-hover:text-[#D4A373]">
                  {type.label}
                </span>
                {type.count > 0 && (
                  <span className="text-xs text-[#2C2C2C]/40">
                    {type.count}
                  </span>
                )}
              </label>
            )
          })}
        </div>
      )}
    </Card>
  )
}

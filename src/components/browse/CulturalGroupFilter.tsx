'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface CulturalGroupFilterProps {
  selectedGroups: string[]
  onChange: (groups: string[]) => void
}

const CULTURAL_GROUPS = [
  { value: 'first-nations', label: 'First Nations', count: 0 },
  { value: 'metis', label: 'Métis', count: 0 },
  { value: 'inuit', label: 'Inuit', count: 0 },
  { value: 'indigenous-australian', label: 'Indigenous Australian', count: 0 },
  { value: 'maori', label: 'Māori', count: 0 },
  { value: 'native-american', label: 'Native American', count: 0 },
  { value: 'pacific-islander', label: 'Pacific Islander', count: 0 },
  { value: 'sami', label: 'Sámi', count: 0 },
  { value: 'other', label: 'Other Indigenous', count: 0 }
]

export function CulturalGroupFilter({ selectedGroups, onChange }: CulturalGroupFilterProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleToggle = (groupValue: string) => {
    if (selectedGroups.includes(groupValue)) {
      onChange(selectedGroups.filter(g => g !== groupValue))
    } else {
      onChange([...selectedGroups, groupValue])
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
          Cultural Groups
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
          {CULTURAL_GROUPS.map((group) => (
            <label
              key={group.value}
              className="flex items-center gap-3 py-1.5 px-2 -mx-2 rounded hover:bg-[#F8F6F1] cursor-pointer group"
            >
              <Checkbox
                checked={selectedGroups.includes(group.value)}
                onCheckedChange={() => handleToggle(group.value)}
                className="border-[#2C2C2C]/30"
              />
              <span className="flex-1 text-sm text-[#2C2C2C] group-hover:text-[#2D5F4F]">
                {group.label}
              </span>
              {group.count > 0 && (
                <span className="text-xs text-[#2C2C2C]/40">
                  {group.count}
                </span>
              )}
            </label>
          ))}
        </div>
      )}
    </Card>
  )
}

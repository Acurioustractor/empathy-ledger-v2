'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Grid, List } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ViewToggleProps {
  value: 'grid' | 'list'
  onChange: (value: 'grid' | 'list') => void
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 border border-[#2C2C2C]/20 rounded-lg p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange('grid')}
        className={cn(
          "h-8 w-8 p-0",
          value === 'grid'
            ? "bg-[#D97757] text-white hover:bg-[#D97757]/90 hover:text-white"
            : "text-[#2C2C2C]/60 hover:text-[#2C2C2C] hover:bg-transparent"
        )}
      >
        <Grid className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange('list')}
        className={cn(
          "h-8 w-8 p-0",
          value === 'list'
            ? "bg-[#D97757] text-white hover:bg-[#D97757]/90 hover:text-white"
            : "text-[#2C2C2C]/60 hover:text-[#2C2C2C] hover:bg-transparent"
        )}
      >
        <List className="w-4 h-4" />
      </Button>
    </div>
  )
}

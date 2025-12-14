'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StoryType {
  icon: LucideIcon
  title: string
  description: string
  color: 'clay' | 'sage' | 'sky'
}

interface DreamStoryTypesProps {
  storyTypes: StoryType[]
}

const colorVariants = {
  clay: {
    bg: 'bg-gradient-to-br from-clay-50 to-clay-100/50 dark:from-clay-950/30 dark:to-clay-900/20',
    icon: 'bg-clay-100 dark:bg-clay-900/50 text-clay-600 dark:text-clay-400',
    border: 'border-clay-200/50 dark:border-clay-800/50',
    hover: 'hover:shadow-clay-200/30'
  },
  sage: {
    bg: 'bg-gradient-to-br from-sage-50 to-sage-100/50 dark:from-sage-950/30 dark:to-sage-900/20',
    icon: 'bg-sage-100 dark:bg-sage-900/50 text-sage-600 dark:text-sage-400',
    border: 'border-sage-200/50 dark:border-sage-800/50',
    hover: 'hover:shadow-sage-200/30'
  },
  sky: {
    bg: 'bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-950/30 dark:to-sky-900/20',
    icon: 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400',
    border: 'border-sky-200/50 dark:border-sky-800/50',
    hover: 'hover:shadow-sky-200/30'
  }
}

export function DreamStoryTypes({ storyTypes }: DreamStoryTypesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {storyTypes.map((storyType, index) => {
        const Icon = storyType.icon
        const colors = colorVariants[storyType.color]

        return (
          <Card
            key={index}
            className={cn(
              'overflow-hidden transition-all duration-300 hover:shadow-lg',
              colors.bg,
              colors.border,
              colors.hover
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                  colors.icon
                )}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-2 text-foreground">
                    {storyType.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {storyType.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

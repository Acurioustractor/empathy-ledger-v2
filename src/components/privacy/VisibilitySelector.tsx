'use client'

import React from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Globe, Users, Lock, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export type VisibilityLevel = 'public' | 'community' | 'private' | 'restricted'

interface VisibilityOption {
  value: VisibilityLevel
  label: string
  description: string
  icon: React.ElementType
  examples: string[]
}

const visibilityOptions: VisibilityOption[] = [
  {
    value: 'public',
    label: 'Public',
    description: 'Anyone can view your stories and profile',
    icon: Globe,
    examples: [
      'Visible on search engines',
      'Shareable links work for anyone',
      'Appears in public storyteller directory'
    ]
  },
  {
    value: 'community',
    label: 'Community Only',
    description: 'Only registered community members can view',
    icon: Users,
    examples: [
      'Must be logged in to view',
      'Not indexed by search engines',
      'Only appears in authenticated directory'
    ]
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only you and people you explicitly share with can view',
    icon: Lock,
    examples: [
      'You control who sees what',
      'Individual story sharing permissions',
      'Hidden from all directories'
    ]
  },
  {
    value: 'restricted',
    label: 'Restricted (Elder Review)',
    description: 'All content requires Elder approval before sharing',
    icon: EyeOff,
    examples: [
      'Elder review required',
      'Cultural protocol enforcement',
      'Sacred knowledge protection'
    ]
  }
]

interface VisibilitySelectorProps {
  value: VisibilityLevel
  onChange: (value: VisibilityLevel) => void
  disabled?: boolean
  className?: string
}

export function VisibilitySelector({
  value,
  onChange,
  disabled = false,
  className
}: VisibilitySelectorProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-clay-800 mb-2">
          Default Story Visibility
        </h3>
        <p className="text-sm text-clay-600">
          Choose who can view your stories by default. You can override this for individual stories.
        </p>
      </div>

      <RadioGroup
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        className="space-y-3"
      >
        {visibilityOptions.map((option) => {
          const Icon = option.icon
          const isSelected = value === option.value

          return (
            <div
              key={option.value}
              className={cn(
                "relative flex items-start space-x-3 rounded-lg border-2 p-4 transition-all",
                isSelected
                  ? "border-clay-400 bg-clay-50"
                  : "border-gray-200 bg-white hover:border-gray-300",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <RadioGroupItem
                value={option.value}
                id={`visibility-${option.value}`}
                className="mt-1"
              />

              <div className="flex-1 min-w-0">
                <Label
                  htmlFor={`visibility-${option.value}`}
                  className={cn(
                    "flex items-center gap-2 text-base font-semibold cursor-pointer",
                    isSelected ? "text-clay-800" : "text-gray-800"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5",
                    isSelected ? "text-clay-600" : "text-gray-500"
                  )} />
                  {option.label}
                </Label>

                <p className={cn(
                  "mt-1 text-sm",
                  isSelected ? "text-clay-700" : "text-gray-600"
                )}>
                  {option.description}
                </p>

                {isSelected && (
                  <ul className="mt-3 space-y-1.5">
                    {option.examples.map((example, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-xs text-clay-600"
                      >
                        <span className="mt-1 block h-1 w-1 rounded-full bg-clay-400 flex-shrink-0" />
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )
        })}
      </RadioGroup>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Changing this setting only affects NEW stories.
          Existing stories will keep their current visibility settings.
        </p>
      </div>
    </div>
  )
}

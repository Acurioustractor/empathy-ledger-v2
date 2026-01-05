'use client'

import React from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Shield, Database, MapPin, Eye, Lock, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DataSovereigntyPreference {
  id: string
  label: string
  description: string
  icon: React.ElementType
  defaultValue: boolean
  isGuaranteedRight?: boolean // Changed from criticalForIndigenous
  legalBasis?: string // e.g., "GDPR Article 15"
}

// Guaranteed rights (always enabled, cannot be disabled)
const guaranteedRights: DataSovereigntyPreference[] = [
  {
    id: 'data_portability',
    label: 'Data Portability - Always Available',
    description: 'You can export all your data at any time in standard formats (JSON, PDF). This right is guaranteed under GDPR Article 15.',
    icon: Database,
    defaultValue: true,
    isGuaranteedRight: true,
    legalBasis: 'GDPR Article 15'
  },
  {
    id: 'third_party_sharing',
    label: 'No Third-Party Sharing - Guaranteed Protection',
    description: 'Your stories will NEVER be shared with third parties without your explicit written consent. This is a permanent protection.',
    icon: Shield,
    defaultValue: true,
    isGuaranteedRight: true,
    legalBasis: 'OCAP Principles'
  }
]

// User-controllable preferences
const userPreferences: DataSovereigntyPreference[] = [
  {
    id: 'location_data_control',
    label: 'Location Data Storage',
    description: 'Store location data (e.g., where photos were taken) with my stories',
    icon: MapPin,
    defaultValue: true,
    isGuaranteedRight: false
  },
  {
    id: 'search_engine_indexing',
    label: 'Search Engine Indexing',
    description: 'Allow search engines (Google, Bing) to index my public stories',
    icon: Eye,
    defaultValue: false,
    isGuaranteedRight: false
  }
]

interface DataSovereigntyPreferencesProps {
  values?: Record<string, boolean>
  onChange?: (id: string, value: boolean) => void
  disabled?: boolean
  className?: string
  // Legacy props for backward compatibility
  storytellerId?: string
  onSettingsChange?: (settings: Record<string, unknown>) => void
}

export function DataSovereigntyPreferences({
  values,
  onChange,
  disabled = false,
  className,
  storytellerId,
  onSettingsChange
}: DataSovereigntyPreferencesProps) {
  // Use local state if values/onChange not provided (backward compatibility)
  const [localValues, setLocalValues] = React.useState<Record<string, boolean>>({})

  const currentValues = values || localValues
  const handleChange = (id: string, value: boolean) => {
    if (onChange) {
      onChange(id, value)
    } else {
      setLocalValues(prev => ({ ...prev, [id]: value }))
      if (onSettingsChange) {
        onSettingsChange({ [id]: value })
      }
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="text-lg font-semibold text-clay-800 mb-2">
          Data Sovereignty & Control
        </h3>
        <p className="text-sm text-clay-600">
          Your data belongs to you. Some rights are guaranteed and permanent, while others you can control.
        </p>
      </div>

      {/* Guaranteed Rights Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-green-800 flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Guaranteed Rights (Always Protected)
        </h4>
        {guaranteedRights.map((right) => {
          const Icon = right.icon

          return (
            <div
              key={right.id}
              className="flex items-start gap-4 p-4 rounded-lg border-2 border-green-200 bg-green-50"
            >
              <div className="mt-1 p-2 rounded-lg bg-green-100">
                <Icon className="h-5 w-5 text-green-700" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="text-base font-semibold text-green-900">
                    {right.label}
                  </h5>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-200 text-green-800">
                    {right.legalBasis}
                  </span>
                </div>
                <p className="text-sm text-green-800">
                  {right.description}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <span className="text-sm font-semibold text-green-700">Protected</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* User Preferences Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-clay-800 flex items-center gap-2">
          Your Preferences
        </h4>
        {userPreferences.map((pref) => {
          const Icon = pref.icon
          const isEnabled = currentValues[pref.id] ?? pref.defaultValue

          return (
            <div
              key={pref.id}
              className={cn(
                "flex items-start justify-between gap-4 p-4 rounded-lg border transition-colors",
                "border-gray-200 bg-white hover:border-gray-300",
                disabled && "opacity-50"
              )}
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1 p-2 rounded-lg bg-gray-100">
                  <Icon className="h-5 w-5 text-gray-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <Label
                    htmlFor={`sovereignty-${pref.id}`}
                    className="text-base font-semibold text-clay-800 cursor-pointer block mb-1"
                  >
                    {pref.label}
                  </Label>
                  <p className="text-sm text-clay-600">
                    {pref.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <Switch
                  id={`sovereignty-${pref.id}`}
                  checked={isEnabled}
                  onCheckedChange={(checked) => handleChange(pref.id, checked)}
                  disabled={disabled}
                  aria-label={pref.label}
                  className="data-[state=checked]:bg-clay-600"
                />
                <span className={cn(
                  "text-xs font-medium",
                  isEnabled ? "text-clay-700" : "text-gray-500"
                )}>
                  {isEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* OCAP Info Box */}
      <div className="p-4 bg-sage-50 border border-sage-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-sage-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-sage-800 mb-1">
              Indigenous Data Sovereignty (OCAP®)
            </h4>
            <p className="text-sm text-sage-700">
              Guaranteed rights follow OCAP® principles:
              <strong className="block mt-1">
                Ownership, Control, Access, and Possession
              </strong>.
              These are permanent protections that cannot be disabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

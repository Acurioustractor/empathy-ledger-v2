'use client'

import React from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Shield, Database, MapPin, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DataSovereigntyPreference {
  id: string
  label: string
  description: string
  icon: React.ElementType
  defaultValue: boolean
  criticalForIndigenous?: boolean
}

const sovereigntyPreferences: DataSovereigntyPreference[] = [
  {
    id: 'data_portability',
    label: 'Data Portability',
    description: 'I can export all my data at any time in a standard format (JSON, PDF)',
    icon: Database,
    defaultValue: true,
    criticalForIndigenous: true
  },
  {
    id: 'location_data_control',
    label: 'Location Data Control',
    description: 'I control whether location data is stored and who can see it',
    icon: MapPin,
    defaultValue: true,
    criticalForIndigenous: true
  },
  {
    id: 'third_party_sharing',
    label: 'Third-Party Sharing (Disabled)',
    description: 'My stories will NEVER be shared with third parties without explicit consent',
    icon: Shield,
    defaultValue: true,
    criticalForIndigenous: true
  },
  {
    id: 'search_engine_indexing',
    label: 'Search Engine Indexing',
    description: 'Allow search engines (Google, Bing) to index my public stories',
    icon: Eye,
    defaultValue: false,
    criticalForIndigenous: false
  }
]

interface DataSovereigntyPreferencesProps {
  values: Record<string, boolean>
  onChange: (id: string, value: boolean) => void
  disabled?: boolean
  className?: string
}

export function DataSovereigntyPreferences({
  values,
  onChange,
  disabled = false,
  className
}: DataSovereigntyPreferencesProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="text-lg font-semibold text-clay-800 mb-2">
          Data Sovereignty & Control
        </h3>
        <p className="text-sm text-clay-600">
          Your data belongs to you. These settings ensure you maintain complete control
          over how your information is stored, accessed, and shared.
        </p>
      </div>

      <div className="space-y-4">
        {sovereigntyPreferences.map((pref) => {
          const Icon = pref.icon
          const isEnabled = values[pref.id] ?? pref.defaultValue

          return (
            <div
              key={pref.id}
              className={cn(
                "flex items-start justify-between gap-4 p-4 rounded-lg border transition-colors",
                pref.criticalForIndigenous
                  ? "border-clay-200 bg-clay-50"
                  : "border-gray-200 bg-white",
                disabled && "opacity-50"
              )}
            >
              <div className="flex items-start gap-3 flex-1">
                <div className={cn(
                  "mt-1 p-2 rounded-lg",
                  pref.criticalForIndigenous
                    ? "bg-clay-100"
                    : "bg-gray-100"
                )}>
                  <Icon className={cn(
                    "h-5 w-5",
                    pref.criticalForIndigenous
                      ? "text-clay-600"
                      : "text-gray-600"
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor={`sovereignty-${pref.id}`}
                      className="text-base font-semibold text-clay-800 cursor-pointer"
                    >
                      {pref.label}
                    </Label>
                    {pref.criticalForIndigenous && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-clay-200 text-clay-800">
                        Indigenous Data Sovereignty
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-clay-600">
                    {pref.description}
                  </p>
                </div>
              </div>

              <Switch
                id={`sovereignty-${pref.id}`}
                checked={isEnabled}
                onCheckedChange={(checked) => onChange(pref.id, checked)}
                disabled={disabled || (pref.criticalForIndigenous && isEnabled)}
                aria-label={pref.label}
              />
            </div>
          )
        })}
      </div>

      <div className="p-4 bg-sage-50 border border-sage-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-sage-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-sage-800 mb-1">
              Indigenous Data Sovereignty (OCAP®)
            </h4>
            <p className="text-sm text-sage-700">
              Settings marked as "Indigenous Data Sovereignty" follow OCAP® principles:
              <strong className="block mt-1">
                Ownership, Control, Access, and Possession
strong>.
              Your data is yours, stored on your terms, accessible by you, in your control.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

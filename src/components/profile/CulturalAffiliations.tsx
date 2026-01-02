'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Globe2, MapPin, Languages, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CulturalAffiliationsProps {
  culturalAffiliations?: string[]
  culturalBackground?: string
  indigenousAffiliation?: string | null
  territories?: string[]
  languages?: string[]
  className?: string
}

export function CulturalAffiliations({
  culturalAffiliations = [],
  culturalBackground,
  indigenousAffiliation,
  territories = [],
  languages = [],
  className
}: CulturalAffiliationsProps) {
  const hasAnyData = culturalAffiliations.length > 0 ||
                     culturalBackground ||
                     indigenousAffiliation ||
                     territories.length > 0 ||
                     languages.length > 0

  if (!hasAnyData) {
    return null
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Indigenous Affiliation - Most Prominent */}
      {indigenousAffiliation && (
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <Users className="h-5 w-5 text-clay-600" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-clay-800 mb-1">
              Indigenous Affiliation
            </h3>
            <p className="text-base text-clay-700">{indigenousAffiliation}</p>
          </div>
        </div>
      )}

      {/* Cultural Affiliations */}
      {culturalAffiliations.length > 0 && (
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <Globe2 className="h-5 w-5 text-clay-600" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-clay-800 mb-2">
              Cultural Affiliations
            </h3>
            <div className="flex flex-wrap gap-2" role="list" aria-label="Cultural affiliations">
              {culturalAffiliations.map((affiliation, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-clay-50 text-clay-700 border-clay-200"
                  role="listitem"
                >
                  {affiliation}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Territories / Country */}
      {territories.length > 0 && (
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <MapPin className="h-5 w-5 text-clay-600" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-clay-800 mb-2">
              Traditional Territories & Country
            </h3>
            <div className="flex flex-wrap gap-2" role="list" aria-label="Traditional territories">
              {territories.map((territory, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-sage-50 text-sage-700 border-sage-200"
                  role="listitem"
                >
                  {territory}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <Languages className="h-5 w-5 text-clay-600" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-clay-800 mb-2">
              Languages Spoken
            </h3>
            <div className="flex flex-wrap gap-2" role="list" aria-label="Languages spoken">
              {languages.map((language, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-sky-50 text-sky-700 border-sky-200"
                  role="listitem"
                >
                  {language}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cultural Background (if different from affiliations) */}
      {culturalBackground && !indigenousAffiliation && (
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <Users className="h-5 w-5 text-clay-600" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-clay-800 mb-1">
              Cultural Background
            </h3>
            <p className="text-base text-clay-700">{culturalBackground}</p>
          </div>
        </div>
      )}
    </div>
  )
}

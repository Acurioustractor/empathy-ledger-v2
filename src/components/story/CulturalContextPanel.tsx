'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Info, MapPin, History, Sparkles, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CulturalContextPanelProps {
  culturalBackground?: string
  territory?: string
  historicalContext?: string
  significance?: string
  protocols?: string[]
  className?: string
}

export function CulturalContextPanel({
  culturalBackground,
  territory,
  historicalContext,
  significance,
  protocols,
  className
}: CulturalContextPanelProps) {
  // Don't render if no context provided
  if (!culturalBackground && !territory && !historicalContext && !significance && !protocols?.length) {
    return null
  }

  return (
    <Card className={cn("p-6 bg-[#2D5F4F]/5 border-2 border-[#2D5F4F]/20", className)}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-2 pb-3 border-b border-[#2D5F4F]/20">
          <Info className="w-5 h-5 text-[#2D5F4F]" />
          <h3 className="font-serif text-xl font-bold text-[#2C2C2C]">
            Cultural Context
          </h3>
        </div>

        {/* Cultural Background */}
        {culturalBackground && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4A373]" />
              <h4 className="font-semibold text-[#2C2C2C]">Cultural Background</h4>
            </div>
            <p className="text-sm text-[#2C2C2C]/80 leading-relaxed pl-6">
              {culturalBackground}
            </p>
          </div>
        )}

        {/* Territory Information */}
        {territory && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D97757]" />
              <h4 className="font-semibold text-[#2C2C2C]">Territory</h4>
            </div>
            <p className="text-sm text-[#2C2C2C]/80 leading-relaxed pl-6">
              {territory}
            </p>
          </div>
        )}

        {/* Historical Context */}
        {historicalContext && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#2D5F4F]" />
              <h4 className="font-semibold text-[#2C2C2C]">Historical Context</h4>
            </div>
            <p className="text-sm text-[#2C2C2C]/80 leading-relaxed pl-6">
              {historicalContext}
            </p>
          </div>
        )}

        {/* Significance */}
        {significance && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4A373]" />
              <h4 className="font-semibold text-[#2C2C2C]">Significance</h4>
            </div>
            <p className="text-sm text-[#2C2C2C]/80 leading-relaxed pl-6">
              {significance}
            </p>
          </div>
        )}

        {/* Cultural Protocols */}
        {protocols && protocols.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-[#2D5F4F]/20">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#D97757]" />
              <h4 className="font-semibold text-[#2C2C2C]">Protocols to Observe</h4>
            </div>
            <ul className="space-y-2 pl-6">
              {protocols.map((protocol, index) => (
                <li
                  key={index}
                  className="text-sm text-[#2C2C2C]/80 leading-relaxed flex items-start gap-2"
                >
                  <span className="text-[#D97757] mt-1">•</span>
                  <span>{protocol}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer Note */}
        <div className="pt-3 border-t border-[#2D5F4F]/20">
          <p className="text-xs text-[#2C2C2C]/60 italic">
            This cultural context is provided to deepen understanding and respect for the story's cultural significance.
          </p>
        </div>
      </div>
    </Card>
  )
}

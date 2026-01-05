'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Shield, Info } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface StoryData {
  cultural_protocols: string[]
  sensitivity_level: 'public' | 'sensitive' | 'sacred'
  trigger_warnings?: string[]
  cultural_context?: string
}

interface CulturalProtocolsSelectorProps {
  story: StoryData
  onChange: (updates: Partial<StoryData>) => void
  className?: string
}

const COMMON_PROTOCOLS = [
  'Elder approval required before sharing',
  'Seasonal viewing restrictions apply',
  'Women only content',
  'Men only content',
  'Community members only',
  'No photography or recording',
  'Ceremonial knowledge - handle with care',
  'Traditional knowledge holders consulted'
]

const TRIGGER_WARNINGS = [
  'Violence',
  'Trauma',
  'Loss and grief',
  'Residential schools',
  'Colonialism',
  'Substance abuse',
  'Mental health',
  'Suicide',
  'Sexual content'
]

export function CulturalProtocolsSelector({
  story,
  onChange,
  className
}: CulturalProtocolsSelectorProps) {
  const handleProtocolToggle = (protocol: string) => {
    const protocols = story.cultural_protocols.includes(protocol)
      ? story.cultural_protocols.filter(p => p !== protocol)
      : [...story.cultural_protocols, protocol]

    onChange({ cultural_protocols: protocols })
  }

  const handleTriggerWarningToggle = (warning: string) => {
    const warnings = story.trigger_warnings || []
    const updated = warnings.includes(warning)
      ? warnings.filter(w => w !== warning)
      : [...warnings, warning]

    onChange({ trigger_warnings: updated })
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Sensitivity Level */}
      <Card className="p-4 border-2 border-[#2C2C2C]/10">
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#2D5F4F]" />
            Content Sensitivity Level *
          </Label>

          <Select
            value={story.sensitivity_level}
            onValueChange={(value: any) => onChange({ sensitivity_level: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="font-medium">Public</div>
                    <div className="text-xs text-[#2C2C2C]/60">
                      General audience, no special restrictions
                    </div>
                  </div>
                </div>
              </SelectItem>

              <SelectItem value="sensitive">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="font-medium">Sensitive</div>
                    <div className="text-xs text-[#2C2C2C]/60">
                      May contain culturally significant content requiring respect
                    </div>
                  </div>
                </div>
              </SelectItem>

              <SelectItem value="sacred">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="font-medium">Sacred</div>
                    <div className="text-xs text-[#2C2C2C]/60">
                      Contains sacred knowledge requiring Elder approval and special protocols
                    </div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {story.sensitivity_level === 'sacred' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-amber-800">
                  <strong>Sacred Content Notice:</strong> This story will require Elder review and approval before publication.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Cultural Protocols */}
      <Card className="p-4 border-2 border-[#2C2C2C]/10">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Cultural Protocols</Label>
          <p className="text-xs text-[#2C2C2C]/60">
            Select any viewing or sharing protocols that apply to this story
          </p>

          <div className="space-y-2">
            {COMMON_PROTOCOLS.map((protocol) => (
              <div key={protocol} className="flex items-start gap-3">
                <Checkbox
                  id={`protocol-${protocol}`}
                  checked={story.cultural_protocols.includes(protocol)}
                  onCheckedChange={() => handleProtocolToggle(protocol)}
                />
                <Label
                  htmlFor={`protocol-${protocol}`}
                  className="text-sm font-normal leading-tight cursor-pointer"
                >
                  {protocol}
                </Label>
              </div>
            ))}
          </div>

          {story.cultural_protocols.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-medium text-[#2D5F4F] mb-2">
                Selected Protocols:
              </p>
              <div className="flex flex-wrap gap-2">
                {story.cultural_protocols.map((protocol) => (
                  <Badge
                    key={protocol}
                    className="bg-[#2D5F4F]/10 text-[#2D5F4F] border border-[#2D5F4F]/20"
                  >
                    {protocol}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Trigger Warnings */}
      <Card className="p-4 border-2 border-[#2C2C2C]/10">
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Content Warnings
          </Label>
          <p className="text-xs text-[#2C2C2C]/60">
            Select any sensitive content that readers should be aware of
          </p>

          <div className="space-y-2">
            {TRIGGER_WARNINGS.map((warning) => (
              <div key={warning} className="flex items-start gap-3">
                <Checkbox
                  id={`warning-${warning}`}
                  checked={(story.trigger_warnings || []).includes(warning)}
                  onCheckedChange={() => handleTriggerWarningToggle(warning)}
                />
                <Label
                  htmlFor={`warning-${warning}`}
                  className="text-sm font-normal leading-tight cursor-pointer"
                >
                  {warning}
                </Label>
              </div>
            ))}
          </div>

          {story.trigger_warnings && story.trigger_warnings.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-medium text-amber-700 mb-2">
                Active Warnings:
              </p>
              <div className="flex flex-wrap gap-2">
                {story.trigger_warnings.map((warning) => (
                  <Badge
                    key={warning}
                    className="bg-amber-100 text-amber-800 border border-amber-300"
                  >
                    {warning}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Cultural Context */}
      <Card className="p-4 border-2 border-[#2C2C2C]/10">
        <div className="space-y-3">
          <Label htmlFor="cultural-context" className="text-sm font-medium flex items-center gap-2">
            <Info className="w-4 h-4 text-[#D4A373]" />
            Cultural Context (Optional)
          </Label>
          <Textarea
            id="cultural-context"
            value={story.cultural_context || ''}
            onChange={(e) => onChange({ cultural_context: e.target.value })}
            placeholder="Provide additional cultural context that would help readers understand and respect this story..."
            className="min-h-[100px] resize-none"
          />
          <p className="text-xs text-[#2C2C2C]/60">
            Explain cultural background, significance, or proper ways to engage with this content
          </p>
        </div>
      </Card>

      {/* OCAP Reminder */}
      <Card className="p-4 bg-[#2D5F4F]/5 border-2 border-[#2D5F4F]/20">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#2D5F4F] flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-[#2D5F4F] mb-1">OCAP® Principles</p>
            <p className="text-[#2C2C2C]/70 leading-relaxed">
              Remember: You maintain <strong>Ownership</strong> and <strong>Control</strong> over your story.
              Set appropriate <strong>Access</strong> levels and ensure proper <strong>Possession</strong>
              of your cultural knowledge.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

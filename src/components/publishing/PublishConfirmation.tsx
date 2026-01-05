'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Globe, Lock, MessageSquare, Shield, AlertTriangle } from 'lucide-react'

interface PublishConfirmationProps {
  story: any
}

export function PublishConfirmation({ story }: PublishConfirmationProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-serif font-bold text-[#2C2C2C] mb-2">
          Ready to Publish?
        </h3>
        <p className="text-[#2C2C2C]/70">
          Review the settings below before publishing your story
        </p>
      </div>

      {/* Story Info */}
      <Card className="p-5 border-2 border-[#2C2C2C]/10">
        <h4 className="font-semibold text-[#2C2C2C] mb-3">Story Settings</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {story.is_public ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span className="text-sm">Visibility</span>
            </div>
            <Badge>{story.is_public ? 'Public' : 'Private'}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">Comments</span>
            </div>
            <Badge>{story.allow_comments ? 'Enabled' : 'Disabled'}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Sensitivity</span>
            </div>
            <Badge>{story.sensitivity_level || 'public'}</Badge>
          </div>
        </div>
      </Card>

      {/* Cultural Tags */}
      {story.cultural_tags && story.cultural_tags.length > 0 && (
        <Card className="p-5 border-2 border-[#2C2C2C]/10">
          <h4 className="font-semibold text-[#2C2C2C] mb-3">Cultural Themes</h4>
          <div className="flex flex-wrap gap-2">
            {story.cultural_tags.map((tag: string) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Protocols Warning */}
      {story.cultural_protocols && story.cultural_protocols.length > 0 && (
        <Card className="p-5 bg-[#2D5F4F]/5 border-2 border-[#2D5F4F]/20">
          <h4 className="font-semibold text-[#2D5F4F] mb-2">Cultural Protocols Active</h4>
          <ul className="space-y-1 text-sm text-[#2C2C2C]/80">
            {story.cultural_protocols.map((protocol: string, i: number) => (
              <li key={i}>• {protocol}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* OCAP Reminder */}
      <Card className="p-5 bg-[#2D5F4F]/5 border-2 border-[#2D5F4F]/20">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#2D5F4F] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-[#2D5F4F] mb-1">OCAP® Principles</p>
            <p className="text-sm text-[#2C2C2C]/70 leading-relaxed">
              By publishing, you affirm that you maintain Ownership and Control of this content,
              and are making it accessible while ensuring proper Possession of your cultural knowledge.
            </p>
          </div>
        </div>
      </Card>

      {/* Sacred Content Warning */}
      {story.sensitivity_level === 'sacred' && (
        <Card className="p-5 bg-amber-50 border-2 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 mb-1">Elder Review Process</p>
              <p className="text-sm text-amber-800">
                Your story will be submitted to the Elder review queue. It will not be publicly visible
                until an Elder has reviewed and approved it.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

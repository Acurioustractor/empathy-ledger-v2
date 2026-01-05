'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Globe, Lock, MessageSquare, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StoryData {
  is_public: boolean
  allow_comments: boolean
  requires_moderation: boolean
  allow_sharing?: boolean
  allow_download?: boolean
}

interface PrivacySettingsPanelProps {
  story: StoryData
  onChange: (updates: Partial<StoryData>) => void
  className?: string
}

export function PrivacySettingsPanel({
  story,
  onChange,
  className
}: PrivacySettingsPanelProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Visibility */}
      <Card className="p-4 border-2 border-[#2C2C2C]/10">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#D97757]" />
                Public Visibility
              </Label>
              <p className="text-xs text-[#2C2C2C]/60 mt-1">
                Make this story visible to everyone on the platform
              </p>
            </div>
            <Switch
              checked={story.is_public}
              onCheckedChange={(checked) => onChange({ is_public: checked })}
            />
          </div>

          {!story.is_public && (
            <div className="pt-2 border-t border-[#2C2C2C]/10">
              <Badge variant="outline" className="bg-amber-50 border-amber-300 text-amber-800">
                <Lock className="w-3 h-3 mr-1" />
                Private Story
              </Badge>
              <p className="text-xs text-[#2C2C2C]/60 mt-2">
                This story will only be visible to you and collaborators
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Comments */}
      <Card className="p-4 border-2 border-[#2C2C2C]/10">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Label className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#D97757]" />
                Allow Comments
              </Label>
              <p className="text-xs text-[#2C2C2C]/60 mt-1">
                Let readers leave comments on your story
              </p>
            </div>
            <Switch
              checked={story.allow_comments}
              onCheckedChange={(checked) => onChange({ allow_comments: checked })}
            />
          </div>

          {story.allow_comments && (
            <div className="pt-2 border-t border-[#2C2C2C]/10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#2D5F4F]" />
                    Elder Moderation
                  </Label>
                  <p className="text-xs text-[#2C2C2C]/60 mt-1">
                    Require Elder review before comments appear publicly
                  </p>
                </div>
                <Switch
                  checked={story.requires_moderation}
                  onCheckedChange={(checked) => onChange({ requires_moderation: checked })}
                />
              </div>

              {story.requires_moderation && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Elder Moderation Active:</strong> All comments will be reviewed by community Elders before being published.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Sharing */}
      <Card className="p-4 border-2 border-[#2C2C2C]/10">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Label className="text-sm font-medium">Allow Social Sharing</Label>
              <p className="text-xs text-[#2C2C2C]/60 mt-1">
                Enable sharing to social media platforms
              </p>
            </div>
            <Switch
              checked={story.allow_sharing !== false}
              onCheckedChange={(checked) => onChange({ allow_sharing: checked })}
            />
          </div>
        </div>
      </Card>

      {/* Downloads */}
      <Card className="p-4 border-2 border-[#2C2C2C]/10">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Label className="text-sm font-medium">Allow Downloads</Label>
              <p className="text-xs text-[#2C2C2C]/60 mt-1">
                Let readers download media from your story
              </p>
            </div>
            <Switch
              checked={story.allow_download !== false}
              onCheckedChange={(checked) => onChange({ allow_download: checked })}
            />
          </div>

          {story.allow_download !== false && (
            <div className="pt-2 border-t border-[#2C2C2C]/10">
              <p className="text-xs text-[#2C2C2C]/60">
                Downloads will include OCAP® reminders to respect cultural protocols
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Summary */}
      <Card className="p-4 bg-[#F8F6F1] border-2 border-[#2C2C2C]/10">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[#2C2C2C]">Privacy Summary</p>
          <div className="space-y-1 text-xs text-[#2C2C2C]/70">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                story.is_public ? "bg-green-500" : "bg-amber-500"
              )} />
              <span>{story.is_public ? 'Public' : 'Private'} story</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                story.allow_comments ? "bg-green-500" : "bg-gray-400"
              )} />
              <span>Comments {story.allow_comments ? 'enabled' : 'disabled'}</span>
            </div>
            {story.allow_comments && (
              <div className="flex items-center gap-2 ml-4">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  story.requires_moderation ? "bg-blue-500" : "bg-gray-400"
                )} />
                <span>Elder moderation {story.requires_moderation ? 'active' : 'inactive'}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                story.allow_sharing !== false ? "bg-green-500" : "bg-gray-400"
              )} />
              <span>Sharing {story.allow_sharing !== false ? 'enabled' : 'disabled'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                story.allow_download !== false ? "bg-green-500" : "bg-gray-400"
              )} />
              <span>Downloads {story.allow_download !== false ? 'enabled' : 'disabled'}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

'use client'

import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Crown,
  MapPin,
  Calendar,
  Share2,
  Settings,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface StorytellerHeaderProps {
  storyteller: {
    id: string
    full_name?: string
    display_name?: string
    bio?: string
    avatar_url?: string
    is_elder?: boolean
    is_storyteller?: boolean
    cultural_background?: string
    location_data?: any
    created_at?: string
    organisations?: Array<{
      id: string
      name: string
      type?: string
    }>
  }
}

export function StorytellerHeader({ storyteller }: StorytellerHeaderProps) {
  const displayName = storyteller.display_name || storyteller.full_name || 'Storyteller'
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="border-b bg-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Back Button */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/storytellers">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Avatar */}
            <Avatar className="h-20 w-20 ring-4 ring-background">
              <AvatarImage src={storyteller.avatar_url || ''} />
              <AvatarFallback className="text-xl bg-primary/10">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{displayName}</h1>
                <div className="flex gap-2">
                  {storyteller.is_elder && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                      <Crown className="h-3 w-3 mr-1" />
                      Elder
                    </Badge>
                  )}
                  {storyteller.is_storyteller && (
                    <Badge variant="secondary">
                      Storyteller
                    </Badge>
                  )}
                </div>
              </div>

              {storyteller.bio && (
                <p className="text-muted-foreground mb-3 max-w-2xl">
                  {storyteller.bio}
                </p>
              )}

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                {storyteller.cultural_background && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Cultural Background:</span>
                    <span>{storyteller.cultural_background}</span>
                  </div>
                )}
                
                {storyteller.created_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(storyteller.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}</span>
                  </div>
                )}
              </div>

              {/* Organizations */}
              {storyteller.organisations && storyteller.organisations.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-sm text-muted-foreground">Associated with:</span>
                  {storyteller.organisations.map((org) => (
                    <Badge key={org.id} variant="outline" className="text-xs">
                      <Link href={`/organisations/${org.id}`} className="hover:underline">
                        {org.name}
                      </Link>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share Profile
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
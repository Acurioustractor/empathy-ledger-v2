'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Trophy, BookOpen, FileText } from 'lucide-react'
import type { ContributorData } from '@/lib/services/organization-dashboard.service'

interface TopContributorsWidgetProps {
  contributors: ContributorData[]
  organizationId: string
}

export function TopContributorsWidget({ contributors, organizationId }: TopContributorsWidgetProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatLastActive = (dateString: string | null) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  const getRankBadge = (index: number) => {
    if (index === 0) return <Trophy className="w-4 h-4 text-amber-500" />
    if (index === 1) return <span className="text-stone-400 font-bold">2nd</span>
    if (index === 2) return <span className="text-amber-700 font-bold">3rd</span>
    return <span className="text-stone-400">{index + 1}th</span>
  }

  if (contributors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-amber-500" />
            Top Contributors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-stone-500">
            <p>No contributors yet</p>
            <p className="text-sm mt-1">Add stories to see your top contributors</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-amber-500" />
            Top Contributors
          </span>
          <a
            href={`/organisations/${organizationId}/members`}
            className="text-sm font-normal text-earth-600 hover:text-earth-700"
          >
            View all
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contributors.map((contributor, index) => (
            <a
              key={contributor.id}
              href={`/storytellers/${contributor.id}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 transition-colors"
            >
              {/* Rank */}
              <div className="w-8 flex justify-center">
                {getRankBadge(index)}
              </div>

              {/* Avatar */}
              <Avatar className="h-10 w-10">
                <AvatarImage src={contributor.avatar || undefined} />
                <AvatarFallback className="bg-earth-100 text-earth-700">
                  {getInitials(contributor.name)}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-earth-800 truncate">{contributor.name}</p>
                <p className="text-xs text-stone-500">
                  Active {formatLastActive(contributor.lastActive)}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 text-sm text-stone-600">
                <div className="flex items-center gap-1" title="Stories">
                  <BookOpen className="w-4 h-4" />
                  <span>{contributor.stories}</span>
                </div>
                <div className="flex items-center gap-1" title="Transcripts">
                  <FileText className="w-4 h-4" />
                  <span>{contributor.transcripts}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

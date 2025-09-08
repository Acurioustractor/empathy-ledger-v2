'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  ExternalLink, 
  Calendar,
  ArrowRight
} from 'lucide-react'

interface Story {
  id: string
  title: string
  author_id: string
  created_at: string
}

interface RecentActivityProps {
  stories: Story[]
  organizationId: string
}

export function RecentActivity({ stories, organizationId }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Recent Stories
        </CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link href={`/organizations/${organizationId}/stories`}>
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {stories.length > 0 ? (
          <div className="space-y-4">
            {stories.map((story) => (
              <div key={story.id} className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <Link 
                    href={`/stories/${story.id}`}
                    className="font-medium hover:underline line-clamp-2"
                  >
                    {story.title}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(story.created_at).toLocaleDateString()}
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/stories/${story.id}`}>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent stories</p>
            <p className="text-sm">Stories will appear here as members share them</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
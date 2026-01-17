'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { StoryAnalyticsDashboard } from '@/components/analytics/StoryAnalyticsDashboard'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface StoryBasicInfo {
  id: string
  title: string
  status: string
  storyteller_name?: string
}

export default function StoryAnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const storyId = params.id as string

  const [story, setStory] = useState<StoryBasicInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStoryInfo = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/stories/${storyId}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Story not found')
          }
          throw new Error('Failed to fetch story')
        }

        const data = await response.json()
        setStory({
          id: data.id,
          title: data.title,
          status: data.status,
          storyteller_name: data.storyteller?.display_name || data.storyteller?.full_name
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load story')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStoryInfo()
  }, [storyId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading...</span>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-6">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => router.push('/admin/stories')}>
                Back to Stories
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto p-6 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Stories', href: '/admin/stories' },
            { label: story?.title || 'Story', href: `/admin/stories/${storyId}` },
            { label: 'Analytics', href: `/admin/stories/${storyId}/analytics` }
          ]}
        />

        {/* Back Button */}
        <div className="flex items-center gap-4">
          <Link href={`/admin/stories/${storyId}`}>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Story
            </Button>
          </Link>
          {story?.storyteller_name && (
            <span className="text-sm text-muted-foreground">
              by {story.storyteller_name}
            </span>
          )}
        </div>

        {/* Analytics Dashboard */}
        <StoryAnalyticsDashboard storyId={storyId} />
      </div>

      <Footer />
    </div>
  )
}

'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Clock, User, Calendar, FileText, Play, Video, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { TranscriptCard } from '@/components/storyteller/TranscriptCard'

export default function TranscriptDetailPage() {
  const params = useParams()
  const transcriptId = params.id as string
  const [transcript, setTranscript] = useState<any>(null)
  const [storyteller, setStoryteller] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTranscript()
  }, [transcriptId])

  const fetchTranscript = async () => {
    try {
      setLoading(true)
      
      // Fetch transcript via API
      console.log('🔍 Fetching transcript ID via API:', transcriptId)
      const response = await fetch(`/api/transcripts/${transcriptId}`)
      const data = await response.json()
      
      console.log('📊 API response:', { data, status: response.status })

      if (!response.ok) {
        console.error('❌ Error fetching transcript via API:', data)
        return
      }

      if (data.success) {
        setTranscript(data.transcript)
        setStoryteller(data.storyteller || null)
        console.log('✅ Transcript data loaded successfully')
      } else {
        console.error('❌ API returned unsuccessful response:', data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">
            Loading transcript...
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!transcript) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Transcript not found</h1>
            <p className="text-muted-foreground mb-4">
              The transcript you're looking for doesn't exist or isn't accessible.
            </p>
            <Button asChild>
              <Link href="/projects">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/projects">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>

          {/* Storyteller Header */}
          {storyteller && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={storyteller?.avatar_url} />
                    <AvatarFallback>
                      {storyteller?.display_name?.charAt(0) || storyteller?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {storyteller?.display_name || storyteller?.email || 'Unknown Storyteller'}
                    </h2>
                    {storyteller?.cultural_background && (
                      <p className="text-muted-foreground">
                        {storyteller.cultural_background}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}

          {/* Enhanced Transcript Card with AI Features */}
          <TranscriptCard
            transcript={{
              id: transcript.id,
              title: transcript.title || 'Untitled Transcript',
              content: transcript.transcript_content || 'No transcript content available.',
              wordCount: transcript.word_count || 0,
              characterCount: transcript.character_count || transcript.transcript_content?.length || 0,
              hasVideo: !!(transcript.video_url || transcript.audio_url || transcript.source_video_url),
              videoUrl: transcript.video_url || transcript.audio_url,
              videoPlatform: transcript.source_video_platform || 'Video',
              status: transcript.status || 'completed',
              createdAt: transcript.created_at,
              metadata: {
                duration_seconds: transcript.duration_seconds,
                transcript_quality: transcript.transcript_quality,
                cultural_sensitivity: transcript.cultural_sensitivity,
                processing_status: transcript.processing_status
              }
            }}
            showContent={true}
            onCreateStory={(transcriptId) => {
              // Handle manual story creation
              window.location.href = `/stories/create?transcript=${transcriptId}`
            }}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
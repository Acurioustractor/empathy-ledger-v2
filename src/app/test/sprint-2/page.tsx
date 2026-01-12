'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { BookOpen, Image, Eye, Send, CheckCircle2 } from 'lucide-react'

// Sprint 2 Components
import { StoryCreationForm } from '@/components/stories/StoryCreationForm'
import { StoryEditor } from '@/components/stories/StoryEditor'
import { StoryVisibilityControls } from '@/components/stories/StoryVisibilityControls'
import { MediaUploader } from '@/components/media/MediaUploader'
import { MediaGallery } from '@/components/media/MediaGallery'
import { MediaMetadataEditor } from '@/components/media/MediaMetadataEditor'
import { StoryPreview } from '@/components/stories/StoryPreview'
import { StoryPublisher } from '@/components/stories/StoryPublisher'

export default function Sprint2TestPage() {
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data
  const mockStorytellerId = 'test-storyteller-123'
  const mockStoryId = 'test-story-456'
  const mockMediaId = 'test-media-789'

  const mockMediaItems = [
    {
      id: 'media-1',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
      type: 'image' as const,
      title: 'Mountain Landscape',
      caption: 'Beautiful mountain view from traditional territory',
      alt_text: 'Snow-capped mountains with forest in foreground',
      cultural_tags: ['landscape', 'traditional territory'],
      created_at: '2024-01-01T00:00:00Z',
      file_size: 2500000
    },
    {
      id: 'media-2',
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
      type: 'image' as const,
      title: 'Forest Path',
      caption: 'Walking path through sacred forest',
      alt_text: 'Sunlit forest path with tall trees',
      cultural_tags: ['sacred site', 'forest'],
      created_at: '2024-01-02T00:00:00Z',
      file_size: 1800000
    },
    {
      id: 'media-3',
      url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d',
      type: 'video' as const,
      title: 'Community Gathering',
      caption: 'Annual community gathering and feast',
      alt_text: 'Video of community members gathering together',
      cultural_tags: ['ceremony', 'community'],
      created_at: '2024-01-03T00:00:00Z',
      file_size: 15000000
    }
  ]

  const mockStory = {
    title: 'My Journey to Understanding',
    content: `This is the story of my journey to understanding our cultural heritage and the importance of preserving our traditions for future generations.

When I was young, my grandmother would tell me stories about our ancestors and their deep connection to the land. She spoke of ceremonies, songs, and teachings that had been passed down through countless generations. At the time, I didn't fully appreciate the wisdom she was sharing.

As I grew older and witnessed the challenges our community faced, I began to understand the profound importance of these teachings. Our culture isn't just history – it's a living, breathing part of who we are.

This realization changed everything for me. I committed myself to learning from the Elders, participating in ceremonies, and helping to ensure that our young people have the opportunity to connect with their heritage.

Today, I share these stories not just as memories, but as a bridge between past and future. Every story we tell, every tradition we honor, is an act of resistance and resilience. We are still here, and we will continue to be here, carrying forward the wisdom of our ancestors.`,
    excerpt: 'A personal journey of cultural discovery and the importance of preserving traditions',
    storyteller_name: 'Test Storyteller',
    storyteller_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    visibility: 'community' as const,
    cultural_sensitivity_level: 'moderate' as const,
    requires_elder_review: false,
    location: 'Traditional Territory',
    tags: ['heritage', 'culture', 'tradition', 'identity'],
    created_at: '2024-01-04T00:00:00Z',
    reading_time: 4,
    has_media: true,
    media: [
      {
        id: 'media-1',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
        type: 'image' as const,
        alt_text: 'Snow-capped mountains representing traditional territory'
      }
    ]
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-bold text-clay-900">Sprint 2 Test Page</h1>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            8/8 Complete
          </Badge>
        </div>
        <p className="text-lg text-muted-foreground">
          Stories & Media Components • January 4, 2026
        </p>
      </div>

      {/* Overview Alert */}
      <Alert className="mb-6 bg-sky-50 border-sky-200">
        <CheckCircle2 className="h-4 w-4 text-sky-600" />
        <AlertDescription className="text-sky-800">
          <strong>Sprint 2 Complete!</strong> All 8 components for Stories & Media are built and ready to test.
          All components support testMode (no API calls) and include cultural safety features.
        </AlertDescription>
      </Alert>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9 h-auto gap-2">
          <TabsTrigger value="overview" className="min-h-[44px]">
            Overview
          </TabsTrigger>
          <TabsTrigger value="story-creation" className="min-h-[44px]">
            1. Creation
          </TabsTrigger>
          <TabsTrigger value="story-editor" className="min-h-[44px]">
            2. Editor
          </TabsTrigger>
          <TabsTrigger value="visibility" className="min-h-[44px]">
            3. Visibility
          </TabsTrigger>
          <TabsTrigger value="media-upload" className="min-h-[44px]">
            4. Upload
          </TabsTrigger>
          <TabsTrigger value="media-gallery" className="min-h-[44px]">
            5. Gallery
          </TabsTrigger>
          <TabsTrigger value="media-metadata" className="min-h-[44px]">
            6. Metadata
          </TabsTrigger>
          <TabsTrigger value="preview" className="min-h-[44px]">
            7. Preview
          </TabsTrigger>
          <TabsTrigger value="publisher" className="min-h-[44px]">
            8. Publish
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sprint 2: Stories & Media - Complete! 🎉</CardTitle>
              <CardDescription>
                All 8 components built with cultural safety, accessibility, and test mode support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Story Management Section */}
              <div>
                <h3 className="text-lg font-semibold text-clay-900 mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-sky-600" />
                  Story Management (3/3)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        StoryCreationForm
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1 text-muted-foreground">
                      <p>✓ Title, content, excerpt fields</p>
                      <p>✓ Story type (text/video/mixed)</p>
                      <p>✓ Cultural sensitivity levels</p>
                      <p>✓ Elder review toggle</p>
                      <p>✓ Word count & reading time</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        StoryEditor
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1 text-muted-foreground">
                      <p>✓ Load existing story</p>
                      <p>✓ Edit all fields</p>
                      <p>✓ Unsaved changes indicator</p>
                      <p>✓ Auto-save functionality</p>
                      <p>✓ Last updated timestamp</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        StoryVisibilityControls
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1 text-muted-foreground">
                      <p>✓ 4 visibility levels</p>
                      <p>✓ Cultural sensitivity selector</p>
                      <p>✓ Elder review toggle</p>
                      <p>✓ Sacred content protection</p>
                      <p>✓ Settings summary</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Media Management Section */}
              <div>
                <h3 className="text-lg font-semibold text-clay-900 mb-3 flex items-center gap-2">
                  <Image className="h-5 w-5 text-sky-600" />
                  Media Management (3/3)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        MediaUploader
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1 text-muted-foreground">
                      <p>✓ Drag-and-drop upload</p>
                      <p>✓ Progress tracking</p>
                      <p>✓ Image/video support</p>
                      <p>✓ Auto-transcription</p>
                      <p>✓ File validation</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        MediaGallery
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1 text-muted-foreground">
                      <p>✓ Grid/list view toggle</p>
                      <p>✓ Search and filter</p>
                      <p>✓ Bulk selection</p>
                      <p>✓ Edit/delete actions</p>
                      <p>✓ Cultural tags display</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        MediaMetadataEditor
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1 text-muted-foreground">
                      <p>✓ Title & caption</p>
                      <p>✓ Required alt text</p>
                      <p>✓ Cultural tags</p>
                      <p>✓ Sensitivity marker</p>
                      <p>✓ Attribution support</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Publishing Section */}
              <div>
                <h3 className="text-lg font-semibold text-clay-900 mb-3 flex items-center gap-2">
                  <Send className="h-5 w-5 text-sky-600" />
                  Story Publishing (2/2)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        StoryPreview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1 text-muted-foreground">
                      <p>✓ Full story display</p>
                      <p>✓ Privacy settings summary</p>
                      <p>✓ Media rendering</p>
                      <p>✓ Reading time estimate</p>
                      <p>✓ Edit/publish actions</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        StoryPublisher
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1 text-muted-foreground">
                      <p>✓ Publishing options</p>
                      <p>✓ Required confirmations</p>
                      <p>✓ Elder review workflow</p>
                      <p>✓ Sacred content protection</p>
                      <p>✓ Success/error handling</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Key Features */}
              <Alert className="bg-clay-50 border-clay-200">
                <AlertDescription className="text-clay-800">
                  <strong>🌟 Key Features Across All Components:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Cultural safety first - OCAP principles embedded throughout</li>
                    <li>Sacred content automatically requires Elder review</li>
                    <li>Test mode support - all components work without API calls</li>
                    <li>WCAG 2.1 AA accessibility compliance</li>
                    <li>Responsive design with 44px touch targets</li>
                    <li>Clear success/error feedback</li>
                    <li>TypeScript strict typing</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Component Test Tabs */}
        <TabsContent value="story-creation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>StoryCreationForm (1/8)</CardTitle>
              <CardDescription>
                Create new stories with cultural sensitivity controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StoryCreationForm
                storytellerId={mockStorytellerId}
                testMode={true}
                onSuccess={(storyId) => alert(`Story created with ID: ${storyId}`)}
                onCancel={() => alert('Cancelled')}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="story-editor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>StoryEditor (2/8)</CardTitle>
              <CardDescription>
                Edit existing stories with unsaved changes tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StoryEditor
                storyId={mockStoryId}
                testMode={true}
                onCancel={() => alert('Cancelled')}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>StoryVisibilityControls (3/8)</CardTitle>
              <CardDescription>
                Control who can see your story with cultural sensitivity settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StoryVisibilityControls
                storyId={mockStoryId}
                initialVisibility="community"
                initialCulturalSensitivity="moderate"
                onChange={(settings) => console.log('Visibility changed:', settings)}
                showSaveButton={true}
                onSave={async (settings) => {
                  console.log('Saving:', settings)
                  await new Promise(resolve => setTimeout(resolve, 1000))
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media-upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>MediaUploader (4/8)</CardTitle>
              <CardDescription>
                Drag-and-drop upload for photos and videos with progress tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaUploader
                storytellerId={mockStorytellerId}
                storyId={mockStoryId}
                maxFiles={5}
                onUploadComplete={(mediaIds) => alert(`Uploaded ${mediaIds.length} files`)}
              />
              <Alert className="mt-4 bg-amber-50 border-amber-200">
                <AlertDescription className="text-amber-800 text-sm">
                  <strong>Note:</strong> MediaUploader was already implemented with drag-and-drop,
                  progress tracking, and auto-transcription for audio/video files.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media-gallery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>MediaGallery (5/8)</CardTitle>
              <CardDescription>
                View and manage media with grid/list views, search, bulk actions, and enhanced tagging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaGallery
                storytellerId={mockStorytellerId}
                media={mockMediaItems}
                selectable={true}
                enableBatchTagging={true}
                onSelect={(ids) => console.log('Selected:', ids)}
                onEdit={(id) => alert(`Edit media: ${id}`)}
                onDelete={(ids) => alert(`Delete ${ids.length} items`)}
                onMediaUpdated={() => console.log('Media updated - refresh data')}
                testMode={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media-metadata" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>MediaMetadataEditor (6/8)</CardTitle>
              <CardDescription>
                Add captions, alt text, and cultural tags to your media
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaMetadataEditor
                mediaId={mockMediaId}
                mediaUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
                mediaType="image"
                initialMetadata={{
                  title: 'Mountain Landscape',
                  caption: 'Beautiful view from traditional territory',
                  alt_text: 'Snow-capped mountains with forest',
                  cultural_tags: ['landscape', 'traditional territory'],
                  culturally_sensitive: true,
                  requires_attribution: false
                }}
                testMode={true}
                onCancel={() => alert('Cancelled')}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>StoryPreview (7/8)</CardTitle>
              <CardDescription>
                Preview how your story will appear to readers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StoryPreview
                story={mockStory}
                onEdit={() => alert('Edit story')}
                onPublish={() => alert('Publish story')}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publisher" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>StoryPublisher (8/8)</CardTitle>
              <CardDescription>
                Publish your story with required confirmations and Elder review workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StoryPublisher
                storyId={mockStoryId}
                story={mockStory}
                testMode={true}
                onSuccess={(url) => alert(`Published! URL: ${url}`)}
                onCancel={() => alert('Cancelled')}
              />
            </CardContent>
          </Card>

          {/* Sacred Content Example */}
          <Card className="border-ember-300 bg-ember-50/30">
            <CardHeader>
              <CardTitle className="text-base">Sacred Content Example</CardTitle>
              <CardDescription>
                See how publisher handles sacred content (Elder review required)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StoryPublisher
                storyId="sacred-story-123"
                story={{
                  ...mockStory,
                  title: 'Sacred Ceremony Story',
                  cultural_sensitivity_level: 'sacred',
                  requires_elder_review: true
                }}
                testMode={true}
                onSuccess={(url) => alert(`Submitted for Elder review! URL: ${url}`)}
                onCancel={() => alert('Cancelled')}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <Card className="mt-8 bg-sage-50 border-sage-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-sage-900">
              🎉 Sprint 2 Complete - All Components Ready!
            </p>
            <p className="text-sm text-sage-700">
              8 components built • Cultural safety embedded • Test mode supported • WCAG 2.1 AA compliant
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/test/sprint-1'}
              >
                ← Sprint 1 Tests
              </Button>
              <Button
                onClick={() => alert('Sprint 3 coming soon!')}
              >
                Sprint 3 Planning →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

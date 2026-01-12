'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { previewSEOTags, type StoryMetadata } from '@/lib/utils/seo-generator'
import { Globe, Facebook, Twitter, Search } from 'lucide-react'

interface SEOPreviewProps {
  story: Partial<StoryMetadata>
}

/**
 * SEO Preview Component
 * Shows how the story will appear on Google, Facebook, and Twitter
 */
export function SEOPreview({ story }: SEOPreviewProps) {
  const preview = useMemo(() => {
    // Provide defaults for required fields
    const storyWithDefaults: StoryMetadata = {
      id: story.id || 'preview',
      title: story.title || 'Untitled Story',
      content: story.content || '',
      ...story
    }
    return previewSEOTags(storyWithDefaults)
  }, [story])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          SEO Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="google">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="google">
              <Globe className="h-4 w-4 mr-2" />
              Google
            </TabsTrigger>
            <TabsTrigger value="facebook">
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </TabsTrigger>
            <TabsTrigger value="twitter">
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </TabsTrigger>
          </TabsList>

          {/* Google Search Preview */}
          <TabsContent value="google" className="space-y-4">
            <div className="border rounded-lg p-4 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-stone-200 rounded-full" />
                <span className="text-xs text-stone-500">empathyledger.org</span>
              </div>
              <div className="text-blue-600 text-xl mb-1 hover:underline cursor-pointer">
                {preview.googlePreview.title}
              </div>
              <div className="text-xs text-stone-500 mb-2">
                {preview.googlePreview.url}
              </div>
              <div className="text-sm text-stone-700">
                {preview.googlePreview.description}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-stone-500">
                <strong>Title Length:</strong> {preview.googlePreview.title.length} chars
                {preview.googlePreview.title.length > 60 && (
                  <Badge variant="destructive" className="ml-2">Too long (max 60)</Badge>
                )}
              </div>
              <div className="text-xs text-stone-500">
                <strong>Description Length:</strong> {preview.googlePreview.description.length} chars
                {preview.googlePreview.description.length > 160 && (
                  <Badge variant="destructive" className="ml-2">Too long (max 160)</Badge>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Facebook Preview */}
          <TabsContent value="facebook" className="space-y-4">
            <div className="border rounded-lg overflow-hidden bg-white">
              {preview.facebookPreview.image && (
                <div className="w-full h-48 bg-stone-200 relative">
                  <img
                    src={preview.facebookPreview.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="text-xs text-stone-500 uppercase mb-1">
                  {preview.facebookPreview.siteName}
                </div>
                <div className="font-semibold text-lg mb-1">
                  {preview.facebookPreview.title}
                </div>
                <div className="text-sm text-stone-600">
                  {preview.facebookPreview.description}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-stone-500">
                <strong>Recommended image size:</strong> 1200x630 pixels
              </div>
              {!preview.facebookPreview.image && (
                <Badge variant="outline">No featured image - using default</Badge>
              )}
            </div>
          </TabsContent>

          {/* Twitter Preview */}
          <TabsContent value="twitter" className="space-y-4">
            <div className="border rounded-lg overflow-hidden bg-white max-w-md">
              {preview.twitterPreview.image && preview.twitterPreview.card === 'summary_large_image' && (
                <div className="w-full h-48 bg-stone-200 relative">
                  <img
                    src={preview.twitterPreview.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex gap-3">
                  {preview.twitterPreview.image && preview.twitterPreview.card === 'summary' && (
                    <div className="w-20 h-20 bg-stone-200 rounded flex-shrink-0">
                      <img
                        src={preview.twitterPreview.image}
                        alt="Preview"
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm mb-1 line-clamp-1">
                      {preview.twitterPreview.title}
                    </div>
                    <div className="text-xs text-stone-600 line-clamp-2">
                      {preview.twitterPreview.description}
                    </div>
                    <div className="text-xs text-stone-500 mt-1">
                      empathyledger.org
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-stone-500">
                <strong>Card Type:</strong> {preview.twitterPreview.card === 'summary_large_image' ? 'Large Image' : 'Summary'}
              </div>
              {!preview.twitterPreview.image && (
                <Badge variant="outline">No image - using summary card</Badge>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search,
  Sparkles,
  Image as ImageIcon,
  Wand2,
  Filter,
  Tag,
  BookOpen
} from 'lucide-react'

// Phase 3 Components
import { SmartSearch } from '@/components/gallery/SmartSearch'
import { SimilarMedia } from '@/components/gallery/SimilarMedia'
import { EnhancedMediaTagger } from '@/components/media/EnhancedMediaTagger'

export default function SearchPage() {
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null)
  const [showSimilar, setShowSimilar] = useState(false)
  const [similarSourceId, setSimilarSourceId] = useState<string | null>(null)

  // Handle media selection from search results
  const handleMediaSelect = useCallback((mediaId: string) => {
    setSelectedMediaId(mediaId)
  }, [])

  // Handle finding similar media
  const handleFindSimilar = useCallback((mediaId: string) => {
    setSimilarSourceId(mediaId)
    setShowSimilar(true)
    setSelectedMediaId(null) // Close the tagger dialog
  }, [])

  // Close similar panel
  const closeSimilar = useCallback(() => {
    setShowSimilar(false)
    setSimilarSourceId(null)
  }, [])

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 via-sage-50/30 to-stone-50 border border-stone-200 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
              <Search className="h-6 w-6 text-purple-600" />
              Smart Search
            </h1>
            <p className="text-stone-600 mt-1">
              Natural language search, visual similarity, and advanced filtering
            </p>
          </div>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
            Phase 3: Search & Discovery
          </Badge>
        </div>
      </div>

      {/* Search Tips */}
      <Card className="bg-gradient-to-r from-sage-50/50 to-stone-50/50 border-sage-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-sage-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-sage-900">Search naturally</h3>
              <p className="text-sm text-sage-700 mt-1">
                Try queries like: &quot;photos of Maria in Sydney&quot;, &quot;ACT Farm videos from last month&quot;,
                &quot;untagged photos needing review&quot;, or &quot;sacred ceremony content&quot;
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Search Interface */}
      <SmartSearch onResultSelect={handleMediaSelect} />

      {/* Similar Media Section (when active) */}
      {showSimilar && similarSourceId && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-purple-600" />
              Visual Similarity Search
            </h2>
            <Button variant="outline" size="sm" onClick={closeSimilar}>
              Close
            </Button>
          </div>
          <SimilarMedia
            mediaId={similarSourceId}
            onSelect={handleMediaSelect}
            limit={12}
          />
        </div>
      )}

      {/* Feature Cards */}
      <Card className="bg-stone-50 border-stone-200">
        <CardHeader>
          <CardTitle className="text-lg">Phase 3 Search Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-lg border border-stone-200">
              <Search className="h-6 w-6 text-purple-600 mb-2" />
              <h4 className="font-medium">Natural Language</h4>
              <p className="text-sm text-muted-foreground">
                Search using everyday language, automatically parsed into filters
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-stone-200">
              <Wand2 className="h-6 w-6 text-sage-600 mb-2" />
              <h4 className="font-medium">Visual Similarity</h4>
              <p className="text-sm text-muted-foreground">
                Find visually similar images based on content and style
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-stone-200">
              <Filter className="h-6 w-6 text-earth-600 mb-2" />
              <h4 className="font-medium">Advanced Filters</h4>
              <p className="text-sm text-muted-foreground">
                Combine multiple filters: type, project, tags, dates, people
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-stone-200">
              <Tag className="h-6 w-6 text-amber-600 mb-2" />
              <h4 className="font-medium">Smart Suggestions</h4>
              <p className="text-sm text-muted-foreground">
                Auto-parsed queries show what filters are being applied
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Search Reference
          </CardTitle>
          <CardDescription>
            Keywords that are automatically detected in your search
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-stone-900 mb-2">Media Types</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• photo, image, picture → Images</li>
                <li>• video, film, clip → Videos</li>
                <li>• audio, sound, recording → Audio</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-stone-900 mb-2">Time Filters</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• today, this week, last week</li>
                <li>• this month, last month</li>
                <li>• this year, last year</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-stone-900 mb-2">Projects</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Empathy Ledger, JusticeHub</li>
                <li>• ACT Farm, The Harvest</li>
                <li>• Goods, Placemat, Studio</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-stone-900 mb-2">Status Filters</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• untagged, no tags</li>
                <li>• needs review, pending review</li>
                <li>• pending consent</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-stone-900 mb-2">Cultural Sensitivity</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• sacred, ceremony</li>
                <li>• sensitive, cultural</li>
                <li>• elder approval</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-stone-900 mb-2">People & Places</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• &quot;of Maria&quot; → Find by person</li>
                <li>• &quot;in Sydney&quot; → Find by location</li>
                <li>• &quot;with John&quot; → Find by person</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Tagger Dialog */}
      <Dialog open={!!selectedMediaId} onOpenChange={(open) => !open && setSelectedMediaId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              View & Edit Media
            </DialogTitle>
          </DialogHeader>

          {selectedMediaId && (
            <div className="space-y-4">
              <EnhancedMediaTagger
                mediaId={selectedMediaId}
                mediaUrl=""
                onSave={() => setSelectedMediaId(null)}
              />

              {/* Find Similar Button */}
              <div className="flex justify-end pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleFindSimilar(selectedMediaId)}
                  className="gap-2"
                >
                  <Wand2 className="h-4 w-4" />
                  Find Similar Media
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Share2,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Image as ImageIcon,
  Video,
  FileText,
  Building2,
  Globe,
  Linkedin,
  Youtube,
  Send,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

// Platform configurations
const PLATFORMS = {
  internal: [
    { id: 'justicehub', name: 'JusticeHub', icon: Building2, color: 'bg-blue-500' },
    { id: 'act_farm', name: 'ACT Farm', icon: Building2, color: 'bg-green-500' },
    { id: 'harvest', name: 'Harvest', icon: Building2, color: 'bg-amber-500' },
    { id: 'goods', name: 'GOODS', icon: Building2, color: 'bg-purple-500' },
    { id: 'placemat', name: 'Placemat', icon: Building2, color: 'bg-pink-500' },
    { id: 'studio', name: 'Studio', icon: Building2, color: 'bg-indigo-500' },
  ],
  social: [
    { id: 'linkedin_company', name: 'LinkedIn (Company)', icon: Linkedin, color: 'bg-blue-700' },
    { id: 'linkedin_personal', name: 'LinkedIn (Personal)', icon: Linkedin, color: 'bg-blue-600' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'bg-red-600' },
    { id: 'bluesky', name: 'Bluesky', icon: Globe, color: 'bg-sky-500' },
    { id: 'google_business', name: 'Google Business', icon: Globe, color: 'bg-green-600' },
  ],
  external: [
    { id: 'external_partner', name: 'External Partner', icon: ExternalLink, color: 'bg-slate-500' },
    { id: 'news_outlet', name: 'News Outlet', icon: FileText, color: 'bg-slate-600' },
    { id: 'academic', name: 'Academic Institution', icon: Building2, color: 'bg-slate-700' },
  ]
}

interface ContentItem {
  id: string
  title: string
  type: 'story' | 'media_asset' | 'gallery'
  thumbnail?: string
  visibility?: string
  created_at: string
  syndication_enabled?: boolean
}

interface SyndicationRecord {
  id: string
  content_type: string
  content_id: string
  destination_type: string
  status: string
  attribution_text: string
  created_at: string
  syndicated_at?: string
  content?: ContentItem
}

export default function SyndicationDashboardPage() {
  const [activeTab, setActiveTab] = useState('syndicate')
  const [searchQuery, setSearchQuery] = useState('')
  const [contentType, setContentType] = useState<string>('story')
  const [content, setContent] = useState<ContentItem[]>([])
  const [syndications, setSyndications] = useState<SyndicationRecord[]>([])
  const [selectedContent, setSelectedContent] = useState<Set<string>>(new Set())
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [isSyndicating, setIsSyndicating] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [attributionText, setAttributionText] = useState('Source: Empathy Ledger')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fetch content based on type
  useEffect(() => {
    async function fetchContent() {
      setIsLoading(true)
      setError(null)

      const table = contentType === 'story' ? 'stories' :
                    contentType === 'media_asset' ? 'media_assets' : 'galleries'

      const { data, error: fetchError } = await supabase
        .from(table)
        .select('id, title, created_at, visibility')
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) {
        setError(`Failed to load content: ${fetchError.message}`)
      } else {
        setContent((data || []).map(item => ({
          ...item,
          type: contentType as 'story' | 'media_asset' | 'gallery',
          title: item.title || 'Untitled'
        })))
      }

      setIsLoading(false)
    }

    fetchContent()
  }, [contentType, supabase])

  // Fetch syndication history
  useEffect(() => {
    async function fetchSyndications() {
      const { data, error: fetchError } = await supabase
        .from('content_syndication')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (!fetchError && data) {
        setSyndications(data)
      }
    }

    if (activeTab === 'history') {
      fetchSyndications()
    }
  }, [activeTab, supabase])

  // Toggle content selection
  const toggleContent = (id: string) => {
    const newSelected = new Set(selectedContent)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedContent(newSelected)
  }

  // Toggle platform selection
  const togglePlatform = (id: string) => {
    const newSelected = new Set(selectedPlatforms)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedPlatforms(newSelected)
  }

  // Handle syndication
  const handleSyndicate = async () => {
    setIsSyndicating(true)
    setError(null)
    setSuccess(null)

    const results: { success: number; failed: number } = { success: 0, failed: 0 }

    for (const contentId of selectedContent) {
      for (const platformId of selectedPlatforms) {
        try {
          const response = await fetch('/api/v1/content-hub/syndicate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': 'internal-dashboard'
            },
            body: JSON.stringify({
              contentType,
              contentId,
              destinationType: platformId,
              attributionText,
              requestedBy: 'admin-dashboard'
            })
          })

          if (response.ok) {
            results.success++
          } else {
            results.failed++
          }
        } catch {
          results.failed++
        }
      }
    }

    setIsSyndicating(false)
    setShowConfirmDialog(false)

    if (results.failed === 0) {
      setSuccess(`Successfully queued ${results.success} syndication(s)`)
      setSelectedContent(new Set())
      setSelectedPlatforms(new Set())
    } else {
      setError(`Completed with ${results.success} success, ${results.failed} failed`)
    }
  }

  // Filter content by search
  const filteredContent = content.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Get content type icon
  const getContentIcon = (type: string) => {
    switch (type) {
      case 'story': return FileText
      case 'media_asset': return ImageIcon
      case 'gallery': return ImageIcon
      default: return FileText
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Share2 className="h-8 w-8 text-blue-600" />
            Content Syndication
          </h1>
          <p className="text-muted-foreground mt-1">
            Distribute content across platforms while maintaining attribution
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="syndicate">
            <Send className="w-4 h-4 mr-2" />
            Syndicate Content
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="w-4 h-4 mr-2" />
            Syndication History
          </TabsTrigger>
        </TabsList>

        {/* Syndicate Tab */}
        <TabsContent value="syndicate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">1. Select Content</CardTitle>
                <CardDescription>Choose content to syndicate across platforms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Content Type Filter */}
                <div className="flex gap-4">
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="story">Stories</SelectItem>
                      <SelectItem value="media_asset">Media Assets</SelectItem>
                      <SelectItem value="gallery">Galleries</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search content..."
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Content List */}
                <div className="border rounded-lg max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-8 text-center">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">Loading content...</p>
                    </div>
                  ) : filteredContent.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No content found
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredContent.map((item) => {
                        const Icon = getContentIcon(item.type)
                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer"
                            onClick={() => toggleContent(item.id)}
                          >
                            <Checkbox
                              checked={selectedContent.has(item.id)}
                              onCheckedChange={() => toggleContent(item.id)}
                            />
                            <div className="p-2 bg-slate-100 rounded">
                              <Icon className="h-4 w-4 text-slate-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(item.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            {item.visibility && (
                              <Badge variant="outline" className="text-xs">
                                {item.visibility}
                              </Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {selectedContent.size > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {selectedContent.size} item(s) selected
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Platform Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2. Select Destinations</CardTitle>
                <CardDescription>Choose where to syndicate the content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Internal Platforms */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Internal Platforms
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {PLATFORMS.internal.map((platform) => (
                      <div
                        key={platform.id}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedPlatforms.has(platform.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'hover:bg-slate-50'
                        }`}
                        onClick={() => togglePlatform(platform.id)}
                      >
                        <Checkbox
                          checked={selectedPlatforms.has(platform.id)}
                          onCheckedChange={() => togglePlatform(platform.id)}
                        />
                        <div className={`p-1.5 rounded ${platform.color}`}>
                          <platform.icon className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm font-medium">{platform.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Media */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Social Media
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {PLATFORMS.social.map((platform) => (
                      <div
                        key={platform.id}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedPlatforms.has(platform.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'hover:bg-slate-50'
                        }`}
                        onClick={() => togglePlatform(platform.id)}
                      >
                        <Checkbox
                          checked={selectedPlatforms.has(platform.id)}
                          onCheckedChange={() => togglePlatform(platform.id)}
                        />
                        <div className={`p-1.5 rounded ${platform.color}`}>
                          <platform.icon className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm font-medium">{platform.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* External */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    External Partners
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {PLATFORMS.external.map((platform) => (
                      <div
                        key={platform.id}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedPlatforms.has(platform.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'hover:bg-slate-50'
                        }`}
                        onClick={() => togglePlatform(platform.id)}
                      >
                        <Checkbox
                          checked={selectedPlatforms.has(platform.id)}
                          onCheckedChange={() => togglePlatform(platform.id)}
                        />
                        <div className={`p-1.5 rounded ${platform.color}`}>
                          <platform.icon className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm font-medium">{platform.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedPlatforms.size > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {selectedPlatforms.size} platform(s) selected
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Attribution & Syndicate Button */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">3. Attribution & Submit</CardTitle>
              <CardDescription>Set attribution text and submit for syndication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Attribution Text</label>
                <Input
                  value={attributionText}
                  onChange={(e) => setAttributionText(e.target.value)}
                  placeholder="Source: Empathy Ledger"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This text will be included with all syndicated content
                </p>
              </div>

              <Button
                size="lg"
                className="w-full"
                disabled={selectedContent.size === 0 || selectedPlatforms.size === 0 || !attributionText}
                onClick={() => setShowConfirmDialog(true)}
              >
                <Send className="w-4 h-4 mr-2" />
                Syndicate {selectedContent.size} item(s) to {selectedPlatforms.size} platform(s)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Syndication History</CardTitle>
              <CardDescription>View past syndication requests and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {syndications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Share2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No syndication history yet</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">Content</th>
                        <th className="text-left p-3 text-sm font-medium">Destination</th>
                        <th className="text-left p-3 text-sm font-medium">Status</th>
                        <th className="text-left p-3 text-sm font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {syndications.map((syn) => (
                        <tr key={syn.id} className="hover:bg-slate-50">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="capitalize">
                                {syn.content_type}
                              </Badge>
                              <span className="text-sm text-muted-foreground truncate max-w-xs">
                                {syn.content_id}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge className="capitalize">
                              {syn.destination_type.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="p-3">{getStatusBadge(syn.status)}</td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {new Date(syn.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Syndication</DialogTitle>
            <DialogDescription>
              You are about to syndicate {selectedContent.size} item(s) to {selectedPlatforms.size} platform(s).
              This will create {selectedContent.size * selectedPlatforms.size} syndication request(s).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Selected Platforms:</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedPlatforms).map(id => {
                  const platform = [...PLATFORMS.internal, ...PLATFORMS.social, ...PLATFORMS.external]
                    .find(p => p.id === id)
                  return platform ? (
                    <Badge key={id} variant="outline" className="capitalize">
                      {platform.name}
                    </Badge>
                  ) : null
                })}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Attribution:</h4>
              <p className="text-sm text-muted-foreground">{attributionText}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSyndicate} disabled={isSyndicating}>
              {isSyndicating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Confirm Syndication
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

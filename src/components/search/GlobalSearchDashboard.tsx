'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  Filter,
  Save,
  Clock,
  Sparkles,
  FileText,
  Users,
  Image,
  Video,
  Music,
  X
} from 'lucide-react'

interface GlobalSearchDashboardProps {
  organizationId: string
  projectId?: string
}

interface SearchResult {
  id: string
  type: 'story' | 'storyteller' | 'transcript' | 'media' | 'theme'
  title: string
  description: string
  relevance_score: number
  highlights: string[]
  metadata: any
}

interface SearchFilters {
  types: string[]
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year'
  culturalGroups: string[]
  themes: string[]
  mediaTypes: string[]
}

export function GlobalSearchDashboard({ organizationId, projectId }: GlobalSearchDashboardProps) {
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState<'keyword' | 'semantic' | 'both'>('both')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    types: [],
    dateRange: 'all',
    culturalGroups: [],
    themes: [],
    mediaTypes: []
  })
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recent-searches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  const handleSearch = async () => {
    if (!query.trim()) return

    try {
      setSearching(true)
      setHasSearched(true)

      // Save to recent searches
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10)
      setRecentSearches(updated)
      localStorage.setItem('recent-searches', JSON.stringify(updated))

      const params = new URLSearchParams()
      params.append('query', query)
      params.append('organization_id', organizationId)
      if (projectId) params.append('project_id', projectId)
      params.append('search_type', searchType)

      // Add filters
      if (filters.types.length > 0) {
        params.append('types', filters.types.join(','))
      }
      if (filters.dateRange !== 'all') {
        params.append('date_range', filters.dateRange)
      }

      const response = await fetch(`/api/search/global?${params}`)
      const data = await response.json()

      setResults(data.results || [])
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setSearching(false)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setHasSearched(false)
  }

  const clearFilters = () => {
    setFilters({
      types: [],
      dateRange: 'all',
      culturalGroups: [],
      themes: [],
      mediaTypes: []
    })
  }

  const filteredResults = results.filter(result => {
    if (activeTab === 'all') return true
    return result.type === activeTab
  })

  const resultCounts = {
    all: results.length,
    story: results.filter(r => r.type === 'story').length,
    storyteller: results.filter(r => r.type === 'storyteller').length,
    transcript: results.filter(r => r.type === 'transcript').length,
    media: results.filter(r => r.type === 'media').length,
    theme: results.filter(r => r.type === 'theme').length
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'story': return <FileText className="w-4 h-4" />
      case 'storyteller': return <Users className="w-4 h-4" />
      case 'media': return <Image className="w-4 h-4" />
      case 'transcript': return <FileText className="w-4 h-4" />
      case 'theme': return <Sparkles className="w-4 h-4" />
      default: return <Search className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Global Search</h2>
        <p className="text-sm text-gray-600">
          Search across all stories, storytellers, transcripts, media, and themes
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Main Search Input */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for stories, people, themes, or content..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 pr-10 h-12 text-base"
                />
                {query && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              <Button
                onClick={handleSearch}
                disabled={searching || !query.trim()}
                className="h-12 px-6 bg-clay-600 hover:bg-clay-700"
              >
                {searching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {/* Search Options */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={searchType === 'keyword' ? 'default' : 'outline'}
                  onClick={() => setSearchType('keyword')}
                >
                  Keyword
                </Button>
                <Button
                  size="sm"
                  variant={searchType === 'semantic' ? 'default' : 'outline'}
                  onClick={() => setSearchType('semantic')}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Semantic
                </Button>
                <Button
                  size="sm"
                  variant={searchType === 'both' ? 'default' : 'outline'}
                  onClick={() => setSearchType('both')}
                >
                  Both
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {(filters.types.length > 0 || filters.dateRange !== 'all') && (
                    <Badge variant="secondary" className="ml-2">
                      {filters.types.length + (filters.dateRange !== 'all' ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
                <Button size="sm" variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Save Search
                </Button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Filter Results</h4>
                  <Button size="sm" variant="ghost" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Content Type Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-2 block">
                      Content Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['story', 'storyteller', 'transcript', 'media', 'theme'].map(type => (
                        <Button
                          key={type}
                          size="sm"
                          variant={filters.types.includes(type) ? 'default' : 'outline'}
                          onClick={() => {
                            setFilters(prev => ({
                              ...prev,
                              types: prev.types.includes(type)
                                ? prev.types.filter(t => t !== type)
                                : [...prev.types, type]
                            }))
                          }}
                        >
                          {getTypeIcon(type)}
                          <span className="ml-1 capitalize">{type}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Date Range Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-2 block">
                      Date Range
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'all', label: 'All Time' },
                        { value: 'today', label: 'Today' },
                        { value: 'week', label: 'This Week' },
                        { value: 'month', label: 'This Month' },
                        { value: 'year', label: 'This Year' }
                      ].map(option => (
                        <Button
                          key={option.value}
                          size="sm"
                          variant={filters.dateRange === option.value ? 'default' : 'outline'}
                          onClick={() => setFilters(prev => ({ ...prev, dateRange: option.value as any }))}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Searches */}
      {!hasSearched && recentSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              Recent Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuery(search)
                    handleSearch()
                  }}
                >
                  {search}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Search Results</CardTitle>
                <CardDescription>
                  Found {results.length} results for "{query}"
                </CardDescription>
              </div>
              {results.length > 0 && (
                <Badge variant="secondary">{results.length} results</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">
                  All ({resultCounts.all})
                </TabsTrigger>
                <TabsTrigger value="story">
                  <FileText className="w-4 h-4 mr-1" />
                  Stories ({resultCounts.story})
                </TabsTrigger>
                <TabsTrigger value="storyteller">
                  <Users className="w-4 h-4 mr-1" />
                  People ({resultCounts.storyteller})
                </TabsTrigger>
                <TabsTrigger value="transcript">
                  <FileText className="w-4 h-4 mr-1" />
                  Transcripts ({resultCounts.transcript})
                </TabsTrigger>
                <TabsTrigger value="media">
                  <Image className="w-4 h-4 mr-1" />
                  Media ({resultCounts.media})
                </TabsTrigger>
                <TabsTrigger value="theme">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Themes ({resultCounts.theme})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {filteredResults.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No results found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Try adjusting your search or filters
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredResults.map(result => (
                      <div
                        key={result.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-clay-300 hover:bg-clay-50/30 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {getTypeIcon(result.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{result.title}</h4>
                              <Badge variant="outline" className="text-xs capitalize">
                                {result.type}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {Math.round(result.relevance_score * 100)}% match
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{result.description}</p>
                            {result.highlights.length > 0 && (
                              <div className="space-y-1">
                                {result.highlights.map((highlight, i) => (
                                  <p
                                    key={i}
                                    className="text-xs text-gray-500 bg-yellow-50 px-2 py-1 rounded"
                                    dangerouslySetInnerHTML={{ __html: highlight }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

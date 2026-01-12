'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Brain, TrendingUp, Search } from 'lucide-react'

interface SemanticSearchEngineProps {
  organizationId: string
  projectId?: string
}

interface SemanticResult {
  id: string
  title: string
  content: string
  similarity_score: number
  type: string
  metadata: any
}

export function SemanticSearchEngine({ organizationId, projectId }: SemanticSearchEngineProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SemanticResult[]>([])
  const [searching, setSearching] = useState(false)
  const [similarThemes, setSimilarThemes] = useState<string[]>([])

  const handleSemanticSearch = async () => {
    if (!query.trim()) return

    try {
      setSearching(true)

      const params = new URLSearchParams()
      params.append('query', query)
      params.append('organization_id', organizationId)
      if (projectId) params.append('project_id', projectId)

      const response = await fetch(`/api/search/semantic?${params}`)
      const data = await response.json()

      setResults(data.results || [])
      setSimilarThemes(data.similar_themes || [])
    } catch (error) {
      console.error('Semantic search error:', error)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Semantic Search
          </CardTitle>
          <CardDescription>
            AI-powered search that understands meaning and context, not just keywords
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="e.g., 'Stories about resilience and healing'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSemanticSearch()}
              className="bg-white"
            />
            <Button
              onClick={handleSemanticSearch}
              disabled={searching || !query.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {searching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How Semantic Search Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Understands Meaning</h4>
              <p className="text-xs text-gray-600">
                Finds content based on concepts and relationships, not just exact word matches
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Similarity Scoring</h4>
              <p className="text-xs text-gray-600">
                Results ranked by semantic similarity, showing most relevant matches first
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Cross-Lingual Support</h4>
              <p className="text-xs text-gray-600">
                Can find related content even across different languages
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Similar Themes */}
      {similarThemes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Related Themes</CardTitle>
            <CardDescription>Themes semantically related to your search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {similarThemes.map((theme, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-purple-50"
                  onClick={() => setQuery(theme)}
                >
                  {theme}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>
              Found {results.length} semantically similar items
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map(result => (
              <div
                key={result.id}
                className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{result.title}</h4>
                    <Badge variant="outline" className="text-xs mt-1">
                      {result.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-purple-600" />
                    <span className="text-sm font-semibold text-purple-600">
                      {Math.round(result.similarity_score * 100)}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{result.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

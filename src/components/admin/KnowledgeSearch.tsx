'use client'

import { useState } from 'react'
import {
  Search,
  Brain,
  FileText,
  Sparkles,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface SearchResult {
  id: string
  documentId: string
  title: string
  category: string
  content: string
  summary: string | null
  similarity: number
  culturalSensitivity: string
  sectionPath: string[] | null
}

interface SearchResponse {
  query: string
  results: SearchResult[]
  totalResults: number
}

export default function KnowledgeSearch() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setSearched(true)

    try {
      const response = await fetch('/api/knowledge-base/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          threshold: 0.3,
          limit: 5,
          category: category || undefined
        })
      })

      if (response.ok) {
        const data: SearchResponse = await response.json()
        setResults(data.results)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getSimilarityLabel = (similarity: number) => {
    if (similarity >= 80) return { label: 'Excellent match', color: 'bg-emerald-100 text-emerald-800' }
    if (similarity >= 60) return { label: 'Good match', color: 'bg-blue-100 text-blue-800' }
    if (similarity >= 40) return { label: 'Partial match', color: 'bg-amber-100 text-amber-800' }
    return { label: 'Related', color: 'bg-gray-100 text-gray-800' }
  }

  const getCategoryInfo = (cat: string) => {
    const categories: Record<string, { color: string; label: string }> = {
      Principle: { color: 'bg-violet-100 text-violet-800', label: 'Why we do things' },
      Method: { color: 'bg-blue-100 text-blue-800', label: 'How we approach things' },
      Practice: { color: 'bg-emerald-100 text-emerald-800', label: 'What we build' },
      Procedure: { color: 'bg-amber-100 text-amber-800', label: 'Step-by-step guides' }
    }
    return categories[cat] || { color: 'bg-gray-100 text-gray-800', label: cat }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Find Documentation
        </CardTitle>
        <CardDescription>
          Ask questions in plain language - the AI will find the most relevant docs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about the Empathy Ledger platform..."
              className="pl-10"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Principle">Principle</SelectItem>
              <SelectItem value="Method">Method</SelectItem>
              <SelectItem value="Practice">Practice</SelectItem>
              <SelectItem value="Procedure">Procedure</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} disabled={loading || !query.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span className="ml-2">Search</span>
          </Button>
        </div>

        {/* Example Queries */}
        {!searched && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500">Try:</span>
            {[
              'What are OCAP principles?',
              'How do I deploy to production?',
              'How do storyteller profiles work?',
              'What is the multi-tenant architecture?'
            ].map(example => (
              <button
                key={example}
                onClick={() => {
                  setQuery(example)
                }}
                className="text-sm text-purple-600 hover:text-purple-800 hover:underline"
              >
                "{example}"
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        {searched && (
          <div className="space-y-3 pt-2">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Searching knowledge base...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No results found for "{query}"</p>
                <p className="text-sm mt-1">Try different keywords or broaden your search</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                </p>
                {results.map((result, index) => {
                  const similarity = getSimilarityLabel(result.similarity)
                  const categoryInfo = getCategoryInfo(result.category)

                  return (
                    <div
                      key={result.id}
                      className="p-4 border rounded-lg hover:border-purple-300 transition-colors bg-white"
                    >
                      {/* Title and Match Quality */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-purple-500" />
                            <h4 className="font-semibold text-gray-900">{result.title}</h4>
                          </div>
                          <p className="text-xs text-gray-500">{categoryInfo.label}</p>
                        </div>
                        <Badge className={similarity.color}>
                          {similarity.label}
                        </Badge>
                      </div>

                      {/* Content Preview - Simplified */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {result.content}
                        </p>
                      </div>

                      {/* Breadcrumb Path - More readable */}
                      {result.sectionPath && result.sectionPath.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span className="text-gray-400">Found in:</span>
                          {result.sectionPath.map((section, i) => (
                            <span key={i} className="flex items-center">
                              {i > 0 && <ChevronRight className="h-3 w-3 mx-0.5 text-gray-300" />}
                              <span className="text-purple-600">{section}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {result.culturalSensitivity !== 'None' && (
                        <Badge className="mt-2 bg-amber-50 text-amber-700 border border-amber-200">
                          Contains cultural content
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

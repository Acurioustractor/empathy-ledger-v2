'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  HelpCircle,
  X,
  Search,
  BookOpen,
  MessageCircle,
  ExternalLink,
  Loader2,
  Sparkles
} from 'lucide-react'

interface SearchResult {
  id: string
  title: string
  excerpt: string
  category: string
  similarity: number
}

interface FloatingHelpButtonProps {
  className?: string
}

export function FloatingHelpButton({ className }: FloatingHelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const quickTopics = [
    { label: 'Creating stories', query: 'how do I create a story' },
    { label: 'Privacy settings', query: 'how to configure privacy settings' },
    { label: 'Uploading media', query: 'how to upload photos and videos' },
    { label: 'Syndication', query: 'how does story sharing work' },
  ]

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setHasSearched(true)

    try {
      const response = await fetch('/api/knowledge-base/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, limit: 5 })
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
      } else {
        setResults([])
      }
    } catch (error) {
      console.error('Help search error:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleQuickTopic = (topicQuery: string) => {
    setQuery(topicQuery)
    handleSearch(topicQuery)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-8 z-40 h-12 w-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 ${className}`}
        size="icon"
        aria-label="Get help"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-24 right-8 z-40 w-96 max-h-[500px] shadow-2xl border-2 border-blue-200">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Quick Help
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Ask a question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 pr-4"
          />
        </div>

        {/* Quick Topics */}
        {!hasSearched && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">Common topics:</p>
            <div className="flex flex-wrap gap-2">
              {quickTopics.map((topic) => (
                <Badge
                  key={topic.label}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors py-1.5 px-3"
                  onClick={() => handleQuickTopic(topic.query)}
                >
                  {topic.label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {isSearching && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        )}

        {hasSearched && !isSearching && (
          <ScrollArea className="h-[250px]">
            {results.length > 0 ? (
              <div className="space-y-3">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors border border-gray-100"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900 line-clamp-1">
                          {result.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {result.excerpt}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {result.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No results found</p>
                <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
              </div>
            )}
          </ScrollArea>
        )}

        {/* Footer Links */}
        <div className="border-t pt-3 flex items-center justify-between text-xs">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-blue-600 h-8"
            onClick={() => setHasSearched(false)}
          >
            <BookOpen className="h-3 w-3 mr-1" />
            Browse topics
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-blue-600 h-8"
            asChild
          >
            <a href="mailto:support@empathy-ledger.com">
              <MessageCircle className="h-3 w-3 mr-1" />
              Contact support
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

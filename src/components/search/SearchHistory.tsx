'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Search, TrendingUp, X } from 'lucide-react'

interface SearchHistoryItem {
  query: string
  timestamp: string
  result_count: number
  filters?: any
}

interface SearchHistoryProps {
  organizationId: string
  onSearchSelect?: (query: string) => void
}

export function SearchHistory({ organizationId, onSearchSelect }: SearchHistoryProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])
  const [popularSearches, setPopularSearches] = useState<string[]>([])

  useEffect(() => {
    fetchSearchHistory()
    fetchPopularSearches()
  }, [organizationId])

  const fetchSearchHistory = () => {
    // Load from localStorage for now
    const saved = localStorage.getItem(`search-history-${organizationId}`)
    if (saved) {
      setHistory(JSON.parse(saved))
    }
  }

  const fetchPopularSearches = async () => {
    try {
      const response = await fetch(`/api/search/popular?organization_id=${organizationId}`)
      const data = await response.json()
      setPopularSearches(data.searches || [])
    } catch (error) {
      console.error('Error fetching popular searches:', error)
    }
  }

  const clearHistory = () => {
    localStorage.removeItem(`search-history-${organizationId}`)
    setHistory([])
  }

  const removeHistoryItem = (index: number) => {
    const updated = history.filter((_, i) => i !== index)
    setHistory(updated)
    localStorage.setItem(`search-history-${organizationId}`, JSON.stringify(updated))
  }

  return (
    <div className="space-y-6">
      {/* Recent Searches */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                Recent Searches
              </CardTitle>
              <CardDescription>Your search history from the past 30 days</CardDescription>
            </div>
            {history.length > 0 && (
              <Button size="sm" variant="ghost" onClick={clearHistory}>
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No recent searches</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 10).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 cursor-pointer" onClick={() => onSearchSelect?.(item.query)}>
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-sm">{item.query}</span>
                      <Badge variant="secondary" className="text-xs">
                        {item.result_count} results
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">
                      {new Date(item.timestamp).toLocaleDateString()} at{' '}
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeHistoryItem(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Popular Searches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Popular Searches
          </CardTitle>
          <CardDescription>
            What others in your organization are searching for
          </CardDescription>
        </CardHeader>
        <CardContent>
          {popularSearches.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No popular searches yet</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onSearchSelect?.(search)}
                  className="hover:bg-orange-50 hover:border-orange-300"
                >
                  {search}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Tips */}
      <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">Search Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="font-semibold text-blue-700">•</span>
            <p>
              <span className="font-semibold">Exact phrases:</span> Use quotes like "cultural identity"
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-blue-700">•</span>
            <p>
              <span className="font-semibold">Exclude words:</span> Use minus like resilience -trauma
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-blue-700">•</span>
            <p>
              <span className="font-semibold">Semantic search:</span> Use natural language for AI-powered results
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-blue-700">•</span>
            <p>
              <span className="font-semibold">Filters:</span> Combine search with filters for precise results
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

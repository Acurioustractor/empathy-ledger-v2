'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, User, BookOpen, Tag, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  type: 'story' | 'storyteller' | 'theme'
  title: string
  subtitle?: string
  url: string
}

interface HeroSearchProps {
  className?: string
  suggestions?: string[]
}

const defaultSuggestions = [
  'Elder wisdom',
  'Land connection',
  'Youth stories',
  'Healing journeys',
  'Traditional teachings',
  'Cultural identity',
  'Family stories',
  'Community resilience'
]

export function HeroSearch({ className, suggestions = defaultSuggestions }: HeroSearchProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)

  // Debounced search
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/search/global?q=${encodeURIComponent(searchQuery)}&limit=6`)
      if (response.ok) {
        const data = await response.json()

        // Transform API results into our format
        const transformedResults: SearchResult[] = []

        // Add stories
        if (data.stories?.length) {
          data.stories.slice(0, 3).forEach((story: { id: string; title: string; storyteller_name?: string }) => {
            transformedResults.push({
              id: story.id,
              type: 'story',
              title: story.title,
              subtitle: story.storyteller_name ? `by ${story.storyteller_name}` : undefined,
              url: `/stories/${story.id}`
            })
          })
        }

        // Add storytellers
        if (data.storytellers?.length) {
          data.storytellers.slice(0, 2).forEach((storyteller: { id: string; display_name: string; cultural_background?: string }) => {
            transformedResults.push({
              id: storyteller.id,
              type: 'storyteller',
              title: storyteller.display_name,
              subtitle: storyteller.cultural_background,
              url: `/storytellers/${storyteller.id}`
            })
          })
        }

        // Add themes
        if (data.themes?.length) {
          data.themes.slice(0, 2).forEach((theme: { id: string; name: string; story_count?: number }) => {
            transformedResults.push({
              id: theme.id,
              type: 'theme',
              title: theme.name,
              subtitle: theme.story_count ? `${theme.story_count} stories` : undefined,
              url: `/search?theme=${encodeURIComponent(theme.name)}`
            })
          })
        }

        setResults(transformedResults)
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (value.length >= 2) {
      setIsLoading(true)
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(value)
      }, 300)
    } else {
      setResults([])
      setIsLoading(false)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < results.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          router.push(results[selectedIndex].url)
          setIsOpen(false)
        } else if (query.length > 0) {
          router.push(`/search?q=${encodeURIComponent(query)}`)
          setIsOpen(false)
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    router.push(`/search?q=${encodeURIComponent(suggestion)}`)
  }

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    router.push(result.url)
    setIsOpen(false)
  }

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.length > 0) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setIsOpen(false)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get icon for result type
  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'story':
        return <BookOpen className="w-4 h-4 text-terracotta" />
      case 'storyteller':
        return <User className="w-4 h-4 text-sage" />
      case 'theme':
        return <Tag className="w-4 h-4 text-ochre" />
    }
  }

  const showDropdown = isOpen && (results.length > 0 || isLoading || query.length >= 2)

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search stories, people, themes..."
            className={cn(
              'w-full pl-12 pr-12 py-4 text-lg',
              'bg-white/95 backdrop-blur-sm',
              'border-2 border-ochre/30 rounded-2xl',
              'placeholder:text-charcoal/40',
              'focus:outline-none focus:border-terracotta focus:ring-4 focus:ring-terracotta/10',
              'transition-all duration-200',
              'shadow-lg shadow-black/5'
            )}
            aria-label="Search stories, people, and themes"
            aria-expanded={showDropdown}
            aria-controls="search-results"
            aria-autocomplete="list"
          />
          <button
            type="submit"
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2',
              'p-2 rounded-xl',
              'bg-terracotta text-white',
              'hover:bg-terracotta/90 active:scale-95',
              'transition-all duration-150',
              'disabled:opacity-50'
            )}
            disabled={query.length === 0}
            aria-label="Search"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dropdown Results */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            id="search-results"
            role="listbox"
            className={cn(
              'absolute top-full left-0 right-0 mt-2',
              'bg-white rounded-xl shadow-xl border border-ochre/20',
              'overflow-hidden z-50',
              'animate-in fade-in slide-in-from-top-2 duration-200'
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-terracotta animate-spin" />
              </div>
            ) : results.length > 0 ? (
              <ul className="py-2">
                {results.map((result, index) => (
                  <li key={`${result.type}-${result.id}`}>
                    <button
                      type="button"
                      onClick={() => handleResultClick(result)}
                      className={cn(
                        'w-full px-4 py-3 flex items-center gap-3 text-left',
                        'hover:bg-cream transition-colors',
                        selectedIndex === index && 'bg-cream'
                      )}
                      role="option"
                      aria-selected={selectedIndex === index}
                    >
                      <span className="flex-shrink-0">
                        {getResultIcon(result.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-charcoal truncate">
                          {result.title}
                        </p>
                        {result.subtitle && (
                          <p className="text-sm text-charcoal/60 truncate">
                            {result.subtitle}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-charcoal/40 capitalize">
                        {result.type}
                      </span>
                    </button>
                  </li>
                ))}
                {/* View all results link */}
                <li className="border-t border-ochre/10 mt-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      router.push(`/search?q=${encodeURIComponent(query)}`)
                      setIsOpen(false)
                    }}
                    className="w-full px-4 py-2 text-center text-sm text-terracotta hover:bg-cream transition-colors"
                  >
                    View all results for &quot;{query}&quot;
                  </button>
                </li>
              </ul>
            ) : query.length >= 2 ? (
              <div className="py-8 text-center">
                <p className="text-charcoal/60">No results found</p>
                <button
                  type="button"
                  onClick={() => router.push(`/search?q=${encodeURIComponent(query)}`)}
                  className="mt-2 text-sm text-terracotta hover:underline"
                >
                  Try advanced search
                </button>
              </div>
            ) : null}
          </div>
        )}
      </form>

      {/* Suggestion Chips */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className="text-sm text-charcoal/50 mr-1">Try:</span>
        {suggestions.slice(0, 6).map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => handleSuggestionClick(suggestion)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-full',
              'bg-sage/10 text-sage',
              'hover:bg-sage/20 active:scale-95',
              'transition-all duration-150'
            )}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}

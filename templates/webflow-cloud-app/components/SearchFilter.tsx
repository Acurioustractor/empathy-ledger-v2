'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface SearchFilterProps {
  themes: string[]
  currentTheme?: string
  currentSearch?: string
}

export function SearchFilter({ themes, currentTheme, currentSearch }: SearchFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(currentSearch || '')

  const handleThemeChange = (theme: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    if (theme) {
      params.set('theme', theme)
    } else {
      params.delete('theme')
    }
    router.push(`/?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams?.toString() || '')
    if (search) {
      params.set('search', search)
    } else {
      params.delete('search')
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stories..."
            className="w-full px-4 py-3 pl-12 rounded-xl border border-stone-200 focus:border-sage-400 focus:ring-2 focus:ring-sage-100 outline-none transition-all"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </form>

      {/* Theme filter */}
      {themes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleThemeChange('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !currentTheme
                ? 'bg-sage-600 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All
          </button>
          {themes.map((theme) => (
            <button
              key={theme}
              onClick={() => handleThemeChange(theme)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                currentTheme === theme
                  ? 'bg-sage-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchFilter

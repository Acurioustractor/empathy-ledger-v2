'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Save } from 'lucide-react'
import { SearchResults } from './SearchResults'

interface AdvancedSearchPanelProps {
  organizationId: string
}

export function AdvancedSearchPanel({ organizationId }: AdvancedSearchPanelProps) {
  const [query, setQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = () => {
    setHasSearched(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-sky-500" />
            Advanced Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search stories, themes, storytellers..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">Filter by Theme</Button>
            <Button size="sm" variant="outline">Filter by Group</Button>
            <Button size="sm" variant="outline">Filter by Date</Button>
            <Button size="sm" variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Save Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasSearched && <SearchResults query={query} organizationId={organizationId} />}
    </div>
  )
}

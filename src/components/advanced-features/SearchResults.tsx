'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SearchResultsProps {
  query: string
  organizationId: string
}

export function SearchResults({ query, organizationId }: SearchResultsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Results for "{query}"</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <p>Search results will appear here</p>
          <p className="text-sm mt-1">Full-text search with PostgreSQL or Algolia integration</p>
        </div>
      </CardContent>
    </Card>
  )
}

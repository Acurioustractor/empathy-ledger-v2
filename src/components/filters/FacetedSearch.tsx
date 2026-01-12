'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, BarChart3, Filter } from 'lucide-react'

interface Facet {
  name: string
  count: number
  selected: boolean
}

interface FacetGroup {
  id: string
  label: string
  facets: Facet[]
}

interface FacetedSearchProps {
  organizationId: string
  projectId?: string
  onResultsChange?: (results: any[]) => void
}

export function FacetedSearch({
  organizationId,
  projectId,
  onResultsChange
}: FacetedSearchProps) {
  const [query, setQuery] = useState('')
  const [facetGroups, setFacetGroups] = useState<FacetGroup[]>([])
  const [results, setResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    fetchFacets()
  }, [organizationId, projectId])

  const fetchFacets = async () => {
    try {
      const params = new URLSearchParams()
      params.append('organization_id', organizationId)
      if (projectId) params.append('project_id', projectId)
      if (query) params.append('query', query)

      const response = await fetch(`/api/search/facets?${params}`)
      const data = await response.json()

      setFacetGroups(data.facet_groups || [])
    } catch (error) {
      console.error('Error fetching facets:', error)
    }
  }

  const handleSearch = async () => {
    try {
      setSearching(true)

      // Build filters from selected facets
      const filters: any = {}

      facetGroups.forEach(group => {
        const selectedFacets = group.facets.filter(f => f.selected).map(f => f.name)
        if (selectedFacets.length > 0) {
          filters[group.id] = selectedFacets
        }
      })

      const params = new URLSearchParams()
      params.append('query', query)
      params.append('organization_id', organizationId)
      if (projectId) params.append('project_id', projectId)
      params.append('filters', JSON.stringify(filters))

      const response = await fetch(`/api/search/faceted?${params}`)
      const data = await response.json()

      setResults(data.results || [])
      onResultsChange?.(data.results || [])

      // Update facet counts
      setFacetGroups(data.facet_groups || facetGroups)
    } catch (error) {
      console.error('Faceted search error:', error)
    } finally {
      setSearching(false)
    }
  }

  const toggleFacet = (groupId: string, facetName: string) => {
    setFacetGroups(prev =>
      prev.map(group =>
        group.id === groupId
          ? {
              ...group,
              facets: group.facets.map(facet =>
                facet.name === facetName ? { ...facet, selected: !facet.selected } : facet
              )
            }
          : group
      )
    )

    // Auto-search on facet change
    setTimeout(handleSearch, 100)
  }

  const clearFacet = (groupId: string) => {
    setFacetGroups(prev =>
      prev.map(group =>
        group.id === groupId
          ? { ...group, facets: group.facets.map(f => ({ ...f, selected: false })) }
          : group
      )
    )
    setTimeout(handleSearch, 100)
  }

  const clearAllFacets = () => {
    setFacetGroups(prev =>
      prev.map(group => ({
        ...group,
        facets: group.facets.map(f => ({ ...f, selected: false }))
      }))
    )
    setTimeout(handleSearch, 100)
  }

  const getTotalSelected = () => {
    return facetGroups.reduce(
      (sum, group) => sum + group.facets.filter(f => f.selected).length,
      0
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Facets Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Facets
              </CardTitle>
              {getTotalSelected() > 0 && (
                <Button size="sm" variant="ghost" onClick={clearAllFacets}>
                  Clear
                </Button>
              )}
            </div>
            <CardDescription>
              {getTotalSelected()} filter{getTotalSelected() !== 1 ? 's' : ''} active
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {facetGroups.map(group => (
              <div key={group.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">{group.label}</h4>
                  {group.facets.some(f => f.selected) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => clearFacet(group.id)}
                      className="h-6 px-2 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <div className="space-y-1">
                  {group.facets.map(facet => (
                    <label
                      key={facet.name}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={facet.selected}
                          onChange={() => toggleFacet(group.id, facet.name)}
                          className="rounded"
                        />
                        <span className="text-sm">{facet.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {facet.count}
                      </Badge>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Facet Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Results:</span>
              <span className="font-semibold">{results.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Filters:</span>
              <span className="font-semibold">{getTotalSelected()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Facet Groups:</span>
              <span className="font-semibold">{facetGroups.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Area */}
      <div className="lg:col-span-3 space-y-4">
        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search with facets..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searching}>
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
          </CardContent>
        </Card>

        {/* Active Filters */}
        {getTotalSelected() > 0 && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-gray-600">Active Filters:</span>
                {facetGroups.map(group =>
                  group.facets
                    .filter(f => f.selected)
                    .map(facet => (
                      <Badge
                        key={`${group.id}-${facet.name}`}
                        variant="secondary"
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => toggleFacet(group.id, facet.name)}
                      >
                        {group.label}: {facet.name} ×
                      </Badge>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>
              {results.length} item{results.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No results found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your filters or search query
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer"
                  >
                    <h4 className="font-semibold text-gray-900">{result.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{result.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {result.type}
                      </Badge>
                      {result.metadata?.theme && (
                        <Badge variant="secondary" className="text-xs">
                          {result.metadata.theme}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

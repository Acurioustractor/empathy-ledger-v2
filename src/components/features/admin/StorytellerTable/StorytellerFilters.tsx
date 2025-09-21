'use client'

import React from 'react'
import { useAdminStore } from '@/lib/stores/admin.store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, X, Filter, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function StorytellerFilters() {
  const { 
    storytellerFilters, 
    updateStorytellerFilters, 
    resetStorytellerFilters 
  } = useAdminStore()

  const activeFiltersCount = Object.values(storytellerFilters).filter(
    v => v && v !== 'all' && v !== ''
  ).length

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-grey-500" />
          <h3 className="font-medium">Filters</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount} active
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetStorytellerFilters}
          disabled={activeFiltersCount === 0}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-grey-400" />
          <Input
            type="search"
            placeholder="Search by name or email..."
            value={storytellerFilters.search}
            onChange={(e) => updateStorytellerFilters({ search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={storytellerFilters.status}
          onValueChange={(value) => updateStorytellerFilters({ status: value as any })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* Featured Filter */}
        <Select
          value={storytellerFilters.featured}
          onValueChange={(value) => updateStorytellerFilters({ featured: value as any })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Storytellers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Storytellers</SelectItem>
            <SelectItem value="true">Featured Only</SelectItem>
            <SelectItem value="false">Non-Featured</SelectItem>
          </SelectContent>
        </Select>

        {/* Elder Filter */}
        <Select
          value={storytellerFilters.elder}
          onValueChange={(value) => updateStorytellerFilters({ elder: value as any })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Ages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ages</SelectItem>
            <SelectItem value="true">Elders Only</SelectItem>
            <SelectItem value="false">Non-Elders</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select
          value={storytellerFilters.sortBy}
          onValueChange={(value) => updateStorytellerFilters({ sortBy: value as any })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="stories">Story Count</SelectItem>
            <SelectItem value="recent">Recently Active</SelectItem>
            <SelectItem value="engagement">Engagement Rate</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select
          value={storytellerFilters.sortOrder}
          onValueChange={(value) => updateStorytellerFilters({ sortOrder: value as any })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Order..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {storytellerFilters.search && (
            <Badge variant="secondary" className="pl-2">
              Search: {storytellerFilters.search}
              <button
                onClick={() => updateStorytellerFilters({ search: '' })}
                className="ml-2 hover:bg-grey-300 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {storytellerFilters.status !== 'all' && (
            <Badge variant="secondary" className="pl-2">
              Status: {storytellerFilters.status}
              <button
                onClick={() => updateStorytellerFilters({ status: 'all' })}
                className="ml-2 hover:bg-grey-300 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {storytellerFilters.featured !== 'all' && (
            <Badge variant="secondary" className="pl-2">
              Featured: {storytellerFilters.featured === 'true' ? 'Yes' : 'No'}
              <button
                onClick={() => updateStorytellerFilters({ featured: 'all' })}
                className="ml-2 hover:bg-grey-300 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {storytellerFilters.elder !== 'all' && (
            <Badge variant="secondary" className="pl-2">
              Elder: {storytellerFilters.elder === 'true' ? 'Yes' : 'No'}
              <button
                onClick={() => updateStorytellerFilters({ elder: 'all' })}
                className="ml-2 hover:bg-grey-300 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
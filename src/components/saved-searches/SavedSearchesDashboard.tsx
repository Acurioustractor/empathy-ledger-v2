'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Save,
  Bell,
  Search,
  Trash2,
  Play,
  Clock,
  Mail,
  BellRing,
  Edit
} from 'lucide-react'

interface SavedSearch {
  id: string
  name: string
  query: string
  filters: any
  alert_enabled: boolean
  alert_frequency: 'realtime' | 'daily' | 'weekly' | 'never'
  last_run: string
  result_count: number
  created_at: string
}

interface SavedSearchesDashboardProps {
  organizationId: string
  userId: string
}

export function SavedSearchesDashboard({ organizationId, userId }: SavedSearchesDashboardProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    fetchSavedSearches()
  }, [organizationId, userId])

  const fetchSavedSearches = async () => {
    try {
      const response = await fetch(
        `/api/search/saved?organization_id=${organizationId}&user_id=${userId}`
      )
      const data = await response.json()
      setSavedSearches(data.saved_searches || [])
    } catch (error) {
      console.error('Error fetching saved searches:', error)
    }
  }

  const runSearch = async (search: SavedSearch) => {
    try {
      const params = new URLSearchParams()
      params.append('query', search.query)
      params.append('organization_id', organizationId)
      params.append('filters', JSON.stringify(search.filters))

      const response = await fetch(`/api/search/global?${params}`)
      const data = await response.json()

      // Update last_run and result_count
      await fetch(`/api/search/saved/${search.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          last_run: new Date().toISOString(),
          result_count: data.count || 0
        })
      })

      fetchSavedSearches()
    } catch (error) {
      console.error('Error running search:', error)
    }
  }

  const deleteSearch = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved search?')) return

    try {
      await fetch(`/api/search/saved/${id}`, {
        method: 'DELETE'
      })
      fetchSavedSearches()
    } catch (error) {
      console.error('Error deleting search:', error)
    }
  }

  const toggleAlert = async (search: SavedSearch) => {
    try {
      await fetch(`/api/search/saved/${search.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert_enabled: !search.alert_enabled
        })
      })
      fetchSavedSearches()
    } catch (error) {
      console.error('Error toggling alert:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Saved Searches & Alerts</h2>
          <p className="text-sm text-gray-600">
            Save your searches and get notified when new matches appear
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          Save New Search
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Saved</p>
                <p className="text-2xl font-bold text-gray-900">{savedSearches.length}</p>
              </div>
              <Save className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {savedSearches.filter(s => s.alert_enabled).length}
                </p>
              </div>
              <Bell className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Results</p>
                <p className="text-2xl font-bold text-gray-900">
                  {savedSearches.reduce((sum, s) => sum + s.result_count, 0)}
                </p>
              </div>
              <Search className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last 7 Days</p>
                <p className="text-2xl font-bold text-gray-900">
                  {savedSearches.filter(s => {
                    const lastRun = new Date(s.last_run)
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    return lastRun > weekAgo
                  }).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saved Searches List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Saved Searches</CardTitle>
          <CardDescription>
            Run saved searches or set up alerts for new content
          </CardDescription>
        </CardHeader>
        <CardContent>
          {savedSearches.length === 0 ? (
            <div className="text-center py-12">
              <Save className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No saved searches yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Save your searches to quickly access them later
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedSearches.map(search => (
                <div
                  key={search.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{search.name}</h4>
                        {search.alert_enabled && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                            <Bell className="w-3 h-3 mr-1" />
                            Alert Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Query:</span> "{search.query}"
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          <Clock className="w-3 h-3 inline mr-1" />
                          Last run: {new Date(search.last_run).toLocaleDateString()}
                        </span>
                        <span>
                          <Search className="w-3 h-3 inline mr-1" />
                          {search.result_count} results
                        </span>
                        {search.alert_enabled && (
                          <span>
                            <Mail className="w-3 h-3 inline mr-1" />
                            {search.alert_frequency}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runSearch(search)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Run
                      </Button>
                      <Button
                        size="sm"
                        variant={search.alert_enabled ? 'default' : 'outline'}
                        onClick={() => toggleAlert(search)}
                        className={search.alert_enabled ? 'bg-orange-600 hover:bg-orange-700' : ''}
                      >
                        <BellRing className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingSearch(search)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteSearch(search.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Settings Info */}
      <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-600" />
            How Alerts Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="font-semibold text-orange-700">•</span>
            <p>
              <strong>Real-time:</strong> Get notified immediately when new content matches your search
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-orange-700">•</span>
            <p>
              <strong>Daily:</strong> Receive a daily summary of new matches
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-orange-700">•</span>
            <p>
              <strong>Weekly:</strong> Get a weekly digest of new content matching your searches
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

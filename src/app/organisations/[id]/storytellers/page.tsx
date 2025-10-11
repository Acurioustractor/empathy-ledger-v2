'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ElegantStorytellerCard, transformToElegantCard } from '@/components/storyteller/elegant-storyteller-card'
import { StorytellerCardAdapter } from '@/lib/adapters/storyteller-card-adapter'
import { adaptStorytellerArray, APIStorytellerData } from '@/lib/adapters/storyteller-data-adapter'
import { StorytellerCreationWizard } from '@/components/storyteller/StorytellerCreationWizard'
import { TranscriptCreationDialog } from '@/components/transcripts/TranscriptCreationDialog'
import {
  Users,
  FileText,
  BookOpen,
  Video,
  Search,
  UserPlus,
  TrendingUp
} from 'lucide-react'

interface OrganizationStats {
  totalStorytellers: number
  totalTranscripts: number
  totalStories: number
  totalVideos: number
  storytellersWithTranscripts: number
  storytellersWithStories: number
  storytellersWithVideos: number
}

interface Organization {
  id: string
  name: string
}

export default function EnhancedStorytellerPage() {
  const params = useParams()
  const organizationId = params.id as string

  const [storytellers, setStorytellers] = useState<APIStorytellerData[]>([])
  const [stats, setStats] = useState<OrganizationStats | null>(null)
  const [organisation, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{storytellerId: string, name: string} | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showAddTranscriptDialog, setShowAddTranscriptDialog] = useState(false)
  const [selectedStorytellerForTranscript, setSelectedStorytellerForTranscript] = useState<string | null>(null)

  useEffect(() => {
    fetchStorytellers()
  }, [organizationId])

  const fetchStorytellers = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/organisations/${organizationId}/storytellers`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch storytellers')
      }

      setStorytellers(data.storytellers || [])
      setStats(data.stats)
      setOrganization(data.organisation)
    } catch (error) {
      console.error('Error fetching storytellers:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleStorytellerCreated = async (storytellerId: string) => {
    // Show success message
    setSuccessMessage('Storyteller has been added successfully')
    setTimeout(() => setSuccessMessage(null), 5000)

    // Close wizard
    setShowAddDialog(false)

    // Refresh the storytellers list
    await fetchStorytellers()
  }

  const handleDeleteRequest = (storytellerId: string) => {
    const storyteller = storytellers.find(s => s.id === storytellerId)
    if (storyteller) {
      setDeleteConfirm({
        storytellerId,
        name: storyteller.displayName || storyteller.fullName || 'this storyteller'
      })
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return

    setIsDeleting(true)
    try {
      const response = await fetch(
        `/api/organisations/${organizationId}/storytellers/${deleteConfirm.storytellerId}`,
        { method: 'DELETE' }
      )

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete storyteller')
      }

      setSuccessMessage(data.message || 'Storyteller has been removed successfully')
      setTimeout(() => setSuccessMessage(null), 5000)

      // Refresh the storytellers list
      await fetchStorytellers()
    } catch (error) {
      console.error('Error deleting storyteller:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete storyteller')
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsDeleting(false)
      setDeleteConfirm(null)
    }
  }

  const handleAddTranscript = (storytellerId: string) => {
    setSelectedStorytellerForTranscript(storytellerId)
    setShowAddTranscriptDialog(true)
  }

  const handleTranscriptCreated = (transcriptId: string) => {
    setSuccessMessage('Transcript has been added successfully')
    setTimeout(() => setSuccessMessage(null), 5000)
    setShowAddTranscriptDialog(false)
    setSelectedStorytellerForTranscript(null)
    // Optionally refresh storytellers to update transcript counts
    fetchStorytellers()
  }

  const filteredStorytellers = storytellers.filter(storyteller =>
    storyteller.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    storyteller.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    storyteller.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    storyteller.location?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const adaptedStorytellers = adaptStorytellerArray(filteredStorytellers)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-earth-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-grey-600">Loading storytellers...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Error: {error}</p>
            <Button onClick={fetchStorytellers} className="mt-4" variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-grey-900">
            {organisation?.name} Storytellers
          </h1>
          <p className="text-grey-600 mt-1">
            Community voices and their stories
          </p>
        </div>

        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setShowAddDialog(true)}
        >
          <UserPlus className="w-4 h-4" />
          Add Storyteller
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-grey-600 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm">Storytellers</span>
              </div>
              <div className="text-2xl font-bold text-grey-900">{stats.totalStorytellers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-grey-600 mb-1">
                <FileText className="w-4 h-4" />
                <span className="text-sm">Transcripts</span>
              </div>
              <div className="text-2xl font-bold text-grey-900">{stats.totalTranscripts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-grey-600 mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm">Stories</span>
              </div>
              <div className="text-2xl font-bold text-grey-900">{stats.totalStories}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-grey-600 mb-1">
                <Video className="w-4 h-4" />
                <span className="text-sm">Videos</span>
              </div>
              <div className="text-2xl font-bold text-grey-900">{stats.totalVideos}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-grey-400 w-4 h-4" />
          <Input
            placeholder="Search storytellers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Badge variant="secondary" className="text-sm">
          {filteredStorytellers.length} of {storytellers.length} storytellers
        </Badge>
      </div>

      {/* Storytellers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStorytellers.map((storyteller) => {
          // Transform API data directly to elegant card format
          const elegantData = transformToElegantCard(storyteller)

          return (
            <ElegantStorytellerCard
              key={storyteller.id}
              storyteller={elegantData}
              variant="default"
              showDelete={true}
              onDelete={handleDeleteRequest}
              showAddTranscript={true}
              onAddTranscript={handleAddTranscript}
            />
          )
        })}
      </div>

      {/* Empty State */}
      {filteredStorytellers.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-grey-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-grey-900 mb-2">
              {searchQuery ? 'No storytellers found' : 'No storytellers yet'}
            </h3>
            <p className="text-grey-600 mb-4">
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'Add storytellers to start building your community'
              }
            </p>
            {!searchQuery && (
              <Button
                variant="outline"
                className="flex items-center gap-2 mx-auto"
                onClick={() => setShowAddDialog(true)}
              >
                <UserPlus className="w-4 h-4" />
                Add First Storyteller
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Storyteller Wizard */}
      {showAddDialog && (
        <StorytellerCreationWizard
          organizationId={organizationId}
          onComplete={handleStorytellerCreated}
          onCancel={() => setShowAddDialog(false)}
        />
      )}

      {/* Add Transcript Dialog */}
      {showAddTranscriptDialog && selectedStorytellerForTranscript && (
        <TranscriptCreationDialog
          organizationId={organizationId}
          preselectedStorytellerId={selectedStorytellerForTranscript}
          onSuccess={handleTranscriptCreated}
          onCancel={() => {
            setShowAddTranscriptDialog(false)
            setSelectedStorytellerForTranscript(null)
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle className="text-xl">Confirm Deletion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-grey-700">
                Are you sure you want to remove <strong>{deleteConfirm.name}</strong> from this organisation?
              </p>
              <p className="text-sm text-grey-600">
                This will remove their storyteller role from this organisation. This action can be undone by re-adding them.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? 'Removing...' : 'Remove Storyteller'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
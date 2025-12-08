'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Search,
  Grid3X3,
  List,
  Archive,
  Ban,
  RefreshCw,
  Filter,
  CheckSquare,
  Square,
  SortAsc,
  SortDesc,
  AlertTriangle,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStoryVault, useVaultActions, VaultStory } from '@/lib/hooks/useStoryVault'
import { StoryOwnershipCard } from './StoryOwnershipCard'
import { RevokeRadar } from './RevokeRadar'
import { RevocationDialog } from './RevocationDialog'

interface StoryVaultProps {
  storytellerId: string
  onViewStoryDetails?: (storyId: string) => void
  onManageEmbeds?: (storyId: string) => void
  onManageDistributions?: (storyId: string) => void
  className?: string
}

type ViewMode = 'grid' | 'list'
type SortField = 'updatedAt' | 'createdAt' | 'views' | 'distributions'
type SortOrder = 'asc' | 'desc'

export function StoryVault({
  storytellerId,
  onViewStoryDetails,
  onManageEmbeds,
  onManageDistributions,
  className
}: StoryVaultProps) {
  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [sortBy, setSortBy] = useState<SortField>('updatedAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [activeTab, setActiveTab] = useState('all')

  // Revocation dialog state
  const [revocationTarget, setRevocationTarget] = useState<{ id: string; title: string } | null>(null)

  // Bulk revoke all state
  const [showBulkRevokeDialog, setShowBulkRevokeDialog] = useState(false)
  const [bulkRevokeReason, setBulkRevokeReason] = useState('')
  const [bulkRevokeProgress, setBulkRevokeProgress] = useState(0)
  const [bulkRevokeTotal, setBulkRevokeTotal] = useState(0)
  const [isBulkRevoking, setIsBulkRevoking] = useState(false)
  const [bulkRevokeComplete, setBulkRevokeComplete] = useState(false)

  // Hooks
  const {
    stories,
    summary,
    isLoading,
    mutate,
    selectedStories,
    toggleStorySelection,
    selectAll,
    clearSelection,
    hasSelection
  } = useStoryVault(storytellerId, {
    includeArchived: showArchived,
    sortBy,
    sortOrder
  })

  const { archiveStory, restoreStory, isLoading: isActioning } = useVaultActions()

  // Filter stories
  const filteredStories = stories.filter(story => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!story.title?.toLowerCase().includes(query)) {
        return false
      }
    }

    // Tab filter
    if (activeTab === 'active' && story.isArchived) return false
    if (activeTab === 'archived' && !story.isArchived) return false
    if (activeTab === 'shared' && story.activeEmbeds === 0 && story.activeDistributions === 0) return false
    if (activeTab === 'consent-pending' && story.consentVerified) return false

    return true
  })

  // Handlers
  const handleArchive = async (storyId: string) => {
    try {
      await archiveStory(storyId)
      mutate()
    } catch (err) {
      console.error('Failed to archive:', err)
    }
  }

  const handleRestore = async (storyId: string) => {
    try {
      await restoreStory(storyId)
      mutate()
    } catch (err) {
      console.error('Failed to restore:', err)
    }
  }

  const handleRevoke = (storyId: string) => {
    const story = stories.find(s => s.id === storyId)
    if (story) {
      setRevocationTarget({ id: storyId, title: story.title })
    }
  }

  const handleBulkAction = async (action: 'archive' | 'revoke') => {
    if (!hasSelection) return

    if (action === 'archive') {
      for (const storyId of selectedStories) {
        await archiveStory(storyId)
      }
      mutate()
      clearSelection()
    } else if (action === 'revoke') {
      // For bulk revoke, we'd need a different approach
      // For now, just revoke the first selected
      if (selectedStories.length === 1) {
        handleRevoke(selectedStories[0])
      }
    }
  }

  // Bulk revoke all handler
  const handleBulkRevokeAll = useCallback(async () => {
    if (!bulkRevokeReason.trim()) return

    // Get stories with active distributions or embeds
    const sharedStories = stories.filter(
      s => (s.activeEmbeds > 0 || s.activeDistributions > 0) && !s.isArchived
    )

    if (sharedStories.length === 0) {
      setShowBulkRevokeDialog(false)
      return
    }

    setIsBulkRevoking(true)
    setBulkRevokeTotal(sharedStories.length)
    setBulkRevokeProgress(0)
    setBulkRevokeComplete(false)

    try {
      for (let i = 0; i < sharedStories.length; i++) {
        const story = sharedStories[i]

        // Call the revocation API for each story
        const response = await fetch(`/api/stories/${story.id}/revoke`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scope: 'full',
            reason: bulkRevokeReason,
            revokeDistributions: true,
            revokeEmbeds: true
          })
        })

        if (!response.ok) {
          console.error(`Failed to revoke story ${story.id}:`, await response.text())
        }

        setBulkRevokeProgress(i + 1)
      }

      setBulkRevokeComplete(true)

      // Refresh the data after a short delay
      setTimeout(() => {
        mutate()
        setShowBulkRevokeDialog(false)
        setBulkRevokeReason('')
        setIsBulkRevoking(false)
        setBulkRevokeComplete(false)
        setBulkRevokeProgress(0)
        setBulkRevokeTotal(0)
      }, 1500)

    } catch (err) {
      console.error('Bulk revoke error:', err)
      setIsBulkRevoking(false)
    }
  }, [bulkRevokeReason, stories, mutate])

  // Open bulk revoke dialog
  const openBulkRevokeDialog = useCallback(() => {
    const sharedStories = stories.filter(
      s => (s.activeEmbeds > 0 || s.activeDistributions > 0) && !s.isArchived
    )
    if (sharedStories.length > 0) {
      setShowBulkRevokeDialog(true)
    }
  }, [stories])

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary radar */}
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div>
          {/* Header with search and filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortField)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updatedAt">Last Updated</SelectItem>
                  <SelectItem value="createdAt">Created</SelectItem>
                  <SelectItem value="views">Views</SelectItem>
                  <SelectItem value="distributions">Distributions</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-r-none"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-l-none"
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => mutate()}
                aria-label="Refresh story list"
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="all" className="gap-2">
                  All
                  {summary && <Badge variant="secondary" size="sm">{summary.totalStories}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="active" className="gap-2">
                  Active
                  {summary && <Badge variant="secondary" size="sm">{summary.activeStories}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="shared" className="gap-2">
                  Shared
                </TabsTrigger>
                <TabsTrigger value="consent-pending" className="gap-2">
                  Pending Consent
                  {summary && summary.storiesWithoutConsent > 0 && (
                    <Badge variant="warning" size="sm">{summary.storiesWithoutConsent}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="archived" className="gap-2">
                  Archived
                  {summary && <Badge variant="secondary" size="sm">{summary.archivedStories}</Badge>}
                </TabsTrigger>
              </TabsList>

              {/* Bulk actions */}
              {hasSelection && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedStories.length} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('archive')}
                    disabled={isActioning}
                  >
                    <Archive className="mr-1 h-3 w-3" />
                    Archive
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleBulkAction('revoke')}
                    disabled={isActioning || selectedStories.length > 1}
                  >
                    <Ban className="mr-1 h-3 w-3" />
                    Revoke
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearSelection}>
                    Clear
                  </Button>
                </div>
              )}
            </div>

            {/* Selection controls */}
            <div className="flex items-center gap-4 mb-4 text-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={hasSelection ? clearSelection : selectAll}
                className="h-8"
              >
                {hasSelection ? (
                  <>
                    <CheckSquare className="mr-1 h-4 w-4" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square className="mr-1 h-4 w-4" />
                    Select All
                  </>
                )}
              </Button>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-archived"
                  checked={showArchived}
                  onCheckedChange={(checked) => setShowArchived(checked as boolean)}
                />
                <label htmlFor="show-archived" className="text-muted-foreground cursor-pointer">
                  Include archived in All
                </label>
              </div>
            </div>

            {/* Story grid/list */}
            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className={cn(
                  'gap-4',
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    : 'space-y-4'
                )}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-[200px] rounded-lg" />
                  ))}
                </div>
              ) : filteredStories.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Archive className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">No stories found</p>
                  <p className="text-sm">
                    {searchQuery
                      ? 'Try adjusting your search'
                      : activeTab === 'archived'
                        ? 'No archived stories'
                        : 'Start creating stories to see them here'}
                  </p>
                </div>
              ) : (
                <div className={cn(
                  'gap-4',
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    : 'space-y-4'
                )}>
                  {filteredStories.map((story) => (
                    <StoryOwnershipCard
                      key={story.id}
                      story={story}
                      isSelected={selectedStories.includes(story.id)}
                      onSelect={toggleStorySelection}
                      onViewDetails={onViewStoryDetails}
                      onRevoke={handleRevoke}
                      onArchive={handleArchive}
                      onRestore={handleRestore}
                      onManageEmbeds={onManageEmbeds}
                      onManageDistributions={onManageDistributions}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar with radar */}
        <div className="space-y-4">
          <RevokeRadar
            summary={summary}
            onRevokeAll={openBulkRevokeDialog}
          />
        </div>
      </div>

      {/* Revocation dialog */}
      {revocationTarget && (
        <RevocationDialog
          open={!!revocationTarget}
          onOpenChange={(open) => !open && setRevocationTarget(null)}
          storyId={revocationTarget.id}
          storyTitle={revocationTarget.title}
          onSuccess={() => {
            mutate()
            setRevocationTarget(null)
          }}
        />
      )}

      {/* Bulk Revoke All Dialog */}
      <Dialog open={showBulkRevokeDialog} onOpenChange={(open) => {
        if (!isBulkRevoking) {
          setShowBulkRevokeDialog(open)
          if (!open) {
            setBulkRevokeReason('')
          }
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Revoke All Distributions
            </DialogTitle>
            <DialogDescription>
              This will revoke access to all your shared stories. This action cannot be undone.
              {summary && (summary.totalActiveEmbeds > 0 || summary.totalActiveDistributions > 0) && (
                <span className="mt-2 block font-medium text-foreground">
                  {summary.totalActiveEmbeds > 0 && `${summary.totalActiveEmbeds} active embeds`}
                  {summary.totalActiveEmbeds > 0 && summary.totalActiveDistributions > 0 && ' and '}
                  {summary.totalActiveDistributions > 0 && `${summary.totalActiveDistributions} active distributions`}
                  {' '}will be revoked.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {!isBulkRevoking && !bulkRevokeComplete ? (
            <>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="bulk-revoke-reason" className="text-sm font-medium">
                    Reason for revocation <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    id="bulk-revoke-reason"
                    placeholder="Please provide a reason for revoking all distributions..."
                    value={bulkRevokeReason}
                    onChange={(e) => setBulkRevokeReason(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <strong>Warning:</strong> All organizations and websites currently using your stories
                  will immediately lose access. They will see a "content revoked" message.
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowBulkRevokeDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleBulkRevokeAll}
                  disabled={!bulkRevokeReason.trim()}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Revoke All Access
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-6 space-y-4">
              {bulkRevokeComplete ? (
                <div className="text-center space-y-3">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-600" />
                  <p className="font-medium text-green-600">All distributions revoked successfully</p>
                  <p className="text-sm text-muted-foreground">
                    Revoked {bulkRevokeTotal} {bulkRevokeTotal === 1 ? 'story' : 'stories'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Revoking distributions...</span>
                  </div>
                  <Progress value={(bulkRevokeProgress / bulkRevokeTotal) * 100} className="w-full" />
                  <p className="text-center text-sm text-muted-foreground">
                    {bulkRevokeProgress} of {bulkRevokeTotal} stories processed
                  </p>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default StoryVault

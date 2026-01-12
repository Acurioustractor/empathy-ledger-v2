'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import {
  Tag,
  MapPin,
  Users,
  FolderKanban,
  X,
  Loader2,
  CheckCircle,
  Plus,
  Minus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TagAutocomplete, SelectedTag } from './TagAutocomplete'

interface BatchTaggingBarProps {
  selectedIds: string[]
  onClearSelection: () => void
  onComplete?: () => void
  className?: string
}

type BatchAction = 'add-tags' | 'remove-tags' | 'set-location' | 'set-project' | 'link-storyteller'

export function BatchTaggingBar({
  selectedIds,
  onClearSelection,
  onComplete,
  className,
}: BatchTaggingBarProps) {
  const [activeAction, setActiveAction] = useState<BatchAction | null>(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  // Tag state
  const [selectedTags, setSelectedTags] = useState<SelectedTag[]>([])

  const handleBatchTags = async (action: 'add' | 'remove') => {
    if (selectedTags.length === 0) return

    setProcessing(true)
    setProgress(0)
    setResult(null)

    try {
      const response = await fetch('/api/media/batch/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaIds: selectedIds,
          action,
          tagIds: selectedTags.map(t => t.id),
          source: 'batch'
        })
      })

      const data = await response.json()

      if (response.ok) {
        setProgress(100)
        setResult({
          success: true,
          message: data.message || `Successfully ${action === 'add' ? 'added' : 'removed'} tags from ${selectedIds.length} items`
        })
        onComplete?.()
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to process batch operation'
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'An error occurred during batch processing'
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleCloseDialog = () => {
    setActiveAction(null)
    setSelectedTags([])
    setResult(null)
    setProgress(0)
  }

  if (selectedIds.length === 0) return null

  return (
    <>
      {/* Fixed bottom bar */}
      <div className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 shadow-lg',
        'px-4 py-3',
        className
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Selection info */}
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-base px-3 py-1">
              {selectedIds.length} selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-stone-500"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveAction('add-tags')}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              <Tag className="h-4 w-4" />
              Add Tags
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveAction('remove-tags')}
              className="gap-2"
            >
              <Minus className="h-4 w-4" />
              <Tag className="h-4 w-4" />
              Remove Tags
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveAction('set-location')}
              className="gap-2"
              disabled
              title="Coming soon"
            >
              <MapPin className="h-4 w-4" />
              Set Location
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveAction('set-project')}
              className="gap-2"
              disabled
              title="Coming soon"
            >
              <FolderKanban className="h-4 w-4" />
              Set Project
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveAction('link-storyteller')}
              className="gap-2"
              disabled
              title="Coming soon"
            >
              <Users className="h-4 w-4" />
              Link Storyteller
            </Button>
          </div>
        </div>
      </div>

      {/* Tag dialog */}
      <Dialog open={activeAction === 'add-tags' || activeAction === 'remove-tags'} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeAction === 'add-tags' ? (
                <>
                  <Plus className="h-5 w-5" />
                  Add Tags to {selectedIds.length} Items
                </>
              ) : (
                <>
                  <Minus className="h-5 w-5" />
                  Remove Tags from {selectedIds.length} Items
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {activeAction === 'add-tags'
                ? 'Select tags to add to all selected media items.'
                : 'Select tags to remove from all selected media items.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Tag selector */}
            <TagAutocomplete
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              placeholder={activeAction === 'add-tags' ? 'Select tags to add...' : 'Select tags to remove...'}
              allowCreate={activeAction === 'add-tags'}
              showCategoryFilter
            />

            {/* Progress */}
            {processing && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-stone-500 text-center">
                  Processing {selectedIds.length} items...
                </p>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className={cn(
                'p-3 rounded-lg text-sm',
                result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              )}>
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  {result.message}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCloseDialog} disabled={processing}>
              {result?.success ? 'Done' : 'Cancel'}
            </Button>
            {!result?.success && (
              <Button
                onClick={() => handleBatchTags(activeAction === 'add-tags' ? 'add' : 'remove')}
                disabled={processing || selectedTags.length === 0}
                className="bg-sage-600 hover:bg-sage-700"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {activeAction === 'add-tags' ? 'Add Tags' : 'Remove Tags'}
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default BatchTaggingBar

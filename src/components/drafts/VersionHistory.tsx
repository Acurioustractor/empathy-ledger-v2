'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Clock, GitCommit, User, Eye, RotateCcw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StoryVersion {
  id: string
  version_number: number
  title: string
  content: string
  created_by: {
    id: string
    full_name: string
    avatar_url?: string
  }
  created_at: string
  restored_from?: string
  change_summary?: string
}

interface VersionHistoryProps {
  storyId: string
  currentVersionId?: string
  onCompare?: (versionA: string, versionB: string) => void
  onRestore?: (versionId: string) => void
  className?: string
}

export function VersionHistory({
  storyId,
  currentVersionId,
  onCompare,
  onRestore,
  className
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<StoryVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)

  useEffect(() => {
    loadVersions()
  }, [storyId])

  const loadVersions = async () => {
    try {
      const response = await fetch(`/api/stories/${storyId}/versions`)
      if (!response.ok) throw new Error('Failed to load versions')
      const data = await response.json()
      setVersions(data.versions || [])
    } catch (error) {
      console.error('Error loading versions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompare = (versionId: string) => {
    if (selectedVersion && selectedVersion !== versionId) {
      onCompare?.(selectedVersion, versionId)
      setSelectedVersion(null)
    } else {
      setSelectedVersion(versionId)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} days ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-[#D97757]" />
        <p className="text-sm text-[#2C2C2C]/60">Loading version history...</p>
      </div>
    )
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-8">
        <GitCommit className="w-12 h-12 mx-auto mb-3 text-[#2C2C2C]/20" />
        <p className="text-sm text-[#2C2C2C]/60">No version history yet</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Instructions */}
      {selectedVersion && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-900">
            Select another version to compare, or click the selected version to cancel
          </p>
        </Card>
      )}

      {/* Version List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-3 pr-4">
          {versions.map((version, index) => {
            const isSelected = selectedVersion === version.id
            const isCurrent = version.id === currentVersionId
            const isRestored = !!version.restored_from

            return (
              <Card
                key={version.id}
                className={cn(
                  "p-4 border-2 transition-all",
                  isSelected && "border-blue-500 bg-blue-50",
                  isCurrent && "border-[#D97757] bg-[#D97757]/5"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Timeline Dot */}
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-3 h-3 rounded-full border-2",
                      isCurrent ? "bg-[#D97757] border-[#D97757]" : "bg-white border-[#2C2C2C]/20"
                    )} />
                    {index < versions.length - 1 && (
                      <div className="w-0.5 h-full bg-[#2C2C2C]/10 mt-2" />
                    )}
                  </div>

                  {/* Version Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-[#2C2C2C]">
                            Version {version.version_number}
                          </h4>
                          {isCurrent && (
                            <Badge className="bg-[#D97757] text-white">Current</Badge>
                          )}
                          {isRestored && (
                            <Badge variant="outline">Restored</Badge>
                          )}
                        </div>
                        <p className="text-sm text-[#2C2C2C]/70 font-medium truncate">
                          {version.title || 'Untitled'}
                        </p>
                      </div>
                    </div>

                    {/* Change Summary */}
                    {version.change_summary && (
                      <p className="text-xs text-[#2C2C2C]/60 mb-2 line-clamp-2">
                        {version.change_summary}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-3 text-xs text-[#2C2C2C]/60 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{version.created_by.full_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(version.created_at)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCompare(version.id)}
                        className={cn(isSelected && "border-blue-500 bg-blue-50")}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        {isSelected ? 'Selected' : 'Compare'}
                      </Button>

                      {!isCurrent && onRestore && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRestore(version.id)}
                          className="text-[#D97757] border-[#D97757] hover:bg-[#D97757]/10"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

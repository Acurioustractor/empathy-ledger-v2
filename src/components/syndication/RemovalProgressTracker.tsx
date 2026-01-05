'use client'

/**
 * Removal Progress Tracker
 *
 * Shows real-time progress of story removal across multiple sites.
 * Provides transparency and reassurance during the revocation process.
 *
 * ACT Philosophy Alignment:
 * - Real-time per-site visibility (not just "processing...")
 * - Gentle reassuring language
 * - Clear success/failure states
 * - Option to contact support if issues arise
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  MessageCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SiteRemovalStatus {
  siteId: string
  siteName: string
  status: 'pending' | 'notifying' | 'verifying' | 'complete' | 'failed'
  message: string
  timestamp: Date
  retryCount?: number
}

interface RemovalProgressTrackerProps {
  storyId: string
  storyTitle: string
  siteIds: string[]
  onComplete?: () => void
  onClose?: () => void
}

export default function RemovalProgressTracker({
  storyId,
  storyTitle,
  siteIds,
  onComplete,
  onClose
}: RemovalProgressTrackerProps) {
  const [siteStatuses, setSiteStatuses] = useState<SiteRemovalStatus[]>([])
  const [overallProgress, setOverallProgress] = useState(0)

  useEffect(() => {
    // Initialize site statuses
    const initialStatuses: SiteRemovalStatus[] = siteIds.map(siteId => ({
      siteId,
      siteName: getSiteName(siteId),
      status: 'pending',
      message: 'Preparing to remove...',
      timestamp: new Date()
    }))
    setSiteStatuses(initialStatuses)

    // Start removal process
    startRemovalProcess(initialStatuses)
  }, [storyId, siteIds])

  useEffect(() => {
    // Calculate overall progress
    const completedCount = siteStatuses.filter(
      s => s.status === 'complete' || s.status === 'failed'
    ).length
    const progress = (completedCount / siteStatuses.length) * 100
    setOverallProgress(progress)

    // Check if all complete
    if (progress === 100) {
      onComplete?.()
    }
  }, [siteStatuses, onComplete])

  const getSiteName = (siteId: string): string => {
    const siteNames: Record<string, string> = {
      justicehub: 'JusticeHub',
      theharvest: 'The Harvest',
      actfarm: 'ACT Farm',
      actplacemat: 'ACT Placemat'
    }
    return siteNames[siteId] || siteId
  }

  const startRemovalProcess = async (statuses: SiteRemovalStatus[]) => {
    // Process each site sequentially for clarity
    for (let i = 0; i < statuses.length; i++) {
      const siteId = statuses[i].siteId

      // Update to notifying
      await updateSiteStatus(siteId, 'notifying', 'Sending removal request...')
      await delay(800)

      // Update to verifying
      await updateSiteStatus(siteId, 'verifying', 'Verifying removal...')
      await delay(1200)

      // Simulate API call
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/syndication/revoke', {
        //   method: 'POST',
        //   body: JSON.stringify({ storyId, siteId })
        // })

        // Mock success (90% success rate for testing)
        const success = Math.random() > 0.1

        if (success) {
          await updateSiteStatus(
            siteId,
            'complete',
            'Story removed successfully'
          )
        } else {
          await updateSiteStatus(
            siteId,
            'failed',
            'Unable to verify removal - please contact support',
            1
          )
        }
      } catch (error) {
        await updateSiteStatus(
          siteId,
          'failed',
          'Connection error - will retry automatically',
          1
        )
      }

      await delay(400)
    }
  }

  const updateSiteStatus = async (
    siteId: string,
    status: SiteRemovalStatus['status'],
    message: string,
    retryCount?: number
  ) => {
    setSiteStatuses(prev =>
      prev.map(site =>
        site.siteId === siteId
          ? {
              ...site,
              status,
              message,
              timestamp: new Date(),
              retryCount
            }
          : site
      )
    )
  }

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const handleRetry = async (siteId: string) => {
    await updateSiteStatus(siteId, 'pending', 'Retrying removal...')
    // Simulate retry process
    await delay(500)
    await updateSiteStatus(siteId, 'notifying', 'Sending removal request...')
    await delay(800)
    await updateSiteStatus(siteId, 'verifying', 'Verifying removal...')
    await delay(1200)
    await updateSiteStatus(siteId, 'complete', 'Story removed successfully')
  }

  const getStatusIcon = (status: SiteRemovalStatus['status']) => {
    switch (status) {
      case 'pending':
      case 'notifying':
      case 'verifying':
        return <Clock className="h-4 w-4 text-amber-600 animate-pulse" />
      case 'complete':
        return <CheckCircle2 className="h-4 w-4 text-sage-600" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-ochre-600" />
    }
  }

  const getStatusColor = (status: SiteRemovalStatus['status']) => {
    switch (status) {
      case 'pending':
      case 'notifying':
      case 'verifying':
        return 'bg-amber-50 text-amber-800 border-amber-200'
      case 'complete':
        return 'bg-sage-50 text-sage-800 border-sage-200'
      case 'failed':
        return 'bg-ochre-50 text-ochre-800 border-ochre-200'
    }
  }

  const allComplete = siteStatuses.every(
    s => s.status === 'complete' || s.status === 'failed'
  )
  const allSuccessful = siteStatuses.every(s => s.status === 'complete')
  const someFailures = siteStatuses.some(s => s.status === 'failed')

  return (
    <Card className="border-clay-200 bg-cream-50">
      <CardHeader>
        <CardTitle className="text-clay-900">
          {allComplete
            ? allSuccessful
              ? 'Story Removed Successfully'
              : 'Removal Complete with Issues'
            : 'Removing Your Story'}
        </CardTitle>
        <CardDescription className="text-clay-700">
          {allComplete
            ? `"${storyTitle}" has been ${allSuccessful ? 'removed from all sites' : 'processed'}`
            : `Removing "${storyTitle}" from ${siteStatuses.length} ${siteStatuses.length === 1 ? 'site' : 'sites'}...`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-clay-700">Overall Progress</span>
            <span className="text-clay-900 font-medium">
              {Math.round(overallProgress)}%
            </span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Per-Site Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-clay-900">
            Removal Status by Site
          </h4>

          <div className="space-y-2">
            {siteStatuses.map(site => (
              <Card
                key={site.siteId}
                className={cn(
                  "border transition-colors",
                  site.status === 'complete' && "border-sage-200 bg-sage-50/50",
                  site.status === 'failed' && "border-ochre-200 bg-ochre-50/50",
                  (site.status === 'pending' || site.status === 'notifying' || site.status === 'verifying') && "border-clay-200"
                )}
              >
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1">
                      {getStatusIcon(site.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-clay-900 text-sm">
                            {site.siteName}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn("text-xs", getStatusColor(site.status))}
                          >
                            {site.status === 'pending' && 'Waiting'}
                            {site.status === 'notifying' && 'Notifying'}
                            {site.status === 'verifying' && 'Verifying'}
                            {site.status === 'complete' && 'Removed'}
                            {site.status === 'failed' && 'Failed'}
                          </Badge>
                        </div>
                        <p className="text-xs text-clay-600">
                          {site.message}
                        </p>
                        {site.retryCount && site.retryCount > 0 && (
                          <p className="text-xs text-ochre-700 mt-1">
                            Retry attempt {site.retryCount}
                          </p>
                        )}
                      </div>
                    </div>

                    {site.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRetry(site.siteId)}
                        className="border-ochre-300 text-ochre-700 hover:bg-ochre-50"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Retry
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Help Section for Failures */}
        {someFailures && (
          <Card className="border-sky-200 bg-sky-50">
            <CardContent className="pt-4">
              <div className="flex gap-3">
                <MessageCircle className="h-5 w-5 text-sky-700 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-medium text-sky-900 text-sm">
                    Need help with removal?
                  </p>
                  <p className="text-xs text-sky-800">
                    If a site hasn't removed your story within 5 minutes, please contact
                    our support team. We'll work with the site directly to ensure your
                    story is removed.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-sky-300 text-sky-700 hover:bg-sky-100"
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Contact Support
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Message */}
        {allSuccessful && (
          <Card className="border-sage-200 bg-sage-50">
            <CardContent className="pt-4">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-sage-700 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-sage-900 text-sm">
                    Your story has been removed
                  </p>
                  <p className="text-xs text-sage-800">
                    People can no longer view "{storyTitle}" on any of the sites you
                    stopped sharing with. You can share it again anytime you choose.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {allComplete && (
          <div className="flex justify-end">
            <Button
              onClick={onClose}
              className="bg-clay-600 hover:bg-clay-700 text-white"
            >
              Close
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

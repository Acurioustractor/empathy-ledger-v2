'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { TrendingUp, Plus, Calendar, Users, BookOpen, Edit, Trash2, Eye } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Campaign {
  id: string
  name: string
  description?: string
  start_date?: string
  end_date?: string
  status: 'draft' | 'active' | 'completed' | 'archived'
  story_count: number
  target_story_count?: number
  created_at: string
}

interface CampaignOrganizerProps {
  organizationId: string
  projectId?: string
  onCampaignUpdate: () => void
}

export function CampaignOrganizer({ organizationId, projectId, onCampaignUpdate }: CampaignOrganizerProps) {
  const { toast } = useToast()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)

  // Form state
  const [campaignName, setCampaignName] = useState('')
  const [campaignDescription, setCampaignDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [targetStoryCount, setTargetStoryCount] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCampaigns()
  }, [organizationId, projectId])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ organization_id: organizationId })
      if (projectId) params.set('project_id', projectId)

      const response = await fetch(`/api/curation/campaigns?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.campaigns || [])
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setCampaignName('')
    setCampaignDescription('')
    setStartDate('')
    setEndDate('')
    setTargetStoryCount('')
    setEditingCampaign(null)
  }

  const handleCreateCampaign = async () => {
    if (!campaignName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter a campaign name.',
        variant: 'destructive'
      })
      return
    }

    try {
      setSaving(true)

      const response = await fetch('/api/curation/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          organization_id: organizationId,
          project_id: projectId,
          name: campaignName.trim(),
          description: campaignDescription.trim() || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          target_story_count: targetStoryCount ? parseInt(targetStoryCount) : undefined,
          status: 'draft'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create campaign')
      }

      toast({
        title: 'Campaign Created',
        description: `"${campaignName}" has been created.`,
      })

      resetForm()
      setCreateDialogOpen(false)
      fetchCampaigns()
      onCampaignUpdate()
    } catch (error) {
      console.error('Failed to create campaign:', error)
      toast({
        title: 'Creation Failed',
        description: 'Unable to create campaign. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateCampaignStatus = async (campaignId: string, newStatus: Campaign['status']) => {
    try {
      const response = await fetch(`/api/curation/campaigns/${campaignId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      toast({
        title: 'Status Updated',
        description: `Campaign status changed to ${newStatus}.`,
      })

      fetchCampaigns()
      onCampaignUpdate()
    } catch (error) {
      console.error('Failed to update status:', error)
      toast({
        title: 'Update Failed',
        description: 'Unable to update campaign status.',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign? Stories will not be deleted.')) {
      return
    }

    try {
      const response = await fetch(`/api/curation/campaigns/${campaignId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to delete campaign')
      }

      toast({
        title: 'Campaign Deleted',
        description: 'Campaign has been deleted.',
      })

      fetchCampaigns()
      onCampaignUpdate()
    } catch (error) {
      console.error('Failed to delete campaign:', error)
      toast({
        title: 'Deletion Failed',
        description: 'Unable to delete campaign.',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-sage-600">Active</Badge>
      case 'completed':
        return <Badge className="bg-sky-600">Completed</Badge>
      case 'archived':
        return <Badge variant="outline">Archived</Badge>
      case 'draft':
      default:
        return <Badge variant="outline" className="border-clay-600 text-clay-600">Draft</Badge>
    }
  }

  const getProgress = (campaign: Campaign) => {
    if (!campaign.target_story_count) return null
    const percentage = Math.min(100, Math.round((campaign.story_count / campaign.target_story_count) * 100))
    return { percentage, color: percentage >= 100 ? 'sage' : percentage >= 50 ? 'amber' : 'clay' }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading campaigns...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Campaigns ({campaigns.length})</h2>
          <p className="text-sm text-muted-foreground">
            Organize stories into themed campaigns for specific audiences or time periods
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Campaign</DialogTitle>
              <DialogDescription>
                Set up a new storytelling campaign to organize related stories
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Campaign Name *</label>
                <Input
                  placeholder="e.g., Truth & Reconciliation Week 2026"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Brief description of this campaign's purpose..."
                  value={campaignDescription}
                  onChange={(e) => setCampaignDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Target Story Count</label>
                <Input
                  type="number"
                  placeholder="e.g., 20"
                  value={targetStoryCount}
                  onChange={(e) => setTargetStoryCount(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm()
                    setCreateDialogOpen(false)
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateCampaign} disabled={saving}>
                  {saving ? 'Creating...' : 'Create Campaign'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No Campaigns Yet</p>
            <p className="text-sm mt-1">Create your first campaign to organize stories</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map(campaign => {
            const progress = getProgress(campaign)
            return (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-base mb-2">{campaign.name}</CardTitle>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCampaign(campaign.id)}
                      >
                        <Trash2 className="h-4 w-4 text-ember-600" />
                      </Button>
                    </div>
                  </div>
                  {campaign.description && (
                    <CardDescription>{campaign.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Date Range */}
                  {(campaign.start_date || campaign.end_date) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {campaign.start_date && new Date(campaign.start_date).toLocaleDateString()}
                        {campaign.start_date && campaign.end_date && ' - '}
                        {campaign.end_date && new Date(campaign.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Story Count */}
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>{campaign.story_count}</strong>
                      {campaign.target_story_count && ` / ${campaign.target_story_count}`} stories
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {progress && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{progress.percentage}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-${progress.color}-600 transition-all`}
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Status Actions */}
                  {campaign.status !== 'archived' && (
                    <div className="flex gap-2">
                      {campaign.status === 'draft' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateCampaignStatus(campaign.id, 'active')}
                        >
                          Activate
                        </Button>
                      )}
                      {campaign.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateCampaignStatus(campaign.id, 'completed')}
                        >
                          Mark Complete
                        </Button>
                      )}
                      {campaign.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateCampaignStatus(campaign.id, 'archived')}
                        >
                          Archive
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

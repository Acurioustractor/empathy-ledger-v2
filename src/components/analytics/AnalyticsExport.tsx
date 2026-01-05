'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react'

interface AnalyticsExportProps {
  organizationId: string
  projectId?: string
}

type ExportFormat = 'csv' | 'pdf'
type DateRange = '7days' | '30days' | '90days' | 'all'

interface ExportOptions {
  format: ExportFormat
  dateRange: DateRange
  includeStories: boolean
  includeStorytellers: boolean
  includeThemes: boolean
  includeProjects: boolean
  includeCampaigns: boolean
  includeConsents: boolean
  includeReviews: boolean
}

export function AnalyticsExport({ organizationId, projectId }: AnalyticsExportProps) {
  const { toast } = useToast()
  const [exporting, setExporting] = useState(false)
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    dateRange: '30days',
    includeStories: true,
    includeStorytellers: true,
    includeThemes: true,
    includeProjects: true,
    includeCampaigns: false,
    includeConsents: false,
    includeReviews: false
  })

  const updateOption = <K extends keyof ExportOptions>(key: K, value: ExportOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const handleExport = async () => {
    // Validate at least one data type is selected
    const hasDataSelected =
      options.includeStories ||
      options.includeStorytellers ||
      options.includeThemes ||
      options.includeProjects ||
      options.includeCampaigns ||
      options.includeConsents ||
      options.includeReviews

    if (!hasDataSelected) {
      toast({
        title: 'No Data Selected',
        description: 'Please select at least one data type to export.',
        variant: 'destructive'
      })
      return
    }

    try {
      setExporting(true)

      const params = new URLSearchParams({
        organization_id: organizationId,
        format: options.format,
        date_range: options.dateRange,
        include_stories: options.includeStories.toString(),
        include_storytellers: options.includeStorytellers.toString(),
        include_themes: options.includeThemes.toString(),
        include_projects: options.includeProjects.toString(),
        include_campaigns: options.includeCampaigns.toString(),
        include_consents: options.includeConsents.toString(),
        include_reviews: options.includeReviews.toString()
      })

      if (projectId) params.set('project_id', projectId)

      const response = await fetch(`/api/analytics/export?${params.toString()}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="?(.+)"?/)
      const filename = filenameMatch?.[1] || `analytics-export-${Date.now()}.${options.format}`

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: 'Export Successful',
        description: `Analytics exported as ${options.format.toUpperCase()}.`,
      })
    } catch (error) {
      console.error('Export failed:', error)
      toast({
        title: 'Export Failed',
        description: 'Unable to export analytics. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setExporting(false)
    }
  }

  const getDateRangeLabel = (range: DateRange) => {
    switch (range) {
      case '7days': return 'Last 7 Days'
      case '30days': return 'Last 30 Days'
      case '90days': return 'Last 90 Days'
      case 'all': return 'All Time'
    }
  }

  const selectedCount = [
    options.includeStories,
    options.includeStorytellers,
    options.includeThemes,
    options.includeProjects,
    options.includeCampaigns,
    options.includeConsents,
    options.includeReviews
  ].filter(Boolean).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-sky-600" />
          Export Analytics
        </CardTitle>
        <CardDescription>
          Download analytics data in CSV or PDF format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Format */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 block">Export Format</Label>
            <Select
              value={options.format}
              onValueChange={(value: ExportFormat) => updateOption('format', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>CSV (Excel-compatible)</span>
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>PDF (Report format)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Date Range</Label>
            <Select
              value={options.dateRange}
              onValueChange={(value: DateRange) => updateOption('dateRange', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">{getDateRangeLabel('7days')}</SelectItem>
                <SelectItem value="30days">{getDateRangeLabel('30days')}</SelectItem>
                <SelectItem value="90days">{getDateRangeLabel('90days')}</SelectItem>
                <SelectItem value="all">{getDateRangeLabel('all')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Data Selection */}
        <div>
          <Label className="mb-3 block">
            Data to Include ({selectedCount} selected)
          </Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted">
              <Checkbox
                id="stories"
                checked={options.includeStories}
                onCheckedChange={(checked) => updateOption('includeStories', checked === true)}
              />
              <Label htmlFor="stories" className="flex-1 cursor-pointer">
                <div className="font-medium">Stories</div>
                <div className="text-xs text-muted-foreground">
                  Story titles, content, themes, and metadata
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted">
              <Checkbox
                id="storytellers"
                checked={options.includeStorytellers}
                onCheckedChange={(checked) => updateOption('includeStorytellers', checked === true)}
              />
              <Label htmlFor="storytellers" className="flex-1 cursor-pointer">
                <div className="font-medium">Storytellers</div>
                <div className="text-xs text-muted-foreground">
                  Storyteller profiles and contribution stats
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted">
              <Checkbox
                id="themes"
                checked={options.includeThemes}
                onCheckedChange={(checked) => updateOption('includeThemes', checked === true)}
              />
              <Label htmlFor="themes" className="flex-1 cursor-pointer">
                <div className="font-medium">Themes</div>
                <div className="text-xs text-muted-foreground">
                  Theme distribution and frequency analysis
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted">
              <Checkbox
                id="projects"
                checked={options.includeProjects}
                onCheckedChange={(checked) => updateOption('includeProjects', checked === true)}
              />
              <Label htmlFor="projects" className="flex-1 cursor-pointer">
                <div className="font-medium">Projects</div>
                <div className="text-xs text-muted-foreground">
                  Project details and story counts
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted">
              <Checkbox
                id="campaigns"
                checked={options.includeCampaigns}
                onCheckedChange={(checked) => updateOption('includeCampaigns', checked === true)}
              />
              <Label htmlFor="campaigns" className="flex-1 cursor-pointer">
                <div className="font-medium">Campaigns</div>
                <div className="text-xs text-muted-foreground">
                  Campaign performance and story assignments
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted">
              <Checkbox
                id="consents"
                checked={options.includeConsents}
                onCheckedChange={(checked) => updateOption('includeConsents', checked === true)}
              />
              <Label htmlFor="consents" className="flex-1 cursor-pointer">
                <div className="font-medium">Consents</div>
                <div className="text-xs text-muted-foreground">
                  Consent status and compliance metrics
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted">
              <Checkbox
                id="reviews"
                checked={options.includeReviews}
                onCheckedChange={(checked) => updateOption('includeReviews', checked === true)}
              />
              <Label htmlFor="reviews" className="flex-1 cursor-pointer">
                <div className="font-medium">Reviews</div>
                <div className="text-xs text-muted-foreground">
                  Elder reviews and quality review history
                </div>
              </Label>
            </div>
          </div>
        </div>

        {/* Export Summary */}
        <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg">
          <h4 className="font-medium text-sky-900 mb-2">Export Summary</h4>
          <div className="text-sm text-sky-800 space-y-1">
            <p>• Format: {options.format.toUpperCase()}</p>
            <p>• Date Range: {getDateRangeLabel(options.dateRange)}</p>
            <p>• Data Types: {selectedCount}</p>
          </div>
        </div>

        {/* Export Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleExport}
          disabled={exporting || selectedCount === 0}
        >
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export {options.format.toUpperCase()}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

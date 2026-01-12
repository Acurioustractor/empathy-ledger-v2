'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Download,
  Presentation,
  Code,
  DollarSign,
  Users,
  TrendingUp,
  Heart,
  BarChart3,
  Target,
  Sparkles
} from 'lucide-react'

interface FunderReportGeneratorProps {
  organizationId: string
  projectId?: string
}

export function FunderReportGenerator({ organizationId, projectId }: FunderReportGeneratorProps) {
  const [template, setTemplate] = useState<'standard' | 'impact' | 'sroi' | 'narrative'>('standard')
  const [dateRange, setDateRange] = useState<'quarter' | 'year' | 'custom'>('quarter')
  const [includeFinancials, setIncludeFinancials] = useState(true)
  const [includeStories, setIncludeStories] = useState(true)
  const [includeQuotes, setIncludeQuotes] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generatedReport, setGeneratedReport] = useState<any>(null)

  const handleGenerate = async () => {
    try {
      setGenerating(true)

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: organizationId,
          project_id: projectId,
          template,
          date_range: dateRange,
          include_financials: includeFinancials,
          include_stories: includeStories,
          include_quotes: includeQuotes
        })
      })

      if (!response.ok) throw new Error('Failed to generate report')

      const data = await response.json()
      setGeneratedReport(data.report)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  const handleExportPDF = async () => {
    try {
      const response = await fetch('/api/reports/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatedReport)
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `funder-report-${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Failed to export PDF')
    }
  }

  const handleExportPowerPoint = async () => {
    try {
      const response = await fetch('/api/reports/export/pptx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatedReport)
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `funder-report-${new Date().toISOString().split('T')[0]}.pptx`
      a.click()
    } catch (error) {
      console.error('Error exporting PowerPoint:', error)
      alert('Failed to export PowerPoint')
    }
  }

  const generateEmbedCode = () => {
    const embedCode = `<iframe src="https://your-platform.com/embed/report/${generatedReport?.id}" width="800" height="600" frameborder="0"></iframe>`
    navigator.clipboard.writeText(embedCode)
    alert('Embed code copied to clipboard!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Funder Report Generator</h2>
        <p className="text-sm text-gray-600">
          Create professional reports showcasing your impact and social value
        </p>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>Choose template and options for your report</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Report Template</Label>
            <Select value={template} onValueChange={(v: any) => setTemplate(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Standard Funder Report</span>
                  </div>
                </SelectItem>
                <SelectItem value="impact">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Impact-Focused Report</span>
                  </div>
                </SelectItem>
                <SelectItem value="sroi">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>SROI Report</span>
                  </div>
                </SelectItem>
                <SelectItem value="narrative">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    <span>Narrative Story Report</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Date Range</Label>
            <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Include in Report</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeFinancials}
                  onChange={(e) => setIncludeFinancials(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Financial data & SROI calculations</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeStories}
                  onChange={(e) => setIncludeStories(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Featured story arcs</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeQuotes}
                  onChange={(e) => setIncludeQuotes(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Community voice quotes</span>
              </label>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-clay-600 hover:bg-clay-700"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Report...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Preview & Export */}
      {generatedReport && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>Review and export your report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Executive Summary */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Executive Summary</h3>
                <p className="text-sm text-gray-700">
                  {generatedReport.executive_summary ||
                    'Your organization has made significant impact through storytelling, engaging X storytellers, collecting Y stories, and demonstrating measurable social value through SROI analysis.'}
                </p>
              </div>

              {/* Key Metrics */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Key Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gradient-to-br from-clay-50 to-white border border-clay-200 rounded-lg">
                    <Users className="w-6 h-6 text-clay-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {generatedReport.metrics?.storytellers || 42}
                    </p>
                    <p className="text-xs text-gray-600">Storytellers</p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-sage-50 to-white border border-sage-200 rounded-lg">
                    <FileText className="w-6 h-6 text-sage-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {generatedReport.metrics?.stories || 156}
                    </p>
                    <p className="text-xs text-gray-600">Stories Collected</p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-sky-50 to-white border border-sky-200 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-sky-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {generatedReport.metrics?.sroi_ratio || '3.2:1'}
                    </p>
                    <p className="text-xs text-gray-600">SROI Ratio</p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-ember-50 to-white border border-ember-200 rounded-lg">
                    <Target className="w-6 h-6 text-ember-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      ${generatedReport.metrics?.social_value || '450K'}
                    </p>
                    <p className="text-xs text-gray-600">Social Value</p>
                  </div>
                </div>
              </div>

              {/* Featured Stories */}
              {includeStories && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Featured Story Arcs</h3>
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-sm mb-1">Story Arc {i}</h4>
                        <p className="text-xs text-gray-600">
                          Compelling narrative showcasing transformation and impact...
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Export Actions */}
              <div className="pt-4 border-t space-y-3">
                <h3 className="font-semibold text-lg">Export Report</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button onClick={handleExportPDF} variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export as PDF
                  </Button>

                  <Button onClick={handleExportPowerPoint} variant="outline" className="w-full">
                    <Presentation className="w-4 h-4 mr-2" />
                    Export as PowerPoint
                  </Button>

                  <Button onClick={generateEmbedCode} variant="outline" className="w-full">
                    <Code className="w-4 h-4 mr-2" />
                    Get Embed Code
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Templates Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Template Descriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <FileText className="w-5 h-5 text-clay-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">Standard Funder Report</h4>
              <p className="text-xs text-gray-600">
                Balanced report with metrics, stories, and financial data
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-sky-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">Impact-Focused Report</h4>
              <p className="text-xs text-gray-600">
                Emphasizes outcomes, ripple effects, and community change
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">SROI Report</h4>
              <p className="text-xs text-gray-600">
                Detailed social return on investment calculations and analysis
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Heart className="w-5 h-5 text-pink-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">Narrative Story Report</h4>
              <p className="text-xs text-gray-600">
                Story-driven report with emotional journey and quotes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

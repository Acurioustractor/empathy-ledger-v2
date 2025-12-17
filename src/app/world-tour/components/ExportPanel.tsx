'use client'

import { useState, useCallback } from 'react'
import {
  Download, FileText, FileSpreadsheet, FileJson,
  Loader2, CheckCircle2, AlertCircle, Calendar
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface ExportPanelProps {
  analyticsData: any
  className?: string
}

type ExportFormat = 'csv' | 'json' | 'pdf'
type DataSection = 'consent' | 'engagement' | 'quality' | 'equity' | 'timeline' | 'comparison'

const SECTIONS: Array<{ id: DataSection; label: string; description: string }> = [
  { id: 'consent', label: 'Consent & Privacy', description: 'Storyteller consent status and privacy settings' },
  { id: 'engagement', label: 'Engagement Metrics', description: 'Views, shares, and interaction data' },
  { id: 'quality', label: 'Story Quality', description: 'Completeness scores and content metrics' },
  { id: 'equity', label: 'Equity & Representation', description: 'Diversity and representation data' },
  { id: 'timeline', label: 'Timeline Data', description: 'Historical growth and trends' },
  { id: 'comparison', label: 'Comparison Data', description: 'Regional and thematic comparisons' }
]

export function ExportPanel({ analyticsData, className }: ExportPanelProps) {
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [selectedSections, setSelectedSections] = useState<DataSection[]>(['consent', 'engagement', 'quality'])
  const [exporting, setExporting] = useState(false)
  const [exportResult, setExportResult] = useState<{ success: boolean; message: string } | null>(null)

  const toggleSection = useCallback((section: DataSection) => {
    setSelectedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }, [])

  const handleExport = useCallback(async () => {
    if (selectedSections.length === 0) {
      setExportResult({ success: false, message: 'Please select at least one section to export' })
      return
    }

    setExporting(true)
    setExportResult(null)

    try {
      // Prepare data for export
      const exportData: Record<string, any> = {}
      selectedSections.forEach(section => {
        if (analyticsData?.[section]) {
          exportData[section] = analyticsData[section]
        }
      })

      let content: string
      let mimeType: string
      let extension: string

      switch (format) {
        case 'json':
          content = JSON.stringify(exportData, null, 2)
          mimeType = 'application/json'
          extension = 'json'
          break

        case 'csv':
          content = convertToCSV(exportData)
          mimeType = 'text/csv'
          extension = 'csv'
          break

        case 'pdf':
          // For PDF, we'll generate an HTML report that can be printed as PDF
          content = generateHTMLReport(exportData, selectedSections)
          mimeType = 'text/html'
          extension = 'html'
          break

        default:
          throw new Error('Unsupported format')
      }

      // Create and download the file
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `world-tour-analytics-${new Date().toISOString().split('T')[0]}.${extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setExportResult({ success: true, message: `Successfully exported ${selectedSections.length} section(s) as ${format.toUpperCase()}` })
    } catch (error) {
      console.error('Export error:', error)
      setExportResult({ success: false, message: 'Failed to export data. Please try again.' })
    } finally {
      setExporting(false)
    }
  }, [format, selectedSections, analyticsData])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-500" />
          Export Analytics
        </CardTitle>
        <CardDescription>
          Download analytics data for reporting and analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div className="space-y-2">
          <Label>Export Format</Label>
          <div className="grid grid-cols-3 gap-3">
            <FormatButton
              format="csv"
              icon={<FileSpreadsheet className="w-4 h-4" />}
              label="CSV"
              description="Spreadsheet"
              selected={format === 'csv'}
              onClick={() => setFormat('csv')}
            />
            <FormatButton
              format="json"
              icon={<FileJson className="w-4 h-4" />}
              label="JSON"
              description="Raw data"
              selected={format === 'json'}
              onClick={() => setFormat('json')}
            />
            <FormatButton
              format="pdf"
              icon={<FileText className="w-4 h-4" />}
              label="Report"
              description="Printable"
              selected={format === 'pdf'}
              onClick={() => setFormat('pdf')}
            />
          </div>
        </div>

        {/* Section Selection */}
        <div className="space-y-3">
          <Label>Data Sections</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SECTIONS.map(section => (
              <div
                key={section.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  selectedSections.includes(section.id)
                    ? "border-blue-300 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-950/30"
                    : "hover:border-stone-300 dark:hover:border-stone-600"
                )}
                onClick={() => toggleSection(section.id)}
              >
                <Checkbox
                  checked={selectedSections.includes(section.id)}
                  onCheckedChange={() => toggleSection(section.id)}
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">{section.label}</div>
                  <div className="text-xs text-muted-foreground">{section.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <div className="flex items-center gap-4">
          <Button
            onClick={handleExport}
            disabled={exporting || selectedSections.length === 0}
            className="flex-1"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export {selectedSections.length} Section{selectedSections.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
          <Badge variant="secondary" className="whitespace-nowrap">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date().toLocaleDateString()}
          </Badge>
        </div>

        {/* Result Message */}
        {exportResult && (
          <div
            className={cn(
              "flex items-center gap-2 p-3 rounded-lg text-sm",
              exportResult.success
                ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
            )}
          >
            {exportResult.success ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {exportResult.message}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function FormatButton({
  format,
  icon,
  label,
  description,
  selected,
  onClick
}: {
  format: ExportFormat
  icon: React.ReactNode
  label: string
  description: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-3 rounded-lg border text-left transition-colors",
        selected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
          : "hover:border-stone-300 dark:hover:border-stone-600"
      )}
    >
      <div className={cn("mb-1", selected ? "text-blue-600" : "text-muted-foreground")}>
        {icon}
      </div>
      <div className="font-medium text-sm">{label}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </button>
  )
}

// Convert nested object to CSV format
function convertToCSV(data: Record<string, any>): string {
  const rows: string[] = []

  Object.entries(data).forEach(([section, sectionData]) => {
    rows.push(`\n# ${section.toUpperCase()}`)
    rows.push('')

    if (typeof sectionData === 'object' && sectionData !== null) {
      // Handle arrays
      if (Array.isArray(sectionData)) {
        if (sectionData.length > 0) {
          const headers = Object.keys(sectionData[0])
          rows.push(headers.join(','))
          sectionData.forEach(item => {
            rows.push(headers.map(h => JSON.stringify(item[h] ?? '')).join(','))
          })
        }
      } else {
        // Handle objects with nested data
        Object.entries(sectionData).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
            rows.push(`\n## ${key}`)
            const headers = Object.keys(value[0])
            rows.push(headers.join(','))
            value.forEach((item: any) => {
              rows.push(headers.map(h => JSON.stringify(item[h] ?? '')).join(','))
            })
          } else if (typeof value === 'object' && value !== null) {
            rows.push(`${key},${JSON.stringify(value)}`)
          } else {
            rows.push(`${key},${value}`)
          }
        })
      }
    }
  })

  return rows.join('\n')
}

// Generate HTML report for PDF export
function generateHTMLReport(data: Record<string, any>, sections: DataSection[]): string {
  const sectionLabels: Record<DataSection, string> = {
    consent: 'Consent & Privacy',
    engagement: 'Engagement Metrics',
    quality: 'Story Quality',
    equity: 'Equity & Representation',
    timeline: 'Timeline Data',
    comparison: 'Comparison Data'
  }

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>World Tour Analytics Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #1a1a1a;
    }
    h1 { color: #C45B28; border-bottom: 2px solid #C45B28; padding-bottom: 10px; }
    h2 { color: #4A7C59; margin-top: 30px; }
    h3 { color: #666; }
    .meta { color: #666; margin-bottom: 30px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e5e5; }
    th { background: #f5f5f5; font-weight: 600; }
    .stat { display: inline-block; margin: 10px 20px 10px 0; }
    .stat-value { font-size: 24px; font-weight: bold; color: #C45B28; }
    .stat-label { font-size: 12px; color: #666; }
    .section { page-break-inside: avoid; margin-bottom: 40px; }
    @media print {
      body { padding: 20px; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>World Tour Analytics Report</h1>
  <p class="meta">Generated on ${new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}</p>
`

  sections.forEach(section => {
    const sectionData = data[section]
    if (!sectionData) return

    html += `<div class="section"><h2>${sectionLabels[section]}</h2>`

    // Render key metrics as stats
    const simpleMetrics = Object.entries(sectionData)
      .filter(([, value]) => typeof value === 'number' || typeof value === 'string')

    if (simpleMetrics.length > 0) {
      html += '<div>'
      simpleMetrics.forEach(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
        html += `<div class="stat"><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>`
      })
      html += '</div>'
    }

    // Render arrays as tables
    const arrayMetrics = Object.entries(sectionData)
      .filter(([, value]) => Array.isArray(value) && value.length > 0)

    arrayMetrics.forEach(([key, value]) => {
      const arr = value as any[]
      if (arr.length === 0 || typeof arr[0] !== 'object') return

      const headers = Object.keys(arr[0])
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())

      html += `<h3>${label}</h3><table><thead><tr>`
      headers.forEach(h => {
        html += `<th>${h.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</th>`
      })
      html += '</tr></thead><tbody>'
      arr.slice(0, 20).forEach(row => {
        html += '<tr>'
        headers.forEach(h => {
          html += `<td>${row[h] ?? '-'}</td>`
        })
        html += '</tr>'
      })
      html += '</tbody></table>'
    })

    html += '</div>'
  })

  html += `
  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; font-size: 12px;">
    <p>Empathy Ledger World Tour - Analytics Report</p>
    <p>This report was automatically generated. For the most current data, visit the World Tour insights dashboard.</p>
  </footer>
</body>
</html>`

  return html
}

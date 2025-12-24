'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import {
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  Loader2,
  CheckCircle
} from 'lucide-react'
import { exportData, formatStorytellerExport, formatStoryExport, batchExport } from '@/lib/utils/export'

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dataType: 'storytellers' | 'stories' | 'projects' | 'organisations'
  data?: any[]
  fetchFunction?: (page: number) => Promise<any[]>
}

export default function ExportModal({
  open,
  onOpenChange,
  dataType,
  data,
  fetchFunction
}: ExportModalProps) {
  const [format, setFormat] = useState<'csv' | 'json' | 'pdf'>('csv')
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportComplete, setExportComplete] = useState(false)

  // Field options based on data type
  const fieldOptions = {
    storytellers: [
      { id: 'name', label: 'Name', default: true },
      { id: 'email', label: 'Email', default: true },
      { id: 'culturalBackground', label: 'Cultural Background', default: true },
      { id: 'location', label: 'Location', default: true },
      { id: 'organisation', label: 'Organization', default: true },
      { id: 'storyCount', label: 'Story Count', default: true },
      { id: 'engagementRate', label: 'Engagement Rate', default: true },
      { id: 'status', label: 'Status', default: true },
      { id: 'createdAt', label: 'Join Date', default: false },
      { id: 'lastActive', label: 'Last Active', default: false },
    ],
    stories: [
      { id: 'title', label: 'Title', default: true },
      { id: 'author', label: 'Author', default: true },
      { id: 'status', label: 'Status', default: true },
      { id: 'views', label: 'Views', default: true },
      { id: 'likes', label: 'Likes', default: true },
      { id: 'comments', label: 'Comments', default: true },
      { id: 'publishedDate', label: 'Published Date', default: true },
      { id: 'tags', label: 'Tags', default: false },
      { id: 'culturalSensitivity', label: 'Cultural Sensitivity', default: false },
    ],
    projects: [
      { id: 'name', label: 'Name', default: true },
      { id: 'description', label: 'Description', default: true },
      { id: 'status', label: 'Status', default: true },
      { id: 'organisation', label: 'Organization', default: true },
      { id: 'participantCount', label: 'Participants', default: true },
      { id: 'createdAt', label: 'Created Date', default: true },
    ],
    organisations: [
      { id: 'name', label: 'Name', default: true },
      { id: 'type', label: 'Type', default: true },
      { id: 'location', label: 'Location', default: true },
      { id: 'memberCount', label: 'Members', default: true },
      { id: 'projectCount', label: 'Projects', default: true },
      { id: 'createdAt', label: 'Created Date', default: true },
    ],
  }

  const fields = fieldOptions[dataType] || []

  // Initialize selected fields
  React.useEffect(() => {
    setSelectedFields(fields.filter(f => f.default).map(f => f.id))
  }, [dataType])

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)
    setExportComplete(false)

    try {
      let exportableData = data

      // If we have a fetch function, use batch export
      if (!exportableData && fetchFunction) {
        const count = await batchExport(fetchFunction, {
          format,
          fields: selectedFields,
          filename: `${dataType}-export`,
          onProgress: setExportProgress
        })
        
        toast.success(`Exported ${count} ${dataType}`)
      } else if (exportableData) {
        // Format data based on type
        if (dataType === 'storytellers') {
          exportableData = formatStorytellerExport(exportableData)
        } else if (dataType === 'stories') {
          exportableData = formatStoryExport(exportableData)
        }

        // Export the data
        await exportData(exportableData, {
          format,
          fields: selectedFields,
          filename: `${dataType}-export`
        })
        
        setExportProgress(100)
        toast.success(`Exported ${exportableData.length} ${dataType}`)
      }

      setExportComplete(true)
      setTimeout(() => {
        onOpenChange(false)
        setExportComplete(false)
        setExportProgress(0)
      }, 1500)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    )
  }

  const selectAll = () => {
    setSelectedFields(fields.map(f => f.id))
  }

  const deselectAll = () => {
    setSelectedFields([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export {dataType}</DialogTitle>
          <DialogDescription>
            Choose your export format and select which fields to include
          </DialogDescription>
        </DialogHeader>

        {!isExporting && !exportComplete && (
          <>
            {/* Format Selection */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium mb-3 block">Export Format</Label>
                <RadioGroup value={format} onValueChange={(v) => setFormat(v as any)}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-stone-50">
                    <RadioGroupItem value="csv" id="csv" />
                    <Label htmlFor="csv" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">CSV</p>
                          <p className="text-sm text-stone-500">Best for Excel, Google Sheets</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-stone-50">
                    <RadioGroupItem value="json" id="json" />
                    <Label htmlFor="json" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <FileJson className="h-5 w-5 text-sage-600" />
                        <div>
                          <p className="font-medium">JSON</p>
                          <p className="text-sm text-stone-500">Best for developers, APIs</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-stone-50">
                    <RadioGroupItem value="pdf" id="pdf" />
                    <Label htmlFor="pdf" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium">PDF</p>
                          <p className="text-sm text-stone-500">Best for printing, reports</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Field Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-medium">Fields to Export</Label>
                  <div className="flex gap-2">
                    <Button variant="link" size="sm" onClick={selectAll}>
                      Select all
                    </Button>
                    <Button variant="link" size="sm" onClick={deselectAll}>
                      Deselect all
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                  {fields.map(field => (
                    <div key={field.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={field.id}
                        checked={selectedFields.includes(field.id)}
                        onCheckedChange={() => toggleField(field.id)}
                      />
                      <Label
                        htmlFor={field.id}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {field.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={selectedFields.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Export Progress */}
        {isExporting && (
          <div className="py-8 space-y-4">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
              <div className="text-center">
                <p className="font-medium">Exporting {dataType}...</p>
                <p className="text-sm text-stone-500 mt-1">This may take a few moments</p>
              </div>
              <Progress value={exportProgress} className="w-full" />
              <p className="text-sm text-stone-500">{Math.round(exportProgress)}%</p>
            </div>
          </div>
        )}

        {/* Export Complete */}
        {exportComplete && (
          <div className="py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-center">
                <p className="font-medium text-lg">Export Complete!</p>
                <p className="text-sm text-stone-500 mt-1">
                  Your file has been downloaded
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Download } from 'lucide-react'

interface ReportBuilderProps {
  organizationId: string
}

export function ReportBuilder({ organizationId }: ReportBuilderProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-sky-500" />
            Custom Report Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Report Template</label>
            <Select>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="funder">Funder Report</SelectItem>
                <SelectItem value="annual">Annual Impact Report</SelectItem>
                <SelectItem value="cultural">Cultural Preservation Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

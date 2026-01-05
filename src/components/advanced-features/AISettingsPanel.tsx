'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Shield } from 'lucide-react'

interface AISettingsPanelProps {
  organizationId: string
}

export function AISettingsPanel({ organizationId }: AISettingsPanelProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-sage-500" />
            AI Analysis Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>AI Model</Label>
            <Select defaultValue="claude-3-sonnet">
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude-3-sonnet">Claude 3 Sonnet (Recommended)</SelectItem>
                <SelectItem value="gpt-4">GPT-4 Turbo</SelectItem>
                <SelectItem value="local">Local Model (Coming Soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="ai-opt-in" defaultChecked />
            <Label htmlFor="ai-opt-in">Enable AI analysis for my stories</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="exclude-sacred" defaultChecked />
            <Label htmlFor="exclude-sacred">Exclude sacred content from AI analysis</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="require-approval" defaultChecked />
            <Label htmlFor="require-approval">Require approval for AI suggestions</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

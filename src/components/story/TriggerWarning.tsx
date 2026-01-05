'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

interface TriggerWarningProps {
  warnings: string[]
  className?: string
}

export function TriggerWarning({ warnings, className }: TriggerWarningProps) {
  if (!warnings || warnings.length === 0) {
    return null
  }

  return (
    <Card className="p-5 bg-amber-50 border-2 border-amber-200">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <h4 className="font-semibold text-amber-900">Content Warning</h4>
          <p className="text-sm text-amber-800 leading-relaxed">
            This story contains content that may be sensitive or triggering for some readers:
          </p>
          <ul className="space-y-1">
            {warnings.map((warning, index) => (
              <li
                key={index}
                className="text-sm text-amber-800 flex items-start gap-2"
              >
                <span>•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-amber-700 italic pt-2">
            Please proceed with caution and care for your wellbeing.
          </p>
        </div>
      </div>
    </Card>
  )
}

'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PublishingChecklistProps {
  story: any
  onComplete: (isComplete: boolean) => void
}

export function PublishingChecklist({ story, onComplete }: PublishingChecklistProps) {
  const checks = [
    { id: 'title', label: 'Story has a title', required: true, passed: story.title?.trim().length > 0 },
    { id: 'content', label: 'Story has content', required: true, passed: story.content?.trim().length > 50 },
    { id: 'tags', label: 'Cultural themes selected', required: true, passed: story.cultural_tags?.length > 0 },
    { id: 'sensitivity', label: 'Sensitivity level set', required: true, passed: !!story.sensitivity_level },
    { id: 'excerpt', label: 'Story has excerpt', required: false, passed: story.excerpt?.trim().length > 0 },
    { id: 'image', label: 'Featured image uploaded', required: false, passed: !!story.featured_image_url }
  ]

  const requiredPassed = checks.filter(c => c.required && c.passed).length
  const requiredTotal = checks.filter(c => c.required).length
  const allRequiredPassed = requiredPassed === requiredTotal

  useEffect(() => {
    onComplete(allRequiredPassed)
  }, [allRequiredPassed, onComplete])

  return (
    <div className="space-y-6">
      <Card className={cn(
        "p-5 border-2",
        allRequiredPassed ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
      )}>
        <div className="flex items-start gap-3">
          {allRequiredPassed ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          )}
          <div>
            <h4 className="font-semibold">{allRequiredPassed ? 'Ready to Publish' : 'Complete Required Items'}</h4>
            <p className="text-sm mt-1">
              {allRequiredPassed ? 'All required items complete' : `Complete ${requiredTotal - requiredPassed} more items`}
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        {checks.map(check => (
          <Card key={check.id} className={cn("p-4 border-2", check.passed && "border-green-200 bg-green-50")}>
            <div className="flex items-center gap-3">
              {check.passed ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-sm">{check.label}</span>
              {check.required && <Badge variant="outline" className="text-xs">Required</Badge>}
            </div>
          </Card>
        ))}
      </div>

      {story.sensitivity_level === 'sacred' && (
        <Card className="p-5 bg-amber-50 border-2 border-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-600 mb-2" />
          <p className="font-semibold text-amber-900">Elder Review Required</p>
          <p className="text-sm text-amber-800 mt-1">Sacred content requires Elder approval before publishing.</p>
        </Card>
      )}
    </div>
  )
}

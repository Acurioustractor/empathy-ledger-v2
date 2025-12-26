'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { CheckCircle2, Circle, Clock, UserCheck, FileCheck, Eye, Globe, XCircle } from 'lucide-react'

export type WorkflowStage = 'invited' | 'interested' | 'consented' | 'recorded' | 'reviewed' | 'published' | 'withdrawn'

interface WorkflowPipelineProps {
  currentStage: WorkflowStage
  counts?: {
    invited: number
    interested: number
    consented: number
    recorded: number
    reviewed: number
    published: number
    withdrawn: number
  }
  onStageClick?: (stage: WorkflowStage) => void
  className?: string
}

const stages: { stage: WorkflowStage; label: string; icon: any; color: string }[] = [
  { stage: 'invited', label: 'Invited', icon: Circle, color: 'text-gray-500' },
  { stage: 'interested', label: 'Interested', icon: Clock, color: 'text-blue-500' },
  { stage: 'consented', label: 'Consented', icon: UserCheck, color: 'text-green-500' },
  { stage: 'recorded', label: 'Recorded', icon: FileCheck, color: 'text-purple-500' },
  { stage: 'reviewed', label: 'Reviewed', icon: Eye, color: 'text-orange-500' },
  { stage: 'published', label: 'Published', icon: Globe, color: 'text-emerald-500' },
]

export function WorkflowPipeline({ currentStage, counts, onStageClick, className }: WorkflowPipelineProps) {
  const currentIndex = stages.findIndex(s => s.stage === currentStage)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Workflow Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-2">
          {stages.map((stageInfo, index) => {
            const Icon = stageInfo.icon
            const isCompleted = index < currentIndex
            const isCurrent = index === currentIndex
            const isUpcoming = index > currentIndex
            const count = counts?.[stageInfo.stage] || 0

            return (
              <div key={stageInfo.stage} className="flex items-center flex-1">
                {/* Stage circle */}
                <button
                  onClick={() => onStageClick?.(stageInfo.stage)}
                  className={cn(
                    'flex flex-col items-center gap-1 transition-all',
                    onStageClick && 'hover:scale-110 cursor-pointer'
                  )}
                >
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all',
                      isCompleted && 'bg-green-500 border-green-500 text-white',
                      isCurrent && 'bg-primary border-primary text-primary-foreground animate-pulse',
                      isUpcoming && 'bg-muted border-muted-foreground/20 text-muted-foreground'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    'text-xs font-medium',
                    isCurrent && 'text-primary font-semibold'
                  )}>
                    {stageInfo.label}
                  </span>
                  {counts && count > 0 && (
                    <Badge variant={isCurrent ? 'default' : 'secondary'} className="text-xs">
                      {count}
                    </Badge>
                  )}
                </button>

                {/* Connector line */}
                {index < stages.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2">
                    <div
                      className={cn(
                        'h-full transition-all',
                        isCompleted ? 'bg-green-500' : 'bg-muted'
                      )}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Withdrawn indicator (if applicable) */}
        {currentStage === 'withdrawn' && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
            <XCircle className="w-5 h-5 text-destructive" />
            <span className="text-sm text-destructive font-medium">Consent Withdrawn</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

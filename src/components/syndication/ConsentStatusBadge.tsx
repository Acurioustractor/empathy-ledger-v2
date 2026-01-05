'use client'

import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ConsentStatus = 'approved' | 'pending' | 'revoked' | 'expired'

interface ConsentStatusBadgeProps {
  status: ConsentStatus
  className?: string
}

const statusConfig = {
  approved: {
    color: 'bg-sage-100 text-sage-900 border-sage-300',
    icon: CheckCircle,
    label: 'Active'
  },
  pending: {
    color: 'bg-amber-100 text-amber-900 border-amber-300',
    icon: Clock,
    label: 'Pending'
  },
  revoked: {
    color: 'bg-ember-100 text-ember-900 border-ember-300',
    icon: XCircle,
    label: 'Revoked'
  },
  expired: {
    color: 'bg-muted text-muted-foreground border-border',
    icon: AlertCircle,
    label: 'Expired'
  }
} as const

export function ConsentStatusBadge({ status, className }: ConsentStatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={cn(
        'flex items-center gap-1.5 font-medium',
        config.color,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

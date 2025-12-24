'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Lock,
  Eye,
  EyeOff,
  Users,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'

/**
 * Cultural sensitivity levels
 */
export type CulturalSensitivityLevel = 'standard' | 'medium' | 'high' | 'sacred'

/**
 * Elder review status values
 */
export type ElderReviewStatus = 'not_required' | 'pending' | 'in_review' | 'approved' | 'rejected'

/**
 * Props for CulturalStatusBadge
 */
export interface CulturalStatusBadgeProps {
  /** Cultural sensitivity level of the content */
  sensitivityLevel?: CulturalSensitivityLevel | string | null
  /** Whether elder approval has been granted */
  elderApproval?: boolean | null
  /** Current elder review status */
  elderReviewStatus?: ElderReviewStatus | string | null
  /** Whether elder review is required */
  requiresElderReview?: boolean | null
  /** Display size */
  size?: 'sm' | 'default' | 'lg'
  /** Show detailed view with all status info */
  detailed?: boolean
  /** Show distribution restriction info */
  showDistributionStatus?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Configuration for each sensitivity level
 */
const sensitivityConfig: Record<CulturalSensitivityLevel, {
  label: string
  icon: React.ElementType
  colorClass: string
  bgClass: string
  borderClass: string
  description: string
}> = {
  standard: {
    label: 'Standard',
    icon: Shield,
    colorClass: 'text-sage-700 dark:text-sage-300',
    bgClass: 'bg-sage-50 dark:bg-sage-950/30',
    borderClass: 'border-sage-200 dark:border-sage-800',
    description: 'General content suitable for public distribution'
  },
  medium: {
    label: 'Medium',
    icon: ShieldAlert,
    colorClass: 'text-amber-700 dark:text-amber-300',
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    borderClass: 'border-amber-200 dark:border-amber-800',
    description: 'Content with cultural significance requiring care'
  },
  high: {
    label: 'High',
    icon: ShieldX,
    colorClass: 'text-orange-700 dark:text-orange-300',
    bgClass: 'bg-orange-50 dark:bg-orange-950/30',
    borderClass: 'border-orange-200 dark:border-orange-800',
    description: 'Elder approval required for external distribution'
  },
  sacred: {
    label: 'Sacred',
    icon: Lock,
    colorClass: 'text-red-700 dark:text-red-300',
    bgClass: 'bg-red-50 dark:bg-red-950/30',
    borderClass: 'border-red-200 dark:border-red-800',
    description: 'Protected content - cannot be distributed externally'
  }
}

/**
 * Configuration for elder approval status
 */
const elderStatusConfig: Record<string, {
  label: string
  icon: React.ElementType
  colorClass: string
}> = {
  not_required: {
    label: 'Review Not Required',
    icon: CheckCircle2,
    colorClass: 'text-stone-500'
  },
  pending: {
    label: 'Awaiting Review',
    icon: AlertTriangle,
    colorClass: 'text-amber-500'
  },
  in_review: {
    label: 'Under Review',
    icon: Eye,
    colorClass: 'text-sage-500'
  },
  approved: {
    label: 'Elder Approved',
    icon: ShieldCheck,
    colorClass: 'text-green-500'
  },
  rejected: {
    label: 'Review Rejected',
    icon: EyeOff,
    colorClass: 'text-red-500'
  }
}

/**
 * CulturalStatusBadge - Displays cultural sensitivity and elder approval status
 *
 * Used throughout the platform to communicate content restrictions and
 * distribution permissions based on OCAP (Ownership, Control, Access, Possession) principles.
 */
export function CulturalStatusBadge({
  sensitivityLevel = 'standard',
  elderApproval,
  elderReviewStatus,
  requiresElderReview,
  size = 'default',
  detailed = false,
  showDistributionStatus = false,
  className
}: CulturalStatusBadgeProps) {
  // Normalize sensitivity level
  const normalizedLevel = (sensitivityLevel?.toLowerCase() || 'standard') as CulturalSensitivityLevel
  const config = sensitivityConfig[normalizedLevel] || sensitivityConfig.standard
  const SensitivityIcon = config.icon

  // Determine elder status
  const getElderStatus = (): string => {
    if (!requiresElderReview && normalizedLevel !== 'high' && normalizedLevel !== 'sacred') {
      return 'not_required'
    }
    if (elderApproval === true) {
      return 'approved'
    }
    if (elderReviewStatus) {
      return elderReviewStatus
    }
    return 'pending'
  }

  const elderStatus = getElderStatus()
  const elderConfig = elderStatusConfig[elderStatus] || elderStatusConfig.pending
  const ElderIcon = elderConfig.icon

  // Determine distribution status
  const canDistribute = (): { allowed: boolean; reason: string } => {
    if (normalizedLevel === 'sacred') {
      return { allowed: false, reason: 'Sacred content cannot be distributed externally' }
    }
    if (normalizedLevel === 'high' && !elderApproval) {
      return { allowed: false, reason: 'Requires elder approval for distribution' }
    }
    if (requiresElderReview && elderStatus !== 'approved' && elderStatus !== 'not_required') {
      return { allowed: false, reason: 'Pending elder review' }
    }
    return { allowed: true, reason: 'Available for distribution' }
  }

  const distributionStatus = canDistribute()

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    default: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    default: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  if (detailed) {
    return (
      <div className={cn('space-y-2', className)}>
        {/* Sensitivity Level Badge */}
        <div
          className={cn(
            'inline-flex items-center rounded-lg border',
            sizeClasses[size],
            config.bgClass,
            config.borderClass,
            config.colorClass
          )}
        >
          <SensitivityIcon className={iconSizes[size]} />
          <span className="font-medium">{config.label} Sensitivity</span>
        </div>

        {/* Elder Status Badge */}
        {(requiresElderReview || normalizedLevel === 'high' || normalizedLevel === 'sacred') && (
          <div
            className={cn(
              'inline-flex items-center rounded-lg border border-stone-200 dark:border-gray-700',
              'bg-stone-50 dark:bg-stone-900/30',
              sizeClasses[size],
              elderConfig.colorClass
            )}
          >
            <ElderIcon className={iconSizes[size]} />
            <span className="font-medium">{elderConfig.label}</span>
          </div>
        )}

        {/* Distribution Status */}
        {showDistributionStatus && (
          <div
            className={cn(
              'inline-flex items-center rounded-lg border',
              sizeClasses[size],
              distributionStatus.allowed
                ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300'
                : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300'
            )}
          >
            {distributionStatus.allowed ? (
              <Eye className={iconSizes[size]} />
            ) : (
              <EyeOff className={iconSizes[size]} />
            )}
            <span className="font-medium">
              {distributionStatus.allowed ? 'Can Distribute' : 'Distribution Blocked'}
            </span>
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-muted-foreground mt-1">
          {config.description}
        </p>
      </div>
    )
  }

  // Compact single badge view
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border',
        sizeClasses[size],
        config.bgClass,
        config.borderClass,
        config.colorClass,
        className
      )}
      title={`${config.label} sensitivity - ${config.description}`}
    >
      <SensitivityIcon className={iconSizes[size]} />
      <span className="font-medium">{config.label}</span>

      {/* Show elder status indicator for high/sacred */}
      {(normalizedLevel === 'high' || normalizedLevel === 'sacred') && (
        <span
          className={cn(
            'ml-1 inline-flex items-center',
            elderStatus === 'approved' ? 'text-green-500' : 'text-amber-500'
          )}
          title={elderConfig.label}
        >
          <ElderIcon className={cn(iconSizes[size], 'ml-0.5')} />
        </span>
      )}
    </div>
  )
}

/**
 * Compact sensitivity indicator for lists and cards
 */
export function SensitivityIndicator({
  level,
  className
}: {
  level?: CulturalSensitivityLevel | string | null
  className?: string
}) {
  const normalizedLevel = (level?.toLowerCase() || 'standard') as CulturalSensitivityLevel
  const config = sensitivityConfig[normalizedLevel] || sensitivityConfig.standard
  const Icon = config.icon

  return (
    <div
      className={cn('inline-flex items-center', config.colorClass, className)}
      title={`${config.label} sensitivity`}
    >
      <Icon className="h-4 w-4" />
    </div>
  )
}

/**
 * Distribution permission indicator
 */
export function DistributionIndicator({
  sensitivityLevel,
  elderApproval,
  className
}: {
  sensitivityLevel?: CulturalSensitivityLevel | string | null
  elderApproval?: boolean | null
  className?: string
}) {
  const normalizedLevel = (sensitivityLevel?.toLowerCase() || 'standard') as CulturalSensitivityLevel

  const canDistribute =
    normalizedLevel !== 'sacred' &&
    (normalizedLevel !== 'high' || elderApproval === true)

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 text-sm',
        canDistribute
          ? 'text-green-600 dark:text-green-400'
          : 'text-red-600 dark:text-red-400',
        className
      )}
      title={canDistribute ? 'Available for distribution' : 'Distribution restricted'}
    >
      {canDistribute ? (
        <>
          <Eye className="h-4 w-4" />
          <span>Distributable</span>
        </>
      ) : (
        <>
          <EyeOff className="h-4 w-4" />
          <span>Restricted</span>
        </>
      )}
    </div>
  )
}

/**
 * Elder approval badge for workflow displays
 */
export function ElderApprovalBadge({
  status,
  size = 'default',
  className
}: {
  status: ElderReviewStatus | string
  size?: 'sm' | 'default' | 'lg'
  className?: string
}) {
  const config = elderStatusConfig[status] || elderStatusConfig.pending
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    default: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    default: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center',
        sizeClasses[size],
        config.colorClass,
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      <span>{config.label}</span>
    </Badge>
  )
}

export default CulturalStatusBadge

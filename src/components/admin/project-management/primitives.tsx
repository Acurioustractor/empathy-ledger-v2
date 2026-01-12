/**
 * Reusable primitive UI components for Project Management
 */

'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { PROJECT_STATUS_CONFIG, ProjectStatus } from './constants'
import { LucideIcon } from 'lucide-react'

/**
 * Status Badge Component
 */
interface StatusBadgeProps {
  status: ProjectStatus
  showIcon?: boolean
}

export function StatusBadge({ status, showIcon = false }: StatusBadgeProps) {
  const config = PROJECT_STATUS_CONFIG[status] || PROJECT_STATUS_CONFIG.active
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={config.className}>
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  )
}

/**
 * Stat Card Component
 */
interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  className?: string
}

export function StatCard({ title, value, description, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && (
          <p className={cn(
            'text-xs mt-1',
            trend.positive ? 'text-green-600' : 'text-red-600'
          )}>
            {trend.positive ? '+' : ''}{trend.value}% {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Empty State Component
 */
interface EmptyStateProps {
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  icon?: LucideIcon
}

export function EmptyState({ title, description, action, icon: Icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="mb-4 rounded-full bg-muted p-3">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.icon && <action.icon className="mr-2 h-4 w-4" />}
          {action.label}
        </Button>
      )}
    </div>
  )
}

/**
 * Action Buttons Component
 */
interface ActionButtonsProps {
  actions: Array<{
    label: string
    onClick: () => void
    icon?: LucideIcon
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive'
    disabled?: boolean
  }>
  className?: string
}

export function ActionButtons({ actions, className }: ActionButtonsProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || 'outline'}
          onClick={action.onClick}
          disabled={action.disabled}
          size="sm"
        >
          {action.icon && <action.icon className="mr-2 h-4 w-4" />}
          {action.label}
        </Button>
      ))}
    </div>
  )
}

/**
 * Loading State Component
 */
interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

/**
 * Section Header Component
 */
interface SectionHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
}

export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {action && (
        <Button onClick={action.onClick}>
          {action.icon && <action.icon className="mr-2 h-4 w-4" />}
          {action.label}
        </Button>
      )}
    </div>
  )
}

/**
 * Info Badge Component
 */
interface InfoBadgeProps {
  label: string
  value: string | number
  variant?: 'default' | 'secondary' | 'outline'
}

export function InfoBadge({ label, value, variant = 'secondary' }: InfoBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <Badge variant={variant}>{value}</Badge>
    </div>
  )
}

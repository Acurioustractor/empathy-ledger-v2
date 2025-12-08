import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actions?: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * EmptyState - Consistent empty state component for the application
 *
 * Usage:
 * ```tsx
 * <EmptyState
 *   icon={BookOpen}
 *   title="No stories yet"
 *   description="Create your first story to get started"
 *   actions={
 *     <Button>Create Story</Button>
 *   }
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actions,
  className,
  size = 'md'
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: 'py-8',
      iconWrapper: 'p-4',
      icon: 'h-8 w-8',
      title: 'text-base',
      description: 'text-sm max-w-sm',
    },
    md: {
      container: 'py-12',
      iconWrapper: 'p-6',
      icon: 'h-12 w-12',
      title: 'text-lg',
      description: 'text-sm max-w-md',
    },
    lg: {
      container: 'py-16',
      iconWrapper: 'p-8',
      icon: 'h-16 w-16',
      title: 'text-xl',
      description: 'text-base max-w-lg',
    },
  }

  const sizes = sizeClasses[size]

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center px-4',
      sizes.container,
      className
    )}>
      <div className={cn(
        'rounded-full bg-muted/30 mb-6',
        sizes.iconWrapper
      )}>
        <Icon className={cn('text-muted-foreground/50', sizes.icon)} />
      </div>
      <h3 className={cn('font-semibold text-foreground mb-2', sizes.title)}>
        {title}
      </h3>
      <p className={cn('text-muted-foreground mb-6 mx-auto', sizes.description)}>
        {description}
      </p>
      {actions && (
        <div className="flex flex-wrap gap-3 justify-center">
          {actions}
        </div>
      )}
    </div>
  )
}

export default EmptyState

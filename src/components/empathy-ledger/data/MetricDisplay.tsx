'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EmpathyCard } from '../core/Card'

export interface MetricDisplayProps {
  label: string
  value: number | string
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  format?: 'number' | 'percentage' | 'currency' | 'decimal'
  icon?: React.ReactNode
  variant?: 'default' | 'warmth' | 'insight'
  size?: 'sm' | 'md' | 'lg'
  subtitle?: string
  loading?: boolean
  className?: string
}

/**
 * MetricDisplay - Beautiful, warm display of key metrics
 *
 * Design Philosophy:
 * - Numbers tell stories - present them warmly
 * - Trends show growth - celebrate with color
 * - Context matters - always include labels
 * - Gentle animations - numbers count up
 *
 * Features:
 * - Multiple format types (number, percentage, currency)
 * - Trend indicators with color coding
 * - Optional icon for visual meaning
 * - Size variants for hierarchy
 * - Loading state with skeleton
 * - Count-up animation for impact
 *
 * Usage:
 * <MetricDisplay
 *   label="Total Stories"
 *   value={1247}
 *   trend="up"
 *   trendValue="+12% this month"
 *   icon={<BookOpen />}
 * />
 */
export function MetricDisplay({
  label,
  value,
  trend,
  trendValue,
  format = 'number',
  icon,
  variant = 'default',
  size = 'md',
  subtitle,
  loading = false,
  className
}: MetricDisplayProps) {

  // Format value based on type
  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val

    switch (format) {
      case 'percentage':
        return `${Math.round(val)}%`
      case 'currency':
        return `$${val.toLocaleString()}`
      case 'decimal':
        return val.toFixed(2)
      default:
        return val.toLocaleString()
    }
  }

  // Size classes
  const sizeClasses = {
    sm: {
      value: 'text-2xl',
      label: 'text-xs',
      icon: 'w-8 h-8',
      padding: 'p-4'
    },
    md: {
      value: 'text-3xl',
      label: 'text-sm',
      icon: 'w-10 h-10',
      padding: 'p-6'
    },
    lg: {
      value: 'text-4xl',
      label: 'text-base',
      icon: 'w-12 h-12',
      padding: 'p-8'
    }
  }

  // Trend colors
  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    stable: 'text-amber-600 dark:text-amber-400'
  }

  // Trend icons
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />
      case 'down':
        return <TrendingDown className="w-4 h-4" />
      case 'stable':
        return <Minus className="w-4 h-4" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className={cn(
        'animate-pulse bg-muted/20 rounded-xl',
        sizeClasses[size].padding,
        className
      )}>
        <div className="h-4 bg-muted rounded w-1/2 mb-3" />
        <div className="h-8 bg-muted rounded w-3/4" />
      </div>
    )
  }

  return (
    <EmpathyCard
      elevation="lifted"
      variant={variant}
      className={cn(sizeClasses[size].padding, className)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Label */}
          <p className={cn(
            'font-medium text-muted-foreground mb-2',
            sizeClasses[size].label
          )}>
            {label}
          </p>

          {/* Value */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              'font-bold text-foreground font-editorial',
              sizeClasses[size].value
            )}
          >
            {formatValue(value)}
          </motion.p>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}

          {/* Trend */}
          {trend && (
            <div className={cn(
              'flex items-center gap-1.5 mt-2',
              trendColors[trend]
            )}>
              {getTrendIcon()}
              {trendValue && (
                <span className="text-xs font-medium">
                  {trendValue}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Icon */}
        {icon && (
          <div className={cn(
            'flex-shrink-0 text-primary-400',
            sizeClasses[size].icon
          )}>
            {icon}
          </div>
        )}
      </div>
    </EmpathyCard>
  )
}

/**
 * MetricGrid - Display multiple metrics in a responsive grid
 */
export interface MetricGridProps {
  metrics: Array<Omit<MetricDisplayProps, 'className'>>
  columns?: 2 | 3 | 4
  className?: string
}

export function MetricGrid({
  metrics,
  columns = 3,
  className
}: MetricGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={cn('grid gap-6', gridCols[columns], className)}>
      {metrics.map((metric, index) => (
        <MetricDisplay key={index} {...metric} />
      ))}
    </div>
  )
}

/**
 * CompactMetric - Inline metric display for lists
 */
export interface CompactMetricProps {
  label: string
  value: number | string
  format?: 'number' | 'percentage'
  className?: string
}

export function CompactMetric({
  label,
  value,
  format = 'number',
  className
}: CompactMetricProps) {
  const formatValue = () => {
    if (typeof value === 'string') return value
    if (format === 'percentage') return `${Math.round(value)}%`
    return value.toLocaleString()
  }

  return (
    <div className={cn('flex items-baseline gap-2', className)}>
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className="text-base font-bold text-foreground">
        {formatValue()}
      </span>
    </div>
  )
}

/**
 * ProgressRing - Circular progress indicator with Empathy Ledger warmth
 */
export interface ProgressRingProps {
  progress: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  thickness?: number
  label?: string
  showPercentage?: boolean
  color?: 'primary' | 'accent' | 'success' | 'warning'
  className?: string
}

export function ProgressRing({
  progress,
  size = 'md',
  thickness = 8,
  label,
  showPercentage = true,
  color = 'primary',
  className
}: ProgressRingProps) {
  const sizes = {
    sm: 80,
    md: 120,
    lg: 160
  }

  const diameter = sizes[size]
  const radius = (diameter - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  const colors = {
    primary: 'stroke-primary-500',
    accent: 'stroke-accent',
    success: 'stroke-green-500',
    warning: 'stroke-amber-500'
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={diameter}
        height={diameter}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={thickness}
          fill="none"
          className="text-muted/20"
        />

        {/* Progress circle */}
        <motion.circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={thickness}
          fill="none"
          strokeLinecap="round"
          className={colors[color]}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <span className={cn(
            'font-bold text-foreground font-editorial',
            size === 'sm' && 'text-lg',
            size === 'md' && 'text-2xl',
            size === 'lg' && 'text-3xl'
          )}>
            {Math.round(progress)}%
          </span>
        )}
        {label && (
          <span className={cn(
            'text-muted-foreground',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-base'
          )}>
            {label}
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * ScoreBar - Linear progress bar with warmth
 */
export interface ScoreBarProps {
  score: number // 0-1
  label?: string
  showValue?: boolean
  height?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'accent' | 'success' | 'cultural'
  className?: string
}

export function ScoreBar({
  score,
  label,
  showValue = true,
  height = 'md',
  color = 'primary',
  className
}: ScoreBarProps) {
  const percentage = Math.round(score * 100)

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  }

  const colors = {
    primary: 'bg-primary-500',
    accent: 'bg-accent',
    success: 'bg-green-500',
    cultural: 'bg-amber-500'
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showValue && <span className="font-semibold text-foreground">{percentage}%</span>}
        </div>
      )}

      <div className={cn('w-full bg-muted/30 rounded-full overflow-hidden', heights[height])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className={cn('h-full rounded-full', colors[color])}
        />
      </div>
    </div>
  )
}

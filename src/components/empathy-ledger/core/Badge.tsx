'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type BadgeVariant = 'default' | 'cultural' | 'status' | 'ai' | 'metric'
export type BadgeSize = 'sm' | 'md' | 'lg'

export interface EmpathyBadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  theme?: string // For cultural themes
  icon?: React.ReactNode
  pulse?: boolean // Gentle pulsing for live/active states
  className?: string
  onClick?: () => void
}

/**
 * EmpathyBadge - Semantic badges with cultural warmth
 *
 * Design Philosophy:
 * - Soft, rounded pills (never harsh rectangles)
 * - Cultural colors carry meaning
 * - Generous padding for comfortable reading
 * - Optional gentle pulse for active states
 * - Icons integrate naturally
 *
 * Variants:
 * - default: General labels and tags
 * - cultural: Theme badges with cultural palette
 * - status: Success, warning, info states
 * - ai: AI-generated insights and suggestions
 * - metric: Numerical scores and counts
 *
 * Usage:
 * <EmpathyBadge variant="cultural" theme="Cultural Preservation">
 *   Heritage
 * </EmpathyBadge>
 */
export function EmpathyBadge({
  children,
  variant = 'default',
  size = 'md',
  theme,
  icon,
  pulse = false,
  className,
  onClick
}: EmpathyBadgeProps) {

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2'
  }

  // Cultural theme colors (from design system)
  const culturalColors = theme ? getCulturalThemeColor(theme) : ''

  // Variant classes
  const variantClasses = {
    default: 'bg-muted text-muted-foreground border-border',

    cultural: culturalColors || 'bg-primary-100 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400 border-primary-200',

    status: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200',

    ai: 'bg-accent/10 text-accent border-accent/20',

    metric: 'bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 dark:from-emerald-950/30 dark:to-blue-950/30 dark:text-emerald-400 border-emerald-200'
  }

  // Pulse animation for active states
  const pulseVariant = pulse ? {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.9, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  } : {}

  return (
    <motion.span
      variants={pulseVariant}
      animate={pulse ? "animate" : undefined}
      onClick={onClick}
      className={cn(
        // Base styles
        'inline-flex items-center font-medium rounded-full border transition-all',

        // Size
        sizeClasses[size],

        // Variant
        variantClasses[variant],

        // Interactive
        onClick && 'cursor-pointer hover:scale-105 active:scale-95',

        // Custom
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.span>
  )
}

/**
 * Cultural theme color mapper
 */
function getCulturalThemeColor(theme: string): string {
  const colorMap: Record<string, string> = {
    'Cultural Preservation & Traditions': 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200',
    'Cultural Preservation': 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200',

    'Family & Kinship': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200',
    'Family': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200',

    'Land & Territory': 'bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 border-sky-200',
    'Land': 'bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 border-sky-200',

    'Resistance & Resilience': 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200',
    'Resilience': 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200',

    'Knowledge & Wisdom': 'bg-violet-100 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400 border-violet-200',
    'Knowledge': 'bg-violet-100 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400 border-violet-200',

    'Justice & Rights': 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border-orange-200',
    'Justice': 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border-orange-200',

    'Arts & Creativity': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400 border-cyan-200',
    'Arts': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400 border-cyan-200',

    'Everyday Life': 'bg-lime-100 text-lime-700 dark:bg-lime-950/30 dark:text-lime-400 border-lime-200'
  }

  return colorMap[theme] || ''
}

/**
 * StatusBadge - Semantic status indicators
 */
export interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'pending'
  children: React.ReactNode
  size?: BadgeSize
  className?: string
}

export function StatusBadge({
  status,
  children,
  size = 'md',
  className
}: StatusBadgeProps) {
  const statusColors = {
    success: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200',
    error: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200',
    pending: 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400 border-gray-200'
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        statusColors[status],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  )
}

/**
 * MetricBadge - Display numerical metrics with context
 */
export interface MetricBadgeProps {
  value: number | string
  label?: string
  trend?: 'up' | 'down' | 'stable'
  format?: 'number' | 'percentage' | 'score'
  size?: BadgeSize
  className?: string
}

export function MetricBadge({
  value,
  label,
  trend,
  format = 'number',
  size = 'md',
  className
}: MetricBadgeProps) {
  const formatValue = () => {
    if (typeof value === 'string') return value

    switch (format) {
      case 'percentage':
        return `${Math.round(value)}%`
      case 'score':
        return `${value.toFixed(1)}`
      default:
        return value.toLocaleString()
    }
  }

  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    stable: 'text-amber-600 dark:text-amber-400'
  }

  const trendIcons = {
    up: '↗',
    down: '↘',
    stable: '→'
  }

  return (
    <EmpathyBadge variant="metric" size={size} className={className}>
      <span className="font-bold">{formatValue()}</span>
      {label && <span className="text-xs opacity-75">{label}</span>}
      {trend && (
        <span className={cn('ml-1', trendColors[trend])}>
          {trendIcons[trend]}
        </span>
      )}
    </EmpathyBadge>
  )
}

/**
 * CountBadge - Simple count indicator
 */
export interface CountBadgeProps {
  count: number
  max?: number
  variant?: 'default' | 'accent' | 'cultural'
  size?: BadgeSize
  className?: string
}

export function CountBadge({
  count,
  max,
  variant = 'default',
  size = 'sm',
  className
}: CountBadgeProps) {
  const displayCount = max && count > max ? `${max}+` : count

  const variantColors = {
    default: 'bg-muted text-muted-foreground',
    accent: 'bg-accent/10 text-accent',
    cultural: 'bg-primary-100 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-bold rounded-full min-w-[1.5rem] h-6 px-2',
        variantColors[variant],
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        size === 'lg' && 'text-base',
        className
      )}
    >
      {displayCount}
    </span>
  )
}

/**
 * AIBadge - Special badge for AI-generated content
 */
export interface AIBadgeProps {
  confidence?: number
  children?: React.ReactNode
  size?: BadgeSize
  showConfidence?: boolean
  className?: string
}

export function AIBadge({
  confidence,
  children = 'AI',
  size = 'sm',
  showConfidence = true,
  className
}: AIBadgeProps) {
  return (
    <EmpathyBadge
      variant="ai"
      size={size}
      icon={<span className="text-accent">✨</span>}
      className={className}
    >
      {children}
      {showConfidence && confidence !== undefined && (
        <span className="ml-1 opacity-75">
          {Math.round(confidence * 100)}%
        </span>
      )}
    </EmpathyBadge>
  )
}

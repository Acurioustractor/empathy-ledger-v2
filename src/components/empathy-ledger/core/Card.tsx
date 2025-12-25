'use client'

import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

export type CardElevation = 'flat' | 'lifted' | 'hovering' | 'focused' | 'floating'
export type CardVariant = 'default' | 'warmth' | 'heritage' | 'insight' | 'connection'

export interface EmpathyCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode
  elevation?: CardElevation
  variant?: CardVariant
  interactive?: boolean
  asPage?: boolean
  className?: string
}

/**
 * EmpathyCard - The foundational card component with Empathy Ledger signature feel
 *
 * Design Philosophy:
 * - Feels like a page in a hand-bound ledger
 * - Soft shadows suggest depth and preservation
 * - Rounded corners like well-worn pages
 * - Warm gradients evoke candlelight
 * - Gentle animations like memories surfacing
 *
 * Features:
 * - Multiple elevation levels (flat → floating)
 * - Variant styles (warmth, heritage, insight, connection)
 * - Interactive hover states with gentle lift
 * - Smooth entrance animations
 * - Optional "page" texture
 *
 * Usage:
 * <EmpathyCard elevation="lifted" variant="warmth">
 *   <CardHeader title="Story Title" />
 *   <CardContent>Content here</CardContent>
 * </EmpathyCard>
 */
export function EmpathyCard({
  children,
  elevation = 'lifted',
  variant = 'default',
  interactive = false,
  asPage = true,
  className,
  ...props
}: EmpathyCardProps) {

  // Elevation styles - like pages lifted from a desk
  const elevationClasses = {
    flat: '',
    lifted: 'shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)]',
    hovering: 'shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]',
    focused: 'shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)]',
    floating: 'shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)]'
  }

  // Variant styles - different moods and purposes
  const variantClasses = {
    default: 'bg-background border-border',
    warmth: 'bg-gradient-to-br from-primary-50 to-background border-primary-200',
    heritage: 'bg-gradient-to-br from-amber-50/50 to-background border-amber-200',
    insight: 'bg-gradient-to-br from-accent/5 to-background border-accent/20',
    connection: 'bg-gradient-to-br from-emerald-50/30 to-background border-emerald-200/50'
  }

  // Interactive hover effect - gentle lift
  const hoverVariant = interactive ? {
    hover: {
      y: -2,
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
      borderColor: variant === 'warmth' ? 'rgb(228, 220, 200)' : 'rgb(228, 228, 231)',
      transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
    }
  } : {}

  // Entrance animation - like turning a page
  const entranceVariant = {
    initial: { opacity: 0, y: 20, scale: 0.97 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] // story-ease
      }
    }
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover={interactive ? "hover" : undefined}
      variants={{ ...entranceVariant, ...hoverVariant }}
      className={cn(
        // Base styles - the ledger page
        'rounded-xl border transition-colors',
        asPage && 'p-6', // Generous padding - breathing room

        // Elevation
        elevationClasses[elevation],

        // Variant
        variantClasses[variant],

        // Interactive cursor
        interactive && 'cursor-pointer',

        // Custom classes
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * CardHeader - Styled header section for cards
 */
export interface CardHeaderProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  badge?: React.ReactNode
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function CardHeader({
  title,
  subtitle,
  badge,
  icon,
  action,
  className
}: CardHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title with optional icon */}
          <div className="flex items-center gap-2 mb-2">
            {icon && (
              <div className="text-primary-500 flex-shrink-0">
                {icon}
              </div>
            )}
            <h3 className="text-xl font-bold text-foreground font-editorial truncate">
              {title}
            </h3>
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Badge or action */}
        {(badge || action) && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {badge}
            {action}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * CardContent - Main content area with comfortable reading spacing
 */
export interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('text-base text-foreground leading-relaxed', className)}>
      {children}
    </div>
  )
}

/**
 * CardFooter - Action area at bottom of card
 */
export interface CardFooterProps {
  children: React.ReactNode
  variant?: 'default' | 'subtle' | 'divided'
  alignment?: 'left' | 'center' | 'right' | 'between'
  className?: string
}

export function CardFooter({
  children,
  variant = 'default',
  alignment = 'right',
  className
}: CardFooterProps) {
  const variantClasses = {
    default: 'mt-6 pt-4',
    subtle: 'mt-6 pt-4 border-t border-border/50',
    divided: 'mt-6 pt-6 border-t border-border'
  }

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3',
        variantClasses[variant],
        alignmentClasses[alignment],
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * CardSection - Divider for multiple sections within a card
 */
export interface CardSectionProps {
  children: React.ReactNode
  title?: string
  className?: string
}

export function CardSection({ children, title, className }: CardSectionProps) {
  return (
    <div className={cn('mt-6 pt-6 border-t border-border/50', className)}>
      {title && (
        <h4 className="text-sm font-semibold text-foreground mb-3">
          {title}
        </h4>
      )}
      {children}
    </div>
  )
}

/**
 * PageCard - Special variant that looks like a book page
 */
export function PageCard({
  children,
  className,
  ...props
}: EmpathyCardProps) {
  return (
    <EmpathyCard
      elevation="lifted"
      variant="warmth"
      asPage={true}
      className={cn(
        // Page-like texture
        'relative overflow-hidden',
        // Optional: Add subtle paper texture
        'before:absolute before:inset-0 before:bg-[url("/textures/paper-grain.png")] before:opacity-[0.03] before:pointer-events-none',
        className
      )}
      {...props}
    >
      {children}
    </EmpathyCard>
  )
}

/**
 * InteractiveCard - Card with built-in hover and click states
 */
export interface InteractiveCardProps extends EmpathyCardProps {
  onClick?: () => void
  href?: string
}

export function InteractiveCard({
  children,
  onClick,
  href,
  className,
  ...props
}: InteractiveCardProps) {
  const handleClick = () => {
    if (href) {
      window.location.href = href
    } else if (onClick) {
      onClick()
    }
  }

  return (
    <EmpathyCard
      interactive={true}
      onClick={handleClick}
      className={cn(
        'group transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </EmpathyCard>
  )
}

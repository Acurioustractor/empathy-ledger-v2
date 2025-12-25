/**
 * Empathy Ledger Design System
 *
 * A warm, memorable design system for preserving human stories
 *
 * Core Philosophy:
 * - Warmth meets preservation
 * - Stories are sacred - handle with reverence
 * - Timeless design that ages gracefully
 * - Accessible to all ages and cultures
 * - Breathing room - never cramped
 *
 * Color Palette:
 * - Editorial Warmth (primary): Cream, parchment, earth tones
 * - Cultural Themes: Meaningful colors for 8 cultural categories
 * - Semantic Colors: Success, warning, info with emotional warmth
 *
 * Typography:
 * - Headings: Editorial New (serif warmth)
 * - Body: Inter (clean, accessible)
 * - Generous line heights for comfortable reading
 *
 * Animation:
 * - Gentle reveals (memories surfacing)
 * - Story-ease timing (organic, breathing)
 * - Never startling, always respectful
 *
 * Usage:
 * import {
 *   EmpathyCard,
 *   EmpathyBadge,
 *   QuoteCard,
 *   MetricDisplay
 * } from '@/components/empathy-ledger'
 */

// Core components - Foundation
export {
  EmpathyCard,
  CardHeader,
  CardContent,
  CardFooter,
  CardSection,
  PageCard,
  InteractiveCard
} from './core/Card'
export type {
  CardElevation,
  CardVariant,
  EmpathyCardProps,
  CardHeaderProps,
  CardContentProps,
  CardFooterProps,
  CardSectionProps,
  InteractiveCardProps
} from './core/Card'

export {
  EmpathyBadge,
  StatusBadge,
  MetricBadge,
  CountBadge,
  AIBadge
} from './core/Badge'
export type {
  BadgeVariant,
  BadgeSize,
  EmpathyBadgeProps,
  StatusBadgeProps,
  MetricBadgeProps,
  CountBadgeProps,
  AIBadgeProps
} from './core/Badge'

// Narrative components - Storytelling
export {
  QuoteCard,
  QuoteGallery
} from './narrative/QuoteCard'
export type {
  QuoteCardProps,
  QuoteGalleryProps
} from './narrative/QuoteCard'

// Data visualization - Warm analytics
export {
  MetricDisplay,
  MetricGrid,
  CompactMetric,
  ProgressRing,
  ScoreBar
} from './data/MetricDisplay'
export type {
  MetricDisplayProps,
  MetricGridProps,
  CompactMetricProps,
  ProgressRingProps,
  ScoreBarProps
} from './data/MetricDisplay'

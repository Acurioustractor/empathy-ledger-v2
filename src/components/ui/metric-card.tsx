import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Typography } from "@/components/ui/typography"
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react"

const metricCardVariants = cva(
  "rounded-xl p-6 transition-all duration-300 hover:shadow-lg",
  {
    variants: {
      variant: {
        // Storytelling-themed variants
        stories: "bg-gradient-to-br from-earth-50 to-earth-100 border-2 border-earth-200 hover:border-earth-300",
        storytellers: "bg-gradient-to-br from-sage-50 to-sage-100 border-2 border-sage-200 hover:border-sage-300", 
        community: "bg-gradient-to-br from-clay-50 to-clay-100 border-2 border-clay-200 hover:border-clay-300",
        engagement: "bg-gradient-to-br from-stone-50 to-stone-100 border-2 border-stone-200 hover:border-stone-300",
        
        // Status variants
        featured: "bg-gradient-to-br from-earth-100 to-clay-100 border-2 border-earth-300 shadow-cultural",
        growing: "bg-gradient-to-br from-sage-50 to-success-50 border-2 border-success-200",
        trending: "bg-gradient-to-br from-clay-50 to-warning-50 border-2 border-warning-200",
        
        // Clean minimal variants
        default: "bg-white border border-stone-200 shadow-sm",
        minimal: "bg-stone-50 border border-stone-100",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface MetricCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof metricCardVariants> {
  
  // Content
  title: string
  value: string | number
  subtitle?: string
  description?: string
  
  // Visual elements
  icon?: LucideIcon
  iconColor?: string
  
  // Trend information
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string | number
  trendLabel?: string
  
  // Actions
  action?: React.ReactNode
  onClick?: () => void
}

const MetricCard: React.FC<MetricCardProps> = ({
  className,
  variant,
  size,
  title,
  value,
  subtitle,
  description,
  icon: Icon,
  iconColor,
  trend,
  trendValue,
  trendLabel,
  action,
  onClick,
  ...props
}) => {
  const isClickable = Boolean(onClick)
  
  // Get trend colours based on variant
  const getTrendColors = () => {
    switch (variant) {
      case 'stories':
        return { up: 'text-earth-600', down: 'text-earth-400', neutral: 'text-earth-500' }
      case 'storytellers':
        return { up: 'text-sage-600', down: 'text-sage-400', neutral: 'text-sage-500' }
      case 'community':
        return { up: 'text-clay-600', down: 'text-clay-400', neutral: 'text-clay-500' }
      default:
        return { up: 'text-success-600', down: 'text-error-600', neutral: 'text-stone-500' }
    }
  }
  
  const trendColors = getTrendColors()
  
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4" />
      case 'down': return <TrendingDown className="w-4 h-4" />
      case 'neutral': return <Minus className="w-4 h-4" />
      default: return null
    }
  }

  const Component = isClickable ? 'button' : 'div'

  return (
    <Component
      className={cn(
        metricCardVariants({ variant, size }),
        isClickable && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {/* Header with Icon and Action */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={cn(
              "p-2 rounded-lg",
              variant === 'stories' && "bg-earth-200/50",
              variant === 'storytellers' && "bg-sage-200/50",
              variant === 'community' && "bg-clay-200/50",
              variant === 'engagement' && "bg-stone-200/50",
              !['stories', 'storytellers', 'community', 'engagement'].includes(variant || '') && "bg-stone-200/50"
            )}>
              <Icon className={cn(
                "w-5 h-5",
                iconColor || (
                  variant === 'stories' ? "text-earth-600" :
                  variant === 'storytellers' ? "text-sage-600" :
                  variant === 'community' ? "text-clay-600" :
                  variant === 'engagement' ? "text-stone-600" :
                  "text-stone-600"
                )
              )} />
            </div>
          )}
          <Typography variant="body-sm" className="font-medium text-stone-600">
            {title}
          </Typography>
        </div>
        
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>

      {/* Main Metric */}
      <div className="mb-3">
        <Typography 
          variant="display-lg" 
          className={cn(
            "font-bold leading-none mb-1",
            variant === 'stories' && "text-earth-800",
            variant === 'storytellers' && "text-sage-800", 
            variant === 'community' && "text-clay-800",
            variant === 'engagement' && "text-stone-800",
            !['stories', 'storytellers', 'community', 'engagement'].includes(variant || '') && "text-stone-900"
          )}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>
        
        {subtitle && (
          <Typography variant="body-sm" className="text-stone-600">
            {subtitle}
          </Typography>
        )}
      </div>

      {/* Trend Information */}
      {trend && (trendValue || trendLabel) && (
        <div className="flex items-center gap-2 mb-3">
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
            trend === 'up' && "bg-success-50 text-success-700",
            trend === 'down' && "bg-error-50 text-error-700", 
            trend === 'neutral' && "bg-stone-100 text-stone-600"
          )}>
            {getTrendIcon()}
            {trendValue && <span>{trendValue}</span>}
          </div>
          {trendLabel && (
            <Typography variant="body-xs" className="text-stone-500">
              {trendLabel}
            </Typography>
          )}
        </div>
      )}

      {/* Description */}
      {description && (
        <Typography variant="body-xs" className="text-stone-500 leading-relaxed">
          {description}
        </Typography>
      )}
    </Component>
  )
}

// Specialized metric cards for storytelling

const StoryMetricCard: React.FC<Omit<MetricCardProps, 'variant'>> = (props) => (
  <MetricCard {...props} variant="stories" />
)

const StorytellerMetricCard: React.FC<Omit<MetricCardProps, 'variant'>> = (props) => (
  <MetricCard {...props} variant="storytellers" />
)

const CommunityMetricCard: React.FC<Omit<MetricCardProps, 'variant'>> = (props) => (
  <MetricCard {...props} variant="community" />
)

const EngagementMetricCard: React.FC<Omit<MetricCardProps, 'variant'>> = (props) => (
  <MetricCard {...props} variant="engagement" />
)

export {
  MetricCard,
  StoryMetricCard,
  StorytellerMetricCard,
  CommunityMetricCard,
  EngagementMetricCard,
  metricCardVariants
}
import * as React from "react"
import { cn } from "@/lib/utils"
import { Typography } from "@/components/ui/typography"
import { CulturalBreadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb"

export interface PageLayoutProps {
  children: React.ReactNode
  className?: string
  
  // Header content
  title?: string
  subtitle?: string
  description?: string
  headerActions?: React.ReactNode
  breadcrumbs?: BreadcrumbItem[]
  
  // Layout options
  variant?: 'default' | 'cultural' | 'dashboard' | 'storytelling'
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '7xl' | 'full'
  padding?: 'none' | 'sm' | 'default' | 'lg' | 'xl'
  
  // Background options
  background?: 'default' | 'cultural' | 'gradient' | 'minimal'
  
  // Show/hide elements
  showBreadcrumbs?: boolean
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className,
  title,
  subtitle,
  description,
  headerActions,
  breadcrumbs = [],
  variant = 'default',
  maxWidth = 'lg',
  padding = 'default',
  background = 'default',
  showBreadcrumbs = true
}) => {
  const hasHeader = title || subtitle || description || headerActions || (breadcrumbs.length > 0 && showBreadcrumbs)

  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl', 
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-screen-2xl',
    '4xl': 'max-w-screen-4xl',
    '7xl': 'max-w-screen-7xl',
    full: 'max-w-none'
  }

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-4',
    default: 'px-6 py-8', 
    lg: 'px-8 py-12',
    xl: 'px-12 py-16'
  }

  const backgroundClasses = {
    default: 'bg-stone-50',
    cultural: 'bg-gradient-to-br from-stone-50 via-sage-50/30 to-clay-50/20',
    gradient: 'bg-gradient-to-br from-earth-50 via-stone-50 to-sage-50',
    minimal: 'bg-white'
  }

  const variantStyles = {
    default: {
      container: '',
      header: ''
    },
    cultural: {
      container: 'bg-gradient-to-br from-stone-50 via-sage-50/30 to-clay-50/20',
      header: 'bg-white/70 backdrop-blur-sm border border-stone-200 rounded-xl shadow-sm'
    },
    dashboard: {
      container: 'bg-stone-50',
      header: 'bg-white border-b border-stone-200'
    },
    storytelling: {
      container: 'bg-gradient-to-br from-earth-50 via-clay-50/30 to-sage-50/20', 
      header: 'bg-white/80 backdrop-blur-sm border border-earth-200 rounded-xl shadow-cultural'
    }
  }

  return (
    <div className={cn(
      'min-h-screen',
      backgroundClasses[background],
      variantStyles[variant].container,
      className
    )}>
      <div className={cn(
        'mx-auto',
        maxWidthClasses[maxWidth],
        paddingClasses[padding]
      )}>
        {hasHeader && (
          <div className={cn(
            'mb-8',
            variant === 'cultural' || variant === 'storytelling' ? 'p-6' : 'pb-6',
            variantStyles[variant].header
          )}>
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && showBreadcrumbs && (
              <div className="mb-4">
                <CulturalBreadcrumb 
                  items={breadcrumbs}
                  className={variant === 'cultural' || variant === 'storytelling' ? 'bg-transparent border-0 px-0 py-0' : ''}
                />
              </div>
            )}

            {/* Header Content */}
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 min-w-0">
                {title && (
                  <Typography
                    variant={
                      variant === 'cultural' || variant === 'storytelling' 
                        ? 'cultural-title' 
                        : variant === 'dashboard' 
                        ? 'display-md' 
                        : 'display-sm'
                    }
                    className={cn(
                      "mb-2",
                      variant === 'cultural' || variant === 'storytelling'
                        ? 'text-earth-800'
                        : 'text-stone-900'
                    )}
                  >
                    {title}
                  </Typography>
                )}

                {subtitle && (
                  <Typography
                    variant={
                      variant === 'cultural' || variant === 'storytelling' 
                        ? 'cultural-subtitle' 
                        : 'body-xl'
                    }
                    className={cn(
                      "mb-3",
                      variant === 'cultural' || variant === 'storytelling'
                        ? 'text-sage-700'
                        : 'text-stone-600'
                    )}
                  >
                    {subtitle}
                  </Typography>
                )}

                {description && (
                  <Typography
                    variant={
                      variant === 'cultural' || variant === 'storytelling' 
                        ? 'cultural-body' 
                        : 'body-md'
                    }
                    className={cn(
                      variant === 'cultural' || variant === 'storytelling'
                        ? 'text-stone-600'
                        : 'text-stone-500'
                    )}
                  >
                    {description}
                  </Typography>
                )}
              </div>

              {/* Header Actions */}
              {headerActions && (
                <div className="flex-shrink-0">
                  {headerActions}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={cn(
          variant === 'cultural' || variant === 'storytelling' 
            ? 'space-y-8' 
            : 'space-y-6'
        )}>
          {children}
        </div>
      </div>
    </div>
  )
}

// Specialized layouts for different page types

const StorytellingPageLayout: React.FC<Omit<PageLayoutProps, 'variant'>> = (props) => (
  <PageLayout {...props} variant="storytelling" />
)

const DashboardPageLayout: React.FC<Omit<PageLayoutProps, 'variant'>> = (props) => (
  <PageLayout {...props} variant="dashboard" background="minimal" />
)

const CulturalPageLayout: React.FC<Omit<PageLayoutProps, 'variant'>> = (props) => (
  <PageLayout {...props} variant="cultural" />
)

export { 
  PageLayout, 
  StorytellingPageLayout, 
  DashboardPageLayout, 
  CulturalPageLayout 
}
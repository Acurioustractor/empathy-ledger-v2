/**
 * Lazy Loading Utilities
 * Dynamic imports and code splitting for better performance
 */

'use client'

import React, { Suspense, lazy } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface LazyLoadProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  minHeight?: string
}

/**
 * Lazy load wrapper with loading fallback
 */
export function LazyLoad({ children, fallback, minHeight = '200px' }: LazyLoadProps) {
  const defaultFallback = (
    <Card>
      <CardContent className="flex items-center justify-center" style={{ minHeight }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clay-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </CardContent>
    </Card>
  )

  return <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>
}

/**
 * Lazy load heavy components
 */

// Analytics Components
export const LazySearchAnalyticsDashboard = lazy(() =>
  import('@/components/analytics/SearchAnalyticsDashboard').then(mod => ({
    default: mod.SearchAnalyticsDashboard
  }))
)

export const LazyThemeEvolutionDashboard = lazy(() =>
  import('@/components/themes/ThemeEvolutionDashboard').then(mod => ({
    default: mod.ThemeEvolutionDashboard
  }))
)

export const LazySROICalculator = lazy(() =>
  import('@/components/analytics-sroi/SROICalculator').then(mod => ({
    default: mod.SROICalculator
  }))
)

// Discovery Components
export const LazyDiscoveryFeed = lazy(() =>
  import('@/components/discovery/DiscoveryFeed').then(mod => ({
    default: mod.DiscoveryFeed
  }))
)

export const LazyRecommendationsEngine = lazy(() =>
  import('@/components/discovery/RecommendationsEngine').then(mod => ({
    default: mod.RecommendationsEngine
  }))
)

// Search Components
export const LazyGlobalSearchDashboard = lazy(() =>
  import('@/components/search/GlobalSearchDashboard').then(mod => ({
    default: mod.GlobalSearchDashboard
  }))
)

export const LazyFacetedSearch = lazy(() =>
  import('@/components/filters/FacetedSearch').then(mod => ({
    default: mod.FacetedSearch
  }))
)

// Report Components
export const LazyFunderReportGenerator = lazy(() =>
  import('@/components/reports/FunderReportGenerator').then(mod => ({
    default: mod.FunderReportGenerator
  }))
)

// Interpretation Components
export const LazyInterpretationSessionDashboard = lazy(() =>
  import('@/components/interpretation/InterpretationSessionDashboard').then(mod => ({
    default: mod.InterpretationSessionDashboard
  }))
)

// Outcomes Components
export const LazyHarvestedOutcomesDashboard = lazy(() =>
  import('@/components/outcomes/HarvestedOutcomesDashboard').then(mod => ({
    default: mod.HarvestedOutcomesDashboard
  }))
)

/**
 * Intersection Observer for lazy loading images
 */
export function useLazyImage(ref: React.RefObject<HTMLImageElement>) {
  React.useEffect(() => {
    const img = ref.current
    if (!img) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const image = entry.target as HTMLImageElement
            const src = image.dataset.src

            if (src) {
              image.src = src
              image.removeAttribute('data-src')
              observer.unobserve(image)
            }
          }
        })
      },
      { rootMargin: '50px' }
    )

    observer.observe(img)

    return () => {
      if (img) observer.unobserve(img)
    }
  }, [ref])
}

/**
 * Lazy Image Component
 */
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  placeholder?: string
}

export function LazyImage({ src, alt, placeholder, className, ...props }: LazyImageProps) {
  const imgRef = React.useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = React.useState(false)

  useLazyImage(imgRef)

  return (
    <div className="relative">
      {!loaded && placeholder && (
        <img
          src={placeholder}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover blur-sm ${className}`}
        />
      )}
      <img
        ref={imgRef}
        data-src={src}
        alt={alt}
        className={className}
        onLoad={() => setLoaded(true)}
        {...props}
      />
    </div>
  )
}

'use client'

import React, { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import providers with SSR disabled to avoid context issues during build
const ThemeProvider = dynamic(
  () => import('@/lib/context/theme.context').then(mod => ({ default: mod.ThemeProvider })),
  { ssr: false }
)

const AuthProvider = dynamic(
  () => import('@/lib/context/auth.context').then(mod => ({ default: mod.AuthProvider })),
  { ssr: false }
)

const TooltipProviderComponent = dynamic(
  () => import('@/components/ui/tooltip').then(mod => ({ default: mod.TooltipProvider })),
  { ssr: false }
)

const GlobalProviders = dynamic(
  () => import('./GlobalProviders'),
  { ssr: false }
)

/**
 * ClientProviders wraps all client-side providers in a single component.
 * Uses dynamic imports with ssr: false to avoid React context issues during SSG.
 */
export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // During SSR/SSG, render just children to avoid context issues
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <Suspense fallback={<>{children}</>}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProviderComponent>
            <GlobalProviders>
              {children}
            </GlobalProviders>
          </TooltipProviderComponent>
        </AuthProvider>
      </ThemeProvider>
    </Suspense>
  )
}

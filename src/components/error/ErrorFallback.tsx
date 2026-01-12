'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'

interface ErrorFallbackProps {
  error?: Error
  title?: string
  message?: string
  resetError?: () => void
  showBackButton?: boolean
}

export function ErrorFallback({
  error,
  title = 'Error Loading Component',
  message = 'We encountered an error while loading this component. Please try again.',
  resetError,
  showBackButton = false
}: ErrorFallbackProps) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <CardTitle className="text-lg text-red-900">{title}</CardTitle>
            <CardDescription className="text-red-700">{message}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-xs font-mono text-red-800">
            {error.message}
          </div>
        )}

        <div className="flex gap-2">
          {resetError && (
            <Button onClick={resetError} size="sm" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          {showBackButton && (
            <Button onClick={() => window.history.back()} size="sm" variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Loading Error - for async data fetching
 */
export function LoadingError({ retry }: { retry?: () => void }) {
  return (
    <ErrorFallback
      title="Failed to Load Data"
      message="We couldn't load the data you requested. Please check your connection and try again."
      resetError={retry}
    />
  )
}

/**
 * Not Found Error
 */
export function NotFoundError({ resourceType = 'Resource' }: { resourceType?: string }) {
  return (
    <ErrorFallback
      title={`${resourceType} Not Found`}
      message={`The ${resourceType.toLowerCase()} you're looking for doesn't exist or has been removed.`}
      showBackButton
    />
  )
}

/**
 * Permission Error
 */
export function PermissionError() {
  return (
    <ErrorFallback
      title="Access Denied"
      message="You don't have permission to access this resource. Please contact your administrator."
      showBackButton
    />
  )
}

/**
 * Network Error
 */
export function NetworkError({ retry }: { retry?: () => void }) {
  return (
    <ErrorFallback
      title="Network Error"
      message="We're having trouble connecting. Please check your internet connection and try again."
      resetError={retry}
    />
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ProjectAnalysisView } from './ProjectAnalysisView'
import { Maximize2, Minimize2, ArrowLeft } from 'lucide-react'

interface FullScreenAnalysisButtonProps {
  projectId: string
  organizationId: string
  projectName: string
  organizationName: string
  project: {
    id: string
    name: string
    description?: string
    status: string
    created_at: string
  }
  organisation: {
    id: string
    name: string
    type: string
  }
}

export function FullScreenAnalysisButton({
  projectId,
  organizationId,
  projectName,
  organizationName,
  project,
  organisation
}: FullScreenAnalysisButtonProps) {
  const [isFullScreen, setIsFullScreen] = useState(false)

  // Handle ESC key to exit full screen
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isFullScreen])

  // Apply full screen styles when active
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isFullScreen])

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  const exitFullScreen = () => {
    setIsFullScreen(false)
  }

  return (
    <>
      {/* Full Screen Button */}
      <Button
        variant="outline"
        onClick={toggleFullScreen}
        className="flex items-center gap-2 bg-white hover:bg-grey-50"
      >
        <Maximize2 className="w-4 h-4" />
        Full Screen
      </Button>

      {/* Full Screen Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-white overflow-auto">
          {/* Full Screen Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-grey-200 px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exitFullScreen}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <div className="flex items-center text-sm text-grey-600">
                  <span>{organisation.name}</span>
                  <span className="mx-2">→</span>
                  <span>{project.name}</span>
                  <span className="mx-2">→</span>
                  <span className="text-grey-900 font-medium">Analysis</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exitFullScreen}
                  className="flex items-center gap-2"
                >
                  <Minimize2 className="w-4 h-4" />
                  Exit Full Screen
                </Button>
              </div>
            </div>
          </div>

          {/* Full Screen Content */}
          <div className="p-6 bg-gradient-to-b from-stone-50 to-amber-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
              <ProjectAnalysisView
                projectId={projectId}
                organizationId={organizationId}
                projectName={projectName}
                organizationName={organizationName}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
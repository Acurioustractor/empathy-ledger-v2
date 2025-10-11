'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, FolderOpen, Users, FileText, UserPlus } from 'lucide-react'
import { StorytellerCreationWizard } from '@/components/storyteller/StorytellerCreationWizard'

interface DashboardQuickActionsProps {
  organizationId: string
}

export function DashboardQuickActions({ organizationId }: DashboardQuickActionsProps) {
  const router = useRouter()
  const [showWizard, setShowWizard] = useState(false)

  const quickActions: Array<{
    label: string
    action?: () => void
    href?: string
    icon: any
    variant: 'primary' | 'earth' | 'sage' | 'clay'
    description: string
  }> = [
    {
      label: 'Add Storyteller',
      action: () => setShowWizard(true),
      icon: UserPlus,
      variant: 'primary',
      description: 'Add a new storyteller to your organisation'
    },
    {
      label: 'New Story',
      href: `/organisations/${organizationId}/stories/create`,
      icon: Plus,
      variant: 'earth',
      description: 'Create a new story'
    },
    {
      label: 'View Projects',
      href: `/organisations/${organizationId}/projects`,
      icon: FolderOpen,
      variant: 'sage',
      description: 'Manage community projects'
    },
    {
      label: 'Manage Members',
      href: `/organisations/${organizationId}/members`,
      icon: Users,
      variant: 'clay',
      description: 'View and manage members'
    },
    {
      label: 'View Transcripts',
      href: `/organisations/${organizationId}/transcripts`,
      icon: FileText,
      variant: 'earth',
      description: 'View and manage transcripts'
    }
  ]

  const getButtonClasses = (variant: string) => {
    const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colours flex items-center gap-2"

    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-primary hover:bg-primary/90 text-white`
      case 'earth':
        return `${baseClasses} bg-earth-600 hover:bg-earth-700 text-white`
      case 'sage':
        return `${baseClasses} bg-sage-600 hover:bg-sage-700 text-white`
      case 'clay':
        return `${baseClasses} bg-clay-600 hover:bg-clay-700 text-white`
      default:
        return `${baseClasses} bg-grey-600 hover:bg-grey-700 text-white`
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => action.action ? action.action() : router.push(action.href!)}
            className={getButtonClasses(action.variant)}
            title={action.description}
          >
            <action.icon className="w-4 h-4" />
            {action.label}
          </button>
        ))}
      </div>

      {/* Storyteller Creation Wizard */}
      {showWizard && (
        <StorytellerCreationWizard
          organizationId={organizationId}
          onComplete={(storytellerId) => {
            setShowWizard(false)
            router.push(`/organisations/${organizationId}/storytellers`)
          }}
          onCancel={() => setShowWizard(false)}
        />
      )}
    </>
  )
}
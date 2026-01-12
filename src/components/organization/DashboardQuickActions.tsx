'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, FolderOpen, Users, FileText, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    variant: 'primary' | 'earth' | 'sage' | 'clay' | 'outline'
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
      label: 'Projects',
      href: `/organisations/${organizationId}/projects`,
      icon: FolderOpen,
      variant: 'outline',
      description: 'Manage community projects'
    },
    {
      label: 'Members',
      href: `/organisations/${organizationId}/members`,
      icon: Users,
      variant: 'outline',
      description: 'View and manage members'
    },
    {
      label: 'Transcripts',
      href: `/organisations/${organizationId}/transcripts`,
      icon: FileText,
      variant: 'outline',
      description: 'View and manage transcripts'
    }
  ]

  const getButtonClasses = (variant: string) => {
    const baseClasses = "px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md text-body-sm"

    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-gradient-to-r from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800 text-white`
      case 'earth':
        return `${baseClasses} bg-gradient-to-r from-earth-600 to-earth-700 hover:from-earth-700 hover:to-earth-800 text-white`
      case 'sage':
        return `${baseClasses} bg-gradient-to-r from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800 text-white`
      case 'clay':
        return `${baseClasses} bg-gradient-to-r from-clay-600 to-clay-700 hover:from-clay-700 hover:to-clay-800 text-white`
      case 'outline':
        return `${baseClasses} bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 hover:border-stone-400 shadow-none`
      default:
        return `${baseClasses} bg-stone-600 hover:bg-stone-700 text-white`
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2.5">
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
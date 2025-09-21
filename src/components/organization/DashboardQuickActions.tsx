'use client'

import { useRouter } from 'next/navigation'
import { Plus, FolderOpen, Users, FileText } from 'lucide-react'

interface DashboardQuickActionsProps {
  organizationId: string
}

export function DashboardQuickActions({ organizationId }: DashboardQuickActionsProps) {
  const router = useRouter()

  const quickActions = [
    {
      label: 'New Story',
      href: `/organisations/${organizationId}/stories/create`,
      icon: Plus,
      variant: 'earth' as const,
      description: 'Create a new story'
    },
    {
      label: 'View Projects',
      href: `/organisations/${organizationId}/projects`,
      icon: FolderOpen,
      variant: 'sage' as const,
      description: 'Manage community projects'
    },
    {
      label: 'Manage Members',
      href: `/organisations/${organizationId}/members`,
      icon: Users,
      variant: 'clay' as const,
      description: 'View and manage members'
    },
    {
      label: 'View Transcripts',
      href: `/organisations/${organizationId}/transcripts`,
      icon: FileText,
      variant: 'earth' as const,
      description: 'View and manage transcripts'
    }
  ]

  const getButtonClasses = (variant: string) => {
    const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colours flex items-center gap-2"

    switch (variant) {
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
    <div className="flex flex-wrap gap-3">
      {quickActions.map((action) => (
        <button
          key={action.label}
          onClick={() => router.push(action.href)}
          className={getButtonClasses(action.variant)}
          title={action.description}
        >
          <action.icon className="w-4 h-4" />
          {action.label}
        </button>
      ))}
    </div>
  )
}
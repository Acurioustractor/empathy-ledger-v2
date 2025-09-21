'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  TrendingUp,
  FolderOpen,
  Images,
  User,
  FileText,
  Activity
} from 'lucide-react'

interface OrganizationNavigationProps {
  organizationId: string
}

interface OrganizationStats {
  members: number
  stories: number
  photos: number
  projects: number
  galleries: number
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and metrics'
  },
  {
    name: 'Members',
    href: '/members',
    icon: Users,
    description: 'Community directory'
  },
  {
    name: 'Stories',
    href: '/stories',
    icon: BookOpen,
    description: 'Story collection'
  },
  {
    name: 'Storytellers',
    href: '/storytellers',
    icon: User,
    description: 'Community storytellers'
  },
  {
    name: 'Transcripts',
    href: '/transcripts',
    icon: FileText,
    description: 'All story transcripts'
  },
  {
    name: 'Galleries',
    href: '/galleries',
    icon: Images,
    description: 'Photos and videos'
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: FolderOpen,
    description: 'Community projects'
  },
  {
    name: 'Impact Analysis',
    href: '/analysis',
    icon: Activity,
    description: 'Project impact insights'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Insights and trends'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Organization settings'
  },
]

export function OrganizationNavigation({ organizationId }: OrganizationNavigationProps) {
  const pathname = usePathname()
  const basePath = `/organisations/${organizationId}`
  const [stats, setStats] = useState<OrganizationStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/organisations/${organizationId}/stats`)
        const data = await response.json()
        if (data.success) {
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Error fetching organisation stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [organizationId])

  return (
    <nav className="space-y-4">
      <div className="px-4 py-3">
        <h2 className="mb-4 px-2 text-display-sm font-semibold text-earth-800">
          Organization
        </h2>
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const href = `${basePath}${item.href}`
            const isActive = pathname === href
            
            return (
              <Link
                key={item.name}
                href={href}
                className={cn(
                  'flex items-center gap-4 rounded-lg px-4 py-3 text-body-md font-medium transition-all duration-200',
                  isActive
                    ? 'bg-earth-100 text-earth-800 border-l-4 border-earth-600 shadow-sm'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800 hover:shadow-sm'
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-colours",
                  isActive ? "text-earth-600" : "text-stone-400"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="text-body-md font-medium truncate">{item.name}</div>
                  <div className={cn(
                    "text-body-xs leading-tight mt-0.5",
                    isActive ? "text-earth-600" : "text-stone-500"
                  )}>
                    {item.description}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
      
      <div className="px-4 py-3">
        <div className="rounded-xl bg-gradient-to-br from-sage-50 to-stone-50 border border-sage-200 p-4 shadow-sm">
          <div className="flex items-center gap-3 text-body-md font-semibold mb-4 text-sage-700">
            <TrendingUp className="h-5 w-5" />
            Quick Stats
          </div>
          
          {isLoading ? (
            <div className="text-body-sm text-stone-500">
              Loading stats...
            </div>
          ) : stats ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-body-sm text-stone-600">Photos</span>
                <span className="text-body-sm font-semibold text-sage-700">{stats.photos.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-sm text-stone-600">Projects</span>
                <span className="text-body-sm font-semibold text-sage-700">{stats.projects}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-sm text-stone-600">Galleries</span>
                <span className="text-body-sm font-semibold text-sage-700">{stats.galleries}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-sm text-stone-600">Stories</span>
                <span className="text-body-sm font-semibold text-sage-700">{stats.stories}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-sm text-stone-600">Members</span>
                <span className="text-body-sm font-semibold text-sage-700">{stats.members}</span>
              </div>
            </div>
          ) : (
            <div className="text-body-sm text-stone-500">
              Unable to load stats
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
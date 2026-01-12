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
  Activity,
  Radar
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
    name: 'ALMA Impact',
    href: '/impact',
    icon: Radar,
    description: 'ALMA-aligned impact intelligence'
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
    <nav className="space-y-5">
      {/* Navigation Section */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-transparent">
          <h2 className="text-body-md font-semibold text-stone-800">
            Navigation
          </h2>
        </div>
        <div className="p-2">
          {navigationItems.map((item) => {
            const href = `${basePath}${item.href}`
            const isActive = pathname === href

            return (
              <Link
                key={item.name}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-sage-100 to-sage-50 text-sage-800 shadow-sm'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                  isActive ? "bg-sage-200" : "bg-stone-100"
                )}>
                  <item.icon className={cn(
                    "h-4 w-4",
                    isActive ? "text-sage-700" : "text-stone-500"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "text-body-sm font-medium truncate",
                    isActive ? "text-sage-800" : "text-stone-700"
                  )}>{item.name}</div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 bg-gradient-to-r from-sage-50/50 to-transparent">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-sage-600" />
            <h2 className="text-body-md font-semibold text-stone-800">Quick Stats</h2>
          </div>
        </div>
        <div className="p-4">
          {isLoading ? (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex justify-between items-center animate-pulse">
                  <div className="h-4 w-16 bg-stone-100 rounded"></div>
                  <div className="h-4 w-8 bg-stone-100 rounded"></div>
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="space-y-2.5">
              <div className="flex justify-between items-center py-1.5 px-2 rounded-md hover:bg-stone-50 transition-colors">
                <span className="text-body-sm text-stone-600">Members</span>
                <span className="text-body-sm font-semibold text-sage-700 bg-sage-50 px-2 py-0.5 rounded-md">{stats.members}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 px-2 rounded-md hover:bg-stone-50 transition-colors">
                <span className="text-body-sm text-stone-600">Stories</span>
                <span className="text-body-sm font-semibold text-earth-700 bg-earth-50 px-2 py-0.5 rounded-md">{stats.stories}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 px-2 rounded-md hover:bg-stone-50 transition-colors">
                <span className="text-body-sm text-stone-600">Projects</span>
                <span className="text-body-sm font-semibold text-clay-700 bg-clay-50 px-2 py-0.5 rounded-md">{stats.projects}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 px-2 rounded-md hover:bg-stone-50 transition-colors">
                <span className="text-body-sm text-stone-600">Galleries</span>
                <span className="text-body-sm font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">{stats.galleries}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 px-2 rounded-md hover:bg-stone-50 transition-colors">
                <span className="text-body-sm text-stone-600">Photos</span>
                <span className="text-body-sm font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">{stats.photos?.toLocaleString() || 0}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-body-sm text-stone-500">Unable to load stats</p>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
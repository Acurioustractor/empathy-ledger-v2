'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings,
  TrendingUp,
  FolderOpen
} from 'lucide-react'

interface OrganizationNavigationProps {
  organizationId: string
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
    name: 'Projects',
    href: '/projects',
    icon: FolderOpen,
    description: 'Community projects'
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
  const basePath = `/organizations/${organizationId}`

  return (
    <nav className="space-y-2">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-2 text-lg font-semibold">
          Organization
        </h2>
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const href = `${basePath}${item.href}`
            const isActive = pathname === href
            
            return (
              <Link
                key={item.name}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                <div className="flex-1">
                  <div>{item.name}</div>
                  <div className="text-xs opacity-60">
                    {item.description}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
      
      <div className="px-3 py-2">
        <div className="rounded-lg bg-muted/50 p-3">
          <div className="flex items-center gap-2 text-sm font-medium mb-2">
            <TrendingUp className="h-4 w-4" />
            Quick Stats
          </div>
          <div className="text-xs text-muted-foreground">
            Real-time organization metrics and community insights
          </div>
        </div>
      </div>
    </nav>
  )
}
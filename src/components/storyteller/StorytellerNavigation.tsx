'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Video,
  Camera,
  BarChart3,
  Settings,
  Users,
  Heart,
  Sparkles
} from 'lucide-react'

interface StorytellerNavigationProps {
  storytellerId: string
}

const navigationItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and stats'
  },
  {
    label: 'Transcripts',
    href: '/transcripts', 
    icon: FileText,
    description: 'Audio transcriptions'
  },
  {
    label: 'Stories',
    href: '/stories',
    icon: BookOpen,
    description: 'Published narratives'
  },
  {
    label: 'Media',
    href: '/media',
    icon: Camera,
    description: 'Photos and videos'
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Story insights'
  },
  {
    label: 'AI Tools',
    href: '/ai-tools',
    icon: Sparkles,
    description: 'Story generation',
    badge: 'New'
  }
]

const bottomItems = [
  {
    label: 'Community',
    href: '/community',
    icon: Users,
    description: 'Connect with others'
  },
  {
    label: 'Support',
    href: '/support',
    icon: Heart,
    description: 'Get help'
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Account preferences'
  }
]

export function StorytellerNavigation({ storytellerId }: StorytellerNavigationProps) {
  const pathname = usePathname()
  
  const isActive = (href: string) => {
    const fullPath = `/storytellers/${storytellerId}${href}`
    return pathname === fullPath || (href === '/dashboard' && pathname === `/storytellers/${storytellerId}`)
  }

  const renderNavItem = (item: typeof navigationItems[0]) => {
    const fullHref = `/storytellers/${storytellerId}${item.href}`
    const active = isActive(item.href)
    
    return (
      <Link
        key={item.href}
        href={fullHref}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colours",
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <item.icon className="h-4 w-4 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="text-xs h-5 px-1.5">
                {item.badge}
              </Badge>
            )}
          </div>
          <p className="text-xs opacity-75">{item.description}</p>
        </div>
      </Link>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Navigation */}
      <Card>
        <CardContent className="p-3">
          <div className="space-y-1">
            <div className="px-2 py-1">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Storytelling
              </h3>
            </div>
            {navigationItems.map(renderNavItem)}
          </div>
        </CardContent>
      </Card>

      {/* Secondary Navigation */}
      <Card>
        <CardContent className="p-3">
          <div className="space-y-1">
            <div className="px-2 py-1">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Community
              </h3>
            </div>
            {bottomItems.map(renderNavItem)}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-clay-50 to-sage-50 border-clay-200">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-clay-600" />
              <span className="text-sm font-medium">AI Story Tools</span>
              <Badge variant="secondary" className="text-xs">Beta</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Transform your transcripts into compelling stories with AI assistance.
            </p>
            <Link
              href={`/storytellers/${storytellerId}/ai-tools`}
              className="block w-full text-center bg-clay-600 hover:bg-clay-700 text-white text-xs py-2 rounded-md transition-colours"
            >
              Try AI Generation
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
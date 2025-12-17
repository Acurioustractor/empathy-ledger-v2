'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Globe, Maximize2, BarChart3, Map, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface WorldTourNavProps {
  variant?: 'light' | 'dark' | 'transparent'
  className?: string
}

const navItems = [
  {
    href: '/world-tour',
    label: 'Overview',
    icon: Home,
    description: 'Tour home & nominations'
  },
  {
    href: '/world-tour/explore',
    label: 'Explore Map',
    icon: Maximize2,
    description: 'Full-screen interactive map'
  },
  {
    href: '/world-tour/insights',
    label: 'Insights',
    icon: BarChart3,
    description: 'Analytics & trends'
  }
]

export function WorldTourNav({ variant = 'light', className }: WorldTourNavProps) {
  const pathname = usePathname()

  const isTransparent = variant === 'transparent'
  const isDark = variant === 'dark'

  return (
    <nav className={cn(
      "flex items-center gap-1 p-1 rounded-lg",
      isTransparent && "bg-white/10 backdrop-blur-md",
      isDark && "bg-stone-900/90 backdrop-blur-md",
      !isTransparent && !isDark && "bg-stone-100 dark:bg-stone-800",
      className
    )}>
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-2 transition-all",
                isTransparent && "text-white hover:bg-white/20",
                isDark && "text-white hover:bg-white/20",
                isActive && isTransparent && "bg-white/20",
                isActive && isDark && "bg-white/20",
                isActive && !isTransparent && !isDark && "bg-white dark:bg-stone-700 shadow-sm",
                !isActive && !isTransparent && !isDark && "hover:bg-white/50 dark:hover:bg-stone-700/50"
              )}
              title={item.description}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Button>
          </Link>
        )
      })}
    </nav>
  )
}

// Compact version for mobile/tight spaces
export function WorldTourNavCompact({ variant = 'light', className }: WorldTourNavProps) {
  const pathname = usePathname()

  const isTransparent = variant === 'transparent'
  const isDark = variant === 'dark'

  return (
    <div className={cn(
      "flex items-center gap-2",
      className
    )}>
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isActive ? "default" : "outline"}
              size="icon"
              className={cn(
                "w-9 h-9",
                isTransparent && !isActive && "border-white/30 text-white hover:bg-white/20 bg-transparent",
                isDark && !isActive && "border-white/30 text-white hover:bg-white/20 bg-transparent",
                isActive && (isTransparent || isDark) && "bg-white text-stone-900"
              )}
              title={item.label}
            >
              <Icon className="w-4 h-4" />
            </Button>
          </Link>
        )
      })}
    </div>
  )
}

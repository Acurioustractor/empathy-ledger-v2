'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderKanban,
  BookOpen,
  MessageSquare,
  BarChart3,
  Settings,
  Users,
  Menu,
  X,
  ChevronDown,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/portal', icon: LayoutDashboard },
  { label: 'Projects', href: '/portal/projects', icon: FolderKanban },
  { label: 'Story Catalog', href: '/portal/catalog', icon: BookOpen },
  { label: 'Messages', href: '/portal/messages', icon: MessageSquare },
  { label: 'Analytics', href: '/portal/analytics', icon: BarChart3 },
  { label: 'Team', href: '/portal/team', icon: Users },
  { label: 'Settings', href: '/portal/settings', icon: Settings }
]

export default function PortalLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [partner, setPartner] = useState<{
    name: string
    appId: string
  } | null>(null)

  useEffect(() => {
    // Mock partner data - would come from auth context
    setPartner({
      name: 'act.place',
      appId: 'act-place-001'
    })
  }, [])

  const isActive = (href: string) => {
    if (href === '/portal') {
      return pathname === '/portal'
    }
    return pathname?.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Left: Logo + Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 hover:bg-stone-100 rounded-lg"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              {mobileNavOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            <Link href="/portal" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-sage-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">EL</span>
              </div>
              <span className="font-semibold text-stone-900 hidden sm:block">
                Partner Portal
              </span>
            </Link>
          </div>

          {/* Right: Partner Selector + User Menu */}
          <div className="flex items-center gap-4">
            {/* Partner Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <div className="h-5 w-5 rounded bg-sage-100 flex items-center justify-center">
                    <span className="text-xs font-medium text-sage-700">
                      {partner?.name?.[0] || 'P'}
                    </span>
                  </div>
                  <span className="hidden sm:block">{partner?.name || 'Partner'}</span>
                  <ChevronDown className="h-4 w-4 text-stone-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-sage-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-sage-700">A</span>
                    </div>
                    <span>act.place</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  + Add organization
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-earth-100 text-earth-700 text-xs">
                      U
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/portal/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40
            w-64 bg-white border-r border-stone-200
            transform transition-transform duration-200 ease-in-out
            lg:transform-none lg:translate-x-0
            ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}
            pt-16 lg:pt-0
          `}
        >
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-colors
                    ${active
                      ? 'bg-sage-50 text-sage-700 font-medium'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-sage-600' : ''}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Help Card */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="p-4 bg-sage-50 rounded-lg">
              <h4 className="font-medium text-sage-900 text-sm">Need help?</h4>
              <p className="text-xs text-sage-600 mt-1">
                Check our documentation or contact support.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full border-sage-200 text-sage-700 hover:bg-sage-100"
                asChild
              >
                <Link href="https://docs.empathyledger.com" target="_blank">
                  View Docs
                </Link>
              </Button>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {mobileNavOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

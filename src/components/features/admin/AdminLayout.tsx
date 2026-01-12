'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAdminStore } from '@/lib/stores/admin.store'
import {
  Users,
  BookOpen,
  Building2,
  FolderOpen,
  BarChart,
  Settings,
  Menu,
  X,
  Home,
  ImageIcon,
  Mic,
  ChevronLeft,
  Bell,
  Search,
  User,
  Eye,
  Camera,
  PlusCircle,
  Video,
  Sparkles,
  Layers,
  Film,
  FrameRectangle,
  LayoutGrid
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface AdminLayoutProps {
  children: React.ReactNode
}

const sections = [
  {
    title: 'Platform Management',
    items: [
      { icon: Home, label: 'Dashboard', href: '/admin' },
      { icon: Users, label: 'Users', href: '/admin/users' },
      { icon: BookOpen, label: 'Stories', href: '/admin/stories' },
      { icon: LayoutGrid, label: 'Stories (Cards)', href: '/admin/stories/cards' },
      { icon: Building2, label: 'Organizations', href: '/admin/organisations' },
      { icon: FolderOpen, label: 'Projects', href: '/admin/projects' }
    ]
  },
  {
    title: 'Quick Actions',
    items: [
      { icon: Layers, label: 'Story Workflow', href: '/admin/storyflow' },
      { icon: PlusCircle, label: 'Quick Add', href: '/admin/quick-add' }
    ]
  },
  {
    title: 'Media',
    items: [
      { icon: ImageIcon, label: 'Galleries', href: '/admin/galleries' },
      { icon: Camera, label: 'Photos', href: '/admin/photos' },
      { icon: FolderOpen, label: 'Compendium Media', href: '/admin/compendium-media' },
      { icon: FrameRectangle, label: 'Story Images', href: '/admin/story-images' },
      { icon: Mic, label: 'Transcripts', href: '/admin/transcripts' },
      { icon: Video, label: 'Videos', href: '/admin/videos' },
      { icon: Sparkles, label: 'Smart Gallery', href: '/admin/smart-gallery' },
      { icon: Search, label: 'Smart Search', href: '/admin/smart-search' }
    ]
  },
  {
    title: 'Management',
    items: [
      { icon: Eye, label: 'Reviews', href: '/admin/reviews' },
      { icon: BarChart, label: 'Analytics', href: '/admin/analytics' },
      { icon: Settings, label: 'Settings', href: '/admin/settings' }
    ]
  }
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useAdminStore()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <div className="flex h-screen bg-grey-50">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-white border-r transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {!sidebarCollapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg" />
              <span className="font-semibold text-lg">Admin Panel</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(sidebarCollapsed && 'mx-auto')}
          >
            {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          <div className="space-y-6 px-2">
            {sections.map((section) => (
              <div key={section.title}>
                {!sidebarCollapsed && (
                  <p className="text-xs uppercase tracking-[0.3em] text-grey-500 mb-2">
                    {section.title}
                  </p>
                )}
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/admin' && pathname.startsWith(item.href))
                    const Icon = item.icon

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg transition-colours',
                            'hover:bg-grey-100',
                            isActive && 'bg-blue-50 text-blue-600 hover:bg-blue-100',
                            sidebarCollapsed && 'justify-center'
                          )}
                          title={sidebarCollapsed ? item.label : undefined}
                        >
                          <Icon className={cn('h-5 w-5', isActive && 'text-blue-600')} />
                          {!sidebarCollapsed && (
                            <span className={cn('font-medium', isActive && 'text-blue-600')}>
                              {item.label}
                            </span>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* User Section */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>SA</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Super Admin</p>
                <p className="text-xs text-grey-500 truncate">admin@empathy.com</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative flex flex-col w-64 bg-white">
            <div className="h-16 flex items-center justify-between px-4 border-b">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg" />
                <span className="font-semibold text-lg">Admin Panel</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <nav className="flex-1 py-4">
              <div className="space-y-6 px-2">
                {sections.map((section) => (
                  <div key={section.title}>
                    <p className="text-xs uppercase tracking-[0.3em] text-grey-500 mb-2">
                      {section.title}
                    </p>
                    <ul className="space-y-1">
                      {section.items.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon

                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colours',
                                'hover:bg-grey-100',
                                isActive && 'bg-blue-50 text-blue-600'
                              )}
                            >
                              <Icon className={cn('h-5 w-5', isActive && 'text-blue-600')} />
                              <span className={cn('font-medium', isActive && 'text-blue-600')}>
                                {item.label}
                              </span>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Global Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-grey-400" />
              <Input
                type="search"
                placeholder="Search everything..."
                className="pl-10 pr-4 w-64 lg:w-96"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>SA</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth.context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Home, Users, BookOpen, Building2, FolderOpen, Settings, BarChart,
  Image, Camera, FileText, Shield, Menu, X, LogOut, Zap,
  Activity, Bell, PlusCircle, ChevronRight, Globe
} from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, isAdmin, isSuperAdmin, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auth guard - redirect non-admins
  useEffect(() => {
    if (!isLoading && mounted) {
      if (!user) {
        router.push('/auth/signin?redirect=/admin')
      } else if (!isAdmin && !isSuperAdmin) {
        router.push('/')
      }
    }
  }, [user, isLoading, isAdmin, isSuperAdmin, router, mounted])

  // Show loading while checking auth
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // Don't render admin content for non-admins
  if (!user || (!isAdmin && !isSuperAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access the admin panel.</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    )
  }

  const navItems = [
    { href: '/admin', icon: Home, label: 'Dashboard' },
    { href: '/admin/quick-add', icon: PlusCircle, label: 'Quick Add', highlight: true },
    { href: '/admin/storytellers', icon: Users, label: 'Storytellers' },
    { href: '/admin/stories', icon: BookOpen, label: 'Stories' },
    { href: '/admin/organisations', icon: Building2, label: 'Organizations' },
    { href: '/admin/projects', icon: FolderOpen, label: 'Projects' },
  ]

  const mediaItems = [
    { href: '/admin/galleries', icon: Image, label: 'Galleries' },
    { href: '/admin/photos', icon: Camera, label: 'Photos' },
    { href: '/admin/transcripts', icon: FileText, label: 'Transcripts' },
  ]

  const managementItems = [
    { href: '/admin/reviews', icon: Shield, label: 'Reviews' },
    { href: '/admin/command-center', icon: Activity, label: 'Command Center', superAdminOnly: true },
    { href: '/admin/audit-log', icon: BarChart, label: 'Audit Log', superAdminOnly: true },
    { href: '/admin/analytics', icon: BarChart, label: 'Analytics' },
    { href: '/admin/world-tour/analytics', icon: Globe, label: 'World Tour' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
  ]

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname?.startsWith(href)
  }

  const NavLink = ({ item }: { item: typeof navItems[0] & { highlight?: boolean; superAdminOnly?: boolean } }) => {
    if (item.superAdminOnly && !isSuperAdmin) return null

    const active = isActive(item.href)
    return (
      <Link href={item.href} onClick={() => setSidebarOpen(false)}>
        <Button
          variant={active ? "secondary" : "ghost"}
          className={`w-full justify-start ${active ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' : ''} ${item.highlight ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' : ''}`}
        >
          <item.icon className={`w-4 h-4 mr-3 ${item.highlight ? 'text-green-600' : ''}`} />
          {item.label}
          {item.highlight && <Zap className="w-3 h-3 ml-auto text-green-600" />}
        </Button>
      </Link>
    )
  }

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
            <p className="text-xs text-gray-500">Empathy Ledger</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-700 font-semibold text-sm">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className={isSuperAdmin ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}>
                {isSuperAdmin ? 'Super Admin' : 'Admin'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}

        {/* Media Section */}
        <div className="pt-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-3">
            Media
          </div>
          {mediaItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>

        {/* Management Section */}
        <div className="pt-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-3">
            Management
          </div>
          {managementItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 space-y-2">
        <Link href="/">
          <Button variant="outline" className="w-full justify-start">
            <ChevronRight className="w-4 h-4 mr-2" />
            View Public Site
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Admin</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={isSuperAdmin ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}>
              {isSuperAdmin ? 'Super' : 'Admin'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-200 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        <div className="pt-16 lg:pt-0">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

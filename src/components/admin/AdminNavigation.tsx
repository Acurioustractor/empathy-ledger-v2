'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Users, 
  BookOpen, 
  Image, 
  Settings, 
  Shield,
  BarChart3,
  FileVideo,
  UserCog,
  Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AdminNavigationProps {
  className?: string
}

export default function AdminNavigation({ className }: AdminNavigationProps) {
  const pathname = usePathname()
  
  const navItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Overview & Stats'
    },
    {
      href: '/admin/users',
      label: 'User Management',
      icon: Users,
      description: 'Manage all users and profiles'
    },
    {
      href: '/admin/profiles',
      label: 'Profiles Admin',
      icon: UserCog,
      description: 'Detailed profile management'
    },
    {
      href: '/admin/stories',
      label: 'Stories',
      icon: BookOpen,
      description: 'Story moderation & management'
    },
    {
      href: '/admin/media-review',
      label: 'Media Review',
      icon: FileVideo,
      description: 'Cultural review & approval'
    },
    {
      href: '/admin/galleries',
      label: 'Galleries',
      icon: Image,
      description: 'Gallery management'
    },
    {
      href: '/admin/organizations',
      label: 'Organizations',
      icon: Building2,
      description: 'Tenant & organization management'
    },
    {
      href: '/admin/settings',
      label: 'Settings',
      icon: Settings,
      description: 'System configuration'
    }
  ]

  const publicNavItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/stories', label: 'Stories', icon: BookOpen },
    { href: '/storytellers', label: 'Storytellers', icon: Users },
    { href: '/galleries', label: 'Galleries', icon: Image }
  ]
  
  return (
    <div className={cn('space-y-6', className)}>
      {/* Public Navigation */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Public Navigation</h3>
        <div className="flex flex-wrap gap-2">
          {publicNavItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button variant="outline" size="sm" className="text-xs">
                <item.icon className="w-3 h-3 mr-1" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Admin Navigation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'p-3 rounded-lg border transition-colors hover:bg-gray-50',
                  pathname === item.href 
                    ? 'bg-orange-50 border-orange-200 text-orange-800' 
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                )}
              >
                <div className="flex items-start space-x-2 mb-1">
                  <item.icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="font-medium text-sm break-words">{item.label}</span>
                </div>
                <p className="text-xs text-gray-500 break-words">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/media-review">
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
              <Shield className="w-3 h-3 mr-1" />
              Review Media
            </Button>
          </Link>
          <Link href="/admin/users?filter=pending">
            <Button variant="outline" size="sm">
              <Users className="w-3 h-3 mr-1" />
              Pending Users
            </Button>
          </Link>
          <Link href="/admin/stories?status=flagged">
            <Button variant="outline" size="sm">
              <BookOpen className="w-3 h-3 mr-1" />
              Flagged Stories
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
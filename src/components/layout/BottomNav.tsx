'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, BookOpen, Mic, Users, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/context/auth.context'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  activeIcon?: React.ReactNode
  matchPaths?: string[]
}

export function BottomNav() {
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuth()

  const navItems: NavItem[] = [
    {
      href: '/',
      label: 'Home',
      icon: <Home className="w-6 h-6" />,
      matchPaths: ['/']
    },
    {
      href: '/stories',
      label: 'Stories',
      icon: <BookOpen className="w-6 h-6" />,
      matchPaths: ['/stories']
    },
    {
      href: '/capture',
      label: 'Capture',
      icon: <Mic className="w-6 h-6" />,
      matchPaths: ['/capture']
    },
    {
      href: '/storytellers',
      label: 'People',
      icon: <Users className="w-6 h-6" />,
      matchPaths: ['/storytellers']
    },
    {
      href: isAuthenticated ? '/profile' : '/auth/signin',
      label: isAuthenticated ? 'Profile' : 'Sign In',
      icon: <User className="w-6 h-6" />,
      matchPaths: ['/profile', '/auth/signin', '/auth/signup']
    }
  ]

  const isActive = (item: NavItem) => {
    if (item.matchPaths) {
      return item.matchPaths.some(path =>
        path === '/' ? pathname === '/' : pathname.startsWith(path)
      )
    }
    return pathname === item.href
  }

  return (
    <nav className="bottom-nav md:hidden" role="navigation" aria-label="Main navigation">
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'bottom-nav-item',
                active && 'active'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <span className={cn(
                'transition-transform duration-200',
                active && 'scale-110'
              )}>
                {item.icon}
              </span>
              <span className="bottom-nav-item-label">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav

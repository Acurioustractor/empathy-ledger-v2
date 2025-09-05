'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X, User, Heart, Map, BookOpen, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/context/auth.context'
import { cn } from '@/lib/utils'

interface NavigationItem {
  name: string
  href: string
  icon?: React.ReactNode
  badge?: string
  description?: string
  requiresAuth?: boolean
  showFor?: 'all' | 'authenticated' | 'storytellers' | 'elders'
}

const mainNavigation: NavigationItem[] = [
  {
    name: 'Stories',
    href: '/stories',
    icon: <BookOpen className="w-4 h-4" />,
    description: 'Discover and share cultural stories',
    showFor: 'all'
  },
  {
    name: 'Storytellers',
    href: '/storytellers',
    icon: <Users className="w-4 h-4" />,
    description: 'Meet our community storytellers',
    showFor: 'all'
  },
  {
    name: 'Cultural Map',
    href: '/map',
    icon: <Map className="w-4 h-4" />,
    description: 'Explore stories by location and culture',
    showFor: 'all'
  },
  {
    name: 'About',
    href: '/about',
    description: 'Learn about our mission and values',
    showFor: 'all'
  }
]

const authenticatedNavigation: NavigationItem[] = [
  {
    name: 'Create Story',
    href: '/stories/create',
    icon: <BookOpen className="w-4 h-4" />,
    description: 'Share your cultural narrative',
    requiresAuth: true,
    showFor: 'authenticated',
    badge: 'New'
  },
  {
    name: 'Dashboard',
    href: '/dashboard',
    description: 'Your personal storytelling space',
    requiresAuth: true,
    showFor: 'authenticated'
  },
  {
    name: 'My Stories',
    href: '/stories/mine',
    description: 'Manage your stories',
    requiresAuth: true,
    showFor: 'authenticated'
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: <User className="w-4 h-4" />,
    requiresAuth: true,
    showFor: 'authenticated'
  }
]

const storytellerNavigation: NavigationItem[] = [
  {
    name: 'Storyteller Hub',
    href: '/storyteller/dashboard',
    badge: 'Storyteller',
    requiresAuth: true,
    showFor: 'storytellers'
  }
]

export default function Header() {
  const { user, profile, isAuthenticated, isStoryteller, isElder, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const shouldShowNavItem = (item: NavigationItem): boolean => {
    switch (item.showFor) {
      case 'authenticated':
        return isAuthenticated
      case 'storytellers':
        return isStoryteller
      case 'elders':
        return isElder
      case 'all':
      default:
        return true
    }
  }

  const getVisibleNavigation = (): NavigationItem[] => {
    let navigation = [...mainNavigation]
    
    if (isAuthenticated) {
      navigation = [...navigation, ...authenticatedNavigation.filter(shouldShowNavItem)]
    }
    
    if (isStoryteller) {
      navigation = [...navigation, ...storytellerNavigation.filter(shouldShowNavItem)]
    }

    return navigation.filter(shouldShowNavItem)
  }

  const visibleNavigation = getVisibleNavigation()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 dark:border-stone-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <Link 
            href="/" 
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            onClick={closeMobileMenu}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-clay-500 to-sage-600 shadow-cultural">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <Typography variant="cultural-heading" className="text-clay-800 dark:text-clay-200">
                Empathy Ledger
              </Typography>
              <Typography variant="caption" className="text-stone-500 dark:text-stone-400 -mt-1">
                Cultural Stories & Wisdom
              </Typography>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {visibleNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  "text-stone-600 dark:text-stone-300 hover:text-clay-700 dark:hover:text-clay-300",
                  "hover:bg-clay-50 dark:hover:bg-clay-950/30"
                )}
              >
                {item.icon}
                <span>{item.name}</span>
                {item.badge && (
                  <Badge variant="cultural-featured" size="sm">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {/* User Profile or Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                {profile && (
                  <div className="hidden sm:block text-right">
                    <Typography variant="small" className="text-stone-700 dark:text-stone-300">
                      {profile.display_name || profile.first_name || 'User'}
                    </Typography>
                    {isStoryteller && (
                      <Badge variant="sage-soft" size="sm" className="mt-1">
                        Storyteller
                      </Badge>
                    )}
                    {isElder && (
                      <Badge variant="clay-soft" size="sm" className="mt-1 ml-1">
                        Elder
                      </Badge>
                    )}
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="hidden sm:flex"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button variant="cultural-primary" size="sm" asChild>
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 dark:border-stone-800 bg-background">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {visibleNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMobileMenu}
                className={cn(
                  "flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors",
                  "text-stone-600 dark:text-stone-300 hover:text-clay-700 dark:hover:text-clay-300",
                  "hover:bg-clay-50 dark:hover:bg-clay-950/30"
                )}
              >
                {item.icon}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Typography variant="body-small" className="font-medium">
                      {item.name}
                    </Typography>
                    {item.badge && (
                      <Badge variant="cultural-featured" size="sm">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <Typography variant="caption" className="text-stone-500 dark:text-stone-400">
                      {item.description}
                    </Typography>
                  )}
                </div>
              </Link>
            ))}

            {/* Mobile Auth Actions */}
            <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-2">
              {isAuthenticated ? (
                <>
                  {profile && (
                    <div className="px-3 py-2">
                      <Typography variant="small" className="font-medium text-stone-700 dark:text-stone-300">
                        {profile.display_name || profile.first_name || 'User'}
                      </Typography>
                      <div className="flex space-x-1 mt-1">
                        {isStoryteller && (
                          <Badge variant="sage-soft" size="sm">
                            Storyteller
                          </Badge>
                        )}
                        {isElder && (
                          <Badge variant="clay-soft" size="sm">
                            Elder
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      signOut()
                      closeMobileMenu()
                    }}
                    className="w-full justify-start"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    asChild 
                    className="w-full justify-start"
                  >
                    <Link href="/auth/signin" onClick={closeMobileMenu}>
                      Sign In
                    </Link>
                  </Button>
                  <Button 
                    variant="cultural-primary" 
                    size="sm" 
                    asChild 
                    className="w-full justify-start"
                  >
                    <Link href="/auth/signup" onClick={closeMobileMenu}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
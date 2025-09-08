'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X, User, Heart, Map, BookOpen, Users, BarChart3, Info, Layout, Settings } from 'lucide-react'

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
    description: 'Discover personal, family, community, and cultural stories',
    showFor: 'all'
  },
  {
    name: 'Storytellers',
    href: '/storytellers',
    icon: <Users className="w-4 h-4" />,
    description: 'Meet storytellers from all backgrounds',
    showFor: 'all'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: <BarChart3 className="w-4 h-4" />,
    description: 'Community impact and cultural insights',
    showFor: 'all'
  }
]

const authenticatedNavigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/storytellers/dashboard',
    icon: <Layout className="w-4 h-4" />,
    description: 'Your storyteller tools',
    requiresAuth: true,
    showFor: 'authenticated'
  },
  {
    name: 'Create',
    href: '/stories/create',
    icon: <BookOpen className="w-4 h-4" />,
    description: 'Share your story',
    requiresAuth: true,
    showFor: 'authenticated'
  }
]

const getStorytellerNavigation = (userId: string): NavigationItem[] => [
  {
    name: 'Storyteller Dashboard',
    href: `/storytellers/${userId}/dashboard`,
    badge: 'Dashboard',
    requiresAuth: true,
    showFor: 'storytellers'
  },
  {
    name: 'My Stories',
    href: `/storytellers/${userId}/stories`,
    requiresAuth: true,
    showFor: 'storytellers'
  },
  {
    name: 'Analytics',
    href: `/storytellers/${userId}/analytics`,
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
    
    if (isStoryteller && user?.id) {
      const storytellerNav = getStorytellerNavigation(user.id)
      navigation = [...navigation, ...storytellerNav.filter(shouldShowNavItem)]
    }

    return navigation.filter(shouldShowNavItem)
  }

  const visibleNavigation = getVisibleNavigation()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
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
              <Typography variant="cultural-heading" className="text-gray-900 dark:text-white text-lg font-bold">
                Empathy Ledger
              </Typography>
              <Typography variant="caption" className="text-gray-600 dark:text-gray-400 -mt-1 text-xs">
                Every Story Matters
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
                  "flex items-center space-x-1 px-2 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap",
                  "text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white",
                  "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                {item.icon}
                <span className="font-semibold">{item.name}</span>
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild
                    className="hidden sm:flex border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-800 transition-all duration-200 font-semibold px-3 py-1.5"
                  >
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-semibold">
                          {profile.display_name || profile.first_name || 'User'}
                        </span>
                        <div className="flex gap-1 mt-0.5">
                          {isStoryteller && (
                            <Badge variant="sage-soft" size="sm" className="text-xs px-1.5 py-0">
                              Storyteller
                            </Badge>
                          )}
                          {isElder && (
                            <Badge variant="clay-soft" size="sm" className="text-xs px-1.5 py-0">
                              Elder
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  </Button>
                )}
                <Button 
                  size="sm" 
                  asChild
                  className="hidden sm:flex bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold border-0 px-3 py-1"
                >
                  <Link href="/admin" className="flex items-center gap-1">
                    <Settings className="w-3 h-3" />
                    Admin
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="hidden sm:flex border-gray-400 text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-semibold px-3 py-1"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                  className="border-gray-400 text-black hover:bg-gray-100 hover:text-black hover:border-gray-500 transition-all duration-200 font-bold"
                >
                  <Link href="/auth/signin" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Sign In
                  </Link>
                </Button>
                <Button 
                  size="sm" 
                  asChild
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-semibold border-0"
                >
                  <Link href="/auth/signup" className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Get Started
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden border border-gray-400 text-gray-700 hover:bg-gray-100"
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
        <div className="md:hidden border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {visibleNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMobileMenu}
                className={cn(
                  "flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors",
                  "text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white font-medium",
                  "hover:bg-clay-50 dark:hover:bg-clay-950/30"
                )}
              >
                {item.icon}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Typography variant="body-small" className="font-medium text-gray-700 dark:text-gray-200">
                      {item.name}
                    </Typography>
                    {item.badge && (
                      <Badge variant="cultural-featured" size="sm">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <Typography variant="caption" className="text-gray-700 dark:text-gray-300 font-medium">
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                      className="w-full justify-start border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-800 transition-all duration-200 font-semibold mb-2"
                    >
                      <Link href="/profile" onClick={closeMobileMenu} className="flex items-center gap-3">
                        <User className="w-4 h-4" />
                        <div className="flex flex-col items-start">
                          <span className="font-semibold">
                            {profile.display_name || profile.first_name || 'User'}
                          </span>
                          <div className="flex space-x-1 mt-1">
                            {isStoryteller && (
                              <Badge variant="sage-soft" size="sm" className="text-xs">
                                Storyteller
                              </Badge>
                            )}
                            {isElder && (
                              <Badge variant="clay-soft" size="sm" className="text-xs">
                                Elder
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Link>
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    asChild
                    className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold border-0 mb-2"
                  >
                    <Link href="/admin" onClick={closeMobileMenu} className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Admin
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      signOut()
                      closeMobileMenu()
                    }}
                    className="w-full justify-start border-gray-400 text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-semibold"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild 
                    className="w-full justify-start border-clay-300 text-clay-700 hover:bg-clay-50 hover:text-clay-800 hover:border-clay-400 transition-all duration-200 font-medium"
                  >
                    <Link href="/auth/signin" onClick={closeMobileMenu} className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Sign In
                    </Link>
                  </Button>
                  <Button 
                    size="sm" 
                    asChild 
                    className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold border-0"
                  >
                    <Link href="/auth/signup" onClick={closeMobileMenu} className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
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
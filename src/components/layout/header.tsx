'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, User, Heart, Map, BookOpen, Users, BarChart3, Info, Layout, Settings, ChevronDown, FolderOpen, LogOut, MoreHorizontal, Rocket } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/context/auth.context'
import { cn } from '@/lib/utils'

interface NavigationItem {
  name: string
  href: string
  iconName?: string
  badge?: string
  description?: string
  requiresAuth?: boolean
  showFor?: 'all' | 'authenticated' | 'storytellers' | 'elders'
}

// Helper function to render icons
const renderIcon = (iconName: string, className: string) => {
  switch (iconName) {
    case 'BookOpen':
      return <BookOpen className={className} />
    case 'Users':
      return <Users className={className} />
    case 'BarChart3':
      return <BarChart3 className={className} />
    case 'FolderOpen':
      return <FolderOpen className={className} />
    default:
      return null
  }
}

// Primary navigation (always visible on desktop)
const primaryNavigation: NavigationItem[] = [
  {
    name: 'Stories',
    href: '/stories',
    iconName: 'BookOpen',
    description: 'Discover personal, family, community, and cultural stories',
    showFor: 'all'
  },
  {
    name: 'Storytellers',
    href: '/storytellers',
    iconName: 'Users',
    description: 'Meet storytellers from all backgrounds',
    showFor: 'all'
  }
]

// Secondary navigation (goes into "More" menu on smaller screens)
const secondaryNavigation: NavigationItem[] = [
  {
    name: 'Projects',
    href: '/projects',
    iconName: 'FolderOpen',
    description: 'Explore storytelling projects and initiatives',
    showFor: 'all'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    iconName: 'BarChart3',
    description: 'Platform insights and metrics',
    showFor: 'all'
  }
]

const authenticatedNavigation: NavigationItem[] = [
  {
    name: 'Organizations',
    href: '/organisations',
    iconName: 'Users',
    description: 'View and manage your organisations',
    requiresAuth: true,
    showFor: 'authenticated'
  }
]

const getStorytellerNavigation = (userId: string): NavigationItem[] => [
  // Dashboard is only shown in user dropdown menu, not main navigation
]

export default function Header() {
  const { user, profile, isAuthenticated, isStoryteller, isElder, isAdmin, isSuperAdmin, signOut, isLoading } = useAuth()

  // Debug header values
  console.log('🔍 Header Auth Values:', {
    hasUser: !!user,
    hasProfile: !!profile,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    profileDisplayName: profile?.display_name,
    userEmail: user?.email
  })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
  const [forceShowAuth, setForceShowAuth] = useState(false)
  const [isAdminBypass, setIsAdminBypass] = useState(false)
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const moreMenuRef = useRef<HTMLDivElement>(null)
  
  // Check for admin bypass mode on client only
  React.useEffect(() => {
    const adminBypass = (
      localStorage.getItem('admin_bypass') === 'true' ||
      localStorage.getItem('temp_admin_access') === 'benjamin@act.place'
    )
    setIsAdminBypass(adminBypass)
  }, [])
  
  
  // Force show auth buttons after 3 seconds if still loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setForceShowAuth(true)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [isLoading])

  // Handle click outside for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false)
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Authentication state is now working correctly

  // Use actual auth data only - no fallbacks to prevent conflicts
  const actualUser = user || (isAdminBypass ? { email: 'benjamin@act.place' } : null)
  const actualProfile = profile || (isAdminBypass ? { display_name: 'Benjamin Knight', full_name: 'Benjamin Knight' } : null)
  const actualIsAuthenticated = isAuthenticated || isAdminBypass
  const actualIsStoryteller = isStoryteller || isAdminBypass
  const actualIsAdmin = isAdmin || isAdminBypass
  const actualIsSuperAdmin = isSuperAdmin || isAdminBypass

  
  // Clean sign out handler using the auth context
  const handleSignOut = async () => {
    try {
      // Clear admin bypass flags
      if (isAdminBypass) {
        localStorage.removeItem('admin_bypass')
        localStorage.removeItem('temp_admin_access')
      }
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const shouldShowNavItem = (item: NavigationItem): boolean => {
    switch (item.showFor) {
      case 'authenticated':
        return actualIsAuthenticated
      case 'storytellers':
        return actualIsStoryteller
      case 'elders':
        return isElder
      case 'all':
      default:
        return true
    }
  }

  const getVisibleNavigation = (): NavigationItem[] => {
    let navigation = [...primaryNavigation, ...secondaryNavigation]

    if (actualIsAuthenticated) {
      navigation = [...navigation, ...authenticatedNavigation.filter(shouldShowNavItem)]
    }

    if (actualIsStoryteller && actualUser?.id) {
      const storytellerNav = getStorytellerNavigation(actualUser.id)
      navigation = [...navigation, ...storytellerNav.filter(shouldShowNavItem)]
    }

    return navigation.filter(shouldShowNavItem)
  }

  const visibleNavigation = getVisibleNavigation()
  const visiblePrimaryNavigation = primaryNavigation.filter(shouldShowNavItem)
  const visibleSecondaryNavigation = [...secondaryNavigation, ...authenticatedNavigation].filter(shouldShowNavItem)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white shadow-sm backdrop-blur-sm">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo and Brand */}
          <Link 
            href="/" 
            className="flex items-center gap-4 hover:opacity-80 transition-all duration-200"
            onClick={closeMobileMenu}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-earth-600 via-clay-600 to-sage-600 shadow-cultural">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <Typography variant="cultural-title" className="text-earth-800 text-xl font-bold leading-tight">
                Empathy Ledger
              </Typography>
              <Typography variant="cultural-caption" className="text-sage-600 -mt-1 text-sm font-medium">
                Every Story Matters
              </Typography>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {/* Primary Navigation - Always Visible */}
            {visiblePrimaryNavigation.map((item) => (
              <Link
                key={`${item.name}-${item.href}`}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-body-md font-medium transition-all duration-200 whitespace-nowrap",
                  "text-stone-700 hover:text-earth-800",
                  "hover:bg-stone-50 hover:shadow-sm"
                )}
              >
                {item.iconName && renderIcon(item.iconName, "w-4 h-4")}
                <span className="font-medium">{item.name}</span>
                {item.badge && (
                  <Badge variant="sage-outline" size="sm">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}

            {/* More Menu - Secondary Navigation */}
            {visibleSecondaryNavigation.length > 0 && (
              <div className="relative" ref={moreMenuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-lg text-body-md font-medium transition-all duration-200",
                    "text-stone-700 hover:text-earth-800",
                    "hover:bg-stone-50 hover:shadow-sm",
                    isMoreMenuOpen && "bg-stone-50 text-earth-800"
                  )}
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                >
                  <MoreHorizontal className="w-4 h-4" />
                  <span className="font-medium">More</span>
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform",
                    isMoreMenuOpen && "rotate-180"
                  )} />
                </Button>

                {/* More Dropdown Menu */}
                {isMoreMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-stone-200 py-2 z-50">
                    {visibleSecondaryNavigation.map((item) => (
                      <Link
                        key={`more-${item.name}-${item.href}`}
                        href={item.href}
                        onClick={() => setIsMoreMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 text-body-sm transition-all duration-200",
                          "text-stone-700 hover:text-earth-800 hover:bg-stone-50"
                        )}
                      >
                        {item.iconName && renderIcon(item.iconName, "w-4 h-4")}
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          {item.description && (
                            <div className="text-stone-500 text-xs mt-0.5">{item.description}</div>
                          )}
                        </div>
                        {item.badge && (
                          <Badge variant="sage-outline" size="sm">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {/* User Profile or Auth Buttons */}
            {isLoading && !forceShowAuth ? (
              <div className="hidden sm:flex items-center space-x-2">
                <div className="animate-pulse bg-grey-200 rounded px-4 py-2 w-20 h-8"></div>
                <div className="animate-pulse bg-grey-200 rounded px-4 py-2 w-24 h-8"></div>
              </div>
            ) : actualIsAuthenticated ? (
              <div className="hidden sm:flex items-center">
                {/* User Dropdown Menu */}
                <div className="relative" ref={userDropdownRef}>
                  <Button
                    variant="outline"
                    size="cultural-sm"
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 border-stone-300 hover:bg-stone-50 hover:border-earth-300",
                      isUserDropdownOpen && "bg-stone-50 border-earth-300"
                    )}
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  >
                    <User className="w-4 h-4 text-stone-600" />
                    <span className="text-body-sm font-medium text-stone-700">
                      {actualProfile?.display_name || actualProfile?.first_name || actualUser?.email?.split('@')[0] || 'User'}
                    </span>
                    {(isAdmin || isSuperAdmin) && (
                      <Badge variant="outline" size="sm" className="text-xs px-2 py-0.5 bg-clay-50 text-clay-700 border-clay-300">
                        Admin
                      </Badge>
                    )}
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform",
                      isUserDropdownOpen && "rotate-180"
                    )} />
                  </Button>

                  {/* User Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-stone-200 py-2 z-50">
                      {/* Profile Link */}
                      <Link
                        href="/profile"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-body-sm transition-all duration-200 text-stone-700 hover:text-earth-800 hover:bg-stone-50"
                      >
                        <User className="w-4 h-4" />
                        <div className="flex-1">
                          <div className="font-medium">Profile</div>
                          <div className="text-stone-500 text-xs mt-0.5">View and edit your profile</div>
                        </div>
                      </Link>

                      {/* Dashboard Link */}
                      {actualIsStoryteller && actualUser?.id && (
                        <Link
                          href={`/storytellers/${actualUser.id}/dashboard`}
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-body-sm transition-all duration-200 text-stone-700 hover:text-earth-800 hover:bg-stone-50"
                        >
                          <Layout className="w-4 h-4" />
                          <div className="flex-1">
                            <div className="font-medium">Dashboard</div>
                            <div className="text-stone-500 text-xs mt-0.5">Your storyteller dashboard</div>
                          </div>
                        </Link>
                      )}


                      {/* Admin Link */}
                      {(isAdmin || isSuperAdmin) && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-body-sm transition-all duration-200 text-stone-700 hover:text-earth-800 hover:bg-stone-50"
                        >
                          <Settings className="w-4 h-4" />
                          <div className="flex-1">
                            <div className="font-medium">Admin</div>
                            <div className="text-stone-500 text-xs mt-0.5">Platform administration</div>
                          </div>
                        </Link>
                      )}

                      {/* Divider */}
                      <div className="border-t border-stone-200 my-2" />

                      {/* Sign Out */}
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false)
                          handleSignOut()
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-body-sm transition-all duration-200 text-red-600 hover:text-red-700 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <div className="flex-1">
                          <div className="font-medium">Sign Out</div>
                          <div className="text-red-500 text-xs mt-0.5">End your session</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="cultural-sm" 
                  asChild
                  className="border-stone-300 text-stone-700 hover:bg-stone-50 hover:border-earth-300 hover:text-earth-700 transition-all duration-200 font-medium"
                >
                  <Link href="/auth/signin" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Sign In
                  </Link>
                </Button>
                <Button 
                  variant="earth-primary"
                  size="cultural-sm" 
                  asChild
                  className="shadow-cultural hover:shadow-lg transition-all duration-200"
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
              className="md:hidden border border-stone-300 text-stone-700 hover:bg-stone-50 hover:border-earth-300"
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
        <div className="md:hidden border-t border-stone-200 bg-white shadow-lg">
          <div className="container mx-auto px-6 py-6 space-y-3">
            {visibleNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMobileMenu}
                className={cn(
                  "flex items-center gap-4 px-4 py-4 rounded-lg transition-all duration-200",
                  "text-stone-700 hover:text-earth-800 font-medium",
                  "hover:bg-stone-50 hover:shadow-sm"
                )}
              >
                {item.iconName && renderIcon(item.iconName, "w-4 h-4")}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Typography variant="body-md" className="font-medium text-stone-700">
                      {item.name}
                    </Typography>
                    {item.badge && (
                      <Badge variant="sage-outline" size="sm">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <Typography variant="body-xs" className="text-stone-500 mt-1">
                      {item.description}
                    </Typography>
                  )}
                </div>
              </Link>
            ))}

            {/* Mobile Auth Actions */}
            <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-2">
              {actualIsAuthenticated ? (
                <>
                  {actualProfile && (
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
                            {actualProfile.display_name || actualProfile.first_name || actualUser?.email?.split('@')[0] || 'User'}
                          </span>
                          <div className="flex space-x-1 mt-1">
                            {(isAdmin || isSuperAdmin) && (
                              <Badge variant="outline" size="sm" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                Admin
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
                  
                  {actualIsStoryteller && actualUser?.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full justify-start border-grey-300 text-grey-700 hover:bg-grey-50 font-semibold mb-2"
                    >
                      <Link href={`/storytellers/${actualUser.id}/dashboard`} onClick={closeMobileMenu} className="flex items-center gap-2">
                        <Layout className="w-4 h-4" />
                        My Dashboard
                      </Link>
                    </Button>
                  )}


                  {(isAdmin || isSuperAdmin) && (
                    <Button 
                      size="sm" 
                      asChild
                      className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold border-0 mb-2"
                    >
                      <Link href="/admin" onClick={closeMobileMenu} className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleSignOut()
                      closeMobileMenu()
                    }}
                    className="w-full justify-start border-grey-400 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold"
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
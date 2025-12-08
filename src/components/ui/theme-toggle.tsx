'use client'

import React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/lib/context/theme.context'
import { Button } from './button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
  variant?: 'icon' | 'dropdown' | 'buttons'
}

/**
 * ThemeToggle - Toggle between light, dark, and system themes
 *
 * Variants:
 * - icon: Single button that cycles through themes (default)
 * - dropdown: Dropdown menu with all three options
 * - buttons: Segmented control showing all three options
 */
export function ThemeToggle({ className, variant = 'dropdown' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme()

  if (variant === 'icon') {
    const cycleTheme = () => {
      const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
      const currentIndex = themes.indexOf(theme)
      const nextIndex = (currentIndex + 1) % themes.length
      setTheme(themes[nextIndex])
    }

    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={cycleTheme}
        className={cn('min-h-[44px] min-w-[44px]', className)}
        aria-label={`Current theme: ${theme}. Click to change theme.`}
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </Button>
    )
  }

  if (variant === 'buttons') {
    return (
      <div className={cn('flex items-center gap-1 p-1 bg-muted rounded-lg', className)}>
        <Button
          variant={theme === 'light' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTheme('light')}
          className="min-h-[36px] px-3"
          aria-label="Light theme"
          aria-pressed={theme === 'light'}
        >
          <Sun className="h-4 w-4 mr-2" />
          Light
        </Button>
        <Button
          variant={theme === 'dark' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTheme('dark')}
          className="min-h-[36px] px-3"
          aria-label="Dark theme"
          aria-pressed={theme === 'dark'}
        >
          <Moon className="h-4 w-4 mr-2" />
          Dark
        </Button>
        <Button
          variant={theme === 'system' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTheme('system')}
          className="min-h-[36px] px-3"
          aria-label="System theme"
          aria-pressed={theme === 'system'}
        >
          <Monitor className="h-4 w-4 mr-2" />
          System
        </Button>
      </div>
    )
  }

  // Default: dropdown variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('min-h-[44px] min-w-[44px]', className)}
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={cn(theme === 'light' && 'bg-accent')}
        >
          <Sun className="h-4 w-4 mr-2" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={cn(theme === 'dark' && 'bg-accent')}
        >
          <Moon className="h-4 w-4 mr-2" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={cn(theme === 'system' && 'bg-accent')}
        >
          <Monitor className="h-4 w-4 mr-2" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ThemeToggle

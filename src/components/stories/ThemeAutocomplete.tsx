'use client'

import { useState, useEffect } from 'react'
import { Check, X, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface Theme {
  id: string
  name: string
  category: string
  description: string
  mediaCount: number
  storyCount: number
  totalContent: number
}

interface ThemeAutocompleteProps {
  selectedThemes: string[]
  onThemesChange: (themes: string[]) => void
  placeholder?: string
  disabled?: boolean
  maxThemes?: number
  showCategoryCounts?: boolean
}

const CATEGORY_COLORS: Record<string, string> = {
  cultural: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  social: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  healing: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  justice: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  environmental: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  spiritual: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  economic: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  community: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  default: 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200',
}

export function ThemeAutocomplete({
  selectedThemes,
  onThemesChange,
  placeholder = 'Select themes...',
  disabled = false,
  maxThemes = 10,
  showCategoryCounts = true,
}: ThemeAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [themes, setThemes] = useState<Theme[]>([])
  const [byCategory, setByCategory] = useState<Record<string, Theme[]>>({})
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch themes on mount
  useEffect(() => {
    async function fetchThemes() {
      try {
        const response = await fetch('/api/v1/content-hub/themes')
        if (response.ok) {
          const data = await response.json()
          setThemes(data.themes || [])
          setByCategory(data.byCategory || {})
          setCategories(['all', ...(data.categories || [])])
        }
      } catch (error) {
        console.error('Error fetching themes:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchThemes()
  }, [])

  const toggleTheme = (themeName: string) => {
    if (disabled) return

    if (selectedThemes.includes(themeName)) {
      // Remove theme
      onThemesChange(selectedThemes.filter((t) => t !== themeName))
    } else {
      // Add theme (check max limit)
      if (selectedThemes.length >= maxThemes) {
        // TODO: Show toast notification
        return
      }
      onThemesChange([...selectedThemes, themeName])
    }
  }

  const removeTheme = (themeName: string) => {
    if (disabled) return
    onThemesChange(selectedThemes.filter((t) => t !== themeName))
  }

  // Filter themes by selected category and search query
  const filteredThemes = themes.filter((theme) => {
    const matchesCategory =
      selectedCategory === 'all' || theme.category === selectedCategory
    const matchesSearch =
      searchQuery === '' ||
      theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theme.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Get theme object by name
  const getTheme = (name: string) => themes.find((t) => t.name === name)

  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS.default
  }

  return (
    <div className="space-y-2">
      {/* Selected Themes Display */}
      {selectedThemes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedThemes.map((themeName) => {
            const theme = getTheme(themeName)
            return (
              <Badge
                key={themeName}
                variant="secondary"
                className={cn(
                  'flex items-center gap-1 px-2 py-1',
                  theme && getCategoryColor(theme.category)
                )}
              >
                {themeName}
                {showCategoryCounts && theme && (
                  <span className="text-xs opacity-70">
                    ({theme.totalContent})
                  </span>
                )}
                <button
                  onClick={() => removeTheme(themeName)}
                  disabled={disabled}
                  className="ml-1 hover:opacity-70"
                  type="button"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}

      {/* Theme Picker */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled || selectedThemes.length >= maxThemes}
          >
            <span className="text-muted-foreground">
              {selectedThemes.length >= maxThemes
                ? `Maximum ${maxThemes} themes selected`
                : placeholder}
            </span>
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search themes..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />

            {/* Category Tabs */}
            <div className="flex gap-1 p-2 border-b overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    'px-3 py-1 text-xs rounded-md whitespace-nowrap transition-colors',
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  )}
                  type="button"
                >
                  {category === 'all'
                    ? 'All'
                    : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            <CommandList>
              {loading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Loading themes...
                </div>
              ) : filteredThemes.length === 0 ? (
                <CommandEmpty>No themes found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredThemes.map((theme) => {
                    const isSelected = selectedThemes.includes(theme.name)
                    return (
                      <CommandItem
                        key={theme.id}
                        onSelect={() => toggleTheme(theme.name)}
                        className="flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div
                            className={cn(
                              'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0',
                              isSelected
                                ? 'bg-primary border-primary'
                                : 'border-muted-foreground'
                            )}
                          >
                            {isSelected && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">
                                {theme.name}
                              </span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-xs shrink-0',
                                  getCategoryColor(theme.category)
                                )}
                              >
                                {theme.category}
                              </Badge>
                            </div>
                            {theme.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {theme.description}
                              </p>
                            )}
                          </div>
                        </div>
                        {showCategoryCounts && (
                          <div className="text-xs text-muted-foreground shrink-0">
                            <div className="text-right">
                              {theme.storyCount + theme.mediaCount} items
                            </div>
                          </div>
                        )}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground">
        {selectedThemes.length} / {maxThemes} themes selected
      </p>
    </div>
  )
}

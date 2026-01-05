'use client'

import React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Leaf,
  Users,
  Heart,
  BookOpen,
  Sparkles,
  Mountain,
  Droplet,
  Sun,
  Moon,
  TreePine,
  Fish,
  Bird
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Theme {
  id: string
  name: string
  slug: string
  description: string
  story_count: number
  icon?: string
  color?: string
}

interface BrowseByThemeProps {
  themes: Theme[]
  className?: string
}

const getThemeIcon = (iconName?: string) => {
  const iconClass = "w-6 h-6"
  switch (iconName) {
    case 'Leaf':
      return <Leaf className={iconClass} />
    case 'Users':
      return <Users className={iconClass} />
    case 'Heart':
      return <Heart className={iconClass} />
    case 'BookOpen':
      return <BookOpen className={iconClass} />
    case 'Sparkles':
      return <Sparkles className={iconClass} />
    case 'Mountain':
      return <Mountain className={iconClass} />
    case 'Droplet':
      return <Droplet className={iconClass} />
    case 'Sun':
      return <Sun className={iconClass} />
    case 'Moon':
      return <Moon className={iconClass} />
    case 'TreePine':
      return <TreePine className={iconClass} />
    case 'Fish':
      return <Fish className={iconClass} />
    case 'Bird':
      return <Bird className={iconClass} />
    default:
      return <BookOpen className={iconClass} />
  }
}

const getThemeColorClass = (color?: string) => {
  switch (color) {
    case 'terracotta':
      return 'bg-[#D97757]/10 text-[#D97757] hover:bg-[#D97757]/20'
    case 'forest':
      return 'bg-[#2D5F4F]/10 text-[#2D5F4F] hover:bg-[#2D5F4F]/20'
    case 'ochre':
      return 'bg-[#D4A373]/10 text-[#D4A373] hover:bg-[#D4A373]/20'
    default:
      return 'bg-[#F8F6F1] text-[#2C2C2C] hover:bg-[#D97757]/10'
  }
}

// Default themes if none provided
const defaultThemes: Theme[] = [
  {
    id: '1',
    name: 'Land & Territory',
    slug: 'land-territory',
    description: 'Stories about connection to land and traditional territories',
    story_count: 0,
    icon: 'Mountain',
    color: 'forest'
  },
  {
    id: '2',
    name: 'Elders & Wisdom',
    slug: 'elders-wisdom',
    description: 'Traditional knowledge passed down through generations',
    story_count: 0,
    icon: 'Users',
    color: 'ochre'
  },
  {
    id: '3',
    name: 'Language & Culture',
    slug: 'language-culture',
    description: 'Preserving Indigenous languages and cultural practices',
    story_count: 0,
    icon: 'BookOpen',
    color: 'terracotta'
  },
  {
    id: '4',
    name: 'Healing & Wellness',
    slug: 'healing-wellness',
    description: 'Stories of healing, resilience, and community wellness',
    story_count: 0,
    icon: 'Heart',
    color: 'forest'
  },
  {
    id: '5',
    name: 'Ceremony & Tradition',
    slug: 'ceremony-tradition',
    description: 'Sacred ceremonies and cultural traditions',
    story_count: 0,
    icon: 'Sparkles',
    color: 'ochre'
  },
  {
    id: '6',
    name: 'Water & Rivers',
    slug: 'water-rivers',
    description: 'Stories about water as life and cultural significance',
    story_count: 0,
    icon: 'Droplet',
    color: 'forest'
  },
  {
    id: '7',
    name: 'Seasons & Cycles',
    slug: 'seasons-cycles',
    description: 'Natural cycles and seasonal knowledge',
    story_count: 0,
    icon: 'Sun',
    color: 'terracotta'
  },
  {
    id: '8',
    name: 'Dreams & Spirit',
    slug: 'dreams-spirit',
    description: 'Spiritual journeys and dream stories',
    story_count: 0,
    icon: 'Moon',
    color: 'ochre'
  },
  {
    id: '9',
    name: 'Plants & Medicine',
    slug: 'plants-medicine',
    description: 'Traditional plant knowledge and medicine',
    story_count: 0,
    icon: 'Leaf',
    color: 'forest'
  },
  {
    id: '10',
    name: 'Animals & Birds',
    slug: 'animals-birds',
    description: 'Stories about animals, birds, and their teachings',
    story_count: 0,
    icon: 'Bird',
    color: 'terracotta'
  },
  {
    id: '11',
    name: 'Family & Kinship',
    slug: 'family-kinship',
    description: 'Family histories and kinship connections',
    story_count: 0,
    icon: 'Users',
    color: 'ochre'
  },
  {
    id: '12',
    name: 'Forest & Trees',
    slug: 'forest-trees',
    description: 'Stories about forests and the wisdom of trees',
    story_count: 0,
    icon: 'TreePine',
    color: 'forest'
  }
]

export function BrowseByTheme({ themes, className }: BrowseByThemeProps) {
  const displayThemes = themes && themes.length > 0 ? themes : defaultThemes

  return (
    <section className={cn("py-16 md:py-20 bg-[#F8F6F1]", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-12">
          <Badge
            variant="outline"
            className="border-[#2D5F4F] text-[#2D5F4F] bg-[#2D5F4F]/5"
          >
            Browse by Theme
          </Badge>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#2C2C2C]">
            Explore Story Themes
          </h2>
          <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto">
            Discover stories organized by cultural themes and traditional knowledge
          </p>
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {displayThemes.slice(0, 12).map((theme) => (
            <Link
              key={theme.id}
              href={`/stories?theme=${theme.slug}`}
              className="group"
            >
              <Card
                className={cn(
                  "p-5 h-full transition-all duration-300 hover:shadow-lg border-2 hover:border-[#D97757]",
                  getThemeColorClass(theme.color)
                )}
              >
                <div className="space-y-3">
                  {/* Icon */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-lg bg-white/50 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      {getThemeIcon(theme.icon)}
                    </div>
                    {theme.story_count > 0 && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-white/80"
                      >
                        {theme.story_count}
                      </Badge>
                    )}
                  </div>

                  {/* Theme Name */}
                  <h3 className="font-serif text-lg font-bold leading-tight">
                    {theme.name}
                  </h3>

                  {/* Description (hidden on mobile, shown on md+) */}
                  <p className="text-xs opacity-80 leading-relaxed line-clamp-2 hidden md:block">
                    {theme.description}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-[#D97757] hover:text-[#D97757]/80 font-medium transition-colors"
          >
            View All Themes
            <span className="text-2xl">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

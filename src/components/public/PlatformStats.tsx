'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { BookOpen, Users, Globe, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlatformStatsProps {
  totalStories?: number
  activeStorytellers?: number
  culturalCommunities?: number
  countriesReached?: number
  className?: string
}

export function PlatformStats({
  totalStories = 0,
  activeStorytellers = 0,
  culturalCommunities = 0,
  countriesReached = 0,
  className
}: PlatformStatsProps) {
  const stats = [
    {
      icon: BookOpen,
      value: totalStories,
      label: 'Stories Shared',
      color: 'terracotta',
      description: 'Voices preserving knowledge'
    },
    {
      icon: Users,
      value: activeStorytellers,
      label: 'Active Storytellers',
      color: 'forest',
      description: 'Community members sharing'
    },
    {
      icon: Heart,
      value: culturalCommunities,
      label: 'Cultural Communities',
      color: 'ochre',
      description: 'Diverse traditions represented'
    },
    {
      icon: Globe,
      value: countriesReached,
      label: 'Countries Reached',
      color: 'forest',
      description: 'Global connection and impact'
    }
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'terracotta':
        return {
          bg: 'bg-[#D97757]/10',
          text: 'text-[#D97757]',
          iconBg: 'bg-[#D97757]',
          iconText: 'text-white'
        }
      case 'forest':
        return {
          bg: 'bg-[#2D5F4F]/10',
          text: 'text-[#2D5F4F]',
          iconBg: 'bg-[#2D5F4F]',
          iconText: 'text-white'
        }
      case 'ochre':
        return {
          bg: 'bg-[#D4A373]/10',
          text: 'text-[#D4A373]',
          iconBg: 'bg-[#D4A373]',
          iconText: 'text-[#2C2C2C]'
        }
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          iconBg: 'bg-gray-500',
          iconText: 'text-white'
        }
    }
  }

  return (
    <section className={cn("py-16 md:py-20 bg-white", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#2C2C2C]">
            Our Growing Community
          </h2>
          <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto">
            Building a platform where every story matters and every voice is heard with respect
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => {
            const colors = getColorClasses(stat.color)
            const Icon = stat.icon

            return (
              <Card
                key={index}
                className={cn(
                  "p-6 transition-all duration-300 hover:shadow-lg border-2",
                  colors.bg
                )}
              >
                <div className="space-y-4">
                  {/* Icon */}
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center shadow-md",
                    colors.iconBg
                  )}>
                    <Icon className={cn("w-6 h-6", colors.iconText)} />
                  </div>

                  {/* Value */}
                  <div>
                    <div className={cn(
                      "text-4xl md:text-5xl font-bold mb-1",
                      colors.text
                    )}>
                      {stat.value.toLocaleString()}
                      {stat.value > 0 && index !== 3 && <span className="text-2xl">+</span>}
                    </div>
                    <div className="text-base font-semibold text-[#2C2C2C]">
                      {stat.label}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[#2C2C2C]/60 leading-relaxed">
                    {stat.description}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Additional Context */}
        <div className="mt-12 text-center">
          <p className="text-sm text-[#2C2C2C]/60 max-w-3xl mx-auto leading-relaxed">
            Every story on this platform is shared with consent, cultural protocols, and respect for Indigenous data sovereignty.
            We honor the wisdom of Elders and the voices of all community members.
          </p>
        </div>
      </div>
    </section>
  )
}

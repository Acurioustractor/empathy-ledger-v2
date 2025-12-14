'use client'

import React, { useState } from 'react'
import { Building2, ExternalLink, MapPin, Filter, Loader2, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DreamOrg {
  id: string
  name: string
  logo_url?: string
  website_url?: string
  description: string
  why_connect: string
  category: string
  location_text?: string
  contact_status: string
}

interface DreamOrganizationsProps {
  organizations: DreamOrg[]
  loading?: boolean
}

const categories = [
  { id: 'all', label: 'All' },
  { id: 'indigenous_rights', label: 'Indigenous Rights' },
  { id: 'cultural_preservation', label: 'Cultural Preservation' },
  { id: 'social_justice', label: 'Social Justice' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'education', label: 'Education' },
  { id: 'environment', label: 'Environment' },
  { id: 'media', label: 'Media' },
  { id: 'technology', label: 'Technology' },
  { id: 'philanthropy', label: 'Philanthropy' }
]

const statusColors: Record<string, string> = {
  dream: 'bg-sky-100 text-sky-700 border-sky-200',
  researching: 'bg-amber-100 text-amber-700 border-amber-200',
  reached_out: 'bg-purple-100 text-purple-700 border-purple-200',
  in_conversation: 'bg-green-100 text-green-700 border-green-200',
  partnered: 'bg-clay-100 text-clay-700 border-clay-200'
}

export function DreamOrganizations({ organizations, loading }: DreamOrganizationsProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredOrgs = selectedCategory === 'all'
    ? organizations
    : organizations.filter(org => org.category === selectedCategory)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-clay-500" />
      </div>
    )
  }

  if (organizations.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-sky-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Dream List Coming Soon</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            We're curating a list of incredible organizations we dream of partnering with.
            Know someone we should connect with?{' '}
            <a href="mailto:hello@empathyledger.com" className="text-clay-600 hover:underline">
              Let us know
            </a>.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((category) => {
          const count = category.id === 'all'
            ? organizations.length
            : organizations.filter(org => org.category === category.id).length

          if (category.id !== 'all' && count === 0) return null

          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                selectedCategory === category.id && 'bg-clay-600 hover:bg-clay-700'
              )}
            >
              {category.label}
              {count > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {count}
                </Badge>
              )}
            </Button>
          )
        })}
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrgs.map((org) => (
          <Card
            key={org.id}
            variant="cultural"
            className="hover:shadow-lg transition-shadow overflow-hidden"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {org.logo_url ? (
                    <img
                      src={org.logo_url}
                      alt={`${org.name} logo`}
                      className="w-12 h-12 object-contain mb-2"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-100 to-clay-100 flex items-center justify-center mb-2">
                      <Building2 className="w-6 h-6 text-sky-600" />
                    </div>
                  )}
                  <CardTitle className="text-lg truncate">{org.name}</CardTitle>
                </div>
                <Badge
                  variant="outline"
                  className={cn('text-xs whitespace-nowrap', statusColors[org.contact_status])}
                >
                  {org.contact_status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {org.category.replace('_', ' ')}
                </Badge>
                {org.location_text && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {org.location_text}
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0 space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {org.description}
              </p>

              <div className="p-3 bg-sage-50/50 dark:bg-sage-950/20 rounded-lg">
                <p className="text-xs font-medium text-sage-700 dark:text-sage-300 mb-1">
                  Why We Want to Connect:
                </p>
                <p className="text-sm text-sage-600 dark:text-sage-400 line-clamp-2">
                  {org.why_connect}
                </p>
              </div>

              {org.website_url && (
                <a
                  href={org.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-sky-600 hover:text-sky-700 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  Visit Website
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrgs.length === 0 && selectedCategory !== 'all' && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No organizations in this category yet.
          </p>
          <Button
            variant="link"
            onClick={() => setSelectedCategory('all')}
            className="mt-2"
          >
            View all organizations
          </Button>
        </div>
      )}
    </div>
  )
}

'use client'

import { Building2, Users, Settings, MapPin, Globe, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth.context'

interface OrganizationHeaderProps {
  organisation: {
    id: string
    name: string
    type: string
    description?: string
    location?: string
    website?: string
    created_at?: string
  }
}

const getTypeStyles = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'community':
      return 'bg-sage-100 text-sage-700 border-sage-200'
    case 'nonprofit':
      return 'bg-earth-100 text-earth-700 border-earth-200'
    case 'indigenous':
      return 'bg-clay-100 text-clay-700 border-clay-200'
    case 'educational':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    default:
      return 'bg-stone-100 text-stone-700 border-stone-200'
  }
}

export function OrganizationHeader({ organisation }: OrganizationHeaderProps) {
  const router = useRouter()
  const { isAdmin, isSuperAdmin } = useAuth()

  // Show admin controls if user is admin or super admin
  const showAdminControls = isAdmin || isSuperAdmin

  return (
    <div className="border-b border-stone-200 bg-gradient-to-r from-stone-50 via-sage-50/30 to-earth-50/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start gap-5">
          {/* Organization Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sage-500 to-earth-600 shadow-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Type Badge & Meta */}
            <div className="flex items-center gap-3 mb-2">
              <Badge
                variant="outline"
                className={`${getTypeStyles(organisation.type)} font-medium`}
              >
                <Users className="h-3 w-3 mr-1.5" />
                {organisation.type || 'Organization'}
              </Badge>

              {organisation.location && (
                <span className="flex items-center gap-1.5 text-body-sm text-stone-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {organisation.location}
                </span>
              )}

              {organisation.created_at && (
                <span className="flex items-center gap-1.5 text-body-sm text-stone-500">
                  <Calendar className="h-3.5 w-3.5" />
                  Est. {new Date(organisation.created_at).getFullYear()}
                </span>
              )}
            </div>

            {/* Organization Name */}
            <h1 className="text-display-md font-bold text-stone-900 tracking-tight">
              {organisation.name}
            </h1>

            {/* Description */}
            {organisation.description && (
              <p className="text-body-md text-stone-600 mt-2 max-w-3xl leading-relaxed">
                {organisation.description}
              </p>
            )}

            {/* Website Link */}
            {organisation.website && (
              <a
                href={organisation.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-body-sm text-sage-600 hover:text-sage-700 mt-3 transition-colors"
              >
                <Globe className="h-3.5 w-3.5" />
                {organisation.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>

          {/* Admin Edit Button */}
          {showAdminControls && (
            <div className="flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/admin/organisations/${organisation.id}/edit`)}
                className="flex items-center gap-2 border-stone-300 hover:bg-stone-100 hover:border-stone-400 transition-all"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
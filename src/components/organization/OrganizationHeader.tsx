'use client'

import { Building2, Users, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth.context'

interface OrganizationHeaderProps {
  organisation: {
    id: string
    name: string
    type: string
    description?: string
  }
}

export function OrganizationHeader({ organisation }: OrganizationHeaderProps) {
  const router = useRouter()
  const { isAdmin, isSuperAdmin } = useAuth()

  // Show admin controls if user is admin or super admin
  const showAdminControls = isAdmin || isSuperAdmin

  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="capitalize">{organisation.type} Organization</span>
            </div>

            <h1 className="text-2xl font-bold text-foreground">
              {organisation.name}
            </h1>

            {organisation.description && (
              <p className="text-muted-foreground mt-2 max-w-2xl">
                {organisation.description}
              </p>
            )}
          </div>

          {/* Admin Edit Button */}
          {showAdminControls && (
            <div className="flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/admin/organisations/${organisation.id}/edit`)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Edit Organization
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
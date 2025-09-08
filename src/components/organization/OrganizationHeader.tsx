'use client'

import { Building2, Users } from 'lucide-react'

interface OrganizationHeaderProps {
  organization: {
    id: string
    name: string
    type: string
    description?: string
  }
}

export function OrganizationHeader({ organization }: OrganizationHeaderProps) {
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
              <span className="capitalize">{organization.type} Organization</span>
            </div>
            
            <h1 className="text-2xl font-bold text-foreground">
              {organization.name}
            </h1>
            
            {organization.description && (
              <p className="text-muted-foreground mt-2 max-w-2xl">
                {organization.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
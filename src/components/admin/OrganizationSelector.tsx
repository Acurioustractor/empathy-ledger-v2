'use client'

import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2 } from 'lucide-react'

interface Organization {
  id: string
  name: string
  slug: string
}

export function OrganizationSelector({
  value,
  onChange
}: {
  value: string | 'all'
  onChange: (value: string) => void
}) {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const res = await fetch('/api/admin/organizations')
        const data = await res.json()

        if (data.organizations) {
          setOrganizations(data.organizations)
        }
      } catch (error) {
        console.error('Error fetching organizations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizations()
  }, [])

  if (loading) {
    return (
      <div className="w-[300px] h-10 bg-grey-100 animate-pulse rounded-md" />
    )
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[300px]">
        <Building2 className="w-4 h-4 mr-2" />
        <SelectValue placeholder="Select organization" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          All Organizations (Platform View)
        </SelectItem>
        {organizations.map(org => (
          <SelectItem key={org.id} value={org.id}>
            {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

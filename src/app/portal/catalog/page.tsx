'use client'

import { useState, useEffect } from 'react'
import { StoryCatalog } from '@/components/partner-portal'

export default function CatalogPage() {
  const [projects, setProjects] = useState<Array<{
    id: string
    name: string
    slug: string
  }>>([])

  // In production, this would come from auth context
  const appId = 'act-place-001'

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch(`/api/partner/projects?app_id=${appId}`)
        if (response.ok) {
          const data = await response.json()
          setProjects(data.projects || [])
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      }
    }

    fetchProjects()
  }, [appId])

  // Mock projects if none loaded
  const displayProjects = projects.length > 0 ? projects : [
    { id: 'proj-1', name: 'Climate Justice Stories', slug: 'climate-justice' },
    { id: 'proj-2', name: 'Community Voices', slug: 'community-voices' },
    { id: 'proj-3', name: 'First Nations Perspectives', slug: 'first-nations' }
  ]

  return <StoryCatalog appId={appId} projects={displayProjects} />
}

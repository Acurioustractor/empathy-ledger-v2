/**
 * Utility functions for Project Management
 */

import { Project } from './types'

/**
 * Format date for display
 */
export function formatDate(date: string | undefined, format: 'short' | 'long' = 'short'): string {
  if (!date) return 'N/A'

  const dateObj = new Date(date)

  if (format === 'short') {
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return dateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Calculate project duration in days
 */
export function calculateProjectDuration(startDate: string | undefined, endDate: string | undefined): number {
  if (!startDate || !endDate) return 0

  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Calculate project progress percentage
 */
export function calculateProjectProgress(startDate: string | undefined, endDate: string | undefined): number {
  if (!startDate) return 0
  if (!endDate) return 50 // Ongoing project

  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  const now = Date.now()

  if (now < start) return 0
  if (now > end) return 100

  const totalDuration = end - start
  const elapsed = now - start

  return Math.round((elapsed / totalDuration) * 100)
}

/**
 * Filter projects by search term
 */
export function filterProjectsBySearch(projects: Project[], searchTerm: string): Project[] {
  if (!searchTerm) return projects

  const lowerSearch = searchTerm.toLowerCase()

  return projects.filter(project =>
    project.name.toLowerCase().includes(lowerSearch) ||
    project.description.toLowerCase().includes(lowerSearch) ||
    project.organisation?.name.toLowerCase().includes(lowerSearch) ||
    project.location?.toLowerCase().includes(lowerSearch)
  )
}

/**
 * Filter projects by status
 */
export function filterProjectsByStatus(projects: Project[], status: string): Project[] {
  if (status === 'all') return projects
  return projects.filter(project => project.status === status)
}

/**
 * Sort projects by field
 */
export function sortProjects(
  projects: Project[],
  field: 'name' | 'createdAt' | 'status' | 'participantCount',
  direction: 'asc' | 'desc' = 'asc'
): Project[] {
  return [...projects].sort((a, b) => {
    let valueA: any = a[field]
    let valueB: any = b[field]

    // Handle string comparison
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      valueA = valueA.toLowerCase()
      valueB = valueB.toLowerCase()
    }

    // Handle date comparison
    if (field === 'createdAt') {
      valueA = new Date(valueA).getTime()
      valueB = new Date(valueB).getTime()
    }

    if (direction === 'asc') {
      return valueA > valueB ? 1 : valueA < valueB ? -1 : 0
    } else {
      return valueA < valueB ? 1 : valueA > valueB ? -1 : 0
    }
  })
}

/**
 * Calculate engagement rate
 */
export function calculateEngagementRate(storyCount: number, participantCount: number): number {
  if (participantCount === 0) return 0
  return Math.round((storyCount / participantCount) * 100)
}

/**
 * Get project statistics summary
 */
export function getProjectStats(project: Project) {
  return {
    duration: calculateProjectDuration(project.startDate, project.endDate),
    progress: calculateProjectProgress(project.startDate, project.endDate),
    engagementRate: project.engagementRate || calculateEngagementRate(project.storyCount, project.participantCount),
    storyCount: project.storyCount || 0,
    participantCount: project.participantCount || 0
  }
}

/**
 * Validate project form data
 */
export function validateProjectForm(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Project name is required')
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push('Project description is required')
  }

  if (data.name && data.name.length > 100) {
    errors.push('Project name must be less than 100 characters')
  }

  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    if (end < start) {
      errors.push('End date must be after start date')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

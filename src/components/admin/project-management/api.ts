/**
 * API utilities for Project Management
 */

import { Project, ProjectFormData } from './types'
import { ERROR_MESSAGES } from './constants'

/**
 * Fetch all projects
 */
export async function fetchProjects(params?: {
  status?: string
  organizationId?: string
  tenantId?: string
}): Promise<Project[]> {
  const searchParams = new URLSearchParams()

  if (params?.status && params.status !== 'all') {
    searchParams.set('status', params.status)
  }
  if (params?.organizationId) {
    searchParams.set('organizationId', params.organizationId)
  }
  if (params?.tenantId) {
    searchParams.set('tenantId', params.tenantId)
  }

  const response = await fetch(`/api/admin/projects?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error(ERROR_MESSAGES.fetch_projects_failed)
  }

  const data = await response.json()
  return data.projects || []
}

/**
 * Create a new project
 */
export async function createProject(projectData: ProjectFormData): Promise<Project> {
  const response = await fetch('/api/admin/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData)
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || ERROR_MESSAGES.create_project_failed)
  }

  const data = await response.json()
  return data.project
}

/**
 * Update an existing project
 */
export async function updateProject(projectId: string, projectData: Partial<ProjectFormData>): Promise<Project> {
  const response = await fetch('/api/admin/projects', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: projectId, ...projectData })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || ERROR_MESSAGES.update_project_failed)
  }

  const data = await response.json()
  return data.project
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<void> {
  const response = await fetch(`/api/admin/projects?id=${projectId}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || ERROR_MESSAGES.delete_project_failed)
  }
}

/**
 * Fetch project storytellers
 */
export async function fetchProjectStorytellers(projectId: string) {
  const response = await fetch(`/api/admin/projects/${projectId}/storytellers`)

  if (!response.ok) {
    throw new Error(ERROR_MESSAGES.fetch_storytellers_failed)
  }

  const data = await response.json()
  return data.storytellers || []
}

/**
 * Fetch project stories
 */
export async function fetchProjectStories(projectId: string) {
  const response = await fetch(`/api/admin/projects/${projectId}/stories`)

  if (!response.ok) {
    throw new Error(ERROR_MESSAGES.fetch_stories_failed)
  }

  const data = await response.json()
  return data.stories || []
}

/**
 * Fetch project media
 */
export async function fetchProjectMedia(projectId: string) {
  const response = await fetch(`/api/admin/projects/${projectId}/media`)

  if (!response.ok) {
    throw new Error(ERROR_MESSAGES.fetch_media_failed)
  }

  const data = await response.json()
  return data.media || []
}

/**
 * Fetch project transcripts
 */
export async function fetchProjectTranscripts(projectId: string) {
  const response = await fetch(`/api/admin/projects/${projectId}/transcripts`)

  if (!response.ok) {
    throw new Error(ERROR_MESSAGES.fetch_transcripts_failed)
  }

  const data = await response.json()
  return data.transcripts || []
}

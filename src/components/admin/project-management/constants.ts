/**
 * Constants and configuration for Project Management
 */

import { CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react'

// Project status configuration
export const PROJECT_STATUS_CONFIG = {
  active: {
    label: 'Active',
    variant: 'outline' as const,
    className: 'text-green-600 border-green-600',
    icon: CheckCircle
  },
  completed: {
    label: 'Completed',
    variant: 'outline' as const,
    className: 'text-blue-600 border-blue-600',
    icon: CheckCircle
  },
  paused: {
    label: 'Paused',
    variant: 'outline' as const,
    className: 'text-yellow-600 border-yellow-600',
    icon: Clock
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'destructive' as const,
    className: '',
    icon: XCircle
  }
} as const

export type ProjectStatus = keyof typeof PROJECT_STATUS_CONFIG

// Filter options
export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Projects' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' }
] as const

// Tab configuration
export const PROJECT_TABS = {
  overview: { id: 'overview', label: 'Overview' },
  storytellers: { id: 'storytellers', label: 'Storytellers' },
  stories: { id: 'stories', label: 'Stories' },
  media: { id: 'media', label: 'Media' },
  transcripts: { id: 'transcripts', label: 'Transcripts' },
  analytics: { id: 'analytics', label: 'Analytics' }
} as const

// Empty state messages
export const EMPTY_STATE_MESSAGES = {
  no_projects: {
    title: 'No projects found',
    description: 'Get started by creating your first project',
    actionLabel: 'Create Project'
  },
  no_filtered_projects: {
    title: 'No projects match your filters',
    description: 'Try adjusting your search or filter criteria',
    actionLabel: null
  },
  no_storytellers: {
    title: 'No storytellers in this project',
    description: 'Add storytellers to begin capturing their stories',
    actionLabel: 'Add Storyteller'
  },
  no_stories: {
    title: 'No stories yet',
    description: 'Stories will appear here as storytellers share their experiences',
    actionLabel: null
  },
  no_media: {
    title: 'No media files',
    description: 'Upload photos, videos, or audio recordings to enrich the stories',
    actionLabel: 'Upload Media'
  },
  no_transcripts: {
    title: 'No transcripts available',
    description: 'Transcripts will be generated from audio recordings',
    actionLabel: null
  }
} as const

// API error messages
export const ERROR_MESSAGES = {
  fetch_projects_failed: 'Failed to fetch projects',
  create_project_failed: 'Failed to create project',
  update_project_failed: 'Failed to update project',
  delete_project_failed: 'Failed to delete project',
  fetch_storytellers_failed: 'Failed to fetch storytellers',
  fetch_stories_failed: 'Failed to fetch stories',
  fetch_media_failed: 'Failed to fetch media',
  fetch_transcripts_failed: 'Failed to fetch transcripts'
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  project_created: 'Project created successfully',
  project_updated: 'Project updated successfully',
  project_deleted: 'Project deleted successfully',
  storyteller_added: 'Storyteller added to project',
  storyteller_removed: 'Storyteller removed from project'
} as const

// Confirmation messages
export const CONFIRMATION_MESSAGES = {
  delete_project: 'Are you sure you want to delete this project? This action cannot be undone.',
  remove_storyteller: 'Are you sure you want to remove this storyteller from the project?'
} as const

// Default form values
export const DEFAULT_PROJECT_FORM = {
  name: '',
  description: '',
  status: 'active' as ProjectStatus,
  location: '',
  startDate: '',
  endDate: '',
  organizationId: '',
  tenantId: ''
} as const

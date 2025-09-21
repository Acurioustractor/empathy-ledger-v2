// Project Management Types
export interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  location?: string
  startDate?: string
  endDate?: string
  createdAt: string
  organizationId?: string
  tenantId?: string
  organisation?: {
    id: string
    name: string
    type: string
  }
  tenant?: {
    id: string
    name: string
    status: string
  }
  storyCount: number
  participantCount: number
  engagementRate: number
}

export interface ProjectManagementProps {
  adminLevel: 'super_admin' | 'tenant_admin'
}

export interface ProjectDetailsViewProps {
  project: Project
}

export interface ProjectStorytellersTabProps {
  projectId: string
}

export interface ProjectStoriesTabProps {
  projectId: string
}

export interface ProjectMediaTabProps {
  projectId: string
}

export interface ProjectTranscriptsTabProps {
  projectId: string
}

export interface AddStorytellerFormProps {
  projectId: string
  onSuccess: () => void
  onCancel: () => void
}

export interface CreateProjectFormProps {
  onSubmit: (data: any) => void
}

export interface EditProjectFormProps {
  project: Project
  onSubmit: (data: any) => void
}

export interface CreateStoryFormProps {
  projectId: string
  onSuccess: () => void
  onCancel: () => void
}

export interface EditStoryFormProps {
  story: any
  onSuccess: () => void
  onCancel: () => void
}

export interface MediaUploadFormProps {
  projectId: string
  onSuccess: () => void
  onCancel: () => void
}

export interface CreateTranscriptFormProps {
  projectId: string
  onSuccess: () => void
  onCancel: () => void
}

export interface EditTranscriptFormProps {
  transcript: any
  onSuccess: () => void
  onCancel: () => void
}
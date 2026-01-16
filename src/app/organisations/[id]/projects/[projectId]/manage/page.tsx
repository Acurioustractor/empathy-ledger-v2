import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { ProjectRelationshipManager } from '@/components/organization/ProjectRelationshipManager'
import ProjectContextManager from '@/components/projects/ProjectContextManager'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Users, Shield } from 'lucide-react'

interface ManageProjectPageProps {
  params: Promise<{ id: string; projectId: string }>
}

export default async function ManageProjectPage({ params }: ManageProjectPageProps) {
  const { id: organizationId, projectId } = await params
  const supabase = await createSupabaseServerClient()

  // Get project details
  const { data: project } = await supabase
    .from('projects')
    .select('id, name, description')
    .eq('id', projectId)
    .single()

  if (!project) {
    notFound()
  }

  // Get organisation details
  const { data: organisation } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('id', organizationId)
    .single()

  if (!organisation) {
    notFound()
  }

  // Check user role for edit permissions
  const { data: { user } } = await supabase.auth.getUser()

  // Development mode bypass - grant edit access if super admin email is set
  const isDevelopment = process.env.NODE_ENV === 'development'
  const devBypass = isDevelopment && process.env.NEXT_PUBLIC_DEV_SUPER_ADMIN_EMAIL

  let canEdit = false

  if (devBypass) {
    console.log('🔓 DEV MODE: Granting edit access for project management')
    canEdit = true
  } else if (user) {
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('profile_id', user.id)
      .single()

    canEdit = membership?.role === 'admin' || membership?.role === 'project_manager'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
        <p className="text-gray-600">{project.description}</p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline">{organisation.name}</Badge>
          {canEdit ? (
            <Badge variant="default" className="gap-1">
              <Shield className="h-3 w-3" />
              Edit Access
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <Shield className="h-3 w-3" />
              View Only
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="context" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="context" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Context & Outcomes
          </TabsTrigger>
          <TabsTrigger value="relationships" className="gap-2">
            <Users className="h-4 w-4" />
            Storytellers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="context" className="space-y-6 mt-6">
          <ProjectContextManager
            projectId={projectId}
            canEdit={canEdit}
          />
        </TabsContent>

        <TabsContent value="relationships" className="space-y-6 mt-6">
          <ProjectRelationshipManager
            projectId={projectId}
            projectName={project.name}
            organizationId={organizationId}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
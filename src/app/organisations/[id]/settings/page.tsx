import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Building2, 
  Users, 
  Shield,
  Info,
  Calendar,
  Globe,
  FileText
} from 'lucide-react'

interface SettingsPageProps {
  params: Promise<{ id: string }>
}

async function getOrganizationSettings(organizationId: string) {
  const supabase = createSupabaseServerClient()
  
  const { data: organisation, error } = await supabase
    .from('organisations')
    .select('*')
    .eq('id', organizationId)
    .single()

  if (error || !organisation) {
    throw new Error('Organization not found')
  }

  // Get member count
  const { count: memberCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', organisation.tenant_id)

  return {
    organisation,
    memberCount: memberCount || 0
  }
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { id } = await params
  const { organisation, memberCount } = await getOrganizationSettings(id)

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Organization Settings</h2>
          <p className="text-muted-foreground">
            Manage your organisation configuration and preferences
          </p>
        </div>
        
        <Badge variant="secondary" className="gap-2">
          <Settings className="h-4 w-4" />
          Admin Access
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Organization Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <div className="text-lg font-semibold">{organisation.name}</div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Type</label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="capitalize">
                  {organisation.type}
                </Badge>
              </div>
            </div>
            
            {organisation.description && (
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-muted-foreground mt-1">
                  {organisation.description}
                </p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium">Tenant ID</label>
              <div className="font-mono text-sm text-muted-foreground mt-1">
                {organisation.tenant_id}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Created {new Date(organisation.created_at).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        {/* Community Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Community Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Members</span>
              <Badge variant="secondary">{memberCount}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Organization Status</span>
              <Badge variant="outline" className="text-green-600">
                Active
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Data Isolation</span>
              <Badge variant="outline" className="text-blue-600">
                Enabled
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Cultural Protocols */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Cultural Protocols
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {organisation.cultural_protocols ? (
              <div>
                <label className="text-sm font-medium">Active Protocols</label>
                <div className="mt-2 space-y-2">
                  {Object.entries(organisation.cultural_protocols as Record<string, any>).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                      <Badge variant={value ? "default" : "secondary"}>
                        {value ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No cultural protocols configured</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Privacy Level</label>
              <div className="mt-1">
                <Badge variant="outline">
                  {organisation.privacy_level || 'Standard'}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tenant Isolation</span>
              <Badge variant="outline" className="text-green-600">
                Active
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Data Access Control</span>
              <Badge variant="outline" className="text-blue-600">
                Enforced
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Organization Administration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              This organisation dashboard provides read-only access to your community data.
              All data is isolated by tenant to ensure privacy and security.
            </p>
            <p>
              For advanced configuration changes, contact your system administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
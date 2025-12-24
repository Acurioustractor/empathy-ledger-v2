'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Trash2, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react'

interface Organization {
  id: string
  name: string
  tenant_id: string
  stats: {
    members: number
    stories: number
    projects: number
  }
}

export default function AdminCleanupPage() {
  const [organisations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const loadOrganizations = async () => {
    try {
      const response = await fetch('/api/admin/orgs')
      const data = await response.json()
      setOrganizations(data.organisations || [])
    } catch (error) {
      console.error('Error loading organisations:', error)
      setMessage({ type: 'error', text: 'Failed to load organisations' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrganizations()
  }, [])

  const deleteOrganization = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/orgs/${id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        loadOrganizations() // Reload the list
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } catch (error) {
      console.error('Error deleting organisation:', error)
      setMessage({ type: 'error', text: 'Failed to delete organisation' })
    }
  }

  const fixTenant = async (id: string, name: string) => {
    if (!confirm(`Give "${name}" its own clean tenant? This will separate it from shared data.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/orgs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'fix_tenant',
          name: name
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        loadOrganizations() // Reload the list
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } catch (error) {
      console.error('Error fixing tenant:', error)
      setMessage({ type: 'error', text: 'Failed to fix tenant' })
    }
  }

  // Group organisations by tenant_id to identify shared tenants
  const groupedOrgs = organisations.reduce((acc, org) => {
    if (!acc[org.tenant_id]) {
      acc[org.tenant_id] = []
    }
    acc[org.tenant_id].push(org)
    return acc
  }, {} as Record<string, Organization[]>)

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading organisations...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Super Admin Cleanup</h1>
        <p className="text-stone-600">Manage and clean up organisations and shared data</p>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          {message.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-red-600" />}
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {Object.entries(groupedOrgs).map(([tenantId, orgs]) => (
          <Card key={tenantId} className={orgs.length > 1 ? 'border-orange-200 bg-orange-50' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {orgs.length > 1 && <AlertTriangle className="w-5 h-5 text-orange-600" />}
                Tenant: {tenantId.slice(0, 8)}...
                {orgs.length > 1 && (
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    {orgs.length} organisations sharing data
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {orgs.length > 1 
                  ? 'Multiple organisations sharing the same data - this should be fixed'
                  : 'Single organisation with its own data'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orgs.map((org) => (
                  <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{org.name}</h3>
                      <p className="text-sm text-stone-600">
                        {org.stats.members} members • {org.stats.stories} stories • {org.stats.projects} projects
                      </p>
                      <p className="text-xs text-stone-500">ID: {org.id}</p>
                    </div>
                    <div className="flex gap-2">
                      {orgs.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fixTenant(org.id, org.name)}
                          className="text-sage-600 border-sage-300 hover:bg-sage-50"
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Give Own Tenant
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteOrganization(org.id, org.name)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-sage-50 border border-sage-200 rounded-lg">
        <h3 className="font-semibold text-sage-800 mb-2">Recommended Actions:</h3>
        <ul className="text-sm text-sage-700 space-y-1">
          <li>• Delete test organisations like &quot;Test Organization Working&quot;</li>
          <li>• Give &quot;A Curious Tractor&quot; its own tenant to separate from Snow Foundation data</li>
          <li>• Keep &quot;Snow Foundation&quot; and &quot;Cultural Healing Center&quot; as they have real data</li>
          <li>• Keep &quot;Clean Test Organization Final&quot; as it already has its own clean tenant</li>
        </ul>
      </div>
    </div>
  )
}
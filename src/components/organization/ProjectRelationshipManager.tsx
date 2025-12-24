'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Plus, Building, Users, Image, ExternalLink, FileText } from 'lucide-react'

interface Organization {
  id: string
  name: string
  type: string
  role: string
  linkId: string
}

interface Storyteller {
  id: string
  displayName: string
  profileImageUrl?: string
  role: string
  status: string
  linkId: string
}

interface Gallery {
  id: string
  title: string
  photoCount: number
}

interface Transcript {
  id: string
  title: string
  status: string
  createdAt: string
  wordCount: number
  characterCount: number
  storyteller?: {
    id: string
    displayName: string
    avatarUrl?: string | null
  } | null
}

interface ProjectRelationshipManagerProps {
  projectId: string
  projectName: string
  organizationId?: string
}

export function ProjectRelationshipManager({ projectId, projectName, organizationId }: ProjectRelationshipManagerProps) {
  const [organisations, setOrganizations] = useState<Organization[]>([])
  const [storytellers, setStorytellers] = useState<Storyteller[]>([])
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [availableOrgs, setAvailableOrgs] = useState<{ id: string, name: string }[]>([])
  const [availableStorytellers, setAvailableStorytellers] = useState<{ id: string, displayName: string }[]>([])
  const [loading, setLoading] = useState(false)

  // Load all data
  useEffect(() => {
    loadProjectData()
    loadAvailableOptions()
  }, [projectId])

  const loadProjectData = async () => {
    try {
      console.log('🔍 Loading project data for project:', projectId)
      console.log('🔗 API URLs that will be called:', {
        orgs: `/api/projects/${projectId}/organisations`,
        storytellers: `/api/projects/${projectId}/storytellers`,
        galleries: `/api/projects/${projectId}/galleries`,
        transcripts: `/api/projects/${projectId}/transcripts`
      })

      const [orgsRes, storytellersRes, galleriesRes, transcriptsRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/organisations`),
        fetch(`/api/projects/${projectId}/storytellers`),
        fetch(`/api/projects/${projectId}/galleries`),
        fetch(`/api/projects/${projectId}/transcripts`)
      ])

      console.log('📊 API Response status:', {
        orgs: orgsRes.status,
        storytellers: storytellersRes.status,
        galleries: galleriesRes.status,
        transcripts: transcriptsRes.status
      })

      if (orgsRes.ok) {
        const orgsData = await orgsRes.json()
        console.log('🏢 Organizations data:', orgsData)
        setOrganizations(orgsData.organisations || [])
      } else {
        console.error('Organizations API error:', await orgsRes.text())
      }

      if (storytellersRes.ok) {
        const storytellersData = await storytellersRes.json()
        console.log('👥 Storytellers data:', storytellersData)
        setStorytellers(storytellersData.storytellers || [])
      } else {
        console.error('Storytellers API error:', await storytellersRes.text())
      }

      if (galleriesRes.ok) {
        const galleriesData = await galleriesRes.json()
        console.log('🖼️ Galleries data:', galleriesData)
        setGalleries(galleriesData.galleries || [])
      } else {
        console.error('Galleries API error:', await galleriesRes.text())
      }

      if (transcriptsRes.ok) {
        const transcriptsData = await transcriptsRes.json()
        console.log('📝 Transcripts data:', transcriptsData)
        setTranscripts(transcriptsData.transcripts || [])
      } else {
        console.error('Transcripts API error:', await transcriptsRes.text())
      }
    } catch (error) {
      console.error('Error loading project data:', error)
    }
  }

  const loadAvailableOptions = async () => {
    try {
      const [orgsRes, storytellersRes] = await Promise.all([
        fetch('/api/admin/orgs'),
        fetch('/api/admin/storytellers')
      ])

      if (orgsRes.ok) {
        const orgsData = await orgsRes.json()
        setAvailableOrgs(orgsData.organisations?.map((org: any) => ({ id: org.id, name: org.name })) || [])
      }

      if (storytellersRes.ok) {
        const storytellersData = await storytellersRes.json()
        setAvailableStorytellers(storytellersData.storytellers?.map((st: any) => ({ id: st.id, displayName: st.displayName })) || [])
      }
    } catch (error) {
      console.error('Error loading available options:', error)
    }
  }

  const addOrganization = async (orgId: string, role: string = 'partner') => {
    setLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/organisations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organization_id: orgId, role })
      })

      if (response.ok) {
        await loadProjectData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add organisation')
      }
    } catch (error) {
      console.error('Error adding organisation:', error)
      alert('Failed to add organisation')
    } finally {
      setLoading(false)
    }
  }

  const removeOrganization = async (linkId: string) => {
    if (!confirm('Remove this organisation from the project?')) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/organisations?link_id=${linkId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadProjectData()
      } else {
        alert('Failed to remove organisation')
      }
    } catch (error) {
      console.error('Error removing organisation:', error)
      alert('Failed to remove organisation')
    } finally {
      setLoading(false)
    }
  }

  const addStoryteller = async (storytellerId: string, role: string = 'participant') => {
    setLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/storytellers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyteller_id: storytellerId, role })
      })

      if (response.ok) {
        await loadProjectData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add storyteller')
      }
    } catch (error) {
      console.error('Error adding storyteller:', error)
      alert('Failed to add storyteller')
    } finally {
      setLoading(false)
    }
  }

  const removeStoryteller = async (linkId: string) => {
    if (!confirm('Remove this storyteller from the project?')) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/storytellers?link_id=${linkId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadProjectData()
      } else {
        alert('Failed to remove storyteller')
      }
    } catch (error) {
      console.error('Error removing storyteller:', error)
      alert('Failed to remove storyteller')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{projectName}</h2>
            <p className="text-muted-foreground">Manage project relationships and connections</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/organisations/${organizationId}/projects/${projectId}/analysis`}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-sage-600 to-clay-600 text-white rounded-lg hover:from-sage-700 hover:to-clay-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Impact Analysis
            </Link>
          </div>
        </div>
      </div>

      {/* Organizations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Organizations ({organisations.length})
          </CardTitle>
          <CardDescription>
            Organizations participating in this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add Organization */}
            <div className="flex gap-2">
              <Select onValueChange={(value) => addOrganization(value)} disabled={loading}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Add organisation..." />
                </SelectTrigger>
                <SelectContent>
                  {availableOrgs.filter(org => !organisations.find(o => o.id === org.id)).map(org => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current Organizations */}
            <div className="space-y-2">
              {organisations.map(org => (
                <div key={org.linkId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{org.name}</div>
                    <div className="text-sm text-muted-foreground">{org.type}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={org.role === 'lead' ? 'default' : 'secondary'}>
                      {org.role}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOrganization(org.linkId)}
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storytellers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Storytellers ({storytellers.length})
          </CardTitle>
          <CardDescription>
            People participating in this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add Storyteller */}
            <div className="flex gap-2">
              <Select onValueChange={(value) => addStoryteller(value)} disabled={loading}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Add storyteller..." />
                </SelectTrigger>
                <SelectContent>
                  {availableStorytellers.filter(st => !storytellers.find(s => s.id === st.id)).map(storyteller => (
                    <SelectItem key={storyteller.id} value={storyteller.id}>{storyteller.displayName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current Storytellers */}
            <div className="space-y-2">
              {storytellers.map(storyteller => (
                <div key={storyteller.linkId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {storyteller.profileImageUrl && (
                      <img
                        src={storyteller.profileImageUrl}
                        alt={storyteller.displayName}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <div className="font-medium">{storyteller.displayName}</div>
                      <div className="text-sm text-muted-foreground">{storyteller.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={storyteller.status === 'active' ? 'default' : 'secondary'}>
                      {storyteller.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStoryteller(storyteller.linkId)}
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Galleries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Galleries ({galleries.length})
          </CardTitle>
          <CardDescription>
            Photo galleries linked to this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {galleries.map(gallery => (
              <div key={gallery.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-stone-50 transition-colours">
                <div className="flex-1">
                  <Link
                    href={`/galleries/${gallery.id}`}
                    className="block hover:text-sage-600 transition-colours"
                  >
                    <div className="font-medium flex items-center gap-2">
                      {gallery.title}
                      <ExternalLink className="h-4 w-4 opacity-50" />
                    </div>
                    <div className="text-sm text-muted-foreground">{gallery.photoCount} photos</div>
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Linked</Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/galleries/${gallery.id}`}>
                      View Gallery
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
            {galleries.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No galleries linked to this project yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transcripts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Transcripts ({transcripts.length})
          </CardTitle>
          <CardDescription>
            Transcripts explicitly linked to this project. Manage transcript content from the transcripts dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transcripts.map(transcript => (
              <div key={transcript.id} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {transcript.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Added {new Date(transcript.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <Badge variant={transcript.status === 'approved' ? 'default' : 'secondary'} className="text-xs capitalize">
                    {transcript.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {transcript.storyteller && (
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold">
                        {transcript.storyteller.displayName
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <span>{transcript.storyteller.displayName}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span>{transcript.wordCount} words</span>
                    <span>•</span>
                    <span>{transcript.characterCount} characters</span>
                  </div>
                </div>
              </div>
            ))}

            {transcripts.length === 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No transcripts linked to this project yet
              </div>
            )}

            <Button variant="outline" className="w-full" asChild>
              <Link href={`/projects/${projectId}/transcripts`}>
                Manage transcripts
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

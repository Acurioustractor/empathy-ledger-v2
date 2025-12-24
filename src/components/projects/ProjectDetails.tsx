'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Calendar, 
  MapPin,
  DollarSign,
  ExternalLink,
  Users,
  Building2,
  Activity,
  FileText,
  Image as ImageIcon,
  ArrowLeft,
  Settings
} from 'lucide-react'

interface ProjectDetailsProps {
  project: any
  relationships: {
    organisations: any[]
    storytellers: any[]
    galleries: any[]
    transcripts: any[]
  }
}

export function ProjectDetails({ project, relationships }: ProjectDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
      case 'completed': return 'bg-sage-50 text-sage-700 dark:bg-sage-950 dark:text-sage-300'
      case 'paused': return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
      case 'cancelled': return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
      default: return 'bg-stone-50 text-stone-700 dark:bg-grey-950 dark:text-stone-300'
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const primaryOrg = relationships.organisations.find(org => org.role === 'lead') || relationships.organisations[0]

  const initialStorytellers = useMemo(() => {
    return (relationships.storytellers || []).map((storyteller, index) => {
      const profile = storyteller.storyteller || {}

      const displayName = profile.display_name || profile.full_name || 'Storyteller'
      const id = profile.id || storyteller.id || `storyteller-${index}`
      const initials = displayName
        .split(' ')
        .map((n: string) => (n ? n[0] : ''))
        .join('')
        .toUpperCase()
        .slice(0, 2)

      return {
        id,
        displayName,
        profileImageUrl: profile.profile_image_url || null,
        culturalBackground: profile.cultural_background || null,
        role: storyteller.role,
        status: storyteller.status || 'active',
        joinedAt: storyteller.joined_at,
        initials
      }
    })
  }, [relationships.storytellers])

  const [storytellers, setStorytellers] = useState(initialStorytellers)
  const [loadingStorytellers, setLoadingStorytellers] = useState(false)

  const initialTranscripts = useMemo(() => {
    return (relationships.transcripts || []).map((transcript: any) => {
      const storyteller = transcript.storyteller || {}
      const displayName = storyteller.display_name || storyteller.full_name || 'Unknown Storyteller'
      const avatarUrl = storyteller.profile_image_url || storyteller.avatar_media?.cdn_url || null

      return {
        id: transcript.id,
        title: transcript.title || 'Untitled Transcript',
        status: transcript.status || 'pending',
        createdAt: transcript.created_at,
        wordCount: transcript.word_count || 0,
        characterCount: transcript.character_count || 0,
        storyteller: {
          id: storyteller.id,
          displayName,
          avatarUrl
        }
      }
    })
  }, [relationships.transcripts])

  const [transcripts, setTranscripts] = useState(initialTranscripts)
  const [loadingTranscripts, setLoadingTranscripts] = useState(false)

  useEffect(() => {
    setStorytellers(initialStorytellers)
    setTranscripts(initialTranscripts)
  }, [initialStorytellers, initialTranscripts])

  useEffect(() => {
    let isMounted = true

    const fetchStorytellers = async () => {
      try {
        setLoadingStorytellers(true)
        const response = await fetch(`/api/projects/${project.id}/storytellers`, {
          cache: 'no-store'
        })

        if (!response.ok) return

        const data = await response.json()
        if (!isMounted || !Array.isArray(data.storytellers)) return

        const enhancedStorytellers = data.storytellers.map((storyteller: any) => {
          const displayName = storyteller.displayName || 'Storyteller'
          const initials = displayName
            .split(' ')
            .map((n: string) => (n ? n[0] : ''))
            .join('')
            .toUpperCase()
            .slice(0, 2)

          return {
            id: storyteller.id,
            displayName,
            profileImageUrl: storyteller.profileImageUrl || null,
            culturalBackground: storyteller.culturalBackground || null,
            role: storyteller.role || 'storyteller',
            status: storyteller.status || 'active',
            joinedAt: storyteller.joinedAt,
            initials
          }
        })

        setStorytellers(prevStorytellers => {
          const storytellerMap = new Map<string, any>()

          prevStorytellers.forEach(storyteller => {
            storytellerMap.set(storyteller.id, storyteller)
          })

          enhancedStorytellers.forEach(storyteller => {
            storytellerMap.set(storyteller.id, {
              ...(storytellerMap.get(storyteller.id) || {}),
              ...storyteller
            })
          })

          return Array.from(storytellerMap.values())
        })
      } catch (error) {
        console.error('Failed to load storytellers for project:', error)
      } finally {
        if (isMounted) {
          setLoadingStorytellers(false)
        }
      }
    }

    fetchStorytellers()

    return () => {
      isMounted = false
    }
  }, [project.id])

  // Transcripts are already loaded from server-side, no need to fetch again
  // useEffect(() => {
  //   let isMounted = true

  //   const fetchTranscripts = async () => {
  //     try {
  //       setLoadingTranscripts(true)
  //       const response = await fetch(`/api/projects/${project.id}/transcripts`, {
  //         cache: 'no-store'
  //       })
  //       if (!response.ok) return

  //       const data = await response.json()
  //       if (!isMounted || !Array.isArray(data.transcripts)) return

  //       const enhancedTranscripts = data.transcripts.map((transcript: any) => ({
  //         id: transcript.id,
  //         title: transcript.title,
  //         status: transcript.status,
  //         createdAt: transcript.createdAt,
  //         wordCount: transcript.wordCount,
  //         characterCount: transcript.characterCount,
  //         storyteller: transcript.storyteller
  //       }))

  //       setTranscripts(enhancedTranscripts)
  //     } catch (error) {
  //       console.error('Failed to load transcripts for project:', error)
  //     } finally {
  //       if (isMounted) {
  //         setLoadingTranscripts(false)
  //       }
  //     }
  //   }

  //   fetchTranscripts()

  //   return () => {
  //     isMounted = false
  //   }
  // }, [project.id])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <Button asChild variant="outline" size="sm">
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </Button>

        {primaryOrg && (
          <Button asChild variant="secondary" size="sm">
            <Link href={`/organisations/${primaryOrg.organisation.id}/projects/${project.id}/manage`}>
              <Settings className="h-4 w-4 mr-2" />
              Manage Project
            </Link>
          </Button>
        )}

        <Button asChild variant="default" size="sm">
          <Link href={`/projects/${project.id}/analysis`}>
            <Activity className="h-4 w-4 mr-2" />
            AI Analysis
          </Link>
        </Button>
      </div>

      {/* Project Info */}
      <div className="border-b pb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
            
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <Badge className={getStatusColor(project.status)}>
                <Activity className="h-3 w-3 mr-1" />
                {project.status}
              </Badge>
              
              {project.organisation ? (
                <Badge variant="outline">
                  <Building2 className="h-3 w-3 mr-1" />
                  {project.organisation.name}
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Users className="h-3 w-3 mr-1" />
                  Community Project
                </Badge>
              )}
            </div>
          </div>
        </div>

        {project.description && (
          <p className="text-muted-foreground text-lg mb-4">
            {project.description}
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {project.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{project.location}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              Started {new Date(project.created_at).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </span>
          </div>
          
          {project.budget && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>{formatCurrency(project.budget)} budget</span>
            </div>
          )}

          {project.created_by_profile && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>
                Created by {project.created_by_profile.display_name || project.created_by_profile.full_name}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Organizations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Organizations ({relationships.organisations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {relationships.organisations.map((org) => (
                <div key={org.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{org.organisation.name}</div>
                    <div className="text-sm text-muted-foreground">{org.organisation.type}</div>
                  </div>
                  <Badge variant={org.role === 'lead' ? 'default' : 'secondary'}>
                    {org.role}
                  </Badge>
                </div>
              ))}
              
              {relationships.organisations.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No organisations linked
                </div>
              )}
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
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loadingStorytellers && storytellers.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Loading storytellers...
                </div>
              )}

              {!loadingStorytellers && storytellers.map((storyteller) => (
                <div key={storyteller.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={storyteller.profileImageUrl || ''} 
                      alt={storyteller.displayName}
                    />
                    <AvatarFallback>
                      {storyteller.initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {storyteller.displayName}
                    </div>
                    {storyteller.culturalBackground && (
                      <div className="text-xs text-muted-foreground truncate">
                        {storyteller.culturalBackground}
                      </div>
                    )}
                  </div>
                  
                  <Badge variant={storyteller.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {storyteller.role}
                  </Badge>
                </div>
              ))}
              
              {!loadingStorytellers && storytellers.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No storytellers assigned
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
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loadingTranscripts && transcripts.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Loading transcripts...
                </div>
              )}

              {!loadingTranscripts && transcripts.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No transcripts linked to this project yet
                </div>
              )}

              {transcripts.map(transcript => (
                <Link
                  key={transcript.id}
                  href={`/admin/transcripts/${transcript.id}/edit`}
                  className="block p-3 border rounded-lg space-y-3 hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {transcript.title || 'Untitled Transcript'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Added {new Date(transcript.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>

                    <Badge
                      variant={transcript.status === 'approved' ? 'default' : 'secondary'}
                      className="text-xs capitalize"
                    >
                      {transcript.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {transcript.storyteller && (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={transcript.storyteller.avatarUrl || ''} alt={transcript.storyteller.displayName} />
                          <AvatarFallback>
                            {transcript.storyteller.displayName
                              .split(' ')
                              .map((n: string) => (n ? n[0] : ''))
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{transcript.storyteller.displayName}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span>{transcript.wordCount} words</span>
                      <span>•</span>
                      <span>{transcript.characterCount} characters</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Galleries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Galleries ({relationships.galleries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {relationships.galleries.map((gallery) => (
                <div key={gallery.id} className="p-3 border rounded-lg">
                  <div className="font-medium text-sm">{gallery.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {gallery.photo_count || 0} photos
                  </div>
                  {gallery.description && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {gallery.description}
                    </div>
                  )}
                </div>
              ))}
              
              {relationships.galleries.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No galleries linked
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Search,
  User,
  Building2,
  FolderKanban,
  X,
  Plus,
  Loader2,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Entity {
  id: string
  name: string
  type: 'storyteller' | 'project' | 'organization'
  avatar?: string
  subtitle?: string
}

interface EntityTagPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedStorytellerIds: string[]
  selectedProjectId?: string | null
  selectedOrganizationId?: string | null
  onSave: (data: {
    storytellerIds: string[]
    projectId: string | null
    organizationId: string | null
  }) => void
  title?: string
  photoPreview?: {
    url: string
    title: string
  }
}

export default function EntityTagPicker({
  open,
  onOpenChange,
  selectedStorytellerIds = [],
  selectedProjectId = null,
  selectedOrganizationId = null,
  onSave,
  title = 'Tag People & Projects',
  photoPreview
}: EntityTagPickerProps) {
  const [activeTab, setActiveTab] = useState<'storytellers' | 'projects' | 'organizations'>('storytellers')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Entity lists
  const [storytellers, setStorytellers] = useState<Entity[]>([])
  const [projects, setProjects] = useState<Entity[]>([])
  const [organizations, setOrganizations] = useState<Entity[]>([])

  // Local selection state
  const [localStorytellerIds, setLocalStorytellerIds] = useState<Set<string>>(new Set(selectedStorytellerIds))
  const [localProjectId, setLocalProjectId] = useState<string | null>(selectedProjectId)
  const [localOrganizationId, setLocalOrganizationId] = useState<string | null>(selectedOrganizationId)

  // Reset local state when props change
  useEffect(() => {
    setLocalStorytellerIds(new Set(selectedStorytellerIds))
    setLocalProjectId(selectedProjectId)
    setLocalOrganizationId(selectedOrganizationId)
  }, [selectedStorytellerIds, selectedProjectId, selectedOrganizationId, open])

  // Fetch entities
  const fetchEntities = useCallback(async () => {
    setLoading(true)
    try {
      const [storytellersRes, projectsRes, organizationsRes] = await Promise.all([
        fetch('/api/admin/storytellers?limit=100'),
        fetch('/api/admin/projects?limit=100'),
        fetch('/api/admin/organizations?limit=100')
      ])

      if (storytellersRes.ok) {
        const data = await storytellersRes.json()
        const items = data.storytellers || data.data || []
        setStorytellers(items.map((s: any) => ({
          id: s.id,
          name: s.display_name || s.name || 'Unknown',
          type: 'storyteller' as const,
          avatar: s.avatar_url,
          subtitle: s.cultural_background || s.bio?.substring(0, 50)
        })))
      }

      if (projectsRes.ok) {
        const data = await projectsRes.json()
        const items = data.projects || data.data || []
        setProjects(items.map((p: any) => ({
          id: p.id,
          name: p.title || p.name || 'Untitled Project',
          type: 'project' as const,
          subtitle: p.status || p.description?.substring(0, 50)
        })))
      }

      if (organizationsRes.ok) {
        const data = await organizationsRes.json()
        const items = data.organizations || data.data || []
        setOrganizations(items.map((o: any) => ({
          id: o.id,
          name: o.name || 'Unnamed Organization',
          type: 'organization' as const,
          subtitle: o.type || o.description?.substring(0, 50)
        })))
      }
    } catch (error) {
      console.error('Failed to fetch entities:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      fetchEntities()
    }
  }, [open, fetchEntities])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({
        storytellerIds: Array.from(localStorytellerIds),
        projectId: localProjectId,
        organizationId: localOrganizationId
      })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  const toggleStoryteller = (id: string) => {
    const newSet = new Set(localStorytellerIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setLocalStorytellerIds(newSet)
  }

  const filterEntities = (entities: Entity[]) => {
    if (!searchTerm) return entities
    const search = searchTerm.toLowerCase()
    return entities.filter(e =>
      e.name.toLowerCase().includes(search) ||
      (typeof e.subtitle === 'string' && e.subtitle.toLowerCase().includes(search))
    )
  }

  const getSelectionCount = () => {
    let count = localStorytellerIds.size
    if (localProjectId) count++
    if (localOrganizationId) count++
    return count
  }

  const EntityList = ({
    entities,
    type,
    selectedIds,
    onToggle,
    singleSelect = false
  }: {
    entities: Entity[]
    type: 'storyteller' | 'project' | 'organization'
    selectedIds: Set<string> | string | null
    onToggle: (id: string) => void
    singleSelect?: boolean
  }) => {
    const filtered = filterEntities(entities)
    const isSelected = (id: string) => {
      if (singleSelect) {
        return selectedIds === id
      }
      return (selectedIds as Set<string>).has(id)
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
        </div>
      )
    }

    if (filtered.length === 0) {
      return (
        <div className="text-center py-8 text-stone-500">
          {searchTerm ? 'No matches found' : `No ${type}s available`}
        </div>
      )
    }

    return (
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filtered.map(entity => (
          <div
            key={entity.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
              isSelected(entity.id)
                ? "bg-sage-50 border-sage-300"
                : "bg-white border-stone-200 hover:bg-stone-50"
            )}
            onClick={() => onToggle(entity.id)}
          >
            {!singleSelect && (
              <Checkbox
                checked={isSelected(entity.id)}
                onChange={() => {}}
              />
            )}
            {singleSelect && (
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                isSelected(entity.id)
                  ? "border-sage-600 bg-sage-600"
                  : "border-stone-300"
              )}>
                {isSelected(entity.id) && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
            )}
            {entity.avatar ? (
              <img
                src={entity.avatar}
                alt={entity.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                {type === 'storyteller' && <User className="w-5 h-5 text-stone-400" />}
                {type === 'project' && <FolderKanban className="w-5 h-5 text-stone-400" />}
                {type === 'organization' && <Building2 className="w-5 h-5 text-stone-400" />}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{entity.name}</p>
              {entity.subtitle && (
                <p className="text-sm text-stone-500 truncate">{entity.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Get selected entity names for display
  const getSelectedNames = () => {
    const names: string[] = []

    storytellers.filter(s => localStorytellerIds.has(s.id)).forEach(s => names.push(s.name))

    const project = projects.find(p => p.id === localProjectId)
    if (project) names.push(project.name)

    const org = organizations.find(o => o.id === localOrganizationId)
    if (org) names.push(org.name)

    return names
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Photo Preview */}
          {photoPreview && (
            <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-lg">
              <div className="w-16 h-16 bg-earth-100 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={photoPreview.url}
                  alt={photoPreview.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{photoPreview.title}</p>
                <p className="text-sm text-stone-500">
                  {getSelectionCount()} tag{getSelectionCount() !== 1 ? 's' : ''} selected
                </p>
              </div>
            </div>
          )}

          {/* Selected Tags Preview */}
          {getSelectedNames().length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-sage-50 rounded-lg border border-sage-200">
              {storytellers.filter(s => localStorytellerIds.has(s.id)).map(s => (
                <Badge
                  key={s.id}
                  variant="outline"
                  className="bg-white border-sage-300 text-sage-700 flex items-center gap-1"
                >
                  <User className="w-3 h-3" />
                  {s.name}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleStoryteller(s.id) }}
                    className="ml-1 hover:text-sage-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {localProjectId && projects.find(p => p.id === localProjectId) && (
                <Badge
                  variant="outline"
                  className="bg-white border-earth-300 text-earth-700 flex items-center gap-1"
                >
                  <FolderKanban className="w-3 h-3" />
                  {projects.find(p => p.id === localProjectId)?.name}
                  <button
                    onClick={(e) => { e.stopPropagation(); setLocalProjectId(null) }}
                    className="ml-1 hover:text-earth-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {localOrganizationId && organizations.find(o => o.id === localOrganizationId) && (
                <Badge
                  variant="outline"
                  className="bg-white border-clay-300 text-clay-700 flex items-center gap-1"
                >
                  <Building2 className="w-3 h-3" />
                  {organizations.find(o => o.id === localOrganizationId)?.name}
                  <button
                    onClick={(e) => { e.stopPropagation(); setLocalOrganizationId(null) }}
                    className="ml-1 hover:text-clay-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="storytellers" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                People
                {localStorytellerIds.size > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {localStorytellerIds.size}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4" />
                Projects
                {localProjectId && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">1</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="organizations" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Orgs
                {localOrganizationId && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">1</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="storytellers" className="mt-4">
              <p className="text-sm text-stone-500 mb-3">
                Select people who appear in or are related to this photo. You can select multiple.
              </p>
              <EntityList
                entities={storytellers}
                type="storyteller"
                selectedIds={localStorytellerIds}
                onToggle={toggleStoryteller}
              />
            </TabsContent>

            <TabsContent value="projects" className="mt-4">
              <p className="text-sm text-stone-500 mb-3">
                Link this photo to a project. Only one project can be selected.
              </p>
              <EntityList
                entities={projects}
                type="project"
                selectedIds={localProjectId}
                onToggle={(id) => setLocalProjectId(localProjectId === id ? null : id)}
                singleSelect
              />
            </TabsContent>

            <TabsContent value="organizations" className="mt-4">
              <p className="text-sm text-stone-500 mb-3">
                Associate this photo with an organization. Only one organization can be selected.
              </p>
              <EntityList
                entities={organizations}
                type="organization"
                selectedIds={localOrganizationId}
                onToggle={(id) => setLocalOrganizationId(localOrganizationId === id ? null : id)}
                singleSelect
              />
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => {
                setLocalStorytellerIds(new Set())
                setLocalProjectId(null)
                setLocalOrganizationId(null)
              }}
              disabled={getSelectionCount() === 0}
            >
              Clear All
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save Tags ({getSelectionCount()})
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tag,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
  Filter,
  Shield,
  AlertTriangle,
  Merge,
  Hash
} from 'lucide-react'

interface TagItem {
  id: string
  name: string
  slug: string
  description: string | null
  category: string
  parentTagId: string | null
  culturalSensitivityLevel: string
  requiresElderApproval: boolean
  usageCount: number
  createdAt: string
}

const CATEGORIES = [
  { value: 'general', label: 'General', color: 'bg-stone-100 text-stone-700' },
  { value: 'cultural', label: 'Cultural', color: 'bg-purple-100 text-purple-700' },
  { value: 'location', label: 'Location', color: 'bg-blue-100 text-blue-700' },
  { value: 'project', label: 'Project', color: 'bg-green-100 text-green-700' },
  { value: 'theme', label: 'Theme', color: 'bg-amber-100 text-amber-700' },
  { value: 'event', label: 'Event', color: 'bg-pink-100 text-pink-700' },
  { value: 'person', label: 'Person', color: 'bg-cyan-100 text-cyan-700' },
]

const SENSITIVITY_LEVELS = [
  { value: 'public', label: 'Public', icon: null },
  { value: 'sensitive', label: 'Sensitive', icon: AlertTriangle },
  { value: 'sacred', label: 'Sacred', icon: Shield },
]

export default function TagManagerPage() {
  const [tags, setTags] = useState<TagItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sensitivityFilter, setSensitivityFilter] = useState('')

  // Pagination
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 50

  // Category counts
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})

  // Dialogs
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showMergeDialog, setShowMergeDialog] = useState(false)
  const [selectedTag, setSelectedTag] = useState<TagItem | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    culturalSensitivityLevel: 'public',
    parentTagId: '',
  })

  // Merge data
  const [mergeTargetId, setMergeTargetId] = useState('')

  // Fetch tags
  const fetchTags = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((page - 1) * pageSize).toString(),
        sortBy: 'usage_count',
        sortOrder: 'desc',
      })

      if (searchQuery) params.set('search', searchQuery)
      if (categoryFilter) params.set('category', categoryFilter)
      if (sensitivityFilter) params.set('sensitivity', sensitivityFilter)

      const response = await fetch(`/api/tags?${params}`)
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setTags(data.tags || [])
      setTotal(data.pagination?.total || 0)
      setCategoryCounts(data.categories || {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tags')
    } finally {
      setLoading(false)
    }
  }, [page, searchQuery, categoryFilter, sensitivityFilter])

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'general',
      culturalSensitivityLevel: 'public',
      parentTagId: '',
    })
  }

  // Create tag
  const handleCreateTag = async () => {
    if (!formData.name.trim()) {
      setError('Tag name is required')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setError(`Tag "${data.existingTag?.name}" already exists`)
        } else {
          throw new Error(data.error)
        }
        return
      }

      setShowAddDialog(false)
      resetForm()
      fetchTags()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tag')
    } finally {
      setSaving(false)
    }
  }

  // Update tag
  const handleUpdateTag = async () => {
    if (!selectedTag || !formData.name.trim()) return

    setSaving(true)
    setError(null)
    try {
      const response = await fetch(`/api/tags/${selectedTag.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setShowEditDialog(false)
      setSelectedTag(null)
      resetForm()
      fetchTags()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tag')
    } finally {
      setSaving(false)
    }
  }

  // Delete tag
  const handleDeleteTag = async () => {
    if (!selectedTag) return

    setSaving(true)
    try {
      const response = await fetch(`/api/tags/${selectedTag.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      setShowDeleteDialog(false)
      setSelectedTag(null)
      fetchTags()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tag')
    } finally {
      setSaving(false)
    }
  }

  // Merge tags
  const handleMergeTags = async () => {
    if (!selectedTag || !mergeTargetId) return

    setSaving(true)
    try {
      const response = await fetch('/api/tags/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceTagId: selectedTag.id,
          targetTagId: mergeTargetId,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setShowMergeDialog(false)
      setSelectedTag(null)
      setMergeTargetId('')
      fetchTags()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to merge tags')
    } finally {
      setSaving(false)
    }
  }

  // Open edit dialog
  const openEditDialog = (tag: TagItem) => {
    setSelectedTag(tag)
    setFormData({
      name: tag.name,
      description: tag.description || '',
      category: tag.category,
      culturalSensitivityLevel: tag.culturalSensitivityLevel,
      parentTagId: tag.parentTagId || '',
    })
    setShowEditDialog(true)
  }

  // Get category badge style
  const getCategoryStyle = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.color || 'bg-stone-100 text-stone-700'
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 via-stone-50 to-sage-50/30 border border-stone-200 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
              <Tag className="h-6 w-6 text-amber-600" />
              Tag Manager
            </h1>
            <p className="text-stone-600 mt-1">
              Create and manage tags for organizing media, videos, and stories
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
              {total} tags
            </Badge>
            <Button onClick={() => { resetForm(); setShowAddDialog(true) }} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Tag
            </Button>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant={categoryFilter === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setCategoryFilter(''); setPage(1) }}
          >
            All ({Object.values(categoryCounts).reduce((a, b) => a + b, 0)})
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant={categoryFilter === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setCategoryFilter(cat.value); setPage(1) }}
              className={categoryFilter !== cat.value ? cat.color : ''}
            >
              {cat.label} ({categoryCounts[cat.value] || 0})
            </Button>
          ))}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="float-right">&times;</button>
        </div>
      )}

      {/* Search and filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
                placeholder="Search tags..."
                className="pl-9"
              />
            </div>

            <Select
              value={sensitivityFilter || '_all'}
              onValueChange={(v) => { setSensitivityFilter(v === '_all' ? '' : v); setPage(1) }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sensitivity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Levels</SelectItem>
                {SENSITIVITY_LEVELS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tags list */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : tags.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Tag className="h-12 w-12 mx-auto text-stone-300 mb-4" />
            <h3 className="text-lg font-medium text-stone-900">No tags found</h3>
            <p className="text-stone-500 mt-1">
              {searchQuery || categoryFilter ? 'Try adjusting your filters' : 'Create your first tag to get started'}
            </p>
            {!searchQuery && !categoryFilter && (
              <Button onClick={() => { resetForm(); setShowAddDialog(true) }} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Tag
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tags.map((tag) => (
            <Card key={tag.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-stone-400" />
                    <span className="font-medium">{tag.name}</span>
                  </div>
                  <Badge className={getCategoryStyle(tag.category)}>
                    {CATEGORIES.find(c => c.value === tag.category)?.label || tag.category}
                  </Badge>
                  {tag.culturalSensitivityLevel !== 'public' && (
                    <Badge
                      variant="outline"
                      className={
                        tag.culturalSensitivityLevel === 'sacred'
                          ? 'border-purple-300 text-purple-700'
                          : 'border-amber-300 text-amber-700'
                      }
                    >
                      {tag.culturalSensitivityLevel === 'sacred' && <Shield className="h-3 w-3 mr-1" />}
                      {tag.culturalSensitivityLevel === 'sensitive' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {tag.culturalSensitivityLevel}
                    </Badge>
                  )}
                  {tag.description && (
                    <span className="text-sm text-muted-foreground hidden md:inline">
                      {tag.description.length > 50 ? tag.description.slice(0, 50) + '...' : tag.description}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {tag.usageCount} uses
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(tag)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTag(tag)
                          setMergeTargetId('')
                          setShowMergeDialog(true)
                        }}
                      >
                        <Merge className="h-4 w-4 mr-2" />
                        Merge into another
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTag(tag)
                          setShowDeleteDialog(true)
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create Tag Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
            <DialogDescription>
              Add a new tag for organizing content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tag Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Family History"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sensitivity</Label>
                <Select
                  value={formData.culturalSensitivityLevel}
                  onValueChange={(v) => setFormData({ ...formData, culturalSensitivityLevel: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SENSITIVITY_LEVELS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTag} disabled={saving || !formData.name.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Tag'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tag Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tag Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sensitivity</Label>
                <Select
                  value={formData.culturalSensitivityLevel}
                  onValueChange={(v) => setFormData({ ...formData, culturalSensitivityLevel: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SENSITIVITY_LEVELS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTag} disabled={saving || !formData.name.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Tag</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedTag?.name}"? This will remove it from all {selectedTag?.usageCount || 0} items using it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTag}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Merge Dialog */}
      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Merge Tag</DialogTitle>
            <DialogDescription>
              Merge "{selectedTag?.name}" into another tag. All items will be retagged with the target tag.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Target Tag</Label>
              <Select
                value={mergeTargetId}
                onValueChange={setMergeTargetId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a tag to merge into" />
                </SelectTrigger>
                <SelectContent>
                  {tags
                    .filter(t => t.id !== selectedTag?.id)
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({t.usageCount} uses)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMergeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMergeTags} disabled={saving || !mergeTargetId}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Merge Tags'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

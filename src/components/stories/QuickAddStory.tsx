'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface QuickAddStoryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storytellerId: string
  tenantId?: string
  organizationId?: string
  projectId?: string
  onSuccess?: (storyId: string) => void
}

type VisibilityLevel = 'public' | 'community' | 'private'
type CulturalSensitivityLevel = 'none' | 'moderate' | 'high' | 'sacred'

export function QuickAddStory({
  open,
  onOpenChange,
  storytellerId,
  tenantId,
  organizationId,
  projectId,
  onSuccess
}: QuickAddStoryProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    visibility: 'community' as VisibilityLevel,
    culturalSensitivity: 'none' as CulturalSensitivityLevel
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide both a title and story content',
        variant: 'destructive'
      })
      return
    }

    setIsCreating(true)

    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          storyteller_id: storytellerId,
          tenant_id: tenantId,
          organization_id: organizationId,
          project_id: projectId,
          privacy_level: formData.visibility,
          is_public: formData.visibility === 'public',
          cultural_sensitivity_level: formData.culturalSensitivity,
          requires_elder_review: formData.culturalSensitivity === 'sacred',
          status: 'draft',
          enable_ai_processing: true
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create story')
      }

      toast({
        title: 'Story created!',
        description: `"${formData.title}" has been saved as a draft`
      })

      // Reset form
      setFormData({
        title: '',
        content: '',
        visibility: 'community',
        culturalSensitivity: 'none'
      })

      onOpenChange(false)
      onSuccess?.(data.id)
    } catch (error) {
      console.error('Error creating story:', error)
      toast({
        title: 'Failed to create story',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sage-600" />
            Quick Add Story
          </DialogTitle>
          <DialogDescription>
            Create a new story quickly. You can edit and add media later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Story Title *</Label>
            <Input
              id="title"
              placeholder="Enter a title for your story..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              disabled={isCreating}
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Story Content *</Label>
            <Textarea
              id="content"
              placeholder="Share your story..."
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              disabled={isCreating}
              required
            />
            <p className="text-xs text-muted-foreground">
              {formData.content.trim().split(/\s+/).filter(w => w).length} words
            </p>
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <Label htmlFor="visibility">Who can see this story?</Label>
            <Select
              value={formData.visibility}
              onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value as VisibilityLevel }))}
              disabled={isCreating}
            >
              <SelectTrigger id="visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Private</span>
                    <span className="text-xs text-muted-foreground">Only you</span>
                  </div>
                </SelectItem>
                <SelectItem value="community">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Community</span>
                    <span className="text-xs text-muted-foreground">Indigenous communities</span>
                  </div>
                </SelectItem>
                <SelectItem value="public">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Public</span>
                    <span className="text-xs text-muted-foreground">Everyone can see</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cultural Sensitivity */}
          <div className="space-y-2">
            <Label htmlFor="cultural">Cultural Sensitivity Level</Label>
            <Select
              value={formData.culturalSensitivity}
              onValueChange={(value) => setFormData(prev => ({ ...prev, culturalSensitivity: value as CulturalSensitivityLevel }))}
              disabled={isCreating}
            >
              <SelectTrigger id="cultural">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">General</span>
                    <span className="text-xs text-muted-foreground">No special considerations</span>
                  </div>
                </SelectItem>
                <SelectItem value="moderate">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Moderate</span>
                    <span className="text-xs text-muted-foreground">Some cultural protocols</span>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">High</span>
                    <span className="text-xs text-muted-foreground">Significant cultural content</span>
                  </div>
                </SelectItem>
                <SelectItem value="sacred">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Sacred</span>
                    <span className="text-xs text-muted-foreground">Requires Elder review</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {formData.culturalSensitivity === 'sacred' && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                This story will be submitted for Elder review before publication.
              </p>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isCreating || !formData.title.trim() || !formData.content.trim()}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Story'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

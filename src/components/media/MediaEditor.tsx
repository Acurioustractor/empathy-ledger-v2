'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface MediaEditorProps {
  media: any
  onSave: (updated: any) => void
  onCancel: () => void
}

export function MediaEditor({ media, onSave, onCancel }: MediaEditorProps) {
  const [caption, setCaption] = useState(media.caption || '')
  const [altText, setAltText] = useState(media.alt_text || '')
  const [culturalTags, setCulturalTags] = useState<string[]>(media.cultural_tags || [])
  const [tagInput, setTagInput] = useState('')
  const [sensitivity, setSensitivity] = useState(media.cultural_sensitivity || 'public')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/media/${media.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption, alt_text: altText, cultural_tags: culturalTags, cultural_sensitivity: sensitivity })
      })
      if (!response.ok) throw new Error('Failed to update')
      const data = await response.json()
      onSave(data.media)
    } catch (error) {
      alert('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const addTag = () => {
    if (tagInput && !culturalTags.includes(tagInput)) {
      setCulturalTags([...culturalTags, tagInput])
      setTagInput('')
    }
  }

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Media</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Caption</Label>
            <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Brief description..." />
          </div>

          <div>
            <Label>Alt Text (for accessibility)</Label>
            <Textarea value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Describe what's in this media..." className="resize-none" rows={3} />
          </div>

          <div>
            <Label>Cultural Sensitivity</Label>
            <Select value={sensitivity} onValueChange={setSensitivity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="sensitive">Sensitive</SelectItem>
                <SelectItem value="sacred">Sacred</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Cultural Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag..." onKeyDown={(e) => e.key === 'Enter' && addTag()} />
              <Button onClick={addTag} type="button">Add</Button>
            </div>
            {culturalTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {culturalTags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <button onClick={() => setCulturalTags(culturalTags.filter(t => t !== tag))} className="ml-2">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-[#D97757]">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FileText, X, Loader2 } from 'lucide-react'

interface Storyteller {
  id: string
  displayName: string
  fullName: string
  avatarUrl?: string
}

interface TranscriptCreationDialogProps {
  organizationId: string
  preselectedStorytellerId?: string
  onSuccess: (transcriptId: string) => void
  onCancel: () => void
}

export function TranscriptCreationDialog({
  organizationId,
  preselectedStorytellerId,
  onSuccess,
  onCancel
}: TranscriptCreationDialogProps) {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [selectedStorytellerId, setSelectedStorytellerId] = useState(preselectedStorytellerId || '')
  const [storytellers, setStorytellers] = useState<Storyteller[]>([])
  const [isLoadingStorytellers, setIsLoadingStorytellers] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!preselectedStorytellerId) {
      fetchStorytellers()
    }
  }, [organizationId, preselectedStorytellerId])

  const fetchStorytellers = async () => {
    setIsLoadingStorytellers(true)
    try {
      const response = await fetch(`/api/organisations/${organizationId}/storytellers`)
      const data = await response.json()

      if (data.success && data.storytellers) {
        setStorytellers(data.storytellers)
      }
    } catch (err) {
      console.error('Error fetching storytellers:', err)
      setError('Failed to load storytellers')
    } finally {
      setIsLoadingStorytellers(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Please enter a title')
      return
    }

    if (!text.trim() || text.trim().length < 10) {
      setError('Please enter transcript text (at least 10 characters)')
      return
    }

    if (!selectedStorytellerId) {
      setError('Please select a storyteller')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/transcripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          text: text.trim(),
          createdBy: selectedStorytellerId
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to create transcript')
      }

      onSuccess(data.transcript.id)
    } catch (err) {
      console.error('Error creating transcript:', err)
      setError(err instanceof Error ? err.message : 'Failed to create transcript')
      setIsSubmitting(false)
    }
  }

  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length
  const selectedStoryteller = storytellers.find(s => s.id === selectedStorytellerId)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-earth-600" />
            <CardTitle className="text-xl">Add New Transcript</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Storyteller Selection */}
            {!preselectedStorytellerId ? (
              <div className="space-y-2">
                <Label htmlFor="storyteller">Storyteller *</Label>
                {isLoadingStorytellers ? (
                  <div className="flex items-center gap-2 text-sm text-grey-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading storytellers...
                  </div>
                ) : (
                  <Select
                    value={selectedStorytellerId}
                    onValueChange={setSelectedStorytellerId}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="storyteller">
                      <SelectValue placeholder="Select a storyteller..." />
                    </SelectTrigger>
                    <SelectContent>
                      {storytellers.map((storyteller) => (
                        <SelectItem key={storyteller.id} value={storyteller.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={storyteller.avatarUrl} />
                              <AvatarFallback className="text-xs">
                                {storyteller.displayName.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{storyteller.displayName || storyteller.fullName}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ) : selectedStoryteller && (
              <div className="space-y-2">
                <Label>Storyteller</Label>
                <div className="flex items-center gap-3 p-3 bg-grey-50 rounded-lg border">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedStoryteller.avatarUrl} />
                    <AvatarFallback>
                      {selectedStoryteller.displayName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedStoryteller.displayName}</div>
                    <div className="text-sm text-grey-600">{selectedStoryteller.fullName}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Journey to Country, Cultural Heritage Story..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                maxLength={200}
              />
              <p className="text-xs text-grey-600">
                {title.length}/200 characters
              </p>
            </div>

            {/* Transcript Text */}
            <div className="space-y-2">
              <Label htmlFor="text">Transcript Content *</Label>
              <Textarea
                id="text"
                placeholder="Paste or type the transcript content here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isSubmitting}
                rows={12}
                className="font-mono text-sm"
              />
              <div className="flex justify-between text-xs text-grey-600">
                <span>{wordCount} words</span>
                <span>{text.length} characters</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Info Message */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              <p className="font-medium mb-1">What happens next?</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>AI analysis will extract themes and insights</li>
                <li>Indigenous impact assessment will be performed</li>
                <li>You can generate a story from this transcript</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !title.trim() || !text.trim() || !selectedStorytellerId}
                className="bg-earth-600 hover:bg-earth-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Transcript'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Edit, Save, X, Loader } from 'lucide-react'

interface EditableSummaryProps {
  storytellerId: string
  currentSummary: string
  displayName: string
  onSummaryUpdate?: (newSummary: string) => void
}

export function EditableSummary({
  storytellerId,
  currentSummary,
  displayName,
  onSummaryUpdate
}: EditableSummaryProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [summary, setSummary] = useState(currentSummary || '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!summary.trim()) {
      setError('Summary cannot be empty')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/storytellers/${storytellerId}/summary`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ summary: summary.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update summary')
      }

      const data = await response.json()

      // Update local state and notify parent
      setSummary(data.profile.summary)
      onSummaryUpdate?.(data.profile.summary)
      setIsEditing(false)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setSummary(currentSummary || '')
    setIsEditing(false)
    setError(null)
  }

  if (!isEditing) {
    return (
      <div className="group relative">
        <div className="bg-sage-50 border border-sage-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-sage-800 mb-2">About {displayName}</h4>
              <p className="text-sm text-sage-700 leading-relaxed">
                {currentSummary || 'No summary provided yet. Click the edit button to add your story summary.'}
              </p>
            </div>
            <Button
              onClick={() => setIsEditing(true)}
              variant="ghost"
              size="sm"
              className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sage-600 hover:text-sage-800"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-sage-50 border border-sage-200 rounded-lg p-4">
      <h4 className="text-sm font-medium text-sage-800 mb-3">Edit Your Summary</h4>

      <div className="space-y-3">
        <Textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Share your story, background, and what makes your storytelling unique..."
          className="min-h-[120px] resize-none border-sage-300 focus:border-sage-500 focus:ring-sage-500"
          maxLength={500}
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-sage-600">
            {summary.length}/500 characters
          </span>

          <div className="flex items-center space-x-2">
            <Button
              onClick={handleCancel}
              variant="outline"
              size="sm"
              className="text-sage-600 border-sage-300 hover:bg-sage-100"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              size="sm"
              disabled={isSaving || !summary.trim()}
              className="bg-sage-600 hover:bg-sage-700 text-white"
            >
              {isSaving ? (
                <Loader className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-1" />
              )}
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
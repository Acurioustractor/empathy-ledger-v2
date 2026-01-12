/**
 * Edit Project Form Component
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle } from 'lucide-react'
import { Project } from '../types'
import { validateProjectForm } from '../utilities'

interface EditProjectFormProps {
  project: Project
  onSubmit: (data: any) => Promise<void>
}

export function EditProjectForm({ project, onSubmit }: EditProjectFormProps) {
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description,
    status: project.status,
    location: project.location || '',
    startDate: project.startDate || '',
    endDate: project.endDate || ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Validate form
    const validation = validateProjectForm(formData)
    if (!validation.valid) {
      setError(validation.errors.join(', '))
      return
    }

    setSubmitting(true)
    setSuccess(false)

    try {
      await onSubmit(formData)
      setSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project')
    } finally {
      setSubmitting(false)
    }
  }

  // Update form field
  function updateField(field: string, value: any) {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Success message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Project updated successfully!
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Project Name */}
      <div>
        <Label htmlFor="name">Project Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          required
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={3}
          required
        />
      </div>

      {/* Status and Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => updateField('status', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => updateField('location', e.target.value)}
            placeholder="e.g. Calgary, Alberta"
          />
        </div>
      </div>

      {/* Start and End Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => updateField('startDate', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => updateField('endDate', e.target.value)}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={submitting || !formData.name}
          className="min-w-[140px]"
        >
          {submitting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Updating...
            </div>
          ) : (
            'Update Project'
          )}
        </Button>
      </div>
    </form>
  )
}

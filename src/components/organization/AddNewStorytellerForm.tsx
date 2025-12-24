'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, UserPlus, Mail, User, FileText, Phone } from 'lucide-react'

interface AddNewStorytellerFormProps {
  organizationId: string
  onSuccess: (data: {
    profileId: string
    name: string
    email: string
    requiresInvitation: boolean
  }) => void
  onCancel: () => void
}

export function AddNewStorytellerForm({
  organizationId,
  onSuccess,
  onCancel
}: AddNewStorytellerFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    displayName: '',
    bio: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.fullName) {
      setError('Full name is required')
      return
    }

    if (!formData.email && !formData.phoneNumber) {
      setError('Please provide at least an email address or phone number')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(`/api/organisations/${organizationId}/storytellers/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to create storyteller')
      }

      onSuccess({
        profileId: data.profile.id,
        name: data.profile.fullName || data.profile.displayName,
        email: data.profile.email,
        requiresInvitation: data.requiresInvitation
      })

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        displayName: '',
        bio: ''
      })
    } catch (error) {
      console.error('Error creating storyteller:', error)
      setError(error instanceof Error ? error.message : 'Failed to create storyteller')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          Full Name *
        </Label>
        <Input
          id="fullName"
          type="text"
          placeholder="e.g., Sarah Johnson"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="sarah@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={loading}
        />
        <p className="text-xs text-stone-600">
          Optional - An invitation link can be sent to this email
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber" className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          Phone Number
        </Label>
        <Input
          id="phoneNumber"
          type="tel"
          placeholder="+61 4XX XXX XXX"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          disabled={loading}
        />
        <p className="text-xs text-stone-600">
          Optional - Provide at least email or phone number
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">
          Display Name (Optional)
        </Label>
        <Input
          id="displayName"
          type="text"
          placeholder="How they prefer to be called"
          value={formData.displayName}
          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Bio (Optional)
        </Label>
        <Textarea
          id="bio"
          placeholder="Tell us about this storyteller..."
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={4}
          disabled={loading}
        />
        <p className="text-xs text-stone-600">
          You can add more details later, or the storyteller can complete their profile
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Create & Invite
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

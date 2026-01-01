'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth.context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Mic } from 'lucide-react'
import Link from 'next/link'

interface Storyteller {
  id: string
  display_name: string
  email: string
}

export default function CreateTranscriptPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [storytellers, setStorytellers] = useState<Storyteller[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    storyteller_id: '',
    source_video_url: '',
    language: 'en',
    status: 'completed'
  })

  // Fetch storytellers for the dropdown
  useEffect(() => {
    const fetchStorytellers = async () => {
      try {
        const response = await fetch('/api/admin/storytellers')
        if (response.ok) {
          const data = await response.json()
          setStorytellers(data.storytellers || [])
        }
      } catch (error) {
        console.error('Error fetching storytellers:', error)
      }
    }
    fetchStorytellers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content || !formData.storyteller_id) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/transcripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyteller_id: formData.storyteller_id,
          title: formData.title,
          transcript_text: formData.content,
          source_video_url: formData.source_video_url,
          status: formData.status,
          metadata: {
            created_via: 'admin_interface'
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create transcript')
      }

      const result = await response.json()
      router.push('/admin/transcripts')
    } catch (error) {
      console.error('Error creating transcript:', error)
      alert('Failed to create transcript. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Please Sign In</h2>
          <p className="text-grey-600 mb-6">You need to be signed in to create transcripts.</p>
          <Link href="/auth/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/admin/transcripts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Transcripts
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-grey-900">Create Transcript</h1>
          <p className="text-grey-600">Add a new transcript to the platform</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mic className="w-5 h-5" />
            <span>Transcript Details</span>
          </CardTitle>
          <CardDescription>
            Enter the transcript content and select the storyteller
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-grey-700 mb-2">
                Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Traditional Stories from the Elders"
                required
              />
            </div>

            {/* Storyteller */}
            <div>
              <label className="block text-sm font-medium text-grey-700 mb-2">
                Storyteller *
              </label>
              <Select value={formData.storyteller_id} onValueChange={(value) => handleChange('storyteller_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a storyteller" />
                </SelectTrigger>
                <SelectContent>
                  {storytellers.map((storyteller) => (
                    <SelectItem key={storyteller.id} value={storyteller.id}>
                      {storyteller.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-grey-700 mb-2">
                Transcript Content *
              </label>
              <Textarea
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                placeholder="Enter the full transcript text here..."
                rows={12}
                required
                className="min-h-[300px]"
              />
              <p className="text-xs text-grey-500 mt-1">
                Word count: {formData.content.split(/\s+/).filter(word => word.length > 0).length}
              </p>
            </div>

            {/* Source URL (optional) */}
            <div>
              <label className="block text-sm font-medium text-grey-700 mb-2">
                Source Video URL
              </label>
              <Input
                type="url"
                value={formData.source_video_url}
                onChange={(e) => handleChange('source_video_url', e.target.value)}
                placeholder="https://example.com/video.mp4"
              />
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-grey-700 mb-2">
                Language
              </label>
              <Select value={formData.language} onValueChange={(value) => handleChange('language', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-grey-700 mb-2">
                Status
              </label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <div className="flex items-center space-x-4 pt-6">
              <Button type="submit" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Creating...' : 'Create Transcript'}
              </Button>
              <Link href="/admin/transcripts">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
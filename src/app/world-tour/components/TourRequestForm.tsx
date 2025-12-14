'use client'

import React, { useState } from 'react'
import { Check, Loader2, MapPin, Send, User, Mail, Phone, Building2, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface TourRequestFormProps {
  onSuccess?: () => void
}

const helpOptions = [
  { id: 'host', label: 'Host the visit', description: 'Provide accommodation or venue' },
  { id: 'connect', label: 'Connect with storytellers', description: 'Introduce us to people with stories' },
  { id: 'fund', label: 'Help fund the visit', description: 'Support travel or production costs' },
  { id: 'volunteer', label: 'Volunteer time', description: 'Help with logistics or coordination' },
  { id: 'other', label: 'Other support', description: 'Different way to contribute' }
]

export function TourRequestForm({ onSuccess }: TourRequestFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location_text: '',
    why_visit: '',
    storytellers_description: '',
    organization_name: '',
    organization_role: '',
    how_can_help: [] as string[]
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleHelpToggle = (helpId: string) => {
    setFormData(prev => ({
      ...prev,
      how_can_help: prev.how_can_help.includes(helpId)
        ? prev.how_can_help.filter(h => h !== helpId)
        : [...prev.how_can_help, helpId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/world-tour/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      setSubmitSuccess(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        location_text: '',
        why_visit: '',
        storytellers_description: '',
        organization_name: '',
        organization_role: '',
        how_can_help: []
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-800 mb-2">
            Thank You for Your Nomination!
          </h3>
          <p className="text-green-700 mb-4">
            We've received your request and will review it soon. If your community is selected,
            we'll reach out to discuss next steps.
          </p>
          <p className="text-sm text-green-600">
            Every story matters. Thank you for helping us find them.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => setSubmitSuccess(false)}
          >
            Submit Another Request
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="cultural" className="shadow-xl">
      <CardHeader className="text-center pb-2">
        <CardTitle className="flex items-center justify-center gap-2">
          <Heart className="w-5 h-5 text-clay-500" />
          Share Your Community's Story
        </CardTitle>
        <CardDescription>
          Tell us about your community and why Empathy Ledger should visit.
          All fields marked with * are required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Your Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Your Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                Phone (Optional)
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Location Details
            </h3>

            <div className="space-y-2">
              <Label htmlFor="location_text" className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Community Location *
              </Label>
              <Input
                id="location_text"
                value={formData.location_text}
                onChange={(e) => handleInputChange('location_text', e.target.value)}
                placeholder="City, Country (e.g., Melbourne, Australia)"
                required
              />
              <p className="text-xs text-muted-foreground">
                Be as specific as possible - include city, region, and country.
              </p>
            </div>
          </div>

          {/* Story Context */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              The Story Opportunity
            </h3>

            <div className="space-y-2">
              <Label htmlFor="why_visit">
                Why should Empathy Ledger visit your community? *
              </Label>
              <Textarea
                id="why_visit"
                value={formData.why_visit}
                onChange={(e) => handleInputChange('why_visit', e.target.value)}
                placeholder="Tell us about the stories waiting to be told, the community's unique perspective, and why these voices matter..."
                className="min-h-[120px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storytellers_description">
                Who are the storytellers? (Optional)
              </Label>
              <Textarea
                id="storytellers_description"
                value={formData.storytellers_description}
                onChange={(e) => handleInputChange('storytellers_description', e.target.value)}
                placeholder="Describe the people whose stories you'd like us to capture - elders, youth, community leaders, artists, etc."
                className="min-h-[80px]"
              />
            </div>
          </div>

          {/* Organization Connection */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Organization Connection (Optional)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organization_name" className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  Organization Name
                </Label>
                <Input
                  id="organization_name"
                  value={formData.organization_name}
                  onChange={(e) => handleInputChange('organization_name', e.target.value)}
                  placeholder="If you're part of an organization"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization_role">Your Role</Label>
                <Input
                  id="organization_role"
                  value={formData.organization_role}
                  onChange={(e) => handleInputChange('organization_role', e.target.value)}
                  placeholder="Your position or role"
                />
              </div>
            </div>
          </div>

          {/* How Can You Help */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              How Can You Help?
            </h3>
            <p className="text-sm text-muted-foreground">
              Select all that apply - this helps us plan visits more effectively.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {helpOptions.map((option) => (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    formData.how_can_help.includes(option.id)
                      ? "border-clay-300 bg-clay-50/50"
                      : "border-stone-200 hover:border-stone-300"
                  )}
                  onClick={() => handleHelpToggle(option.id)}
                >
                  <Checkbox
                    checked={formData.how_can_help.includes(option.id)}
                    onCheckedChange={() => handleHelpToggle(option.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error Alert */}
          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              variant="clay-primary"
              size="cultural-lg"
              className="w-full shadow-lg hover:shadow-xl transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Your Invitation...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Your Invitation
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              We respect your privacy. Your information will only be used to contact you about this request.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

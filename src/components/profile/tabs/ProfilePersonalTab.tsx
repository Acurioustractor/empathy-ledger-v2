'use client'

import { Edit3, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface ProfileFormData {
  first_name: string
  last_name: string
  display_name: string
  preferred_name: string
  pronouns: string
  email: string
  phone: string
  date_of_birth: string
  timezone: string
  bio: string
}

interface ProfilePersonalTabProps {
  editData: ProfileFormData
  setEditData: (data: ProfileFormData) => void
  isEditing: boolean
  setIsEditing: (editing: boolean) => void
  isSaving: boolean
  onSave: () => void
  onCancel: () => void
}

export function ProfilePersonalTab({
  editData,
  setEditData,
  isEditing,
  setIsEditing,
  isSaving,
  onSave,
  onCancel
}: ProfilePersonalTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Basic personal details and identity</CardDescription>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="space-x-2">
              <Button onClick={onSave} size="sm" disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button onClick={onCancel} variant="outline" size="sm">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Names Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Name & Identity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              {isEditing ? (
                <Input
                  value={editData.first_name}
                  onChange={(e) => setEditData({...editData, first_name: e.target.value})}
                  placeholder="Your first name"
                />
              ) : (
                <div className="p-3 bg-muted/50 rounded-md">{editData.first_name || 'Not set'}</div>
              )}
            </div>
            <div>
              <Label>Last Name</Label>
              {isEditing ? (
                <Input
                  value={editData.last_name}
                  onChange={(e) => setEditData({...editData, last_name: e.target.value})}
                  placeholder="Your last name"
                />
              ) : (
                <div className="p-3 bg-muted/50 rounded-md">{editData.last_name || 'Not set'}</div>
              )}
            </div>
            <div>
              <Label>Display Name</Label>
              {isEditing ? (
                <Input
                  value={editData.display_name}
                  onChange={(e) => setEditData({...editData, display_name: e.target.value})}
                  placeholder="How you'd like to be known publicly"
                />
              ) : (
                <div className="p-3 bg-muted/50 rounded-md">{editData.display_name || 'Not set'}</div>
              )}
            </div>
            <div>
              <Label>Preferred Name</Label>
              {isEditing ? (
                <Input
                  value={editData.preferred_name}
                  onChange={(e) => setEditData({...editData, preferred_name: e.target.value})}
                  placeholder="Name you prefer to be called"
                />
              ) : (
                <div className="p-3 bg-muted/50 rounded-md">{editData.preferred_name || 'Not set'}</div>
              )}
            </div>
            <div>
              <Label>Pronouns</Label>
              {isEditing ? (
                <Input
                  value={editData.pronouns}
                  onChange={(e) => setEditData({...editData, pronouns: e.target.value})}
                  placeholder="e.g., he/him, she/her, they/them"
                />
              ) : (
                <div className="p-3 bg-muted/50 rounded-md">{editData.pronouns || 'Not set'}</div>
              )}
            </div>
          </div>
        </div>

        {/* Contact & Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contact & Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <div className="p-3 bg-muted/50 rounded-md">{editData.email}</div>
              <p className="text-sm text-muted-foreground mt-1">Email cannot be changed here</p>
            </div>
            <div>
              <Label>Phone</Label>
              {isEditing ? (
                <Input
                  value={editData.phone}
                  onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  placeholder="Your phone number"
                  type="tel"
                />
              ) : (
                <div className="p-3 bg-muted/50 rounded-md">{editData.phone || 'Not set'}</div>
              )}
            </div>
            <div>
              <Label>Date of Birth</Label>
              {isEditing ? (
                <Input
                  value={editData.date_of_birth}
                  onChange={(e) => setEditData({...editData, date_of_birth: e.target.value})}
                  type="date"
                />
              ) : (
                <div className="p-3 bg-muted/50 rounded-md">
                  {editData.date_of_birth ? new Date(editData.date_of_birth).toLocaleDateString() : 'Not set'}
                </div>
              )}
            </div>
            <div>
              <Label>Timezone</Label>
              {isEditing ? (
                <Select value={editData.timezone} onValueChange={(value) => setEditData({...editData, timezone: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="America/Anchorage">Alaska Time (AKT)</SelectItem>
                    <SelectItem value="Pacific/Honolulu">Hawaii Time (HT)</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-muted/50 rounded-md">{editData.timezone || 'Not set'}</div>
              )}
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">About</h3>
          <div>
            <Label>Biography</Label>
            {isEditing ? (
              <Textarea
                value={editData.bio}
                onChange={(e) => setEditData({...editData, bio: e.target.value})}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            ) : (
              <div className="p-3 bg-muted/50 rounded-md min-h-[100px]">
                {editData.bio || 'No biography added yet.'}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
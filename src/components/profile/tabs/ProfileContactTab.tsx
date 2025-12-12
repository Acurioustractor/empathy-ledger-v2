'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Edit3, Save, X } from 'lucide-react'
import { ArrayFieldEditor } from '../shared/ArrayFieldEditor'

interface ContactFormData {
  preferred_communication: string[]
  occupation: string
  current_role: string
  interests: string[]
  community_roles: string[]
}

interface ProfileContactTabProps {
  editData: ContactFormData
  setEditData: (data: ContactFormData | ((prev: ContactFormData) => ContactFormData)) => void
  isEditing: boolean
  setIsEditing: (editing: boolean) => void
  isSaving: boolean
  onSave: () => void
  onCancel: () => void
}

export function ProfileContactTab({
  editData,
  setEditData,
  isEditing,
  setIsEditing,
  isSaving,
  onSave,
  onCancel
}: ProfileContactTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Contact & Location</CardTitle>
            <CardDescription>Address, emergency contacts, and communication preferences</CardDescription>
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
        {/* Communication Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Communication</h3>
          {isEditing && (
            <ArrayFieldEditor
              items={editData.preferred_communication}
              label="Preferred Communication Methods"
              placeholder="e.g., Email, Phone, Text"
              onItemsChange={(items) => setEditData({...editData, preferred_communication: items})}
            />
          )}
          {!isEditing && (
            <div>
              <Label>Preferred Communication Methods</Label>
              <div className="p-3 bg-muted/50 rounded-md">
                {editData.preferred_communication.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {editData.preferred_communication.map((method, index) => (
                      <Badge key={index} variant="secondary">{method}</Badge>
                    ))}
                  </div>
                ) : (
                  'None specified'
                )}
              </div>
            </div>
          )}
        </div>

        {/* Professional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Professional</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Occupation</Label>
              {isEditing ? (
                <Input
                  value={editData.occupation}
                  onChange={(e) => setEditData({...editData, occupation: e.target.value})}
                  placeholder="Your occupation"
                />
              ) : (
                <div className="p-3 bg-muted/50 rounded-md">{editData.occupation || 'Not set'}</div>
              )}
            </div>
            <div>
              <Label>Current Role</Label>
              {isEditing ? (
                <Input
                  value={editData.current_role}
                  onChange={(e) => setEditData({...editData, current_role: e.target.value})}
                  placeholder="Your current role"
                />
              ) : (
                <div className="p-3 bg-muted/50 rounded-md">{editData.current_role || 'Not set'}</div>
              )}
            </div>
          </div>
          {isEditing && (
            <>
              <ArrayFieldEditor
                items={editData.interests}
                label="Interests"
                placeholder="Add interest"
                onItemsChange={(items) => setEditData({...editData, interests: items})}
              />
              <ArrayFieldEditor
                items={editData.community_roles}
                label="Community Roles"
                placeholder="Add community role"
                onItemsChange={(items) => setEditData({...editData, community_roles: items})}
              />
            </>
          )}
          {!isEditing && (
            <>
              <div>
                <Label>Interests</Label>
                <div className="p-3 bg-muted/50 rounded-md">
                  {editData.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {editData.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary">{interest}</Badge>
                      ))}
                    </div>
                  ) : (
                    'None added'
                  )}
                </div>
              </div>
              <div>
                <Label>Community Roles</Label>
                <div className="p-3 bg-muted/50 rounded-md">
                  {editData.community_roles.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {editData.community_roles.map((role, index) => (
                        <Badge key={index} variant="secondary">{role}</Badge>
                      ))}
                    </div>
                  ) : (
                    'None added'
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

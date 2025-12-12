'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Edit3, Save, X, Accessibility, Utensils } from 'lucide-react'
import { ArrayFieldEditor } from '../shared/ArrayFieldEditor'

interface AccessibilityFormData {
  accessibility_needs: string[]
  dietary_requirements: string[]
}

interface ProfileAccessibilityTabProps {
  editData: AccessibilityFormData
  setEditData: (data: AccessibilityFormData | ((prev: AccessibilityFormData) => AccessibilityFormData)) => void
  isEditing: boolean
  setIsEditing: (editing: boolean) => void
  isSaving: boolean
  onSave: () => void
  onCancel: () => void
}

export function ProfileAccessibilityTab({
  editData,
  setEditData,
  isEditing,
  setIsEditing,
  isSaving,
  onSave,
  onCancel
}: ProfileAccessibilityTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Accessibility & Dietary</CardTitle>
            <CardDescription>Accessibility needs and dietary requirements</CardDescription>
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
        {isEditing && (
          <>
            <ArrayFieldEditor
              items={editData.accessibility_needs}
              label="Accessibility Needs"
              placeholder="Add accessibility need"
              onItemsChange={(items) => setEditData({...editData, accessibility_needs: items})}
            />
            <ArrayFieldEditor
              items={editData.dietary_requirements}
              label="Dietary Requirements"
              placeholder="Add dietary requirement"
              onItemsChange={(items) => setEditData({...editData, dietary_requirements: items})}
            />
          </>
        )}
        {!isEditing && (
          <>
            <div>
              <Label>Accessibility Needs</Label>
              <div className="p-3 bg-muted/50 rounded-md">
                {editData.accessibility_needs.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {editData.accessibility_needs.map((need, index) => (
                      <Badge key={index} variant="secondary">
                        <Accessibility className="w-3 h-3 mr-1" />
                        {need}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  'None specified'
                )}
              </div>
            </div>
            <div>
              <Label>Dietary Requirements</Label>
              <div className="p-3 bg-muted/50 rounded-md">
                {editData.dietary_requirements.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {editData.dietary_requirements.map((requirement, index) => (
                      <Badge key={index} variant="secondary">
                        <Utensils className="w-3 h-3 mr-1" />
                        {requirement}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  'None specified'
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

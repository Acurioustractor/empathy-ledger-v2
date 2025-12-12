'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Edit3, Save, X } from 'lucide-react'
import { ArrayFieldEditor } from '../shared/ArrayFieldEditor'

interface CulturalFormData {
  cultural_background: string
  cultural_affiliations: string[]
  languages_spoken: string[]
  storytelling_experience: string
  is_storyteller: boolean
  is_elder: boolean
  traditional_knowledge_keeper: boolean
}

interface ProfileCulturalTabProps {
  editData: CulturalFormData
  setEditData: (data: CulturalFormData | ((prev: CulturalFormData) => CulturalFormData)) => void
  isEditing: boolean
  setIsEditing: (editing: boolean) => void
  isSaving: boolean
  onSave: () => void
  onCancel: () => void
}

export function ProfileCulturalTab({
  editData,
  setEditData,
  isEditing,
  setIsEditing,
  isSaving,
  onSave,
  onCancel
}: ProfileCulturalTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Cultural & Storytelling</CardTitle>
            <CardDescription>Cultural background, languages, and storytelling experience</CardDescription>
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
        {/* Cultural Background */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Cultural Identity</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Cultural Background</Label>
              {isEditing ? (
                <Textarea
                  value={editData.cultural_background}
                  onChange={(e) => setEditData({...editData, cultural_background: e.target.value})}
                  placeholder="Describe your cultural heritage and background"
                  rows={3}
                />
              ) : (
                <div className="p-3 bg-muted/50 rounded-md min-h-[80px]">
                  {editData.cultural_background || 'Not set'}
                </div>
              )}
            </div>
            {isEditing && (
              <>
                <ArrayFieldEditor
                  items={editData.cultural_affiliations}
                  label="Cultural Affiliations"
                  placeholder="Add cultural affiliation"
                  onItemsChange={(items) => setEditData({...editData, cultural_affiliations: items})}
                />
                <ArrayFieldEditor
                  items={editData.languages_spoken}
                  label="Languages Spoken"
                  placeholder="Add language"
                  onItemsChange={(items) => setEditData({...editData, languages_spoken: items})}
                />
              </>
            )}
            {!isEditing && (
              <>
                <div>
                  <Label>Cultural Affiliations</Label>
                  <div className="p-3 bg-muted/50 rounded-md">
                    {editData.cultural_affiliations.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {editData.cultural_affiliations.map((affiliation, index) => (
                          <Badge key={index} variant="secondary">{affiliation}</Badge>
                        ))}
                      </div>
                    ) : (
                      'None added'
                    )}
                  </div>
                </div>
                <div>
                  <Label>Languages Spoken</Label>
                  <div className="p-3 bg-muted/50 rounded-md">
                    {editData.languages_spoken.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {editData.languages_spoken.map((language, index) => (
                          <Badge key={index} variant="secondary">{language}</Badge>
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
        </div>

        {/* Storytelling & Roles */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Storytelling & Community Roles</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Storytelling Experience</Label>
              {isEditing ? (
                <Textarea
                  value={editData.storytelling_experience}
                  onChange={(e) => setEditData({...editData, storytelling_experience: e.target.value})}
                  placeholder="Describe your storytelling background and experience"
                  rows={3}
                />
              ) : (
                <div className="p-3 bg-muted/50 rounded-md min-h-[80px]">
                  {editData.storytelling_experience || 'Not set'}
                </div>
              )}
            </div>

            {/* Role Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Storyteller</Label>
                  <p className="text-sm text-muted-foreground">Share stories with the community</p>
                </div>
                {isEditing ? (
                  <Switch
                    checked={editData.is_storyteller}
                    onCheckedChange={(checked) => setEditData({...editData, is_storyteller: checked})}
                  />
                ) : (
                  <Badge variant={editData.is_storyteller ? "default" : "secondary"}>
                    {editData.is_storyteller ? 'Yes' : 'No'}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Elder</Label>
                  <p className="text-sm text-muted-foreground">Recognized community elder</p>
                </div>
                {isEditing ? (
                  <Switch
                    checked={editData.is_elder}
                    onCheckedChange={(checked) => setEditData({...editData, is_elder: checked})}
                  />
                ) : (
                  <Badge variant={editData.is_elder ? "default" : "secondary"}>
                    {editData.is_elder ? 'Yes' : 'No'}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Knowledge Keeper</Label>
                  <p className="text-sm text-muted-foreground">Guardian of traditional knowledge</p>
                </div>
                {isEditing ? (
                  <Switch
                    checked={editData.traditional_knowledge_keeper}
                    onCheckedChange={(checked) => setEditData({...editData, traditional_knowledge_keeper: checked})}
                  />
                ) : (
                  <Badge variant={editData.traditional_knowledge_keeper ? "default" : "secondary"}>
                    {editData.traditional_knowledge_keeper ? 'Yes' : 'No'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

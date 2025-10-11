'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
// import { LocationPicker } from '@/components/ui/location-picker' // TODO: Fix command component
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { MapPin, Landmark, Home, Star } from 'lucide-react'

interface AddLocationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (locationData: {
    location_id: string
    location_type: string
    is_public: boolean
    is_primary: boolean
  }) => Promise<void>
}

export function AddLocationDialog({
  open,
  onOpenChange,
  onAdd
}: AddLocationDialogProps) {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
  const [locationType, setLocationType] = useState<string>('current')
  const [isPublic, setIsPublic] = useState(true)
  const [isPrimary, setIsPrimary] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const locationTypes = [
    { value: 'current', label: 'Current Location', icon: <MapPin className="w-4 h-4" /> },
    { value: 'traditional', label: 'Traditional Territory', icon: <Landmark className="w-4 h-4" /> },
    { value: 'birthplace', label: 'Birthplace', icon: <Home className="w-4 h-4" /> },
    { value: 'significant', label: 'Significant Place', icon: <Star className="w-4 h-4" /> }
  ]

  const handleSubmit = async () => {
    if (!selectedLocationId) return

    setIsSubmitting(true)
    try {
      await onAdd({
        location_id: selectedLocationId,
        location_type: locationType,
        is_public: isPublic,
        is_primary: isPrimary
      })

      // Reset form
      setSelectedLocationId(null)
      setLocationType('current')
      setIsPublic(true)
      setIsPrimary(false)
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding location:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Location</DialogTitle>
          <DialogDescription>
            Add a location to your profile. You can control its visibility and significance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Location Picker */}
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Search for a location..."
              onChange={(e) => setSelectedLocationId(e.target.value)}
            />
            <p className="text-xs text-grey-600 mt-1">TODO: Replace with LocationPicker component</p>
          </div>

          {/* Location Type */}
          <div>
            <Label htmlFor="location-type">Location Type</Label>
            <Select value={locationType} onValueChange={setLocationType}>
              <SelectTrigger id="location-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      {type.icon}
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {locationType === 'traditional' && (
              <p className="text-xs text-grey-600 mt-2">
                Traditional Territory represents your ancestral connection to Country
              </p>
            )}
          </div>

          {/* Visibility */}
          <div className="flex items-center justify-between p-3 bg-grey-50 rounded-lg">
            <div>
              <Label htmlFor="public" className="font-medium">
                Public Visibility
              </Label>
              <p className="text-xs text-grey-600">
                Make this location visible on your public profile
              </p>
            </div>
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          {/* Primary Location */}
          <div className="flex items-center justify-between p-3 bg-grey-50 rounded-lg">
            <div>
              <Label htmlFor="primary" className="font-medium">
                Primary Location
              </Label>
              <p className="text-xs text-grey-600">
                Set as your main location (shown first)
              </p>
            </div>
            <Switch
              id="primary"
              checked={isPrimary}
              onCheckedChange={setIsPrimary}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedLocationId || isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Location'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

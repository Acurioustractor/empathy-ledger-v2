'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { MapPin, Edit2, Check, X } from 'lucide-react'

interface LocationEditorProps {
  storytellerId: string
  currentLocation: string | null
  onUpdate: (storytellerId: string, location: string | null) => void
  compact?: boolean
}

// Common locations list - you can expand this or load from API
const commonLocations = [
  'Adelaide, SA, Australia',
  'Brisbane, QLD, Australia',
  'Canberra, ACT, Australia',
  'Darwin, NT, Australia',
  'Hobart, TAS, Australia',
  'Melbourne, VIC, Australia',
  'Perth, WA, Australia',
  'Sydney, NSW, Australia',
  'Alice Springs, NT, Australia',
  'Cairns, QLD, Australia',
  'Gold Coast, QLD, Australia',
  'Newcastle, NSW, Australia',
  'Townsville, QLD, Australia',
  'Wollongong, NSW, Australia',
]

export function LocationEditor({
  storytellerId,
  currentLocation,
  onUpdate,
  compact = false
}: LocationEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [workingLocation, setWorkingLocation] = useState(currentLocation || '__none__')
  const [isCustomInput, setIsCustomInput] = useState(false)

  const save = () => {
    const finalLocation = workingLocation === '__none__' ? null : workingLocation || null
    onUpdate(storytellerId, finalLocation)
    setIsEditing(false)
    setIsCustomInput(false)
  }

  const cancel = () => {
    setWorkingLocation(currentLocation || '__none__')
    setIsEditing(false)
    setIsCustomInput(false)
  }

  if (isEditing) {
    return (
      <div className="space-y-2 min-w-[200px]">
        <div className="text-sm font-medium">Edit Location</div>

        {!isCustomInput ? (
          <div className="space-y-2">
            <Select value={workingLocation} onValueChange={setWorkingLocation}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select location..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No location</SelectItem>
                {commonLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
                <SelectItem value="__custom__">Custom location...</SelectItem>
              </SelectContent>
            </Select>

            {workingLocation === '__custom__' && (
              <div>
                <Input
                  placeholder="Enter custom location..."
                  value=""
                  onChange={(e) => {
                    setWorkingLocation(e.target.value)
                    setIsCustomInput(true)
                  }}
                  className="text-sm"
                  autoFocus
                />
              </div>
            )}
          </div>
        ) : (
          <Input
            placeholder="Enter location..."
            value={workingLocation}
            onChange={(e) => setWorkingLocation(e.target.value)}
            className="text-sm"
            autoFocus
          />
        )}

        <div className="flex gap-2">
          <Button size="sm" onClick={save} className="h-7">
            <Check className="w-3 h-3 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={cancel} className="h-7">
            <X className="w-3 h-3 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  // Compact display mode
  if (compact) {
    return (
      <div className="flex items-center gap-1 group">
        {currentLocation ? (
          <span
            className="text-xs text-stone-600 hover:text-stone-800 cursor-pointer flex items-center gap-1"
            onClick={() => setIsEditing(true)}
          >
            <MapPin className="w-3 h-3" />
            {currentLocation}
          </span>
        ) : (
          <span
            className="text-xs text-stone-400 hover:text-stone-600 cursor-pointer flex items-center gap-1"
            onClick={() => setIsEditing(true)}
          >
            <MapPin className="w-3 h-3" />
            Add location
          </span>
        )}

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit2 className="w-3 h-3" />
        </Button>
      </div>
    )
  }

  return null
}
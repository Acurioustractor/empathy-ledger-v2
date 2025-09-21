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
import { Badge } from '@/components/ui/badge'
import { Edit2, Check, X } from 'lucide-react'

interface StatusEditorProps {
  storytellerId: string
  currentStatus: 'active' | 'pending' | 'suspended' | 'inactive' | 'public' | 'private' | 'draft'
  onUpdate: (storytellerId: string, status: string) => void
  compact?: boolean
}

const statusOptions = [
  { value: 'active', label: 'Active', colour: 'bg-green-100 text-green-800' },
  { value: 'public', label: 'Public', colour: 'bg-blue-100 text-blue-800' },
  { value: 'private', label: 'Private', colour: 'bg-purple-100 text-purple-800' },
  { value: 'draft', label: 'Draft', colour: 'bg-orange-100 text-orange-800' },
  { value: 'pending', label: 'Pending', colour: 'bg-yellow-100 text-yellow-800' },
  { value: 'inactive', label: 'Inactive', colour: 'bg-grey-100 text-grey-800' },
  { value: 'suspended', label: 'Suspended', colour: 'bg-red-100 text-red-800' },
]

function getStatusConfig(status: string) {
  return statusOptions.find(opt => opt.value === status) || statusOptions[1] // Default to public
}

export function StatusEditor({
  storytellerId,
  currentStatus,
  onUpdate,
  compact = false
}: StatusEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [workingStatus, setWorkingStatus] = useState(currentStatus)

  const save = () => {
    onUpdate(storytellerId, workingStatus)
    setIsEditing(false)
  }

  const cancel = () => {
    setWorkingStatus(currentStatus)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="space-y-2 min-w-[180px]">
        <div className="text-sm font-medium">Edit Status</div>

        <Select value={workingStatus} onValueChange={setWorkingStatus}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Select status..." />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${option.colour.replace('text-', 'bg-').split(' ')[0]}`}></div>
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
    const statusConfig = getStatusConfig(currentStatus)

    return (
      <div className="flex items-center gap-1 group">
        <Badge
          className={`text-xs cursor-pointer hover:opacity-80 ${statusConfig.colour}`}
          onClick={() => setIsEditing(true)}
        >
          {statusConfig.label}
        </Badge>

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
'use client'

import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Mail, Users, Building, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContactGroup {
  id: string
  label: string
  description: string
  icon: React.ElementType
  defaultEnabled: boolean
}

const contactGroups: ContactGroup[] = [
  {
    id: 'community_members',
    label: 'Community Members',
    description: 'Registered users who are part of the Empathy Ledger community',
    icon: Users,
    defaultEnabled: true
  },
  {
    id: 'organizations',
    label: 'Organizations',
    description: 'Verified organizations seeking storytellers for projects',
    icon: Building,
    defaultEnabled: true
  },
  {
    id: 'researchers',
    label: 'Researchers',
    description: 'Academic and cultural researchers (with ethics approval)',
    icon: Globe,
    defaultEnabled: false
  },
  {
    id: 'public',
    label: 'Anyone (Public)',
    description: 'Anyone can send you messages through the platform',
    icon: Mail,
    defaultEnabled: false
  }
]

interface ContactPermissionsProps {
  allowedGroups: string[]
  onChange: (groups: string[]) => void
  disabled?: boolean
  className?: string
}

export function ContactPermissions({
  allowedGroups,
  onChange,
  disabled = false,
  className
}: ContactPermissionsProps) {
  const handleToggle = (groupId: string, checked: boolean) => {
    if (checked) {
      onChange([...allowedGroups, groupId])
    } else {
      onChange(allowedGroups.filter(id => id !== groupId))
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="text-lg font-semibold text-clay-800 mb-2">
          Who Can Contact Me
        </h3>
        <p className="text-sm text-clay-600">
          Control who can send you messages through the Empathy Ledger platform.
          You can always block specific users later.
        </p>
      </div>

      <div className="space-y-3">
        {contactGroups.map((group) => {
          const Icon = group.icon
          const isChecked = allowedGroups.includes(group.id)

          return (
            <div
              key={group.id}
              className={cn(
                "flex items-start gap-4 p-4 rounded-lg border transition-colors",
                isChecked
                  ? "border-clay-300 bg-clay-50"
                  : "border-gray-200 bg-white hover:border-gray-300",
                disabled && "opacity-50"
              )}
            >
              <Checkbox
                id={`contact-${group.id}`}
                checked={isChecked}
                onCheckedChange={(checked) => handleToggle(group.id, checked as boolean)}
                disabled={disabled}
                className="mt-1"
              />

              <div className="flex items-start gap-3 flex-1">
                <div className={cn(
                  "mt-0.5 p-2 rounded-lg",
                  isChecked ? "bg-clay-100" : "bg-gray-100"
                )}>
                  <Icon className={cn(
                    "h-4 w-4",
                    isChecked ? "text-clay-600" : "text-gray-600"
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <Label
                    htmlFor={`contact-${group.id}`}
                    className="text-base font-semibold text-clay-800 cursor-pointer"
                  >
                    {group.label}
                  </Label>
                  <p className="mt-1 text-sm text-clay-600">
                    {group.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Your email address is never shared.</strong> All messages go through
          the platform, and you can report or block anyone at any time.
        </p>
      </div>
    </div>
  )
}

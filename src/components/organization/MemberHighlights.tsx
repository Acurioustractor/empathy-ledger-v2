'use client'

import Link from 'next/link'
import { Users, ArrowRight, Calendar, UserCircle } from 'lucide-react'

interface Member {
  id: string
  display_name: string | null
  full_name: string | null
  current_role: string | null
  created_at: string
}

interface MemberHighlightsProps {
  members: Member[]
  organizationId: string
}

// Generate consistent color based on name
const getAvatarColor = (name: string) => {
  const colors = [
    { bg: 'bg-sage-100', text: 'text-sage-700' },
    { bg: 'bg-earth-100', text: 'text-earth-700' },
    { bg: 'bg-clay-100', text: 'text-clay-700' },
    { bg: 'bg-amber-100', text: 'text-amber-700' },
    { bg: 'bg-stone-100', text: 'text-stone-700' },
  ]
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

export function MemberHighlights({ members, organizationId }: MemberHighlightsProps) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-gradient-to-r from-sage-50/50 to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center">
            <Users className="w-4 h-4 text-sage-600" />
          </div>
          <h3 className="text-body-md font-semibold text-stone-800">Recent Members</h3>
        </div>
        <Link
          href={`/organisations/${organizationId}/members`}
          className="text-body-sm text-sage-600 hover:text-sage-700 font-medium flex items-center gap-1.5 transition-colors"
        >
          View All
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Content */}
      <div className="p-5">
        {members.length > 0 ? (
          <div className="space-y-3">
            {members.map((member) => {
              const name = member.display_name || member.full_name || 'Member'
              const initials = name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
              const avatarColor = getAvatarColor(name)

              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <div className={`w-10 h-10 ${avatarColor.bg} rounded-full flex items-center justify-center shadow-sm`}>
                    <span className={`text-body-sm font-semibold ${avatarColor.text}`}>
                      {initials}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-body-md font-medium text-stone-800 truncate">
                      {name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span className="text-body-xs text-stone-500">
                        Joined {new Date(member.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3">
              <UserCircle className="w-6 h-6 text-stone-400" />
            </div>
            <p className="text-body-md text-stone-600 font-medium">No recent members</p>
            <p className="text-body-sm text-stone-500 mt-1">New members will appear here when they join</p>
          </div>
        )}
      </div>
    </div>
  )
}
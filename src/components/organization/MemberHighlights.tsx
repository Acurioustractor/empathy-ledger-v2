'use client'

import Link from 'next/link'

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

export function MemberHighlights({ members, organizationId }: MemberHighlightsProps) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Recent Members</h3>
        <Link
          href={`/organisations/${organizationId}/members`}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View All
        </Link>
      </div>

      {members.length > 0 ? (
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 border-b border-grey-100 pb-4 last:border-b-0 last:pb-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-700">
                  {(member.display_name || member.full_name || 'M')
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
              </div>

              <div className="flex-1">
                <div className="font-medium text-grey-900">
                  {member.display_name || member.full_name || 'Member'}
                </div>
                <div className="text-sm text-grey-500">
                  Joined {new Date(member.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-grey-500">
          <p>No recent members</p>
          <p className="text-sm mt-1">New members will appear here when they join</p>
        </div>
      )}
    </div>
  )
}
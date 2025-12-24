'use client'

import Link from 'next/link'

interface Story {
  id: string
  title: string
  author_id: string
  created_at: string
}

interface RecentActivityProps {
  stories: Story[]
  organizationId: string
}

export function RecentActivity({ stories, organizationId }: RecentActivityProps) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Recent Stories</h3>
        <Link
          href={`/organisations/${organizationId}/stories`}
          className="text-sm text-sage-600 hover:text-sage-800"
        >
          View All
        </Link>
      </div>

      {stories.length > 0 ? (
        <div className="space-y-4">
          {stories.map((story) => (
            <div key={story.id} className="border-b border-stone-100 pb-4 last:border-b-0 last:pb-0">
              <Link
                href={`/stories/${story.id}`}
                className="font-medium text-stone-900 hover:text-sage-600 block"
              >
                {story.title}
              </Link>
              <p className="text-sm text-stone-500 mt-1">
                {new Date(story.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-stone-500">
          <p>No recent stories</p>
          <p className="text-sm mt-1">Stories will appear here as members share them</p>
        </div>
      )}
    </div>
  )
}
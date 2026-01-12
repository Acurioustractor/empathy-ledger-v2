'use client'

import Link from 'next/link'
import { BookOpen, ArrowRight, Calendar } from 'lucide-react'

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
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-gradient-to-r from-earth-50/50 to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-earth-100 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-earth-600" />
          </div>
          <h3 className="text-body-md font-semibold text-stone-800">Recent Stories</h3>
        </div>
        <Link
          href={`/organisations/${organizationId}/stories`}
          className="text-body-sm text-sage-600 hover:text-sage-700 font-medium flex items-center gap-1.5 transition-colors"
        >
          View All
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Content */}
      <div className="p-5">
        {stories.length > 0 ? (
          <div className="space-y-3">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/stories/${story.id}`}
                className="block p-3 rounded-lg hover:bg-stone-50 transition-colors group"
              >
                <p className="text-body-md font-medium text-stone-800 group-hover:text-earth-700 transition-colors line-clamp-1">
                  {story.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <p className="text-body-xs text-stone-500">
                    {new Date(story.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-stone-400" />
            </div>
            <p className="text-body-md text-stone-600 font-medium">No recent stories</p>
            <p className="text-body-sm text-stone-500 mt-1">Stories will appear here as members share them</p>
          </div>
        )}
      </div>
    </div>
  )
}
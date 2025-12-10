import { Story } from '@/lib/empathy-ledger'
import { StoryCard } from './StoryCard'

interface StoryGridProps {
  stories: Story[]
  columns?: 2 | 3 | 4
  featuredFirst?: boolean
}

export function StoryGrid({
  stories,
  columns = 3,
  featuredFirst = true
}: StoryGridProps) {
  if (stories.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">📚</div>
        <h3 className="text-lg font-medium text-stone-600">No stories yet</h3>
        <p className="text-stone-400 mt-2">
          Stories will appear here when they're shared
        </p>
      </div>
    )
  }

  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4'
  }

  return (
    <div className={`grid grid-cols-1 ${gridCols[columns]} gap-6`}>
      {stories.map((story, index) => (
        <StoryCard
          key={story.id}
          story={story}
          variant={featuredFirst && index === 0 ? 'featured' : 'default'}
        />
      ))}
    </div>
  )
}

export default StoryGrid

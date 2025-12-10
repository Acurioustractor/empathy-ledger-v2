import { fetchStories, fetchThemes } from '@/lib/empathy-ledger'
import { StoryGrid } from '@/components/StoryGrid'
import { SearchFilter } from '@/components/SearchFilter'

interface PageProps {
  searchParams: Promise<{ theme?: string; search?: string; page?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams
  const theme = params.theme
  const search = params.search
  const page = parseInt(params.page || '1')
  const perPage = 12

  // Fetch stories and themes in parallel
  const [storiesData, themes] = await Promise.all([
    fetchStories({
      limit: perPage,
      offset: (page - 1) * perPage,
      theme,
      search
    }),
    fetchThemes()
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
          Stories of Change
        </h1>
        <p className="text-xl text-stone-600 max-w-2xl mx-auto">
          Real stories from real people, shared with consent and controlled by storytellers.
        </p>
      </div>

      {/* Search and filters */}
      <SearchFilter
        themes={themes}
        currentTheme={theme}
        currentSearch={search}
      />

      {/* Story grid */}
      <StoryGrid
        stories={storiesData.stories}
        columns={3}
        featuredFirst={!theme && !search && page === 1}
      />

      {/* Pagination */}
      {storiesData.has_more && (
        <div className="mt-12 text-center">
          <a
            href={`/?page=${page + 1}${theme ? `&theme=${theme}` : ''}${search ? `&search=${search}` : ''}`}
            className="inline-flex items-center px-6 py-3 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-700 font-medium transition-colors"
          >
            Load More Stories
            <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      )}
    </div>
  )
}

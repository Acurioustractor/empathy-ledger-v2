import { StoryPage } from '@/components/story/StoryPage'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // TODO: Fetch story title and excerpt for metadata
  // For now, return generic metadata
  return {
    title: 'Story - Empathy Ledger',
    description: 'Read this Indigenous story with full cultural context and safety protocols.',
  }
}

export default async function StoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <StoryPage storyId={id} />
}

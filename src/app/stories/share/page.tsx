export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { SimpleStoryCreator } from '@/components/stories/SimpleStoryCreator'

export const metadata: Metadata = {
  title: 'Share Your Story | Empathy Ledger',
  description: 'Share your story in just a few minutes. Your voice matters.',
}

export default function ShareStoryPage() {
  return <SimpleStoryCreator />
}

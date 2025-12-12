export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { StorytellerSupport } from '@/components/storyteller/StorytellerSupport'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'Storyteller Help & Support | Empathy Ledger',
  description: 'Get help with sharing your stories. Learn about privacy, cultural protocols, and how to make your voice heard.',
}

export default function StorytellerHelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto py-8">
        <StorytellerSupport variant="full" />
      </main>

      <Footer />
    </div>
  )
}

'use client'

import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { StoryBrowsePage } from '@/components/browse/StoryBrowsePage'

export default function StoriesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <StoryBrowsePage />
      <Footer />
    </div>
  )
}
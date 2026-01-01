import { Metadata } from 'next'
import StorytellerDashboard from '@/components/storyteller/StorytellerDashboard'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'Storyteller Dashboard | Empathy Ledger',
  description: 'Manage your stories, profile, and storytelling activities. Track your cultural contributions and connect with the community.',
}

export default function StorytellerDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <StorytellerDashboard />
      </div>

      <Footer />
    </div>
  )
}
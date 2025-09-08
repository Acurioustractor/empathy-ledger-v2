import { Metadata } from 'next'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { ProfileDashboard } from '@/components/profile/ProfileDashboard'

export const metadata: Metadata = {
  title: 'My Profile | Empathy Ledger',
  description: 'View and manage your personal profile, stories, and account settings.',
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">My Profile</h1>
            <p className="text-lg text-muted-foreground">
              Manage your personal information, stories, and account settings
            </p>
          </div>
          
          <ProfileDashboard />
        </div>
      </div>

      <Footer />
    </div>
  )
}
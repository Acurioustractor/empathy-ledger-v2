export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { SharingSettings } from '@/components/profile/SharingSettings'

export const metadata: Metadata = {
  title: 'Story Sharing Settings | Empathy Ledger',
  description: 'Manage how your stories are shared with external applications and partners.',
}

export default function SharingSettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Story Sharing Settings</h1>
            <p className="text-lg text-muted-foreground">
              Control how your stories are shared with external applications and partner organizations
            </p>
          </div>

          <SharingSettings />
        </div>
      </div>

      <Footer />
    </div>
  )
}

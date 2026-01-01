import { Metadata } from 'next'
import AdminDashboard from '@/components/admin/AdminDashboard'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'Admin Dashboard | Empathy Ledger',
  description: 'Comprehensive administration interface for platform management, story moderation, and tenant oversight.',
}

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <AdminDashboard />
      </div>

      <Footer />
    </div>
  )
}
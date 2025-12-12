export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import AdminDashboard from '@/components/admin/AdminDashboard-simple'

export const metadata: Metadata = {
  title: 'Admin Dashboard | Empathy Ledger',
  description: 'Comprehensive administration interface for platform management, story moderation, and tenant oversight.',
}

export default function AdminPage() {
  return <AdminDashboard />
}
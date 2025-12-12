export const dynamic = 'force-dynamic'

import AdminLayout from '@/components/features/admin/AdminLayout'
import AdminDashboard from '@/components/features/admin/Dashboard/AdminDashboard'

export default function ModernAdminPage() {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  )
}
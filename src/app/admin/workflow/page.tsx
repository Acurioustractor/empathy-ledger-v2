import { Metadata } from 'next'
import AdminStorytellingWorkflow from '@/components/admin/AdminStorytellingWorkflow'

export const metadata: Metadata = {
  title: 'Admin Storytelling Workflow | Empathy Ledger',
  description: 'Guided workflow for administrators to create, manage, and publish stories through the complete storytelling pipeline.',
}

export default function AdminWorkflowPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AdminStorytellingWorkflow />
    </div>
  )
}
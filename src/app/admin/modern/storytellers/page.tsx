'use client'

export const dynamic = 'force-dynamic'

import AdminLayout from '@/components/features/admin/AdminLayout'
import VirtualizedStorytellerTable from '@/components/features/admin/StorytellerTable/VirtualizedStorytellerTable'
import StorytellerFilters from '@/components/features/admin/StorytellerTable/StorytellerFilters'
import { Button } from '@/components/ui/button'
import { Plus, Download, Upload } from 'lucide-react'
import { useAdminStore } from '@/lib/stores/admin.store'

export default function ModernStorytellersPage() {
  const { viewMode, setViewMode } = useAdminStore()

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Storytellers</h1>
            <p className="text-grey-500">Manage and monitor all storyteller profiles</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Storyteller
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        <StorytellerFilters />

        {/* Table */}
        <VirtualizedStorytellerTable />
      </div>
    </AdminLayout>
  )
}
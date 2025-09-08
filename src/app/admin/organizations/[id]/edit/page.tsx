'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AdminNavigation from '@/components/admin/AdminNavigation'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'

export default function EditOrganizationPage() {
  const params = useParams()
  const router = useRouter()
  const organizationId = params.id as string

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <AdminNavigation className="mb-8" />

        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              onClick={() => router.push('/admin/organizations')}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Organizations
            </Button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Organization
          </h1>
          <p className="text-gray-600">
            Modify organization settings and properties
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium mb-2">Organization Editor</p>
              <p className="text-sm">
                Organization ID: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{organizationId}</code>
              </p>
              <p className="text-sm mt-4">
                This is a placeholder page for editing organization: {organizationId}
              </p>
              <div className="flex justify-center space-x-4 mt-6">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Organization
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
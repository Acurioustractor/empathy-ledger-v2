'use client'

export const dynamic = 'force-dynamic'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AdminNavigation from '@/components/admin/AdminNavigation'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { ArrowLeft, Plus } from 'lucide-react'

export default function CreateOrganizationPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <AdminNavigation className="mb-8" />

        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              onClick={() => router.push('/admin/organisations')}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Organizations
            </Button>
          </div>
          
          <h1 className="text-3xl font-bold text-grey-900 mb-2">
            Create New Organization
          </h1>
          <p className="text-grey-600">
            Add a new organisation to the platform
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Organization Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-12 text-grey-500">
              <Plus className="w-16 h-16 mx-auto mb-4 text-grey-400" />
              <p className="text-lg font-medium mb-2">Create Organization Form</p>
              <p className="text-sm mb-4">
                This is a placeholder page for creating new organisations
              </p>
              <div className="flex justify-center space-x-4">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Organization
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/admin/organisations')}
                >
                  Cancel
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
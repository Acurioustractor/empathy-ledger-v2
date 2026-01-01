'use client'

import React from 'react'
import PersonalAnalyticsDashboard from '@/components/analytics/PersonalAnalyticsDashboard'
import { useAuth } from '@/lib/context/auth.context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, LogIn, User, Home, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/layout/header'

export default function MyAnalyticsPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-grey-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Brain className="w-6 h-6 text-blue-600" />
                Personal Analytics Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-grey-600 mb-6">
                Sign in to view your personalized storytelling analytics, including your themes,
                impact metrics, powerful quotes, and growth insights.
              </p>
              <Link href="/auth/signin">
                <Button>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In to View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-grey-50">
      <Header />

      {/* Quick Navigation Bar */}
      <div className="bg-white border-b border-grey-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-grey-600 hover:text-blue-600">
                <Home className="w-4 h-4" />
                <span className="text-sm">Home</span>
              </Link>
              <span className="text-grey-300">|</span>
              <Link href="/storytellers" className="text-sm text-grey-600 hover:text-blue-600">
                Storytellers
              </Link>
              <span className="text-grey-300">|</span>
              <Link href="/stories" className="text-sm text-grey-600 hover:text-blue-600">
                Stories
              </Link>
              <span className="text-grey-300">|</span>
              <span className="text-sm font-medium text-blue-600">My Analytics</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-grey-600">
                <User className="w-4 h-4" />
                <span>Welcome, {user?.email?.split('@')[0] || 'Benjamin'}</span>
              </div>
              <Link href="/settings" className="p-2 text-grey-600 hover:text-blue-600">
                <Settings className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <PersonalAnalyticsDashboard />
        </div>
      </div>
    </div>
  )
}
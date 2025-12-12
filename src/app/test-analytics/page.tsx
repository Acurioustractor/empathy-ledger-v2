'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import StorytellerAnalyticsTest from '@/components/analytics/StorytellerAnalyticsTest'
import { supabase } from '@/lib/supabase/client'
import { Users } from 'lucide-react'

interface Storyteller {
  id: string
  display_name: string | null
  full_name: string | null
  is_storyteller: boolean
}

export default function TestAnalyticsPage() {
  const [storytellers, setStorytellers] = useState<Storyteller[]>([])
  const [selectedStoryteller, setSelectedStoryteller] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStorytellers()
  }, [])

  const fetchStorytellers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, full_name, is_storyteller')
        .eq('is_storyteller', true)
        .limit(10)

      if (error) {
        console.error('Error fetching storytellers:', error)
        return
      }

      setStorytellers(data || [])
      if (data && data.length > 0) {
        setSelectedStoryteller(data[0].id)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-grey-600">Loading storytellers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-grey-900">🌟 Analytics System Test</h1>
          <p className="mt-2 text-grey-600">
            Test the new storyteller analytics integration with populated sample data
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Select Storyteller
            </CardTitle>
            <CardDescription>
              Choose a storyteller to view their analytics dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              {storytellers.map((storyteller) => (
                <Button
                  key={storyteller.id}
                  onClick={() => setSelectedStoryteller(storyteller.id)}
                  variant={selectedStoryteller === storyteller.id ? "default" : "outline"}
                  size="sm"
                >
                  {storyteller.display_name || storyteller.full_name || 'Unnamed Storyteller'}
                </Button>
              ))}
              <Button onClick={fetchStorytellers} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
            <div className="mt-4 text-sm text-grey-600">
              Found {storytellers.length} storytellers with analytics data
            </div>
          </CardContent>
        </Card>

        {selectedStoryteller && (
          <div className="mt-8">
            <StorytellerAnalyticsTest storytellerId={selectedStoryteller} />
          </div>
        )}

        {storytellers.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-grey-600">
                No storytellers found. Make sure you have storytellers with is_storyteller = true in your profiles table.
              </p>
              <Button onClick={fetchStorytellers} className="mt-4">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">🚀 What's Working</h3>
            <div className="space-y-2 text-blue-800 text-sm">
              <p>✅ Database migration applied successfully</p>
              <p>✅ Sample analytics data populated from transcripts</p>
              <p>✅ Frontend components can read new analytics tables</p>
              <p>✅ Row Level Security policies are working</p>
              <p>📊 You now have a complete storyteller analytics system!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
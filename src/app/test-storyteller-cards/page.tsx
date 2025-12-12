'use client'

export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from 'react'
import { UnifiedStorytellerCard } from '@/components/storyteller/unified-storyteller-card'
import { ElegantStorytellerCard, transformToElegantCard } from '@/components/storyteller/elegant-storyteller-card'
import { StorytellerCardCollection } from '@/components/storyteller/storyteller-card-collection'
import { StorytellerCardDemo } from '@/components/storyteller/storyteller-card-demo'
import { StorytellerCardAdapter } from '@/lib/adapters/storyteller-card-adapter'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Database,
  Sparkles,
  Users,
  TestTube
} from 'lucide-react'
import type { EnhancedStorytellerProfile, AISuggestionAction } from '@/types/storyteller-card'

export default function TestStorytellerCardsPage() {
  const [realStorytellers, setRealStorytellers] = useState<any[]>([])
  const [enhancedStorytellers, setEnhancedStorytellers] = useState<EnhancedStorytellerProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transformationStatus, setTransformationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  // Fetch real storyteller data from your API
  const fetchRealData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/storytellers')
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`)
      }

      const data = await response.json()
      console.log('Fetched real storyteller data:', data)
      setRealStorytellers(Array.isArray(data) ? data : data.storytellers || [])
    } catch (err) {
      console.error('Error fetching storytellers:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch storytellers')
    } finally {
      setLoading(false)
    }
  }

  // Transform real data to enhanced format
  const transformData = async () => {
    if (realStorytellers.length === 0) {
      setError('No real data to transform. Please fetch data first.')
      return
    }

    setTransformationStatus('loading')

    try {
      console.log('Transforming storytellers:', realStorytellers.length)

      const enhanced = await StorytellerCardAdapter.transformBatch(
        realStorytellers,
        {
          includeAIInsights: true,
          includeLocationEnhancement: true,
          generateMissingData: true
        }
      )

      console.log('Enhanced storytellers:', enhanced)
      setEnhancedStorytellers(enhanced)
      setTransformationStatus('success')
    } catch (err) {
      console.error('Error transforming data:', err)
      setError(err instanceof Error ? err.message : 'Failed to transform data')
      setTransformationStatus('error')
    }
  }

  // Handle AI suggestions
  const handleAISuggestion = async (action: AISuggestionAction) => {
    console.log('AI Suggestion Action:', action)

    try {
      // In a real implementation, this would update the database
      // For testing, we'll just update local state
      const updatedStorytellers = enhancedStorytellers.map(storyteller => {
        if (storyteller.ai_insights?.suggested_tags.some(tag => tag === action.suggestion)) {
          const updatedProfile = { ...storyteller }
          const category = action.suggestion.category

          if (action.type === 'apply') {
            // Add the suggested value to the appropriate field
            const currentValues = updatedProfile[category] || []
            updatedProfile[category] = [...currentValues, action.suggestion.value]

            // Remove the suggestion from AI insights
            if (updatedProfile.ai_insights) {
              updatedProfile.ai_insights.suggested_tags = updatedProfile.ai_insights.suggested_tags.filter(
                tag => tag !== action.suggestion
              )
              // Increase profile completeness
              updatedProfile.ai_insights.profile_completeness = Math.min(
                updatedProfile.ai_insights.profile_completeness + 5,
                100
              )
            }
          }

          return updatedProfile
        }
        return storyteller
      })

      setEnhancedStorytellers(updatedStorytellers)

      // Show success feedback
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50'
      notification.textContent = `Applied suggestion: ${action.suggestion.value}`
      document.body.appendChild(notification)

      setTimeout(() => {
        document.body.removeChild(notification)
      }, 3000)

    } catch (err) {
      console.error('Error applying AI suggestion:', err)
      setError(err instanceof Error ? err.message : 'Failed to apply suggestion')
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchRealData()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <Typography variant="h1" className="text-3xl font-bold mb-2">
          Enhanced Storyteller Cards - Development & Testing
        </Typography>
        <Typography variant="body" className="text-grey-600">
          Testing the new enhanced storyteller card system with real data integration
        </Typography>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="w-4 h-4" />
              Real Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realStorytellers.length}</div>
            <div className="text-xs text-grey-500">storytellers loaded</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Enhanced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enhancedStorytellers.length}</div>
            <div className="text-xs text-grey-500">transformed</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              With AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enhancedStorytellers.filter(s => s.ai_insights).length}
            </div>
            <div className="text-xs text-grey-500">have AI data</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              className={
                transformationStatus === 'success' ? 'bg-green-100 text-green-800' :
                transformationStatus === 'error' ? 'bg-red-100 text-red-800' :
                transformationStatus === 'loading' ? 'bg-yellow-100 text-yellow-800' :
                'bg-grey-100 text-grey-800'
              }
            >
              {transformationStatus}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4 mb-8">
        <Button
          onClick={fetchRealData}
          disabled={loading}
          variant="outline"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Fetch Real Data
        </Button>

        <Button
          onClick={transformData}
          disabled={realStorytellers.length === 0 || transformationStatus === 'loading'}
        >
          {transformationStatus === 'loading' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Transform to Enhanced Format
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="elegant-cards" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="elegant-cards">Elegant Cards</TabsTrigger>
          <TabsTrigger value="enhanced-cards">Enhanced Cards</TabsTrigger>
          <TabsTrigger value="real-data">Real Data Test</TabsTrigger>
          <TabsTrigger value="collection">Collection View</TabsTrigger>
          <TabsTrigger value="demo">Demo Data</TabsTrigger>
        </TabsList>

        {/* Elegant Cards Tab */}
        <TabsContent value="elegant-cards" className="space-y-6">
          <div>
            <Typography variant="h2" className="text-xl font-semibold mb-4">
              Elegant Storyteller Cards (Simplified & Clean)
            </Typography>

            {enhancedStorytellers.length > 0 ? (
              <div className="space-y-6">
                <Typography variant="body" className="text-grey-600">
                  Clean, elegant design focused on essential information:
                </Typography>

                {/* Elegant card examples */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enhancedStorytellers.slice(0, 6).map((storyteller) => (
                    <ElegantStorytellerCard
                      key={storyteller.id}
                      storyteller={transformToElegantCard(storyteller)}
                      variant="default"
                    />
                  ))}
                </div>

                {/* Feature comparison */}
                <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
                  <Typography variant="h3" className="text-lg font-semibold text-green-800 mb-3">
                    ✨ Elegant Design Features
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
                    <div>
                      <strong>Visual Focus:</strong>
                      <ul className="mt-1 space-y-1 ml-4">
                        <li>• Larger profile image (h-64)</li>
                        <li>• Clean typography hierarchy</li>
                        <li>• Minimal visual clutter</li>
                        <li>• Better hover animations</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Essential Information Only:</strong>
                      <ul className="mt-1 space-y-1 ml-4">
                        <li>• Location prominently displayed</li>
                        <li>• Primary organisation + project</li>
                        <li>• Top theme instead of many</li>
                        <li>• Story count + last active</li>
                        <li>• Optional traditional territory</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-grey-500">
                No enhanced data available. Please transform the real data first.
              </div>
            )}
          </div>
        </TabsContent>

        {/* Real Data Tab */}
        <TabsContent value="real-data" className="space-y-6">
          <div>
            <Typography variant="h2" className="text-xl font-semibold mb-4">
              Real Storyteller Data (Original Format)
            </Typography>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">Loading real data...</span>
              </div>
            ) : realStorytellers.length > 0 ? (
              <div className="space-y-4">
                <Typography variant="body" className="text-grey-600">
                  Showing first 3 storytellers from your existing data:
                </Typography>
                <div className="grid grid-cols-1 gap-4">
                  {realStorytellers.slice(0, 3).map((storyteller, index) => (
                    <Card key={index} className="p-4">
                      <pre className="text-sm overflow-x-auto bg-grey-50 p-3 rounded">
                        {JSON.stringify(storyteller, null, 2)}
                      </pre>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-grey-500">
                No real data loaded. Click "Fetch Real Data" to load from your API.
              </div>
            )}
          </div>
        </TabsContent>

        {/* Enhanced Cards Tab */}
        <TabsContent value="enhanced-cards" className="space-y-6">
          <div>
            <Typography variant="h2" className="text-xl font-semibold mb-4">
              Enhanced Storyteller Cards (Full Feature Version)
            </Typography>

            {enhancedStorytellers.length > 0 ? (
              <div className="space-y-6">
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg mb-4">
                  <Typography variant="body" className="text-orange-800">
                    ⚠️ <strong>Note:</strong> This is the full-featured version with all data.
                    Compare with the "Elegant Cards" tab to see the simplified, cleaner design.
                  </Typography>
                </div>

                <Typography variant="body" className="text-grey-600">
                  Full-featured cards with all available data and AI insights:
                </Typography>

                {/* Single card examples */}
                <div className="space-y-8">
                  <div>
                    <Typography variant="h3" className="text-lg font-medium mb-3">Default Variant</Typography>
                    <div className="max-w-md">
                      <UnifiedStorytellerCard
                        storyteller={enhancedStorytellers[0]}
                        variant="default"
                        showAIInsights={true}
                        onApplyAISuggestion={handleAISuggestion}
                      />
                    </div>
                  </div>

                  {enhancedStorytellers.length > 1 && (
                    <div>
                      <Typography variant="h3" className="text-lg font-medium mb-3">Detailed Variant</Typography>
                      <div className="max-w-2xl">
                        <UnifiedStorytellerCard
                          storyteller={enhancedStorytellers[1]}
                          variant="detailed"
                          showAIInsights={true}
                          onApplyAISuggestion={handleAISuggestion}
                        />
                      </div>
                    </div>
                  )}

                  {enhancedStorytellers.length > 2 && (
                    <div>
                      <Typography variant="h3" className="text-lg font-medium mb-3">Compact Variant</Typography>
                      <div className="max-w-lg">
                        <UnifiedStorytellerCard
                          storyteller={enhancedStorytellers[2]}
                          variant="compact"
                          showAIInsights={false}
                          onApplyAISuggestion={handleAISuggestion}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-grey-500">
                No enhanced data available. Please transform the real data first.
              </div>
            )}
          </div>
        </TabsContent>

        {/* Collection Tab */}
        <TabsContent value="collection" className="space-y-6">
          <div>
            <Typography variant="h2" className="text-xl font-semibold mb-4">
              Storyteller Card Collection (Full Featured)
            </Typography>

            {enhancedStorytellers.length > 0 ? (
              <StorytellerCardCollection
                storytellers={enhancedStorytellers}
                variant="default"
                callbacks={{
                  onApplyAISuggestion: handleAISuggestion,
                  onUpdateProfile: async (updates) => {
                    console.log('Profile update:', updates)
                  }
                }}
              />
            ) : (
              <div className="text-center py-12 text-grey-500">
                No enhanced data available. Please transform the real data first.
              </div>
            )}
          </div>
        </TabsContent>

        {/* Demo Tab */}
        <TabsContent value="demo" className="space-y-6">
          <div>
            <Typography variant="h2" className="text-xl font-semibold mb-4">
              Demo with Sample Data
            </Typography>
            <Typography variant="body" className="text-grey-600 mb-6">
              This shows the full feature set with carefully crafted sample data:
            </Typography>
            <StorytellerCardDemo />
          </div>
        </TabsContent>
      </Tabs>

      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-sm">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Real Data Sample:</strong>
                <pre className="mt-1 text-xs bg-grey-50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(realStorytellers[0] || 'No data', null, 2)}
                </pre>
              </div>
              <div>
                <strong>Enhanced Data Sample:</strong>
                <pre className="mt-1 text-xs bg-grey-50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(enhancedStorytellers[0] || 'No data', null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, MapPin, Languages, Globe } from 'lucide-react'

interface DemographicsBreakdownProps {
  organizationId: string
  period: string
}

export function DemographicsBreakdown({ organizationId, period }: DemographicsBreakdownProps) {
  const [demographicsData, setDemographicsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDemographics()
  }, [organizationId, period])

  const loadDemographics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/analytics/organization/${organizationId}/demographics?period=${period}`
      )
      if (response.ok) {
        const data = await response.json()
        setDemographicsData(data)
      }
    } catch (err) {
      console.error('Error loading demographics:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="animate-pulse"><div className="h-64 bg-gray-200 rounded" /></div>
  }

  const renderDistribution = (items: any[], label: string) => {
    if (!items || items.length === 0) {
      return <p className="text-gray-500 text-center py-4">No data available</p>
    }

    const total = items.reduce((sum, item) => sum + item.count, 0)

    return (
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 font-medium">{item.name}</span>
              <span className="text-gray-600">
                {item.count} ({((item.count / total) * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500"
                style={{ width: `${(item.count / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cultural Groups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-clay-500" />
            Cultural Groups Represented
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderDistribution(demographicsData?.cultural_groups, 'cultural group')}
        </CardContent>
      </Card>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-amber-500" />
            Geographic Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderDistribution(demographicsData?.locations, 'location')}
        </CardContent>
      </Card>

      {/* Language Diversity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-purple-500" />
            Language Diversity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderDistribution(demographicsData?.languages, 'language')}
        </CardContent>
      </Card>

      {/* Age Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-green-500" />
            Age Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderDistribution(demographicsData?.age_groups, 'age group')}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="border-sage-200 bg-sage-50">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-sage-700">Cultural Groups</p>
              <p className="text-2xl font-bold text-sage-900">
                {demographicsData?.cultural_groups?.length || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-sage-700">Languages</p>
              <p className="text-2xl font-bold text-sage-900">
                {demographicsData?.languages?.length || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-sage-700">Locations</p>
              <p className="text-2xl font-bold text-sage-900">
                {demographicsData?.locations?.length || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

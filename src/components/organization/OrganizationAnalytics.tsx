'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Heart,
  Target,
  Lightbulb,
  Globe,
  Award
} from 'lucide-react'

interface CommunityInsights {
  topThemes: Array<{ theme: string; count: number }>
  topValues: Array<{ value: string; count: number }>
  topStrengths: Array<{ strength: string; count: number }>
  culturalMarkers: string[]
}

interface OrganizationAnalyticsProps {
  insights: CommunityInsights
  memberCount: number
  analyticsCount: number
}

export function OrganizationAnalytics({ 
  insights, 
  memberCount, 
  analyticsCount 
}: OrganizationAnalyticsProps) {
  const analyticsRate = memberCount > 0 ? (analyticsCount / memberCount) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Community Analytics</h2>
          <p className="text-muted-foreground">
            Aggregated insights from {analyticsCount} of {memberCount} members
          </p>
        </div>
        
        <Badge variant="secondary" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          {Math.round(analyticsRate)}% Coverage
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analytics Coverage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsCount}/{memberCount}</div>
            <Progress value={analyticsRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community Themes</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.topThemes.length}</div>
            <p className="text-xs text-muted-foreground">Unique themes identified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Core Values</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.topValues.length}</div>
            <p className="text-xs text-muted-foreground">Shared values</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cultural Markers</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.culturalMarkers.length}</div>
            <p className="text-xs text-muted-foreground">Cultural identities</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Community Themes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Community Themes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.topThemes.length > 0 ? (
              <div className="space-y-3">
                {insights.topThemes.slice(0, 8).map(({ theme, count }) => (
                  <div key={theme} className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate flex-1">
                      {theme}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No themes identified yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Community Values */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Shared Values
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.topValues.length > 0 ? (
              <div className="space-y-3">
                {insights.topValues.slice(0, 8).map(({ value, count }) => (
                  <div key={value} className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate flex-1">
                      {value}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No values identified yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Community Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Community Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.topStrengths.length > 0 ? (
              <div className="space-y-3">
                {insights.topStrengths.slice(0, 8).map(({ strength, count }) => (
                  <div key={strength} className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate flex-1">
                      {strength}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No strengths identified yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cultural Identity Markers */}
      {insights.culturalMarkers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Cultural Identity Markers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {insights.culturalMarkers.map((marker, index) => (
                <Badge key={index} variant="outline">
                  {marker}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {analyticsCount === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Analytics Data Yet</h3>
            <p className="text-muted-foreground mb-4">
              Community analytics will appear here once members complete their individual analytics.
            </p>
            <p className="text-sm text-muted-foreground">
              Encourage members to visit their individual analytics page to contribute to community insights.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
'use client';

/**
 * Main Analytics Dashboard Component
 * Provides comprehensive community impact overview with cultural sensitivity
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  BookOpen, 
  FileText, 
  Heart, 
  TrendingUp, 
  Globe, 
  Lightbulb,
  Shield,
  Star,
  MapPin,
  Activity
} from 'lucide-react';
import { analyticsService, CommunityMetrics, ImpactAnalytics } from '@/lib/services/analytics.service';

interface MetricCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  culturalSensitive?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  description, 
  icon, 
  trend,
  culturalSensitive = false 
}) => (
  <Card className={`relative ${culturalSensitive ? 'border-amber-200 bg-amber-50' : ''}`}>
    {culturalSensitive && (
      <div className="absolute top-2 right-2">
        <Shield className="w-4 h-4 text-amber-600" title="Cultural Protocol Protected" />
      </div>
    )}
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="flex items-center space-x-1">
        {icon}
        {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<ImpactAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');

  useEffect(() => {
    loadAnalytics();
  }, [selectedTimeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getImpactAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading community insights...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <Alert>
        <AlertDescription>
          {error || 'Unable to load analytics data'}
        </AlertDescription>
      </Alert>
    );
  }

  const { communityMetrics, culturalThemes, wisdomQuotes, geographicInsights } = analytics;

  return (
    <div className="space-y-6">
      {/* Cultural Protocol Notice */}
      <Alert className="border-amber-200 bg-amber-50">
        <Shield className="w-4 h-4" />
        <AlertDescription>
          All analytics respect Indigenous data sovereignty and cultural protocols. 
          Sensitive content requires elder approval before display.
        </AlertDescription>
      </Alert>

      {/* Community Impact Overview */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Community Impact Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Stories"
            value={communityMetrics.totalStories}
            description="Community narratives preserved"
            icon={<BookOpen className="w-4 h-4 text-blue-500" />}
            trend="up"
          />
          
          <MetricCard
            title="Active Storytellers"
            value={communityMetrics.activeStorytellers}
            description="Community members sharing"
            icon={<Users className="w-4 h-4 text-green-500" />}
            trend="up"
          />
          
          <MetricCard
            title="Healing Journeys"
            value={communityMetrics.healingJourneys}
            description="Stories of recovery & growth"
            icon={<Heart className="w-4 h-4 text-red-500" />}
            culturalSensitive
          />
          
          <MetricCard
            title="Cultural Vitality"
            value={`${communityMetrics.culturalVitality}%`}
            description="Community cultural strength"
            icon={<Star className="w-4 h-4 text-yellow-500" />}
            trend="up"
            culturalSensitive
          />
        </div>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="community" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="wisdom">Wisdom</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
        </TabsList>

        {/* Community Impact Tab */}
        <TabsContent value="community" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Community Resilience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Community Resilience Score
                </CardTitle>
                <CardDescription>
                  Measures community strength and healing capacity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Overall Resilience</span>
                    <span className="font-bold text-green-600">
                      {communityMetrics.communityResilience}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${communityMetrics.communityResilience}%` }}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Based on healing narratives, community connections, and cultural continuity
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Intergenerational Connections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Intergenerational Impact
                </CardTitle>
                <CardDescription>
                  Knowledge transfer between generations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Connected Stories</span>
                    <span className="font-bold">
                      {communityMetrics.intergenerationalConnections}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Elder Wisdom Quotes</span>
                    <span className="font-bold text-amber-600">
                      {communityMetrics.elderWisdomQuotes}
                    </span>
                  </div>
                  <Badge variant="outline" className="w-full justify-center">
                    Traditional Knowledge Preserved
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cultural Themes Tab */}
        <TabsContent value="themes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cultural Themes Analysis</CardTitle>
              <CardDescription>
                Predominant themes across community stories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {culturalThemes.slice(0, 9).map((theme, index) => (
                  <Card key={theme.name} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{theme.name}</h4>
                      {theme.elderApproved && (
                        <Shield className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Frequency</span>
                        <span className="font-medium">{theme.frequency}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Significance</span>
                        <span className="font-medium">{theme.significance}%</span>
                      </div>
                      <Badge 
                        variant={theme.sentiment === 'positive' ? 'default' : 'secondary'}
                        className="w-full justify-center"
                      >
                        {theme.sentiment} sentiment
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wisdom Quotes Tab */}
        <TabsContent value="wisdom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                Elder Wisdom & Teachings
              </CardTitle>
              <CardDescription>
                Significant quotes preserving traditional knowledge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {wisdomQuotes.slice(0, 10).map((quote, index) => (
                  <Card key={quote.id} className="p-4 bg-amber-50 border-amber-200">
                    <div className="space-y-2">
                      <blockquote className="text-lg italic">
                        "{quote.text.length > 150 ? `${quote.text.substring(0, 150)}...` : quote.text}"
                      </blockquote>
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-medium">{quote.storyteller}</span>
                          <span className="text-muted-foreground ml-2">
                            {quote.culturalContext}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-amber-600 font-medium">
                            Significance: {quote.significance}%
                          </span>
                          {quote.elderApproval === 'approved' && (
                            <Shield className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {quote.themes.map(theme => (
                          <Badge key={theme} variant="outline" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Network Analysis Tab */}
        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Community Network Analysis</CardTitle>
              <CardDescription>
                Storyteller connections and influence patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Globe className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">Interactive Network Visualization</p>
                <p className="text-muted-foreground mb-4">
                  Advanced D3.js network graph showing storyteller connections
                </p>
                <Badge variant="outline">
                  Component will load interactive visualization here
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geographic Insights Tab */}
        <TabsContent value="geographic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Geographic Distribution
              </CardTitle>
              <CardDescription>
                Story density and cultural clusters by region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {geographicInsights.map((insight, index) => (
                  <Card key={insight.region} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-lg">{insight.region}</h4>
                      <Badge variant="secondary">
                        {insight.storyDensity} stories
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium mb-1">Predominant Themes:</h5>
                        <div className="flex flex-wrap gap-1">
                          {insight.predominantThemes.map(theme => (
                            <Badge key={theme} variant="outline">
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-1">Cultural Clusters:</h5>
                        <div className="space-y-1">
                          {insight.culturalClusters.map((cluster, i) => (
                            <div key={i} className="text-sm flex justify-between">
                              <span>{cluster.name}</span>
                              <span className="text-muted-foreground">
                                {cluster.storytellers} storytellers
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
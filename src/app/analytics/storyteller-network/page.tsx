'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Users, 
  Network,
  Star,
  Globe,
  Activity,
  Eye,
  Download
} from 'lucide-react';
import NetworkVisualization from '@/components/analytics/NetworkVisualization';
import { analyticsService, StorytellerConnection } from '@/lib/services/analytics.service';

export default function StorytellerNetworkPage() {
  const [storytellers, setStorytellers] = useState<StorytellerConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStoryteller, setSelectedStoryteller] = useState<StorytellerConnection | null>(null);

  useEffect(() => {
    loadStorytellerNetwork();
  }, []);

  const loadStorytellerNetwork = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getStorytellerNetwork();
      setStorytellers(data);
    } catch (error) {
      console.error('Error loading storyteller network:', error);
    } finally {
      setLoading(false);
    }
  };

  const networkStats = {
    totalConnections: storytellers.reduce((sum, s) => sum + s.connections.length, 0),
    averageConnections: storytellers.length ? Math.round(storytellers.reduce((sum, s) => sum + s.connections.length, 0) / storytellers.length) : 0,
    highInfluenceStorytellers: storytellers.filter(s => s.influences > 70).length,
    elders: storytellers.filter(s => s.culturalRole === 'Elder').length,
    communityKeepers: storytellers.filter(s => s.culturalRole === 'Community Keeper').length
  };

  const topInfluencers = storytellers
    .sort((a, b) => b.influences - a.influences)
    .slice(0, 5);

  const handleNodeClick = (node: any) => {
    const storyteller = storytellers.find(s => s.id === node.id);
    if (storyteller) {
      setSelectedStoryteller(storyteller);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Network className="w-8 h-8 animate-pulse mx-auto mb-4" />
            <p>Loading storyteller network...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Storyteller Network Analysis</h1>
        <p className="text-lg text-muted-foreground">
          Discover the connections and influence patterns within our storytelling community.
          Understand how stories create bridges between people, cultures, and generations.
        </p>
      </div>

      {/* Cultural Protocol Notice */}
      <Alert className="mb-6 border-amber-200 bg-amber-50">
        <Shield className="w-4 h-4" />
        <AlertDescription>
          Network analysis respects storyteller privacy and cultural boundaries. 
          Sensitive relationships require community consent before visualization.
        </AlertDescription>
      </Alert>

      {/* Network Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Storytellers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storytellers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats.totalConnections}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg. Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats.averageConnections}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Elders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{networkStats.elders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">High Influence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{networkStats.highInfluenceStorytellers}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Network Visualization */}
        <div className="lg:col-span-3">
          <NetworkVisualization
            storytellers={storytellers}
            width={900}
            height={600}
            onNodeClick={handleNodeClick}
          />
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Top Influencers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Star className="w-5 h-5 mr-2" />
                Top Influencers
              </CardTitle>
              <CardDescription>
                Storytellers with highest community influence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topInfluencers.map((storyteller, index) => (
                  <div key={storyteller.id} className="flex items-center space-x-3 p-2 rounded-lg bg-grey-50">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{storyteller.name}</p>
                      <p className="text-xs text-muted-foreground">{storyteller.culturalRole}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {storyteller.influences}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cultural Roles Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="w-5 h-5 mr-2" />
                Cultural Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="text-sm">Elders</span>
                  </div>
                  <Badge variant="outline">{networkStats.elders}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Community Keepers</span>
                  </div>
                  <Badge variant="outline">{networkStats.communityKeepers}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Community Members</span>
                  </div>
                  <Badge variant="outline">
                    {storytellers.length - networkStats.elders - networkStats.communityKeepers}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Storyteller Details */}
          {selectedStoryteller && (
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Eye className="w-5 h-5 mr-2" />
                  Selected Storyteller
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">{selectedStoryteller.name}</h4>
                    <p className="text-sm text-muted-foreground">{selectedStoryteller.culturalRole}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium">Stories:</span>
                      <div className="text-lg font-bold">{selectedStoryteller.storyCount}</div>
                    </div>
                    <div>
                      <span className="font-medium">Influence:</span>
                      <div className="text-lg font-bold">{selectedStoryteller.influences}</div>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Connections:</span>
                      <div className="text-lg font-bold">{selectedStoryteller.connections.length}</div>
                    </div>
                  </div>

                  {selectedStoryteller.organisation && (
                    <div>
                      <span className="text-sm font-medium">Organization:</span>
                      <p className="text-sm text-muted-foreground">{selectedStoryteller.organisation}</p>
                    </div>
                  )}

                  {selectedStoryteller.themes.length > 0 && (
                    <div>
                      <span className="text-sm font-medium">Themes:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedStoryteller.themes.slice(0, 4).map(theme => (
                          <Badge key={theme} variant="outline" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Network Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Activity className="w-5 h-5 mr-2" />
                Network Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-800">Strong Community Bonds</p>
                  <p className="text-green-600">
                    {Math.round((networkStats.totalConnections / storytellers.length) * 100) / 100} connections per person indicates a well-connected community.
                  </p>
                </div>
                
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="font-medium text-amber-800">Elder Wisdom Network</p>
                  <p className="text-amber-600">
                    {networkStats.elders} elders serve as knowledge keepers and community anchors.
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-800">Influence Distribution</p>
                  <p className="text-blue-600">
                    {Math.round((networkStats.highInfluenceStorytellers / storytellers.length) * 100)}% have high community influence.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Network Analysis Summary */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Network Analysis Summary
          </CardTitle>
          <CardDescription>
            Key findings from storyteller relationship analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Community Strengths</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                  <span>High connectivity between different generations through shared storytelling themes</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                  <span>Strong elder influence network preserving traditional knowledge</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                  <span>Multiple community keepers facilitating story connections</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Growth Opportunities</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2"></div>
                  <span>Potential for more cross-cultural connections between organisations</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2"></div>
                  <span>Opportunity to engage more community members in storytelling</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2"></div>
                  <span>Bridge building between different cultural clusters</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
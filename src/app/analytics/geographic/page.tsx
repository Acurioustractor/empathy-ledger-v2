'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import nextDynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  MapPin, 
  Globe,
  BarChart3,
  Download,
  Filter,
  Users,
  BookOpen
} from 'lucide-react';
import { analyticsService, GeographicInsight } from '@/lib/services/analytics.service';

// Dynamically import Leaflet map to avoid SSR issues
const MapContainer = nextDynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = nextDynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = nextDynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = nextDynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

interface StoryLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  storyCount: number;
  themes: string[];
  culturalSignificance: 'high' | 'medium' | 'low';
}

export default function GeographicPage() {
  const [insights, setInsights] = useState<GeographicInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'map' | 'charts'>('map');

  // Mock story locations - in real implementation, would come from service
  const storyLocations: StoryLocation[] = [
    {
      id: '1',
      name: 'Winnipeg, MB',
      latitude: 49.8951,
      longitude: -97.1384,
      storyCount: 67,
      themes: ['Healing', 'Community', 'Tradition'],
      culturalSignificance: 'high'
    },
    {
      id: '2',
      name: 'Vancouver, BC',
      latitude: 49.2827,
      longitude: -123.1207,
      storyCount: 45,
      themes: ['Cultural Revival', 'Youth', 'Language'],
      culturalSignificance: 'high'
    },
    {
      id: '3',
      name: 'Toronto, ON',
      latitude: 43.6532,
      longitude: -79.3832,
      storyCount: 34,
      themes: ['Urban Indigenous', 'Connection', 'Identity'],
      culturalSignificance: 'medium'
    },
    {
      id: '4',
      name: 'Calgary, AB',
      latitude: 51.0447,
      longitude: -114.0719,
      storyCount: 28,
      themes: ['Family', 'Land', 'Ceremony'],
      culturalSignificance: 'high'
    },
    {
      id: '5',
      name: 'Yellowknife, NT',
      latitude: 62.4540,
      longitude: -114.3718,
      storyCount: 23,
      themes: ['Traditional Knowledge', 'Elders', 'Land'],
      culturalSignificance: 'high'
    }
  ];

  useEffect(() => {
    loadGeographicInsights();
  }, []);

  const loadGeographicInsights = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getGeographicInsights();
      setInsights(data);
    } catch (error) {
      console.error('Error loading geographic insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInsights = selectedRegion === 'all' 
    ? insights 
    : insights.filter(insight => 
        insight.region.toLowerCase().includes(selectedRegion.toLowerCase())
      );

  const totalStories = insights.reduce((sum, insight) => sum + insight.storyDensity, 0);
  const averageDensity = insights.length ? Math.round(totalStories / insights.length) : 0;
  const topRegion = insights.sort((a, b) => b.storyDensity - a.storyDensity)[0];

  const exportData = () => {
    const csvContent = insights.map(insight => ({
      region: insight.region,
      storyDensity: insight.storyDensity,
      predominantThemes: insight.predominantThemes.join('; '),
      culturalClusters: insight.culturalClusters.map(c => `${c.name}: ${c.storytellers}`).join('; ')
    }));

    const csv = [
      Object.keys(csvContent[0]).join(','),
      ...csvContent.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'geographic-insights.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Globe className="w-8 h-8 animate-pulse mx-auto mb-4" />
            <p>Loading geographic insights...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Geographic Story Mapping</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Explore the geographic distribution of community stories and cultural clusters. 
          Understand how place shapes narrative and connects communities across regions.
        </p>
      </div>

      {/* Cultural Protocol Notice */}
      <Alert className="mb-6 border-amber-200 bg-amber-50">
        <Shield className="w-4 h-4" />
        <AlertDescription>
          Geographic data is anonymized to protect community locations. 
          Specific addresses and sacred sites are never displayed publicly.
        </AlertDescription>
      </Alert>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Geographic Analysis Controls
            </span>
            <div className="flex items-center space-x-4">
              <Select value={viewMode} onValueChange={(value: 'map' | 'charts') => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="map">Map View</SelectItem>
                  <SelectItem value="charts">Chart View</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportData} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Filter by Region:</span>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {insights.map(insight => (
                    <SelectItem key={insight.region} value={insight.region}>
                      {insight.region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Geographic Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Regions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.length}</div>
            <p className="text-xs text-muted-foreground">Active story regions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStories}</div>
            <p className="text-xs text-muted-foreground">Across all regions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Density</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageDensity}</div>
            <p className="text-xs text-muted-foreground">Stories per region</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Top Region</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600">
              {topRegion?.region || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {topRegion?.storyDensity || 0} stories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Map View */}
      {viewMode === 'map' && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Interactive Story Map
            </CardTitle>
            <CardDescription>
              Geographic distribution of community stories with cultural significance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 rounded-lg overflow-hidden border">
              {typeof window !== 'undefined' && (
                <MapContainer
                  center={[56.1304, -106.3468]} // Center of Canada
                  zoom={4}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {storyLocations.map((location) => (
                    <Marker
                      key={location.id}
                      position={[location.latitude, location.longitude]}
                    >
                      <Popup>
                        <div className="p-2">
                          <h4 className="font-semibold">{location.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {location.storyCount} stories
                          </p>
                          <div className="space-y-1">
                            <Badge 
                              variant={location.culturalSignificance === 'high' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {location.culturalSignificance} significance
                            </Badge>
                            <div className="flex flex-wrap gap-1">
                              {location.themes.slice(0, 3).map(theme => (
                                <Badge key={theme} variant="outline" className="text-xs">
                                  {theme}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </div>
            
            {/* Map Legend */}
            <div className="mt-4 p-4 bg-stone-50 rounded-lg">
              <h4 className="font-semibold mb-2">Map Legend</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>High Cultural Significance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span>Medium Cultural Significance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-stone-500 rounded-full"></div>
                  <span>General Community Stories</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regional Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {filteredInsights.map((insight, index) => (
          <Card key={insight.region} className="p-6">
            <div className="space-y-4">
              {/* Region Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{insight.region}</h3>
                <Badge variant="secondary" className="text-sm">
                  {insight.storyDensity} stories
                </Badge>
              </div>

              {/* Story Density Visualization */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Story Density</span>
                  <span className="font-medium">{insight.storyDensity}</span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-2">
                  <div 
                    className="bg-sage-500 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, (insight.storyDensity / Math.max(...insights.map(i => i.storyDensity))) * 100)}%` 
                    }}
                  />
                </div>
              </div>

              {/* Predominant Themes */}
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Predominant Themes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {insight.predominantThemes.map(theme => (
                    <Badge key={theme} variant="outline" className="text-xs">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Cultural Clusters */}
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Cultural Clusters
                </h4>
                <div className="space-y-2">
                  {insight.culturalClusters.map((cluster, i) => (
                    <div key={i} className="flex items-center justify-between text-sm p-2 bg-stone-50 rounded">
                      <span className="font-medium">{cluster.name}</span>
                      <div className="text-right">
                        <div className="font-medium">{cluster.storytellers}</div>
                        <div className="text-xs text-muted-foreground">storytellers</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Geographic Insights Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Geographic Analysis Summary
          </CardTitle>
          <CardDescription>
            Key findings from regional story distribution analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-700">Regional Strengths</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                  <span>Strong urban Indigenous storytelling presence in major cities</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                  <span>Diverse cultural themes represented across all regions</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                  <span>Significant story density in culturally important areas</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                  <span>Active community clusters maintaining cultural connections</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-amber-700">Expansion Opportunities</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2"></div>
                  <span>Potential for connecting isolated regional communities</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2"></div>
                  <span>Opportunities for inter-regional story sharing initiatives</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2"></div>
                  <span>Remote communities seeking digital storytelling platforms</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2"></div>
                  <span>Cultural bridging between urban and traditional communities</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
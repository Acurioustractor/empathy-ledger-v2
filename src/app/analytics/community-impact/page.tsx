'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  Heart, 
  TrendingUp,
  Activity,
  Star,
  Globe,
  BookOpen,
  Calendar,
  Target
} from 'lucide-react';

export default function CommunityImpactPage() {
  const [timeRange, setTimeRange] = useState('all-time');

  // Mock data - in real implementation, this would come from the analytics service
  const impactMetrics = {
    healingJourneys: 89,
    culturalRevitalization: 67,
    intergenerationalConnections: 156,
    communityStrength: 78,
    traditionalKnowledgePreserved: 234,
    elderWisdomShared: 145
  };

  const outcomes = [
    {
      category: 'Healing & Wellness',
      metrics: [
        { name: 'Stories of Recovery', value: 34, change: '+12%' },
        { name: 'Trauma Processing', value: 28, change: '+8%' },
        { name: 'Community Support', value: 67, change: '+15%' }
      ]
    },
    {
      category: 'Cultural Continuity',
      metrics: [
        { name: 'Traditional Practices', value: 45, change: '+18%' },
        { name: 'Language Preservation', value: 23, change: '+5%' },
        { name: 'Ceremony Documentation', value: 19, change: '+11%' }
      ]
    },
    {
      category: 'Community Building',
      metrics: [
        { name: 'New Connections Made', value: 78, change: '+22%' },
        { name: 'Cross-Cultural Understanding', value: 56, change: '+14%' },
        { name: 'Youth Engagement', value: 43, change: '+19%' }
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Community Impact Analysis</h1>
        <p className="text-lg text-muted-foreground">
          Measuring the real-world impact of storytelling on community healing, 
          cultural preservation, and social connections.
        </p>
      </div>

      {/* Cultural Protocol Notice */}
      <Alert className="mb-6 border-amber-200 bg-amber-50">
        <Shield className="w-4 h-4" />
        <AlertDescription>
          Impact measurements are conducted with community consent and elder oversight. 
          All data respects Indigenous data sovereignty principles.
        </AlertDescription>
      </Alert>

      {/* Key Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Heart className="w-5 h-5 mr-2 text-green-600" />
              Healing Journeys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {impactMetrics.healingJourneys}
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Stories documenting healing and recovery processes
            </p>
            <Badge variant="outline" className="text-green-700 border-green-300">
              <TrendingUp className="w-3 h-3 mr-1" />
              +23% this quarter
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Globe className="w-5 h-5 mr-2 text-amber-600" />
              Cultural Revitalization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600 mb-2">
              {impactMetrics.culturalRevitalization}
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Stories preserving and revitalizing cultural practices
            </p>
            <Badge variant="outline" className="text-amber-700 border-amber-300">
              <TrendingUp className="w-3 h-3 mr-1" />
              +18% this quarter
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Community Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {impactMetrics.intergenerationalConnections}
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              New relationships formed through storytelling
            </p>
            <Badge variant="outline" className="text-blue-700 border-blue-300">
              <TrendingUp className="w-3 h-3 mr-1" />
              +31% this quarter
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Impact Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Community Strength Index */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Community Strength Index
            </CardTitle>
            <CardDescription>
              Composite measure of community resilience and cohesion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-green-600 mb-2">
                  {impactMetrics.communityStrength}
                </div>
                <p className="text-lg text-muted-foreground">
                  Community Strength Score
                </p>
                <Badge className="bg-green-100 text-green-800">
                  Strong Community
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Social Cohesion</span>
                  <span className="font-medium">82%</span>
                </div>
                <div className="w-full bg-grey-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '82%' }} />
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Cultural Vitality</span>
                  <span className="font-medium">75%</span>
                </div>
                <div className="w-full bg-grey-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }} />
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Healing Progress</span>
                  <span className="font-medium">78%</span>
                </div>
                <div className="w-full bg-grey-200 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '78%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Preservation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Traditional Knowledge Preservation
            </CardTitle>
            <CardDescription>
              Tracking of cultural knowledge documentation and transfer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600">
                    {impactMetrics.traditionalKnowledgePreserved}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Knowledge Items Documented
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {impactMetrics.elderWisdomShared}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Elder Wisdom Quotes
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ceremonies & Practices</span>
                  <Badge variant="outline">67 documented</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Traditional Stories</span>
                  <Badge variant="outline">89 preserved</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cultural Teachings</span>
                  <Badge variant="outline">124 recorded</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Language Elements</span>
                  <Badge variant="outline">78 captured</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Impact Outcomes by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Measured Impact Outcomes
          </CardTitle>
          <CardDescription>
            Concrete outcomes and improvements identified through story analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {outcomes.map((category, index) => (
              <div key={category.category} className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  {index === 0 && <Heart className="w-5 h-5 mr-2 text-green-500" />}
                  {index === 1 && <Globe className="w-5 h-5 mr-2 text-amber-500" />}
                  {index === 2 && <Users className="w-5 h-5 mr-2 text-blue-500" />}
                  {category.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {category.metrics.map((metric) => (
                    <Card key={metric.name} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{metric.name}</span>
                        <Badge variant="outline" className="text-green-600">
                          {metric.change}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold">{metric.value}</div>
                      <div className="text-xs text-muted-foreground">stories identified</div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Impact Timeline */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Impact Timeline
          </CardTitle>
          <CardDescription>
            Key community impact milestones and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Community Healing Initiative Launch</p>
                <p className="text-sm text-muted-foreground">
                  Launched trauma-informed storytelling program with 23 participants
                </p>
                <Badge variant="outline" className="text-xs">Q1 2024</Badge>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Elder Council Partnership</p>
                <p className="text-sm text-muted-foreground">
                  Established formal partnership for cultural oversight and approval
                </p>
                <Badge variant="outline" className="text-xs">Q2 2024</Badge>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Intergenerational Dialogue Program</p>
                <p className="text-sm text-muted-foreground">
                  Connected 45 youth with elders through story sharing sessions
                </p>
                <Badge variant="outline" className="text-xs">Q3 2024</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
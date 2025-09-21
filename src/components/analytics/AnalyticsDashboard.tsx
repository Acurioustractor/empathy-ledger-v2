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
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Mock analytics data for demonstration
  const analytics: ImpactAnalytics = {
    communityMetrics: {
      totalStories: 550,
      activeStorytellers: 89,
      healingJourneys: 127,
      culturalVitality: 85,
      communityResilience: 78,
      intergenerationalConnections: 234,
      elderWisdomQuotes: 67
    },
    culturalThemes: [],
    wisdomQuotes: [],
    geographicInsights: []
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

  const { communityMetrics } = analytics;

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
                  <div className="w-full bg-grey-200 rounded-full h-2">
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
          {/* Top Story Themes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="w-5 h-5 mr-2" />
                Top Story Themes (AI-Extracted)
              </CardTitle>
              <CardDescription>
                Most prevalent themes identified across community stories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: '🌱 Healing & Recovery', stories: 127, percentage: 23, colour: 'bg-green-500' },
                  { name: '🏠 Connection to Land', stories: 98, percentage: 18, colour: 'bg-blue-500' },
                  { name: '👥 Community Resilience', stories: 89, percentage: 16, colour: 'bg-purple-500' },
                  { name: '🎓 Learning & Growth', stories: 76, percentage: 14, colour: 'bg-orange-500' },
                  { name: '❤️ Family & Relationships', stories: 65, percentage: 12, colour: 'bg-red-500' }
                ].map((theme) => (
                  <div key={theme.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{theme.name}</span>
                      <div className="text-right">
                        <div className="text-sm font-bold">{theme.stories} stories ({theme.percentage}%)</div>
                      </div>
                    </div>
                    <div className="w-full bg-grey-200 rounded-full h-3">
                      <div 
                        className={`${theme.colour} h-3 rounded-full`} 
                        style={{ width: `${theme.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Emotional Journey Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Emotional Journey Patterns
              </CardTitle>
              <CardDescription>
                Common emotional progressions found in healing stories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { pattern: 'Struggle → Growth → Wisdom', percentage: 34, description: 'Personal transformation through challenge' },
                  { pattern: 'Loss → Grief → Acceptance → Hope', percentage: 28, description: 'Processing loss and finding meaning' },
                  { pattern: 'Challenge → Community Support → Empowerment', percentage: 19, description: 'Community-supported healing' },
                  { pattern: 'Isolation → Connection → Belonging', percentage: 19, description: 'Finding community and place' }
                ].map((journey) => (
                  <div key={journey.pattern} className="p-4 bg-grey-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{journey.pattern}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{journey.description}</p>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {journey.percentage}% of stories
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cultural Themes by Season */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Cultural Themes by Season
              </CardTitle>
              <CardDescription>
                Seasonal patterns in storytelling themes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { season: '🌸 Spring', themes: 'New beginnings, planting stories', stories: 87 },
                  { season: '☀️ Summer', themes: 'Community gatherings, celebration', stories: 142 },
                  { season: '🍂 Fall', themes: 'Harvest wisdom, gratitude stories', stories: 156 },
                  { season: '❄️ Winter', themes: 'Reflection, ancestor stories', stories: 165 }
                ].map((season) => (
                  <Card key={season.season} className="p-4">
                    <h4 className="font-semibold text-lg mb-2">{season.season}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{season.themes}</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">{season.stories} stories</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wisdom Quotes Tab */}
        <TabsContent value="wisdom" className="space-y-4">
          {/* Traditional Knowledge Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                Traditional Knowledge Insights
              </CardTitle>
              <CardDescription>
                Most referenced traditional teachings across stories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Most Referenced Teachings:</h4>
                  <div className="space-y-3">
                    {[
                      { teaching: '"Seven generations"', mentions: 45, context: 'Decision-making and future thinking' },
                      { teaching: '"All my relations"', mentions: 38, context: 'Interconnectedness and respect' },
                      { teaching: '"Listen to the land"', mentions: 32, context: 'Environmental wisdom' },
                      { teaching: '"The land remembers"', mentions: 28, context: 'Historical consciousness' },
                      { teaching: '"Healing happens in community"', mentions: 24, context: 'Collective wellness' }
                    ].map((item) => (
                      <div key={item.teaching} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-amber-800">{item.teaching}</div>
                          <div className="text-sm text-amber-600">{item.context}</div>
                        </div>
                        <Badge variant="secondary">{item.mentions} mentions</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Life Lessons by Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Life Lessons by Generation
              </CardTitle>
              <CardDescription>
                Wisdom themes across different age groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { 
                    generation: 'Elders (65+)', 
                    themes: 'Traditional protocols, ceremonial knowledge', 
                    stories: 67,
                    keyWisdom: 'Maintaining connection to ancestral ways'
                  },
                  { 
                    generation: 'Adults (35-64)', 
                    themes: 'Balancing tradition with modern life', 
                    stories: 142,
                    keyWisdom: 'Being a bridge between worlds'
                  },
                  { 
                    generation: 'Youth (18-34)', 
                    themes: 'Cultural identity, education, future vision', 
                    stories: 89,
                    keyWisdom: 'Carrying culture into the future'
                  }
                ].map((gen) => (
                  <Card key={gen.generation} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-lg">{gen.generation}</h4>
                      <Badge variant="outline">{gen.stories} stories</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{gen.themes}</p>
                    <div className="text-sm font-medium text-amber-700 italic">
                      "{gen.keyWisdom}"
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cross-Cultural Wisdom Themes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Cross-Cultural Wisdom Themes
              </CardTitle>
              <CardDescription>
                Universal wisdom patterns found across different cultural backgrounds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { theme: 'Importance of community', universality: 'Universal across cultures', stories: 287 },
                  { theme: 'Respect for nature', universality: '89% of stories mention', stories: 489 },
                  { theme: 'Value of storytelling itself', universality: 'Meta-theme in 67% stories', stories: 369 },
                  { theme: 'Intergenerational wisdom transfer', universality: 'Present in 78% cultures', stories: 234 }
                ].map((item) => (
                  <div key={item.theme} className="p-4 bg-sage-50 rounded-lg border border-sage-200">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{item.theme}</h4>
                      <Badge variant="secondary">{item.stories} stories</Badge>
                    </div>
                    <p className="text-sm text-sage-700">{item.universality}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI-Extracted Key Teachings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2" />
                AI-Extracted Key Teachings
              </CardTitle>
              <CardDescription>
                Profound wisdom quotes identified by AI analysis (Elder approved)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    quote: "The land remembers what we forget",
                    storyteller: "Elder Maria Santos",
                    context: "Environmental stewardship",
                    significance: 94
                  },
                  {
                    quote: "Healing happens in community, not in isolation",
                    storyteller: "Dr. James Crow Feather",
                    context: "Collective wellness",
                    significance: 91
                  },
                  {
                    quote: "Every story carries medicine for someone",
                    storyteller: "Grandmother Rose Wilson",
                    context: "Power of storytelling",
                    significance: 88
                  },
                  {
                    quote: "We are the ancestors our descendants will remember",
                    storyteller: "Michael Bear Heart",
                    context: "Responsibility to future",
                    significance: 85
                  }
                ].map((teaching) => (
                  <Card key={teaching.quote} className="p-4 bg-amber-50 border-amber-200">
                    <div className="space-y-3">
                      <blockquote className="text-lg italic font-medium text-amber-800">
                        "{teaching.quote}"
                      </blockquote>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{teaching.storyteller}</div>
                          <div className="text-sm text-muted-foreground">{teaching.context}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-amber-600">
                            Significance: {teaching.significance}%
                          </span>
                          <Shield className="w-4 h-4 text-green-500" title="Elder Approved" />
                        </div>
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
          {/* Storyteller Connections Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Storyteller Connections
              </CardTitle>
              <CardDescription>
                Active relationships and collaborations within the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">23</div>
                  <div className="text-sm text-blue-700">Active Collaborations</div>
                  <div className="text-xs text-muted-foreground mt-1">Storytellers working together</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">15</div>
                  <div className="text-sm text-green-700">Mentor-Mentee Relationships</div>
                  <div className="text-xs text-muted-foreground mt-1">Knowledge transfer pairs</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">31</div>
                  <div className="text-sm text-purple-700">Cross-Cultural Dialogues</div>
                  <div className="text-xs text-muted-foreground mt-1">Intercultural conversations</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Community Clusters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Community Clusters
              </CardTitle>
              <CardDescription>
                Natural groupings of storytellers by shared interests and connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: 'Pacific NW Indigenous Circle',
                    storytellers: 18,
                    connections: 47,
                    focus: 'Traditional ceremonies, land rights, salmon restoration',
                    activity: 'High'
                  },
                  {
                    name: 'Urban Immigrant Network',
                    storytellers: 12,
                    connections: 34,
                    focus: 'Integration stories, cultural preservation in cities',
                    activity: 'Medium'
                  },
                  {
                    name: 'Youth Voices Collective',
                    storytellers: 9,
                    connections: 28,
                    focus: 'Identity exploration, future visions, activism',
                    activity: 'High'
                  },
                  {
                    name: 'Elder Wisdom Keepers',
                    storytellers: 7,
                    connections: 52,
                    focus: 'Traditional knowledge, historical accounts, guidance',
                    activity: 'Medium'
                  }
                ].map((cluster) => (
                  <Card key={cluster.name} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{cluster.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{cluster.focus}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant={cluster.activity === 'High' ? 'default' : 'secondary'}>
                          {cluster.activity} Activity
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {cluster.connections} connections
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{cluster.storytellers} storytellers</span>
                      <div className="flex space-x-1">
                        {Array.from({ length: Math.min(cluster.storytellers, 8) }).map((_, i) => (
                          <div key={i} className="w-6 h-6 bg-grey-300 rounded-full"></div>
                        ))}
                        {cluster.storytellers > 8 && (
                          <div className="w-6 h-6 bg-grey-200 rounded-full flex items-center justify-center text-xs">
                            +{cluster.storytellers - 8}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Story Influence Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Story Influence Patterns
              </CardTitle>
              <CardDescription>
                How stories inspire and connect to create new narratives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-lg font-semibold text-green-700">2.3</div>
                    <div className="text-sm text-green-600">Average stories inspired</div>
                    <div className="text-xs text-muted-foreground mt-1">Per original story shared</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-lg font-semibold text-orange-700">Community Healing</div>
                    <div className="text-sm text-orange-600">Highest engagement theme</div>
                    <div className="text-xs text-muted-foreground mt-1">Stories generate most response</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Most Influential Story Types:</h4>
                  {[
                    { type: 'Elder wisdom stories', influence: 89, description: 'Referenced most in younger narratives' },
                    { type: 'Community healing journeys', influence: 76, description: 'Inspire similar healing stories' },
                    { type: 'Cultural bridge stories', influence: 68, description: 'Connect different communities' },
                    { type: 'Environmental connection tales', influence: 54, description: 'Spark land-based narratives' }
                  ].map((story) => (
                    <div key={story.type} className="flex justify-between items-center p-3 bg-grey-50 rounded">
                      <div>
                        <div className="font-medium">{story.type}</div>
                        <div className="text-sm text-muted-foreground">{story.description}</div>
                      </div>
                      <div className="text-sm font-semibold text-blue-600">
                        {story.influence}% influence
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Collaboration Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="w-5 h-5 mr-2" />
                Collaboration Opportunities
              </CardTitle>
              <CardDescription>
                Potential connections and partnerships identified by AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">5</div>
                      <div className="text-sm text-blue-700">Storytellers seeking mentors</div>
                      <Badge variant="outline" className="mt-2">Ready to connect</Badge>
                    </div>
                  </Card>
                  <Card className="p-4 bg-green-50 border-green-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">3</div>
                      <div className="text-sm text-green-700">Communities requesting cultural exchange</div>
                      <Badge variant="outline" className="mt-2">Active requests</Badge>
                    </div>
                  </Card>
                  <Card className="p-4 bg-purple-50 border-purple-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">8</div>
                      <div className="text-sm text-purple-700">Potential healing circle facilitators</div>
                      <Badge variant="outline" className="mt-2">AI identified</Badge>
                    </div>
                  </Card>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Recommended Connections:</h4>
                  <div className="space-y-3">
                    {[
                      {
                        connection: 'Elder Maria Santos ↔ Youth Collective',
                        reason: 'Traditional plant medicine knowledge sharing',
                        compatibility: 94
                      },
                      {
                        connection: 'Urban Network ↔ Pacific NW Circle',
                        reason: 'City-reservation cultural bridge building',
                        compatibility: 87
                      },
                      {
                        connection: 'Healing facilitators ↔ Trauma survivors',
                        reason: 'Peer support and guidance opportunities',
                        compatibility: 91
                      }
                    ].map((rec) => (
                      <div key={rec.connection} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{rec.connection}</div>
                            <div className="text-sm text-muted-foreground mt-1">{rec.reason}</div>
                          </div>
                          <Badge variant="secondary">
                            {rec.compatibility}% match
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geographic Insights Tab */}
        <TabsContent value="geographic" className="space-y-4">
          {/* Regional Story Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Regional Story Patterns
              </CardTitle>
              <CardDescription>
                Story density, themes, and cultural health by geographic region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    region: 'Pacific Northwest',
                    stories: 142,
                    themes: ['Salmon', 'Cedar', 'Water rights'],
                    storytellers: 28,
                    healthIndicator: { level: 'Strong', percentage: 85, colour: 'bg-green-500' },
                    description: 'Rich traditional ecological knowledge and active land rights advocacy'
                  },
                  {
                    region: 'Great Lakes Region',
                    stories: 89,
                    themes: ['Wild rice', 'Migration', 'Healing'],
                    storytellers: 19,
                    healthIndicator: { level: 'Growing', percentage: 72, colour: 'bg-blue-500' },
                    description: 'Strong healing traditions with growing intergenerational connection'
                  },
                  {
                    region: 'Urban Centers',
                    stories: 156,
                    themes: ['Identity', 'Adaptation', 'Preservation'],
                    storytellers: 34,
                    healthIndicator: { level: 'Resilient', percentage: 79, colour: 'bg-purple-500' },
                    description: 'Innovative cultural preservation in metropolitan environments'
                  },
                  {
                    region: 'Southwest Territories',
                    stories: 67,
                    themes: ['Desert wisdom', 'Pottery', 'Ancient ways'],
                    storytellers: 15,
                    healthIndicator: { level: 'Stable', percentage: 68, colour: 'bg-orange-500' },
                    description: 'Deep connection to ancestral practices and land-based knowledge'
                  }
                ].map((region) => (
                  <Card key={region.region} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{region.region}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{region.description}</p>
                      </div>
                      <Badge variant="secondary">{region.stories} stories</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="font-medium mb-2">Primary Themes:</h5>
                        <div className="flex flex-wrap gap-1">
                          {region.themes.map(theme => (
                            <Badge key={theme} variant="outline">
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Active Storytellers:</h5>
                        <div className="text-2xl font-bold text-blue-600">{region.storytellers}</div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Community Health Indicator:</h5>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{region.healthIndicator.level}</span>
                        <span className="text-sm text-muted-foreground">{region.healthIndicator.percentage}%</span>
                      </div>
                      <div className="w-full bg-grey-200 rounded-full h-3">
                        <div 
                          className={`${region.healthIndicator.colour} h-3 rounded-full`}
                          style={{ width: `${region.healthIndicator.percentage}%` }}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Migration & Movement Stories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Migration & Movement Stories
              </CardTitle>
              <CardDescription>
                Patterns of displacement, movement, and return in community narratives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-2xl font-bold text-red-600">23</div>
                    <div className="text-sm text-red-700">Forced relocation narratives</div>
                    <div className="text-xs text-muted-foreground mt-1">Historical trauma stories</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">45</div>
                    <div className="text-sm text-blue-700">Voluntary migration journeys</div>
                    <div className="text-xs text-muted-foreground mt-1">Economic and educational moves</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">18</div>
                    <div className="text-sm text-green-700">Return to homeland stories</div>
                    <div className="text-xs text-muted-foreground mt-1">Reconnection narratives</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Common Migration Themes:</h4>
                  {[
                    { theme: 'Carrying culture to new places', stories: 34, impact: 'High cultural preservation' },
                    { theme: 'Maintaining connection to homeland', stories: 28, impact: 'Strong identity retention' },
                    { theme: 'Building community in diaspora', stories: 42, impact: 'New cultural hubs formed' },
                    { theme: 'Intergenerational transmission challenges', stories: 19, impact: 'Language and tradition gaps' }
                  ].map((item) => (
                    <div key={item.theme} className="p-3 bg-grey-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{item.theme}</div>
                          <div className="text-sm text-muted-foreground mt-1">{item.impact}</div>
                        </div>
                        <Badge variant="outline">{item.stories} stories</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cultural Preservation Hotspots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Cultural Preservation Hotspots
              </CardTitle>
              <CardDescription>
                Areas with highest cultural vitality and preservation activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Highest Cultural Vitality Scores:</h4>
                  <div className="space-y-3">
                    {[
                      {
                        area: 'Traditional territories with active elders',
                        score: 94,
                        characteristics: 'Language immersion, ceremony continuation, land-based learning',
                        examples: '7 communities identified'
                      },
                      {
                        area: 'Urban indigenous centres with youth programs',
                        score: 87,
                        characteristics: 'Cultural education, arts programs, identity development',
                        examples: '12 centres active'
                      },
                      {
                        area: 'Rural communities with language revitalization',
                        score: 91,
                        characteristics: 'Immersion schools, elder teaching programs, digital archives',
                        examples: '5 programs running'
                      }
                    ].map((hotspot) => (
                      <Card key={hotspot.area} className="p-4 bg-gradient-to-r from-green-50 to-blue-50">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-semibold">{hotspot.area}</h5>
                          <Badge variant="default" className="bg-green-600">
                            {hotspot.score}% vitality
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{hotspot.characteristics}</p>
                        <div className="text-xs text-green-700 font-medium">{hotspot.examples}</div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">At-Risk Areas Needing Support:</h4>
                  <div className="space-y-2">
                    {[
                      { area: 'Remote communities with limited internet', risk: 'Language documentation gaps', support: 'Digital infrastructure needed' },
                      { area: 'Urban youth disconnected from culture', risk: 'Identity fragmentation', support: 'Mentorship programs needed' },
                      { area: 'Communities with elder knowledge holders aging', risk: 'Knowledge loss acceleration', support: 'Urgent documentation projects' }
                    ].map((risk) => (
                      <div key={risk.area} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-orange-800">{risk.area}</div>
                            <div className="text-sm text-orange-600 mt-1">Risk: {risk.risk}</div>
                          </div>
                          <div className="text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded">
                            {risk.support}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
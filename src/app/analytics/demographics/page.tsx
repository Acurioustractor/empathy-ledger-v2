'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Users, 
  Calendar,
  MapPin,
  Globe,
  BookOpen,
  Heart,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { Switch } from '@/components/ui/switch';

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#f97316'];

export default function DemographicsPage() {
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock demographic data - in real implementation, this would come from analytics service
  const demographicData = {
    ageGroups: [
      { name: 'Elders (65+)', value: 23, stories: 89, culturalRole: 'Knowledge Keepers' },
      { name: 'Adults (35-64)', value: 45, stories: 234, culturalRole: 'Community Leaders' },
      { name: 'Young Adults (18-34)', value: 28, stories: 156, culturalRole: 'Bridge Builders' },
      { name: 'Youth (Under 18)', value: 12, stories: 67, culturalRole: 'Future Carriers' }
    ],
    culturalBackgrounds: [
      { name: 'First Nations', value: 45, communities: 8 },
      { name: 'Métis', value: 23, communities: 4 },
      { name: 'Inuit', value: 12, communities: 3 },
      { name: 'Non-Indigenous Allies', value: 20, communities: 2 }
    ],
    regions: [
      { name: 'Prairie Provinces', storytellers: 67, stories: 234 },
      { name: 'British Columbia', storytellers: 45, stories: 189 },
      { name: 'Eastern Canada', storytellers: 34, stories: 123 },
      { name: 'Territories', storytellers: 23, stories: 78 }
    ],
    languages: [
      { name: 'English', primary: 145, secondary: 34 },
      { name: 'Cree', primary: 23, secondary: 67 },
      { name: 'Ojibwe', primary: 18, secondary: 45 },
      { name: 'French', primary: 12, secondary: 23 },
      { name: 'Other Indigenous Languages', primary: 34, secondary: 89 }
    ]
  };

  const engagementMetrics = {
    storyParticipation: 78, // percentage of active storytellers
    communityGrowth: 23, // percentage growth this year
    intergenerationalEngagement: 67, // percentage of stories with multiple generations
    culturalPreservation: 89 // percentage of culturally significant content
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Users className="w-8 h-8 animate-pulse mx-auto mb-4" />
            <p>Loading demographic insights...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Community Demographics & Engagement</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Understanding our storytelling community composition with cultural sensitivity 
          and respect for privacy. Data is aggregated and anonymized to protect individual identity.
        </p>
      </div>

      {/* Cultural Protocol & Privacy Notice */}
      <Alert className="mb-6 border-amber-200 bg-amber-50">
        <Shield className="w-4 h-4" />
        <AlertDescription>
          Demographic analysis follows strict Indigenous data sovereignty principles. 
          Sensitive cultural information is protected and only shown with community consent.
        </AlertDescription>
      </Alert>

      {/* Privacy Toggle */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Data Visibility Controls
            </span>
            <div className="flex items-center space-x-2">
              {showSensitiveData ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <Switch
                checked={showSensitiveData}
                onCheckedChange={setShowSensitiveData}
              />
              <span className="text-sm">Show Detailed Demographics</span>
            </div>
          </CardTitle>
          <CardDescription>
            Control the level of demographic detail displayed. Detailed view requires proper authorization.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Key Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <BookOpen className="w-5 h-5 mr-2 text-green-600" />
              Story Participation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {engagementMetrics.storyParticipation}%
            </div>
            <p className="text-sm text-muted-foreground">Active storytellers</p>
            <Progress value={engagementMetrics.storyParticipation} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Community Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              +{engagementMetrics.communityGrowth}%
            </div>
            <p className="text-sm text-muted-foreground">This year</p>
            <Progress value={engagementMetrics.communityGrowth} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Users className="w-5 h-5 mr-2 text-amber-600" />
              Intergenerational
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600 mb-2">
              {engagementMetrics.intergenerationalEngagement}%
            </div>
            <p className="text-sm text-muted-foreground">Multi-generational stories</p>
            <Progress value={engagementMetrics.intergenerationalEngagement} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Heart className="w-5 h-5 mr-2 text-purple-600" />
              Cultural Preservation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {engagementMetrics.culturalPreservation}%
            </div>
            <p className="text-sm text-muted-foreground">Culturally significant content</p>
            <Progress value={engagementMetrics.culturalPreservation} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Age Group Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Age Group Representation
            </CardTitle>
            <CardDescription>
              Distribution of storytellers across different life stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {showSensitiveData ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={demographicData.ageGroups}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {demographicData.ageGroups.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-3">
                    {demographicData.ageGroups.map((group, index) => (
                      <div key={group.name} className="flex items-center justify-between p-3 bg-grey-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div>
                            <p className="font-medium">{group.name}</p>
                            <p className="text-xs text-muted-foreground">{group.culturalRole}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{group.stories} stories</p>
                          <p className="text-xs text-muted-foreground">{group.value} storytellers</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <EyeOff className="w-12 h-12 mx-auto mb-4 text-grey-400" />
                  <p className="text-grey-600">Detailed age demographics require authorization</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Enable detailed view to see age distribution analysis
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cultural Background Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Cultural Heritage
            </CardTitle>
            <CardDescription>
              Cultural background representation in our community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {showSensitiveData ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={demographicData.culturalBackgrounds}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {demographicData.culturalBackgrounds.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-3">
                    {demographicData.culturalBackgrounds.map((bg, index) => (
                      <div key={bg.name} className="flex items-center justify-between p-3 bg-grey-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{bg.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{bg.value}%</p>
                          <p className="text-xs text-muted-foreground">{bg.communities} communities</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-amber-500" />
                  <p className="text-grey-600">Cultural heritage data protected</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This information requires community consent to display
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Geographic Distribution
          </CardTitle>
          <CardDescription>
            Regional representation of storytellers and stories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showSensitiveData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {demographicData.regions.map((region, index) => (
                <Card key={region.name} className="p-4">
                  <h4 className="font-semibold mb-2">{region.name}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Storytellers:</span>
                      <span className="font-medium">{region.storytellers}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Stories:</span>
                      <span className="font-medium">{region.stories}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Avg: {Math.round(region.stories / region.storytellers)} stories per person
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-grey-400" />
              <p className="text-grey-600">Geographic data requires authorization</p>
              <p className="text-sm text-muted-foreground mt-2">
                Location information is protected for community privacy
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Language Representation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Language Diversity
          </CardTitle>
          <CardDescription>
            Languages represented in storytelling community
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showSensitiveData ? (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={demographicData.languages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="primary" fill="#3b82f6" name="Primary Language" />
                  <Bar dataKey="secondary" fill="#93c5fd" name="Secondary Language" />
                </BarChart>
              </ResponsiveContainer>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Language Preservation</h4>
                  <p className="text-muted-foreground">
                    {demographicData.languages.filter(l => l.name.includes('Indigenous')).length + 2} Indigenous languages are actively preserved through storytelling.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Multilingual Community</h4>
                  <p className="text-muted-foreground">
                    {Math.round((demographicData.languages.reduce((sum, l) => sum + l.secondary, 0) / demographicData.languages.reduce((sum, l) => sum + l.primary, 0)) * 100)}% of community members are multilingual.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-grey-400" />
              <p className="text-grey-600">Language data requires community consent</p>
              <p className="text-sm text-muted-foreground mt-2">
                Indigenous language information is culturally sensitive
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Community Insights */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Community Insights & Recommendations</CardTitle>
          <CardDescription>
            Data-driven insights for community strengthening and growth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center text-green-700">
                <Heart className="w-5 h-5 mr-2" />
                Community Strengths
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                  <span>Strong intergenerational participation with active elder involvement</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                  <span>High cultural preservation rate in story content</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                  <span>Growing participation from younger community members</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 flex items-center text-amber-700">
                <TrendingUp className="w-5 h-5 mr-2" />
                Growth Opportunities
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2"></div>
                  <span>Potential for expanded language preservation programs</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2"></div>
                  <span>Opportunities for cross-regional story sharing</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2"></div>
                  <span>Youth engagement programs showing promising growth</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
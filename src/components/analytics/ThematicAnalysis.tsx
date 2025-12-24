'use client';

/**
 * Thematic Analysis Component
 * Advanced cultural theme identification and trend analysis
 * with sentiment analysis and elder-approved cultural insights
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Shield, 
  Heart, 
  Brain, 
  Globe,
  Users,
  Sparkles,
  BarChart3,
  PieChart,
  Activity,
  Filter,
  Download,
  Eye,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { CulturalTheme, analyticsService } from '@/lib/services/analytics.service';

interface ThematicAnalysisProps {
  organizationFilter?: string;
  timeRangeFilter?: 'all' | 'year' | 'month';
  onThemeClick?: (theme: CulturalTheme) => void;
}

type ViewMode = 'overview' | 'detailed' | 'trends' | 'sentiment';

const CULTURAL_COLORS = [
  '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6',
  '#f97316', '#06b6d4', '#84cc16', '#ec4899', '#6366f1'
];

export const ThematicAnalysis: React.FC<ThematicAnalysisProps> = ({
  organizationFilter,
  timeRangeFilter = 'all',
  onThemeClick
}) => {
  const [themes, setThemes] = useState<CulturalTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [sortBy, setSortBy] = useState<'frequency' | 'significance' | 'sentiment'>('significance');
  const [filterApproved, setFilterApproved] = useState<'all' | 'approved' | 'pending'>('all');
  const [selectedTheme, setSelectedTheme] = useState<CulturalTheme | null>(null);

  useEffect(() => {
    loadThemes();
  }, [organizationFilter, timeRangeFilter]);

  const loadThemes = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getCulturalThemes();
      setThemes(data);
    } catch (err) {
      setError('Failed to load thematic analysis');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Process and filter themes
  const processedThemes = useMemo(() => {
    let filtered = [...themes];

    // Apply approval filter
    if (filterApproved !== 'all') {
      filtered = filtered.filter(theme => 
        filterApproved === 'approved' ? theme.elderApproved : !theme.elderApproved
      );
    }

    // Sort themes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'frequency':
          return b.frequency - a.frequency;
        case 'significance':
          return b.significance - a.significance;
        case 'sentiment':
          const sentimentOrder = { positive: 3, neutral: 2, negative: 1 };
          return sentimentOrder[b.sentiment] - sentimentOrder[a.sentiment];
        default:
          return b.significance - a.significance;
      }
    });

    return filtered;
  }, [themes, sortBy, filterApproved]);

  // Chart data preparations
  const chartData = useMemo(() => {
    const topThemes = processedThemes.slice(0, 10);
    
    return {
      bar: topThemes.map(theme => ({
        name: theme.name.length > 15 ? `${theme.name.substring(0, 15)}...` : theme.name,
        fullName: theme.name,
        frequency: theme.frequency,
        significance: theme.significance,
        approved: theme.elderApproved
      })),
      pie: topThemes.map((theme, index) => ({
        name: theme.name,
        value: theme.frequency,
        colour: CULTURAL_COLORS[index % CULTURAL_COLORS.length]
      })),
      sentiment: themes.reduce((acc, theme) => {
        const existing = acc.find(item => item.sentiment === theme.sentiment);
        if (existing) {
          existing.count += 1;
          existing.totalSignificance += theme.significance;
        } else {
          acc.push({
            sentiment: theme.sentiment,
            count: 1,
            totalSignificance: theme.significance,
            avgSignificance: theme.significance
          });
        }
        return acc;
      }, [] as Array<{
        sentiment: string;
        count: number;
        totalSignificance: number;
        avgSignificance: number;
      }>).map(item => ({
        ...item,
        avgSignificance: Math.round(item.totalSignificance / item.count)
      }))
    };
  }, [processedThemes, themes]);

  const getSentimentIcon = (sentiment: CulturalTheme['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'neutral':
        return <Minus className="w-4 h-4 text-stone-500" />;
    }
  };

  const getSentimentColor = (sentiment: CulturalTheme['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'neutral':
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  const exportThemes = () => {
    const csvContent = processedThemes.map(theme => ({
      name: theme.name,
      frequency: theme.frequency,
      significance: theme.significance,
      sentiment: theme.sentiment,
      elderApproved: theme.elderApproved,
      storiesCount: theme.stories.length,
      quotesCount: theme.relatedQuotes.length
    }));

    const csv = [
      Object.keys(csvContent[0]).join(','),
      ...csvContent.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cultural-themes-analysis.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Brain className="w-8 h-8 animate-pulse mx-auto mb-4" />
            <p>Analyzing cultural themes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cultural Protocol Notice */}
      <Alert className="border-amber-200 bg-amber-50">
        <Shield className="w-4 h-4" />
        <AlertDescription>
          Cultural themes are analysed with respect for Indigenous knowledge systems. 
          Sensitive themes require elder approval before being displayed publicly.
        </AlertDescription>
      </Alert>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Thematic Analysis Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">View:</span>
              <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="trends">Trends</SelectItem>
                  <SelectItem value="sentiment">Sentiment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Sort by:</span>
              <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="significance">Significance</SelectItem>
                  <SelectItem value="frequency">Frequency</SelectItem>
                  <SelectItem value="sentiment">Sentiment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Filter:</span>
              <Select value={filterApproved} onValueChange={(value: typeof filterApproved) => setFilterApproved(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Themes</SelectItem>
                  <SelectItem value="approved">Approved Only</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={exportThemes} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overview Mode */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Theme Frequency Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Theme Frequency
              </CardTitle>
              <CardDescription>
                Most frequently discussed cultural themes across all stories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.bar}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name, props) => [
                      value,
                      name,
                      `Full name: ${props.payload.fullName}`,
                      `Approved: ${props.payload.approved ? 'Yes' : 'No'}`
                    ]}
                  />
                  <Bar 
                    dataKey="frequency" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Theme Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Theme Distribution
              </CardTitle>
              <CardDescription>
                Proportional representation of cultural themes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={chartData.pie}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.pie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.colour} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sentiment Analysis Mode */}
      {viewMode === 'sentiment' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              Sentiment Analysis
            </CardTitle>
            <CardDescription>
              Emotional tone and cultural sentiment across themes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {chartData.sentiment.map(item => (
                <Card key={item.sentiment} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getSentimentIcon(item.sentiment as CulturalTheme['sentiment'])}
                      <span className="font-medium capitalize">{item.sentiment}</span>
                    </div>
                    <Badge variant="outline">{item.count} themes</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{item.avgSignificance}%</div>
                    <div className="text-sm text-muted-foreground">Average Significance</div>
                    <Progress value={item.avgSignificance} className="h-2" />
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Theme Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Detailed Theme Analysis
            <Badge variant="outline" className="ml-2">
              {processedThemes.length} themes
            </Badge>
          </CardTitle>
          <CardDescription>
            Comprehensive analysis of cultural themes with significance scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {processedThemes.map((theme, index) => (
              <Card 
                key={theme.name} 
                className={`p-4 cursor-pointer hover:shadow-md transition-shadow
                  ${theme.elderApproved ? 'border-green-200 bg-green-50/30' : ''}
                  ${selectedTheme?.name === theme.name ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => {
                  setSelectedTheme(selectedTheme?.name === theme.name ? null : theme);
                  onThemeClick?.(theme);
                }}
              >
                <div className="space-y-3">
                  {/* Theme Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-semibold">{theme.name}</h4>
                      {getSentimentIcon(theme.sentiment)}
                      {theme.elderApproved && (
                        <Shield className="w-4 h-4 text-green-500" title="Elder Approved" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getSentimentColor(theme.sentiment)}>
                        {theme.sentiment}
                      </Badge>
                      <Badge variant="outline">
                        Rank #{index + 1}
                      </Badge>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-sage-600">{theme.frequency}</div>
                      <div className="text-sm text-muted-foreground">Frequency</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600">{theme.significance}%</div>
                      <div className="text-sm text-muted-foreground">Significance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{theme.stories.length}</div>
                      <div className="text-sm text-muted-foreground">Stories</div>
                    </div>
                  </div>

                  {/* Progress Bars */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm w-20">Significance:</span>
                      <Progress value={theme.significance} className="flex-1" />
                      <span className="text-sm w-10">{theme.significance}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm w-20">Frequency:</span>
                      <Progress 
                        value={Math.min(100, (theme.frequency / Math.max(...themes.map(t => t.frequency))) * 100)} 
                        className="flex-1" 
                      />
                      <span className="text-sm w-10">{theme.frequency}</span>
                    </div>
                  </div>

                  {/* Sample Quotes */}
                  {theme.relatedQuotes.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2 flex items-center">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Sample Quotes ({theme.relatedQuotes.length} total)
                      </h5>
                      <div className="space-y-2">
                        {theme.relatedQuotes.slice(0, 2).map((quote, i) => (
                          <blockquote key={i} className="text-sm italic text-stone-600 border-l-2 border-stone-300 pl-3">
                            "{quote.length > 100 ? `${quote.substring(0, 100)}...` : quote}"
                          </blockquote>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expanded Details */}
                  {selectedTheme?.name === theme.name && (
                    <div className="pt-4 border-t space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Related Stories:</span>
                          <div className="text-muted-foreground">
                            {theme.stories.length} stories reference this theme
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Cultural Impact:</span>
                          <div className="text-muted-foreground">
                            {theme.significance >= 80 ? 'Very High' :
                             theme.significance >= 60 ? 'High' :
                             theme.significance >= 40 ? 'Medium' : 'Emerging'}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-sm">All Quotes ({theme.relatedQuotes.length}):</span>
                        <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                          {theme.relatedQuotes.map((quote, i) => (
                            <div key={i} className="text-sm p-2 bg-stone-50 rounded border-l-2 border-amber-300">
                              "{quote}"
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {processedThemes.length === 0 && (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 mx-auto mb-4 text-stone-400" />
              <h3 className="text-lg font-medium mb-2">No Themes Found</h3>
              <p className="text-muted-foreground">
                No cultural themes match the current filter criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ThematicAnalysis;
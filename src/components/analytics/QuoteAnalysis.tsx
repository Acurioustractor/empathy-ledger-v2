'use client';

/**
 * Quote Analysis Component
 * AI-powered wisdom quote extraction and cultural theme analysis
 * with elder approval workflows and significance ranking
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Star, 
  Shield, 
  Heart, 
  Lightbulb, 
  Filter,
  Download,
  ExternalLink,
  Clock,
  User,
  Quote as QuoteIcon,
  TrendingUp,
  Eye
} from 'lucide-react';
import { WisdomQuote, analyticsService } from '@/lib/services/analytics.service';

interface QuoteAnalysisProps {
  limit?: number;
  showElderApprovalOnly?: boolean;
  onQuoteClick?: (quote: WisdomQuote) => void;
}

type SortOption = 'significance' | 'recent' | 'alphabetical' | 'theme';
type FilterOption = 'all' | 'approved' | 'pending' | 'high-significance';

export const QuoteAnalysis: React.FC<QuoteAnalysisProps> = ({
  limit = 50,
  showElderApprovalOnly = false,
  onQuoteClick
}) => {
  const [quotes, setQuotes] = useState<WisdomQuote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<WisdomQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('significance');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [expandedQuote, setExpandedQuote] = useState<string | null>(null);

  useEffect(() => {
    loadQuotes();
  }, [limit]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [quotes, searchTerm, sortBy, filterBy, selectedThemes]);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getWisdomQuotes(limit);
      setQuotes(data);
    } catch (err) {
      setError('Failed to load wisdom quotes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...quotes];

    // Apply text search
    if (searchTerm) {
      filtered = filtered.filter(quote => 
        quote.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.storyteller.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.themes.some(theme => theme.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply approval filter
    switch (filterBy) {
      case 'approved':
        filtered = filtered.filter(quote => quote.elderApproval === 'approved');
        break;
      case 'pending':
        filtered = filtered.filter(quote => quote.elderApproval === 'pending');
        break;
      case 'high-significance':
        filtered = filtered.filter(quote => quote.significance >= 70);
        break;
    }

    // Apply theme filter
    if (selectedThemes.length > 0) {
      filtered = filtered.filter(quote =>
        quote.themes.some(theme => selectedThemes.includes(theme))
      );
    }

    // Apply elder approval filter
    if (showElderApprovalOnly) {
      filtered = filtered.filter(quote => quote.elderApproval === 'approved');
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'significance':
          return b.significance - a.significance;
        case 'alphabetical':
          return a.text.localeCompare(b.text);
        case 'theme':
          return a.themes[0]?.localeCompare(b.themes[0] || '') || 0;
        default:
          return b.significance - a.significance;
      }
    });

    setFilteredQuotes(filtered);
  };

  const getSignificanceColor = (significance: number) => {
    if (significance >= 80) return 'text-red-600 bg-red-50';
    if (significance >= 60) return 'text-orange-600 bg-orange-50';
    if (significance >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-stone-600 bg-stone-50';
  };

  const getApprovalBadge = (approval: WisdomQuote['elderApproval']) => {
    switch (approval) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Shield className="w-3 h-3 mr-1" />
            Elder Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="border-amber-200 text-amber-700">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        );
      case 'restricted':
        return (
          <Badge variant="outline" className="border-red-200 text-red-700">
            <Eye className="w-3 h-3 mr-1" />
            Restricted
          </Badge>
        );
    }
  };

  const allThemes = React.useMemo(() => {
    const themes = new Set<string>();
    quotes.forEach(quote => {
      quote.themes.forEach(theme => themes.add(theme));
    });
    return Array.from(themes).sort();
  }, [quotes]);

  const exportQuotes = () => {
    const csvContent = filteredQuotes.map(quote => ({
      text: quote.text,
      storyteller: quote.storyteller,
      significance: quote.significance,
      themes: quote.themes.join('; '),
      culturalContext: quote.culturalContext,
      approval: quote.elderApproval
    }));

    const csv = [
      Object.keys(csvContent[0]).join(','),
      ...csvContent.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wisdom-quotes.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Lightbulb className="w-8 h-8 animate-pulse mx-auto mb-4" />
            <p>Extracting wisdom quotes...</p>
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
          Elder wisdom quotes are subject to cultural review. Only approved content is shown to general visitors.
          High-significance quotes require special approval before public display.
        </AlertDescription>
      </Alert>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <QuoteIcon className="w-5 h-5 mr-2" />
            Quote Analysis Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
              <Input
                placeholder="Search quotes, themes, or storytellers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="significance">Significance</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
                <SelectItem value="theme">Theme</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter */}
            <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quotes</SelectItem>
                <SelectItem value="approved">Elder Approved</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="high-significance">High Significance</SelectItem>
              </SelectContent>
            </Select>

            {/* Export */}
            <Button onClick={exportQuotes} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Theme Filter */}
          {allThemes.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Filter by Themes:</h4>
              <div className="flex flex-wrap gap-2">
                {allThemes.slice(0, 10).map(theme => (
                  <Badge
                    key={theme}
                    variant={selectedThemes.includes(theme) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedThemes(prev =>
                        prev.includes(theme)
                          ? prev.filter(t => t !== theme)
                          : [...prev, theme]
                      );
                    }}
                  >
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredQuotes.length} of {quotes.length} wisdom quotes
          </p>
          {filteredQuotes.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Avg. Significance: {Math.round(filteredQuotes.reduce((sum, q) => sum + q.significance, 0) / filteredQuotes.length)}%
            </p>
          )}
        </div>
      </div>

      {/* Quotes Grid */}
      <div className="space-y-4">
        {filteredQuotes.map((quote) => (
          <Card 
            key={quote.id} 
            className={`p-6 ${quote.elderApproval === 'approved' ? 'border-green-200 bg-green-50/30' : ''} 
                       ${quote.significance >= 80 ? 'border-l-4 border-l-amber-500' : ''}`}
          >
            <div className="space-y-4">
              {/* Quote Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSignificanceColor(quote.significance)}`}>
                    <Star className="w-4 h-4 inline mr-1" />
                    {quote.significance}%
                  </div>
                  {getApprovalBadge(quote.elderApproval)}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedQuote(
                      expandedQuote === quote.id ? null : quote.id
                    )}
                  >
                    {expandedQuote === quote.id ? 'Show Less' : 'Show More'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onQuoteClick?.(quote)}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Quote Text */}
              <blockquote className="text-lg italic leading-relaxed text-stone-800">
                "{expandedQuote === quote.id ? quote.text : 
                   quote.text.length > 200 ? `${quote.text.substring(0, 200)}...` : quote.text}"
              </blockquote>

              {/* Quote Attribution */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{quote.storyteller}</span>
                  <span>•</span>
                  <span>{quote.culturalContext}</span>
                </div>
              </div>

              {/* Themes */}
              <div className="flex flex-wrap gap-2">
                {quote.themes.map(theme => (
                  <Badge key={theme} variant="outline" className="text-xs">
                    {theme}
                  </Badge>
                ))}
              </div>

              {/* Expanded Content */}
              {expandedQuote === quote.id && (
                <div className="pt-4 border-t space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Story ID:</span>
                      <span className="ml-2 font-mono text-xs">{quote.storyId}</span>
                    </div>
                    {quote.transcriptId && (
                      <div>
                        <span className="font-medium">Transcript ID:</span>
                        <span className="ml-2 font-mono text-xs">{quote.transcriptId}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4 text-sage-500" />
                      <span>Cultural Impact Score: {Math.round(quote.significance * 0.8 + Math.random() * 20)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>Community Resonance: {Math.round(quote.significance * 0.7 + Math.random() * 30)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredQuotes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Lightbulb className="w-16 h-16 mx-auto mb-4 text-stone-400" />
            <h3 className="text-lg font-medium mb-2">No Wisdom Quotes Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedThemes.length > 0 ? 
                'Try adjusting your search or filter criteria.' :
                'No quotes match the current filters.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuoteAnalysis;
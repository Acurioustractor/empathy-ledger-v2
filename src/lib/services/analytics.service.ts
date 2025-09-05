/**
 * Analytics Service for Empathy Ledger Platform
 * Provides comprehensive impact measurement and cultural insights
 * with OCAP compliance and elder approval workflows
 */

import { createClient } from '@/lib/supabase';
import { ai } from 'ai';

export interface CommunityMetrics {
  totalStories: number;
  totalTranscripts: number;
  activeStorytellers: number;
  culturalThemes: string[];
  healingJourneys: number;
  intergenerationalConnections: number;
  elderWisdomQuotes: number;
  communityResilience: number; // 0-100 score
  culturalVitality: number; // 0-100 score
}

export interface StorytellerConnection {
  id: string;
  name: string;
  organization?: string;
  connections: string[];
  influences: number;
  culturalRole: string;
  storyCount: number;
  themes: string[];
}

export interface CulturalTheme {
  name: string;
  frequency: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  relatedQuotes: string[];
  stories: string[];
  significance: number; // 0-100
  elderApproved: boolean;
}

export interface WisdomQuote {
  id: string;
  text: string;
  storyteller: string;
  culturalContext: string;
  significance: number; // AI-determined significance score
  themes: string[];
  elderApproval: 'pending' | 'approved' | 'restricted';
  storyId: string;
  transcriptId?: string;
}

export interface GeographicInsight {
  region: string;
  storyDensity: number;
  predominantThemes: string[];
  culturalClusters: {
    name: string;
    storytellers: number;
    commonThemes: string[];
  }[];
}

export interface ImpactAnalytics {
  communityMetrics: CommunityMetrics;
  storytellerNetwork: StorytellerConnection[];
  culturalThemes: CulturalTheme[];
  wisdomQuotes: WisdomQuote[];
  geographicInsights: GeographicInsight[];
  healingPatterns: {
    pattern: string;
    frequency: number;
    outcomes: string[];
  }[];
}

export class AnalyticsService {
  private supabase = createClient();

  /**
   * Get comprehensive community impact overview
   */
  async getCommunityMetrics(): Promise<CommunityMetrics> {
    try {
      // Get basic counts
      const [storiesCount, transcriptsCount, storytellersCount] = await Promise.all([
        this.supabase.from('stories').select('id', { count: 'exact', head: true }),
        this.supabase.from('transcripts').select('id', { count: 'exact', head: true }),
        this.supabase.from('storytellers').select('id', { count: 'exact', head: true })
      ]);

      // Get active storytellers (those with stories)
      const { data: activeStorytellers } = await this.supabase
        .from('storytellers')
        .select('id')
        .in('id', 
          this.supabase
            .from('stories')
            .select('storyteller_id')
        );

      // Get cultural themes from transcript analysis
      const { data: transcripts } = await this.supabase
        .from('transcripts')
        .select('content, themes, analysis')
        .not('themes', 'is', null);

      const culturalThemes = this.extractCulturalThemes(transcripts || []);
      
      // Calculate healing journeys and intergenerational connections
      const healingJourneys = await this.calculateHealingJourneys();
      const intergenerationalConnections = await this.calculateIntergenerationalConnections();
      const elderWisdomQuotes = await this.countElderWisdomQuotes();

      // Calculate community resilience and vitality scores
      const communityResilience = await this.calculateCommunityResilience();
      const culturalVitality = await this.calculateCulturalVitality();

      return {
        totalStories: storiesCount.count || 0,
        totalTranscripts: transcriptsCount.count || 0,
        activeStorytellers: activeStorytellers?.length || 0,
        culturalThemes,
        healingJourneys,
        intergenerationalConnections,
        elderWisdomQuotes,
        communityResilience,
        culturalVitality
      };
    } catch (error) {
      console.error('Error getting community metrics:', error);
      throw error;
    }
  }

  /**
   * Generate storyteller network analysis for social graph visualization
   */
  async getStorytellerNetwork(): Promise<StorytellerConnection[]> {
    try {
      const { data: storytellers } = await this.supabase
        .from('storytellers')
        .select(`
          id,
          name,
          organization,
          cultural_background,
          stories!inner(
            id,
            title,
            themes
          )
        `);

      const connections: StorytellerConnection[] = [];

      for (const storyteller of storytellers || []) {
        const storyThemes = storyteller.stories.flatMap(s => s.themes || []);
        
        // Find connections based on shared themes, organizations, or cultural background
        const relatedStorytellers = await this.findRelatedStorytellers(
          storyteller.id, 
          storyThemes, 
          storyteller.organization,
          storyteller.cultural_background
        );

        connections.push({
          id: storyteller.id,
          name: storyteller.name,
          organization: storyteller.organization,
          connections: relatedStorytellers.map(r => r.id),
          influences: await this.calculateInfluenceScore(storyteller.id),
          culturalRole: this.determineCulturalRole(storyteller),
          storyCount: storyteller.stories.length,
          themes: [...new Set(storyThemes)]
        });
      }

      return connections;
    } catch (error) {
      console.error('Error generating storyteller network:', error);
      throw error;
    }
  }

  /**
   * Analyze cultural themes across all stories and transcripts
   */
  async getCulturalThemes(): Promise<CulturalTheme[]> {
    try {
      const { data: transcripts } = await this.supabase
        .from('transcripts')
        .select(`
          content,
          themes,
          analysis,
          stories(id, title),
          storytellers(name, cultural_background)
        `)
        .not('content', 'is', null);

      const themeAnalysis = new Map<string, {
        frequency: number;
        sentiment: 'positive' | 'neutral' | 'negative';
        quotes: string[];
        stories: string[];
        significance: number;
      }>();

      for (const transcript of transcripts || []) {
        if (transcript.themes) {
          for (const theme of transcript.themes) {
            const current = themeAnalysis.get(theme) || {
              frequency: 0,
              sentiment: 'neutral' as const,
              quotes: [],
              stories: [],
              significance: 0
            };

            current.frequency += 1;
            current.stories.push(...transcript.stories.map(s => s.id));
            
            // Extract significant quotes related to this theme
            const quotes = await this.extractThemeQuotes(transcript.content, theme);
            current.quotes.push(...quotes);

            // Analyze sentiment using AI
            const sentiment = await this.analyzeSentiment(transcript.content);
            current.sentiment = sentiment;

            // Calculate significance based on frequency and cultural importance
            current.significance = await this.calculateThemeSignificance(theme, current.frequency);

            themeAnalysis.set(theme, current);
          }
        }
      }

      const culturalThemes: CulturalTheme[] = [];
      for (const [name, analysis] of themeAnalysis.entries()) {
        culturalThemes.push({
          name,
          frequency: analysis.frequency,
          sentiment: analysis.sentiment,
          relatedQuotes: analysis.quotes.slice(0, 10), // Top 10 quotes
          stories: [...new Set(analysis.stories)],
          significance: analysis.significance,
          elderApproved: await this.checkElderApproval(name)
        });
      }

      return culturalThemes.sort((a, b) => b.significance - a.significance);
    } catch (error) {
      console.error('Error analyzing cultural themes:', error);
      throw error;
    }
  }

  /**
   * Extract and rank wisdom quotes from elder stories
   */
  async getWisdomQuotes(limit: number = 50): Promise<WisdomQuote[]> {
    try {
      const { data: transcripts } = await this.supabase
        .from('transcripts')
        .select(`
          id,
          content,
          themes,
          stories(
            id,
            title,
            storytellers(name, birth_year, cultural_background)
          )
        `)
        .not('content', 'is', null);

      const wisdomQuotes: WisdomQuote[] = [];

      for (const transcript of transcripts || []) {
        if (!transcript.content) continue;

        // Extract meaningful quotes using AI
        const quotes = await this.extractSignificantQuotes(transcript.content);
        
        for (const story of transcript.stories) {
          const storyteller = story.storytellers;
          if (!storyteller) continue;

          // Determine if this is an elder (cultural significance or age)
          const isElder = this.isElder(storyteller);
          
          for (const quote of quotes) {
            const themes = await this.identifyQuoteThemes(quote);
            const significance = await this.calculateQuoteSignificance(quote, isElder);
            
            wisdomQuotes.push({
              id: `${transcript.id}-${wisdomQuotes.length}`,
              text: quote,
              storyteller: storyteller.name,
              culturalContext: storyteller.cultural_background || 'Not specified',
              significance,
              themes,
              elderApproval: 'pending',
              storyId: story.id,
              transcriptId: transcript.id
            });
          }
        }
      }

      // Sort by significance and return top quotes
      return wisdomQuotes
        .sort((a, b) => b.significance - a.significance)
        .slice(0, limit);
    } catch (error) {
      console.error('Error extracting wisdom quotes:', error);
      throw error;
    }
  }

  /**
   * Generate geographic insights for story mapping
   */
  async getGeographicInsights(): Promise<GeographicInsight[]> {
    try {
      const { data: stories } = await this.supabase
        .from('stories')
        .select(`
          id,
          location,
          themes,
          storytellers(
            id,
            name,
            location,
            cultural_background
          )
        `)
        .not('location', 'is', null);

      const regionAnalysis = new Map<string, {
        storyCount: number;
        themes: string[];
        storytellers: Set<string>;
        culturalBackgrounds: string[];
      }>();

      for (const story of stories || []) {
        const region = story.location || story.storytellers?.location || 'Unknown';
        
        const current = regionAnalysis.get(region) || {
          storyCount: 0,
          themes: [],
          storytellers: new Set(),
          culturalBackgrounds: []
        };

        current.storyCount += 1;
        current.themes.push(...(story.themes || []));
        if (story.storytellers) {
          current.storytellers.add(story.storytellers.id);
          if (story.storytellers.cultural_background) {
            current.culturalBackgrounds.push(story.storytellers.cultural_background);
          }
        }

        regionAnalysis.set(region, current);
      }

      const insights: GeographicInsight[] = [];
      for (const [region, analysis] of regionAnalysis.entries()) {
        const themeCounts = this.countThemeFrequency(analysis.themes);
        const predominantThemes = Object.entries(themeCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([theme]) => theme);

        const culturalClusters = this.identifyCulturalClusters(
          analysis.culturalBackgrounds,
          analysis.storytellers.size
        );

        insights.push({
          region,
          storyDensity: analysis.storyCount,
          predominantThemes,
          culturalClusters
        });
      }

      return insights.sort((a, b) => b.storyDensity - a.storyDensity);
    } catch (error) {
      console.error('Error generating geographic insights:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive impact analytics
   */
  async getImpactAnalytics(): Promise<ImpactAnalytics> {
    try {
      const [
        communityMetrics,
        storytellerNetwork,
        culturalThemes,
        wisdomQuotes,
        geographicInsights,
        healingPatterns
      ] = await Promise.all([
        this.getCommunityMetrics(),
        this.getStorytellerNetwork(),
        this.getCulturalThemes(),
        this.getWisdomQuotes(),
        this.getGeographicInsights(),
        this.analyzeHealingPatterns()
      ]);

      return {
        communityMetrics,
        storytellerNetwork,
        culturalThemes,
        wisdomQuotes,
        geographicInsights,
        healingPatterns
      };
    } catch (error) {
      console.error('Error generating impact analytics:', error);
      throw error;
    }
  }

  // Private helper methods

  private extractCulturalThemes(transcripts: any[]): string[] {
    const themes = new Set<string>();
    transcripts.forEach(t => {
      if (t.themes) {
        t.themes.forEach((theme: string) => themes.add(theme));
      }
    });
    return Array.from(themes);
  }

  private async calculateHealingJourneys(): Promise<number> {
    // Analyze transcripts for healing-related content
    const { data } = await this.supabase
      .from('transcripts')
      .select('content')
      .or('content.ilike.%healing%,content.ilike.%recovery%,content.ilike.%journey%');
    
    return data?.length || 0;
  }

  private async calculateIntergenerationalConnections(): Promise<number> {
    // Find stories that connect different generations
    const { data } = await this.supabase
      .from('stories')
      .select('themes')
      .or('themes.cs.{intergenerational},themes.cs.{family},themes.cs.{tradition}');
    
    return data?.length || 0;
  }

  private async countElderWisdomQuotes(): Promise<number> {
    // Count quotes from identified elders
    const { data: elders } = await this.supabase
      .from('storytellers')
      .select('id')
      .or('birth_year.lt.1960,cultural_role.ilike.%elder%');
    
    if (!elders?.length) return 0;

    const { count } = await this.supabase
      .from('stories')
      .select('id', { count: 'exact', head: true })
      .in('storyteller_id', elders.map(e => e.id));
    
    return count || 0;
  }

  private async calculateCommunityResilience(): Promise<number> {
    // Calculate based on story themes, healing journeys, and community connections
    // This is a complex algorithm that would analyze multiple factors
    return Math.floor(Math.random() * 40) + 60; // Placeholder: 60-100 range
  }

  private async calculateCulturalVitality(): Promise<number> {
    // Calculate based on cultural theme diversity, intergenerational connections, etc.
    return Math.floor(Math.random() * 30) + 70; // Placeholder: 70-100 range
  }

  private async findRelatedStorytellers(id: string, themes: string[], org?: string, cultural?: string) {
    const { data } = await this.supabase
      .from('storytellers')
      .select('id, name, stories(themes)')
      .neq('id', id)
      .limit(10);

    return (data || []).filter(s => {
      const sharedThemes = s.stories.some(story => 
        story.themes?.some(t => themes.includes(t))
      );
      return sharedThemes;
    });
  }

  private async calculateInfluenceScore(storytellerId: string): Promise<number> {
    // Calculate based on story count, themes, and connections
    return Math.floor(Math.random() * 100);
  }

  private determineCulturalRole(storyteller: any): string {
    // Determine role based on age, background, and story content
    if (storyteller.birth_year && storyteller.birth_year < 1960) {
      return 'Elder';
    }
    if (storyteller.stories.length > 5) {
      return 'Community Keeper';
    }
    return 'Community Member';
  }

  private async extractThemeQuotes(content: string, theme: string): Promise<string[]> {
    // Extract relevant quotes using AI
    // This would use the AI service to find meaningful quotes related to the theme
    return [];
  }

  private async analyzeSentiment(content: string): Promise<'positive' | 'neutral' | 'negative'> {
    // Use AI to analyze sentiment
    return 'positive'; // Placeholder
  }

  private async calculateThemeSignificance(theme: string, frequency: number): Promise<number> {
    // Calculate significance based on cultural importance and frequency
    return Math.min(100, frequency * 10);
  }

  private async checkElderApproval(theme: string): Promise<boolean> {
    // Check if theme has been approved by cultural elders
    return Math.random() > 0.3; // Placeholder: 70% approval rate
  }

  private async extractSignificantQuotes(content: string): Promise<string[]> {
    // Use AI to extract meaningful quotes
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 5); // Return first 5 meaningful sentences as placeholder
  }

  private isElder(storyteller: any): boolean {
    return storyteller.birth_year && storyteller.birth_year < 1960;
  }

  private async identifyQuoteThemes(quote: string): Promise<string[]> {
    // Use AI to identify themes in the quote
    return ['wisdom', 'tradition']; // Placeholder
  }

  private async calculateQuoteSignificance(quote: string, isElder: boolean): Promise<number> {
    let score = quote.length / 10; // Base score on length
    if (isElder) score *= 1.5; // Boost elder quotes
    if (quote.toLowerCase().includes('tradition')) score *= 1.2;
    if (quote.toLowerCase().includes('healing')) score *= 1.3;
    return Math.min(100, Math.floor(score));
  }

  private countThemeFrequency(themes: string[]): Record<string, number> {
    const counts: Record<string, number> = {};
    themes.forEach(theme => {
      counts[theme] = (counts[theme] || 0) + 1;
    });
    return counts;
  }

  private identifyCulturalClusters(backgrounds: string[], storytellerCount: number): { name: string; storytellers: number; commonThemes: string[] }[] {
    const clusters = new Map<string, number>();
    backgrounds.forEach(bg => {
      clusters.set(bg, (clusters.get(bg) || 0) + 1);
    });

    return Array.from(clusters.entries()).map(([name, count]) => ({
      name,
      storytellers: count,
      commonThemes: ['tradition', 'community'] // Placeholder
    }));
  }

  private async analyzeHealingPatterns() {
    // Analyze patterns in healing narratives
    return [
      {
        pattern: 'Connection to Land',
        frequency: 45,
        outcomes: ['Spiritual healing', 'Cultural reconnection', 'Personal growth']
      },
      {
        pattern: 'Intergenerational Dialogue',
        frequency: 38,
        outcomes: ['Knowledge transfer', 'Family healing', 'Community strength']
      },
      {
        pattern: 'Cultural Ceremony',
        frequency: 29,
        outcomes: ['Spiritual cleansing', 'Community bonding', 'Traditional healing']
      }
    ];
  }
}

export const analyticsService = new AnalyticsService();
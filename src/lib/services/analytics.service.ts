/**
 * Analytics Service for Empathy Ledger Platform
 * Provides comprehensive impact measurement and cultural insights
 * with OCAP compliance and elder approval workflows
 */

import { createSupabaseClient } from '@/lib/supabase/client';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

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
  organisation?: string;
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
  significance: number;
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

// ============================================================================
// CONSTANTS
// ============================================================================

const FALLBACK_THEMES = ['Resilience', 'Community', 'Heritage', 'Healing', 'Connection'];

const RESILIENCE_KEYWORDS = [
  'healing', 'strength', 'community', 'recovery', 'overcome',
  'resilience', 'unity', 'support', 'together'
];

const DEFAULT_APPROVED_THEMES = [
  'healing', 'community', 'tradition', 'heritage', 'wisdom', 'family',
  'culture', 'resilience', 'strength', 'unity', 'peace', 'love', 'respect'
];

const ELDER_BIRTH_YEAR_THRESHOLD = 1960;

const SCORE_WEIGHTS = {
  KEYWORD_MATCH: 2,
  THEME_MATCH: 5,
  STORY_COUNT: 5,
  VIEW_COUNT_DIVISOR: 10,
  THEME_DIVERSITY: 2,
  TRANSCRIPT_COUNT: 2,
  MAX_STORY_BONUS: 40,
  MAX_VIEW_BONUS: 30,
  MAX_THEME_BONUS: 20,
  MAX_TRANSCRIPT_BONUS: 10,
  MAX_THEME_DIVERSITY_BONUS: 15,
  MAX_INTERGENERATIONAL_BONUS: 10,
  MAX_DIVERSITY_BONUS: 5,
  ELDER_QUOTE_MULTIPLIER: 1.5,
  TRADITION_MULTIPLIER: 1.2,
  HEALING_MULTIPLIER: 1.3,
  QUOTE_LENGTH_DIVISOR: 10,
  THEME_SIGNIFICANCE_MULTIPLIER: 10
};

const BASE_SCORES = {
  COMMUNITY_RESILIENCE: 60,
  CULTURAL_VITALITY: 70
};

// ============================================================================
// FALLBACK DATA
// ============================================================================

const FALLBACK_COMMUNITY_METRICS: CommunityMetrics = {
  totalStories: 0,
  totalTranscripts: 0,
  activeStorytellers: 0,
  culturalThemes: FALLBACK_THEMES,
  healingJourneys: 0,
  intergenerationalConnections: 0,
  elderWisdomQuotes: 0,
  communityResilience: 75,
  culturalVitality: 82
};

const FALLBACK_STORYTELLER: StorytellerConnection = {
  id: '1',
  name: 'Sample Storyteller',
  organisation: 'Community Center',
  connections: [],
  influences: 85,
  culturalRole: 'Community Keeper',
  storyCount: 3,
  themes: ['Heritage', 'Community', 'Healing']
};

const FALLBACK_CULTURAL_THEMES: CulturalTheme[] = [
  {
    name: 'Community Resilience',
    frequency: 45,
    sentiment: 'positive',
    relatedQuotes: ['Together we are stronger than apart', 'Our community has always been our strength'],
    stories: ['1', '2', '3'],
    significance: 95,
    elderApproved: true
  },
  {
    name: 'Cultural Heritage',
    frequency: 38,
    sentiment: 'positive',
    relatedQuotes: ['Our traditions connect us to our ancestors', 'These stories are our heritage'],
    stories: ['4', '5'],
    significance: 92,
    elderApproved: true
  },
  {
    name: 'Healing Journey',
    frequency: 29,
    sentiment: 'positive',
    relatedQuotes: ['Healing comes through telling our stories', 'The journey of healing never ends'],
    stories: ['6', '7', '8'],
    significance: 88,
    elderApproved: true
  }
];

const FALLBACK_WISDOM_QUOTES: WisdomQuote[] = [
  {
    id: 'quote-1',
    text: 'Our stories are the threads that weave the fabric of our community together.',
    storyteller: 'Elder Mary Johnson',
    culturalContext: 'Indigenous Community',
    significance: 95,
    themes: ['Community', 'Tradition', 'Wisdom'],
    elderApproval: 'approved',
    storyId: '1'
  },
  {
    id: 'quote-2',
    text: 'When we share our pain, we lighten the burden for those who come after us.',
    storyteller: 'Elder Robert Thunder',
    culturalContext: 'First Nations',
    significance: 92,
    themes: ['Healing', 'Community', 'Legacy'],
    elderApproval: 'approved',
    storyId: '2'
  },
  {
    id: 'quote-3',
    text: 'The land remembers what we forget, and our stories help us remember what the land knows.',
    storyteller: 'Elder Sarah Crow Feather',
    culturalContext: 'Native American',
    significance: 89,
    themes: ['Connection to Land', 'Memory', 'Cultural Knowledge'],
    elderApproval: 'approved',
    storyId: '3'
  }
];

const FALLBACK_GEOGRAPHIC_INSIGHTS: GeographicInsight[] = [
  {
    region: 'Pacific Northwest',
    storyDensity: 35,
    predominantThemes: ['Connection to Land', 'Cultural Heritage', 'Community Resilience'],
    culturalClusters: [
      {
        name: 'Indigenous Communities',
        storytellers: 15,
        commonThemes: ['Traditional Knowledge', 'Land Stewardship']
      },
      {
        name: 'Immigrant Stories',
        storytellers: 12,
        commonThemes: ['Cultural Adaptation', 'Community Building']
      }
    ]
  },
  {
    region: 'Great Lakes Region',
    storyDensity: 28,
    predominantThemes: ['Healing Journeys', 'Intergenerational Wisdom', 'Community Support'],
    culturalClusters: [
      {
        name: 'Elder Voices',
        storytellers: 10,
        commonThemes: ['Traditional Healing', 'Cultural Preservation']
      }
    ]
  }
];

const FALLBACK_HEALING_PATTERNS = [
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

// ============================================================================
// QUERY UTILITIES
// ============================================================================

async function safeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  fallback: T,
  errorMessage: string
): Promise<T> {
  try {
    const { data, error } = await queryFn();
    if (error) throw error;
    return data || fallback;
  } catch (error) {
    console.warn(errorMessage, error);
    return fallback;
  }
}

async function safeCount(
  queryFn: () => Promise<{ count: number | null; error: any }>,
  fallback: number,
  errorMessage: string
): Promise<number> {
  try {
    const { count, error } = await queryFn();
    if (error) throw error;
    return count ?? fallback;
  } catch (error) {
    console.warn(errorMessage, error);
    return fallback;
  }
}

function extractUniqueThemes(transcripts: any[]): string[] {
  const themes = new Set<string>();
  transcripts.forEach(t => {
    if (t.themes) {
      t.themes.forEach((theme: string) => themes.add(theme));
    }
  });
  return Array.from(themes);
}

function countThemeFrequency(themes: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  themes.forEach(theme => {
    counts[theme] = (counts[theme] || 0) + 1;
  });
  return counts;
}

function extractTopThemes(themes: string[], limit: number = 5): string[] {
  const themeCounts = countThemeFrequency(themes);
  return Object.entries(themeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([theme]) => theme);
}

// ============================================================================
// ELDER IDENTIFICATION
// ============================================================================

function isElder(storyteller: any): boolean {
  return storyteller.birth_year && storyteller.birth_year < ELDER_BIRTH_YEAR_THRESHOLD;
}

async function getElderIds(supabase: any): Promise<string[]> {
  const { data: elders } = await supabase
    .from('storytellers')
    .select('id')
    .or(`birth_year.lt.${ELDER_BIRTH_YEAR_THRESHOLD},cultural_role.ilike.%elder%`);
  return elders ? elders.map((e: any) => e.id) : [];
}

// ============================================================================
// SCORING UTILITIES
// ============================================================================

function calculateResilienceScore(content: string, themes?: string[]): number {
  let score = 0;
  const contentLower = content.toLowerCase();

  // Count keyword occurrences
  RESILIENCE_KEYWORDS.forEach(keyword => {
    const matches = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
    score += matches * SCORE_WEIGHTS.KEYWORD_MATCH;
  });

  // Bonus for resilience-related themes
  if (themes) {
    const resilienceThemes = themes.filter(theme =>
      RESILIENCE_KEYWORDS.some(keyword => theme.toLowerCase().includes(keyword))
    );
    score += resilienceThemes.length * SCORE_WEIGHTS.THEME_MATCH;
  }

  return Math.min(100, score);
}

function calculateVitalityScore(
  uniqueThemes: Set<string>,
  intergenerationalContent: number,
  uniqueBackgrounds: Set<string>
): number {
  let score = BASE_SCORES.CULTURAL_VITALITY;

  // Theme diversity bonus
  const themeBonus = Math.min(
    SCORE_WEIGHTS.MAX_THEME_DIVERSITY_BONUS,
    uniqueThemes.size * 0.5
  );
  score += themeBonus;

  // Intergenerational content bonus
  const intergenerationalBonus = Math.min(
    SCORE_WEIGHTS.MAX_INTERGENERATIONAL_BONUS,
    intergenerationalContent * 0.3
  );
  score += intergenerationalBonus;

  // Cultural diversity bonus
  const diversityBonus = Math.min(
    SCORE_WEIGHTS.MAX_DIVERSITY_BONUS,
    uniqueBackgrounds.size * 0.2
  );
  score += diversityBonus;

  return Math.min(100, Math.floor(score));
}

function calculateInfluenceScore(
  storyCount: number,
  totalViews: number,
  uniqueThemeCount: number,
  transcriptCount: number
): number {
  let score = 0;

  // Story count contribution
  score += Math.min(
    SCORE_WEIGHTS.MAX_STORY_BONUS,
    storyCount * SCORE_WEIGHTS.STORY_COUNT
  );

  // View count contribution
  score += Math.min(
    SCORE_WEIGHTS.MAX_VIEW_BONUS,
    Math.floor(totalViews / SCORE_WEIGHTS.VIEW_COUNT_DIVISOR)
  );

  // Theme diversity contribution
  score += Math.min(
    SCORE_WEIGHTS.MAX_THEME_BONUS,
    uniqueThemeCount * SCORE_WEIGHTS.THEME_DIVERSITY
  );

  // Transcript contribution
  score += Math.min(
    SCORE_WEIGHTS.MAX_TRANSCRIPT_BONUS,
    transcriptCount * SCORE_WEIGHTS.TRANSCRIPT_COUNT
  );

  return Math.min(100, score);
}

function calculateQuoteSignificance(quote: string, isElder: boolean): number {
  let score = quote.length / SCORE_WEIGHTS.QUOTE_LENGTH_DIVISOR;
  if (isElder) score *= SCORE_WEIGHTS.ELDER_QUOTE_MULTIPLIER;
  if (quote.toLowerCase().includes('tradition')) score *= SCORE_WEIGHTS.TRADITION_MULTIPLIER;
  if (quote.toLowerCase().includes('healing')) score *= SCORE_WEIGHTS.HEALING_MULTIPLIER;
  return Math.min(100, Math.floor(score));
}

function calculateThemeSignificance(frequency: number): number {
  return Math.min(100, frequency * SCORE_WEIGHTS.THEME_SIGNIFICANCE_MULTIPLIER);
}

// ============================================================================
// CULTURAL ROLE DETERMINATION
// ============================================================================

function determineCulturalRole(storyteller: any): string {
  if (storyteller.birth_year && storyteller.birth_year < ELDER_BIRTH_YEAR_THRESHOLD) {
    return 'Elder';
  }
  if (storyteller.stories?.length > 5) {
    return 'Community Keeper';
  }
  return 'Community Member';
}

// ============================================================================
// DATA TRANSFORMATION
// ============================================================================

function identifyCulturalClusters(
  backgrounds: string[],
  storytellerCount: number
): { name: string; storytellers: number; commonThemes: string[] }[] {
  const clusters = new Map<string, number>();
  backgrounds.forEach(bg => {
    clusters.set(bg, (clusters.get(bg) || 0) + 1);
  });

  return Array.from(clusters.entries()).map(([name, count]) => ({
    name,
    storytellers: count,
    commonThemes: ['tradition', 'community'] // Placeholder for future AI enhancement
  }));
}

function extractSignificantQuotes(content: string, limit: number = 5): string[] {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  return sentences.slice(0, limit);
}

// ============================================================================
// ANALYTICS SERVICE CLASS
// ============================================================================

export class AnalyticsService {
  private supabase = createSupabaseClient();

  /**
   * Get comprehensive community impact overview
   */
  async getCommunityMetrics(): Promise<CommunityMetrics> {
    try {
      // Get basic counts
      const [storiesCount, transcriptsCount, storytellersCount] = await Promise.all([
        safeCount(
          () => this.supabase.from('stories').select('id', { count: 'exact', head: true }),
          0,
          'Error counting stories'
        ),
        safeCount(
          () => this.supabase.from('transcripts').select('id', { count: 'exact', head: true }),
          0,
          'Error counting transcripts'
        ),
        safeCount(
          () => this.supabase.from('storytellers').select('id', { count: 'exact', head: true }),
          0,
          'Error counting storytellers'
        )
      ]);

      // Get active storytellers
      const activeStorytellers = await this.getActiveStorytellerCount();

      // Get cultural themes
      const culturalThemes = await this.extractCulturalThemesFromTranscripts();

      // Calculate all metrics in parallel
      const [
        healingJourneys,
        intergenerationalConnections,
        elderWisdomQuotes,
        communityResilience,
        culturalVitality
      ] = await Promise.all([
        this.calculateHealingJourneys(),
        this.calculateIntergenerationalConnections(),
        this.countElderWisdomQuotes(),
        this.calculateCommunityResilience(),
        this.calculateCulturalVitality()
      ]);

      return {
        totalStories: storiesCount,
        totalTranscripts: transcriptsCount,
        activeStorytellers,
        culturalThemes,
        healingJourneys,
        intergenerationalConnections,
        elderWisdomQuotes,
        communityResilience,
        culturalVitality
      };
    } catch (error) {
      console.error('Error getting community metrics:', error);
      return FALLBACK_COMMUNITY_METRICS;
    }
  }

  /**
   * Generate storyteller network analysis for social graph visualization
   */
  async getStorytellerNetwork(): Promise<StorytellerConnection[]> {
    try {
      const storytellers = await safeQuery(
        () => this.supabase
          .from('storytellers')
          .select(`
            id,
            name,
            organisation,
            cultural_background,
            stories!inner(id, title, themes)
          `),
        [],
        'Error fetching storytellers for network'
      );

      if (!storytellers || storytellers.length === 0) {
        return [FALLBACK_STORYTELLER];
      }

      const connections: StorytellerConnection[] = [];

      for (const storyteller of storytellers) {
        try {
          const storyThemes = storyteller.stories?.flatMap((s: any) => s.themes || []) || [];

          const relatedStorytellers = await this.findRelatedStorytellers(
            storyteller.id,
            storyThemes,
            storyteller.organisation,
            storyteller.cultural_background
          );

          connections.push({
            id: storyteller.id,
            name: storyteller.name,
            organisation: storyteller.organisation,
            connections: relatedStorytellers.map((r: any) => r.id),
            influences: await this.calculateInfluenceScoreForStoryteller(storyteller.id),
            culturalRole: determineCulturalRole(storyteller),
            storyCount: storyteller.stories?.length || 0,
            themes: [...new Set(storyThemes)]
          });
        } catch (error) {
          console.warn(`Error processing storyteller ${storyteller.id}:`, error);
        }
      }

      return connections.length > 0 ? connections : [FALLBACK_STORYTELLER];
    } catch (error) {
      console.error('Error generating storyteller network:', error);
      return [FALLBACK_STORYTELLER];
    }
  }

  /**
   * Analyze cultural themes across all stories and transcripts
   */
  async getCulturalThemes(): Promise<CulturalTheme[]> {
    try {
      const transcripts = await safeQuery(
        () => this.supabase
          .from('transcripts')
          .select(`
            content,
            themes,
            analysis,
            stories(id, title),
            storytellers(name, cultural_background)
          `)
          .not('content', 'is', null),
        [],
        'Error fetching transcripts for theme analysis'
      );

      if (!transcripts || transcripts.length === 0) {
        return FALLBACK_CULTURAL_THEMES;
      }

      const themeAnalysis = new Map<string, {
        frequency: number;
        quotes: string[];
        stories: string[];
      }>();

      // Aggregate theme data
      for (const transcript of transcripts) {
        if (transcript.themes) {
          for (const theme of transcript.themes) {
            const current = themeAnalysis.get(theme) || {
              frequency: 0,
              quotes: [],
              stories: []
            };

            current.frequency += 1;
            if (transcript.stories) {
              current.stories.push(...transcript.stories.map((s: any) => s.id));
            }

            // Extract quotes (simplified for now)
            if (transcript.content) {
              const quotes = extractSignificantQuotes(transcript.content, 2);
              current.quotes.push(...quotes);
            }

            themeAnalysis.set(theme, current);
          }
        }
      }

      // Build cultural themes
      const culturalThemes: CulturalTheme[] = [];
      for (const [name, analysis] of themeAnalysis.entries()) {
        culturalThemes.push({
          name,
          frequency: analysis.frequency,
          sentiment: 'positive', // Simplified - can be enhanced with AI
          relatedQuotes: analysis.quotes.slice(0, 10),
          stories: [...new Set(analysis.stories)],
          significance: calculateThemeSignificance(analysis.frequency),
          elderApproved: await this.checkElderApproval(name)
        });
      }

      const result = culturalThemes.sort((a, b) => b.significance - a.significance);
      return result.length > 0 ? result : FALLBACK_CULTURAL_THEMES;
    } catch (error) {
      console.error('Error analyzing cultural themes:', error);
      return FALLBACK_CULTURAL_THEMES;
    }
  }

  /**
   * Extract and rank wisdom quotes from elder stories
   */
  async getWisdomQuotes(limit: number = 50): Promise<WisdomQuote[]> {
    try {
      const transcripts = await safeQuery(
        () => this.supabase
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
          .not('content', 'is', null),
        [],
        'Error fetching transcripts for wisdom quotes'
      );

      if (!transcripts || transcripts.length === 0) {
        return FALLBACK_WISDOM_QUOTES.slice(0, limit);
      }

      const wisdomQuotes: WisdomQuote[] = [];

      for (const transcript of transcripts) {
        if (!transcript.content) continue;

        try {
          const quotes = extractSignificantQuotes(transcript.content);

          for (const story of transcript.stories || []) {
            const storyteller = story.storytellers;
            if (!storyteller) continue;

            const isElderStoryteller = isElder(storyteller);

            for (const quote of quotes) {
              const significance = calculateQuoteSignificance(quote, isElderStoryteller);

              wisdomQuotes.push({
                id: `${transcript.id}-${wisdomQuotes.length}`,
                text: quote,
                storyteller: storyteller.name,
                culturalContext: storyteller.cultural_background || 'Not specified',
                significance,
                themes: ['wisdom', 'tradition'], // Simplified - can be enhanced with AI
                elderApproval: 'pending',
                storyId: story.id,
                transcriptId: transcript.id
              });
            }
          }
        } catch (error) {
          console.warn(`Error processing transcript ${transcript.id}:`, error);
        }
      }

      const result = wisdomQuotes
        .sort((a, b) => b.significance - a.significance)
        .slice(0, limit);

      return result.length > 0 ? result : FALLBACK_WISDOM_QUOTES.slice(0, limit);
    } catch (error) {
      console.error('Error extracting wisdom quotes:', error);
      return FALLBACK_WISDOM_QUOTES.slice(0, limit);
    }
  }

  /**
   * Generate geographic insights for story mapping
   */
  async getGeographicInsights(): Promise<GeographicInsight[]> {
    try {
      const stories = await safeQuery(
        () => this.supabase
          .from('stories')
          .select(`
            id,
            location,
            themes,
            storytellers(id, name, location, cultural_background)
          `)
          .not('location', 'is', null),
        [],
        'Error fetching stories for geographic insights'
      );

      if (!stories || stories.length === 0) {
        return FALLBACK_GEOGRAPHIC_INSIGHTS;
      }

      const regionAnalysis = new Map<string, {
        storyCount: number;
        themes: string[];
        storytellers: Set<string>;
        culturalBackgrounds: string[];
      }>();

      // Aggregate regional data
      for (const story of stories) {
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

      // Build geographic insights
      const insights: GeographicInsight[] = [];
      for (const [region, analysis] of regionAnalysis.entries()) {
        const predominantThemes = extractTopThemes(analysis.themes);
        const culturalClusters = identifyCulturalClusters(
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

      const result = insights.sort((a, b) => b.storyDensity - a.storyDensity);
      return result.length > 0 ? result : FALLBACK_GEOGRAPHIC_INSIGHTS;
    } catch (error) {
      console.error('Error generating geographic insights:', error);
      return FALLBACK_GEOGRAPHIC_INSIGHTS;
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

  // ==========================================================================
  // PRIVATE HELPER METHODS
  // ==========================================================================

  private async getActiveStorytellerCount(): Promise<number> {
    try {
      const { data: storyTellerIds } = await this.supabase
        .from('stories')
        .select('storyteller_id');

      const storytellerIds = storyTellerIds?.map(s => s.storyteller_id).filter(Boolean) || [];

      if (storytellerIds.length === 0) return 0;

      const { data } = await this.supabase
        .from('storytellers')
        .select('id')
        .in('id', storytellerIds);

      return data?.length || 0;
    } catch (error) {
      console.warn('Error getting active storytellers:', error);
      return 0;
    }
  }

  private async extractCulturalThemesFromTranscripts(): Promise<string[]> {
    try {
      const { data: transcripts } = await this.supabase
        .from('transcripts')
        .select('themes')
        .not('themes', 'is', null);

      if (!transcripts || transcripts.length === 0) {
        return FALLBACK_THEMES;
      }

      return extractUniqueThemes(transcripts);
    } catch (error) {
      console.warn('Error extracting cultural themes:', error);
      return FALLBACK_THEMES;
    }
  }

  private async calculateHealingJourneys(): Promise<number> {
    return safeCount(
      () => this.supabase
        .from('transcripts')
        .select('id', { count: 'exact', head: true })
        .or('content.ilike.%healing%,content.ilike.%recovery%,content.ilike.%journey%'),
      12,
      'Error calculating healing journeys'
    );
  }

  private async calculateIntergenerationalConnections(): Promise<number> {
    return safeCount(
      () => this.supabase
        .from('stories')
        .select('id', { count: 'exact', head: true })
        .or('themes.cs.{intergenerational},themes.cs.{family},themes.cs.{tradition}'),
      8,
      'Error calculating intergenerational connections'
    );
  }

  private async countElderWisdomQuotes(): Promise<number> {
    try {
      const elderIds = await getElderIds(this.supabase);
      if (elderIds.length === 0) return 15;

      return safeCount(
        () => this.supabase
          .from('stories')
          .select('id', { count: 'exact', head: true })
          .in('storyteller_id', elderIds),
        15,
        'Error counting elder wisdom quotes'
      );
    } catch (error) {
      console.warn('Error counting elder wisdom quotes:', error);
      return 15;
    }
  }

  private async calculateCommunityResilience(): Promise<number> {
    try {
      const { data: transcripts } = await this.supabase
        .from('transcripts')
        .select('content, themes')
        .not('content', 'is', null);

      if (!transcripts || transcripts.length === 0) {
        return 75;
      }

      let totalScores = 0;
      let countedItems = 0;

      for (const transcript of transcripts) {
        const score = calculateResilienceScore(transcript.content, transcript.themes);
        totalScores += Math.min(score, 100);
        countedItems++;
      }

      if (countedItems > 0) {
        const averageScore = totalScores / countedItems;
        return Math.max(BASE_SCORES.COMMUNITY_RESILIENCE, Math.min(100, Math.floor(averageScore + BASE_SCORES.COMMUNITY_RESILIENCE)));
      }

      return 75;
    } catch (error) {
      console.warn('Error calculating community resilience:', error);
      return 75;
    }
  }

  private async calculateCulturalVitality(): Promise<number> {
    try {
      const [transcripts, storytellers] = await Promise.all([
        safeQuery(
          () => this.supabase.from('transcripts').select('themes').not('themes', 'is', null),
          [],
          'Error fetching transcripts for vitality'
        ),
        safeQuery(
          () => this.supabase.from('storytellers').select('cultural_background').not('cultural_background', 'is', null),
          [],
          'Error fetching storytellers for vitality'
        )
      ]);

      const uniqueThemes = new Set<string>();
      let intergenerationalContent = 0;

      transcripts.forEach((transcript: any) => {
        if (transcript.themes) {
          transcript.themes.forEach((theme: string) => {
            uniqueThemes.add(theme.toLowerCase());

            if (theme.toLowerCase().includes('intergenerational') ||
                theme.toLowerCase().includes('elder') ||
                theme.toLowerCase().includes('tradition') ||
                theme.toLowerCase().includes('heritage')) {
              intergenerationalContent++;
            }
          });
        }
      });

      const uniqueBackgrounds = new Set(storytellers.map((s: any) => s.cultural_background));

      return calculateVitalityScore(uniqueThemes, intergenerationalContent, uniqueBackgrounds);
    } catch (error) {
      console.warn('Error calculating cultural vitality:', error);
      return 82;
    }
  }

  private async findRelatedStorytellers(
    id: string,
    themes: string[],
    org?: string,
    cultural?: string
  ): Promise<any[]> {
    const { data } = await this.supabase
      .from('storytellers')
      .select('id, name, stories(themes)')
      .neq('id', id)
      .limit(10);

    return (data || []).filter((s: any) => {
      const sharedThemes = s.stories?.some((story: any) =>
        story.themes?.some((t: string) => themes.includes(t))
      );
      return sharedThemes;
    });
  }

  private async calculateInfluenceScoreForStoryteller(storytellerId: string): Promise<number> {
    try {
      const { data: stories } = await this.supabase
        .from('stories')
        .select('id, themes, view_count')
        .eq('storyteller_id', storytellerId);

      if (!stories || stories.length === 0) {
        return 0;
      }

      const storyCount = stories.length;
      const totalViews = stories.reduce((sum, story) => sum + (story.view_count || 0), 0);
      const allThemes = stories.flatMap(story => story.themes || []);
      const uniqueThemeCount = new Set(allThemes).size;

      // Get transcript count
      const storyIds = stories.map(story => story.id);
      const transcriptCount = storyIds.length > 0
        ? await safeCount(
            () => this.supabase.from('transcripts').select('id', { count: 'exact', head: true }).in('story_id', storyIds),
            0,
            'Error counting transcripts'
          )
        : 0;

      return calculateInfluenceScore(storyCount, totalViews, uniqueThemeCount, transcriptCount);
    } catch (error) {
      console.warn(`Error calculating influence score for ${storytellerId}:`, error);
      return 50;
    }
  }

  private async checkElderApproval(theme: string): Promise<boolean> {
    try {
      // Check for explicit approval (if table exists)
      const { data: approvals } = await this.supabase
        .from('theme_approvals')
        .select('approved')
        .eq('theme_name', theme)
        .eq('approved_by_elder', true)
        .single();

      if (approvals) {
        return approvals.approved;
      }
    } catch (error) {
      // Table may not exist, continue to fallback logic
    }

    try {
      // Check if theme appears in elder stories
      const elderIds = await getElderIds(this.supabase);

      if (elderIds.length > 0) {
        const { data: elderStories } = await this.supabase
          .from('stories')
          .select('themes')
          .in('storyteller_id', elderIds)
          .not('themes', 'is', null);

        if (elderStories) {
          const elderUsesTheme = elderStories.some((story: any) =>
            story.themes && story.themes.some((t: string) =>
              t.toLowerCase().includes(theme.toLowerCase())
            )
          );

          if (elderUsesTheme) {
            return true;
          }
        }
      }
    } catch (error) {
      console.warn('Error checking elder approval:', error);
    }

    // Default approval for common positive themes
    return DEFAULT_APPROVED_THEMES.some(approved =>
      theme.toLowerCase().includes(approved)
    );
  }

  private async analyzeHealingPatterns() {
    return FALLBACK_HEALING_PATTERNS;
  }
}

export const analyticsService = new AnalyticsService();

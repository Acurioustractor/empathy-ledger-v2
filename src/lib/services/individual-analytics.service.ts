/**
 * Individual Analytics Service for Empathy Ledger Platform
 * Provides personalized insights, skills analysis, and development recommendations
 * for individual storytellers based on their transcript collection
 */

import { supabase as supabaseClient } from '@/lib/supabase/client';
import { generateObject, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Core types for individual analysis
export interface StorytellerProfile {
  id: string;
  display_name: string;
  cultural_background?: string;
  specialties?: string[];
  years_of_experience?: number;
  location?: string;
  bio?: string;
}

export interface TranscriptAnalysis {
  id: string;
  storyteller_id: string;
  transcript_content: string;
  themes: string[];
  skills_mentioned: string[];
  achievements: string[];
  challenges: string[];
  cultural_references: string[];
  created_at: string;
}

export interface PersonalInsights {
  storyteller_id: string;
  narrative_themes: string[];
  core_values: string[];
  life_philosophy: string;
  strengths: string[];
  growth_areas: string[];
  cultural_identity_markers: string[];
  community_contributions: string[];
  professional_competencies: ProfessionalCompetency[];
  impact_stories: ImpactStory[];
  generated_at: string;
}

export interface ProfessionalCompetency {
  skill: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  evidence: string[];
  development_recommendations: string[];
  market_value: number; // 1-10 scale
  related_opportunities: string[];
}

export interface ImpactStory {
  title: string;
  description: string;
  measurable_outcomes: string[];
  beneficiaries: string[];
  timeframe: string;
  cultural_significance: string;
  suitable_for: ('resume' | 'grant_application' | 'interview' | 'portfolio')[];
}

export interface CareerRecommendation {
  title: string;
  organisation: string;
  match_score: number; // 0-100
  required_skills: string[];
  storyteller_skills: string[];
  gap_analysis: string[];
  application_strategy: string;
  cultural_fit: string;
  salary_range?: string;
  application_deadline?: string;
  url?: string;
}

export interface GrantOpportunity {
  title: string;
  organisation: string;
  funding_amount: string;
  match_score: number; // 0-100
  required_criteria: string[];
  storyteller_qualifications: string[];
  suggested_project: string;
  application_deadline: string;
  cultural_focus: boolean;
  community_impact_potential: string;
  url?: string;
}

export interface DevelopmentPlan {
  storyteller_id: string;
  short_term_goals: Goal[];
  long_term_goals: Goal[];
  skill_development_path: SkillPath[];
  networking_recommendations: string[];
  educational_opportunities: string[];
  cultural_preservation_opportunities: string[];
  mentorship_suggestions: string[];
  created_at: string;
}

export interface Goal {
  title: string;
  description: string;
  timeline: string;
  success_metrics: string[];
  required_skills: string[];
  resources_needed: string[];
  cultural_considerations?: string;
}

export interface SkillPath {
  skill: string;
  current_level: string;
  target_level: string;
  learning_resources: string[];
  practice_opportunities: string[];
  timeline: string;
  cultural_context?: string;
}

// Zod schemas for AI-generated content validation
const PersonalInsightsSchema = z.object({
  narrative_themes: z.array(z.string()),
  core_values: z.array(z.string()),
  life_philosophy: z.string(),
  strengths: z.array(z.string()),
  growth_areas: z.array(z.string()),
  cultural_identity_markers: z.array(z.string()),
  community_contributions: z.array(z.string())
});

const ProfessionalCompetencySchema = z.object({
  skill: z.string(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  evidence: z.array(z.string()),
  development_recommendations: z.array(z.string()),
  market_value: z.number().min(1).max(10),
  related_opportunities: z.array(z.string())
});

const ImpactStorySchema = z.object({
  title: z.string(),
  description: z.string(),
  measurable_outcomes: z.array(z.string()),
  beneficiaries: z.array(z.string()),
  timeframe: z.string(),
  cultural_significance: z.string(),
  suitable_for: z.array(z.enum(['resume', 'grant_application', 'interview', 'portfolio']))
});

const CareerRecommendationSchema = z.object({
  title: z.string(),
  organisation: z.string(),
  match_score: z.number().min(0).max(100),
  required_skills: z.array(z.string()),
  storyteller_skills: z.array(z.string()),
  gap_analysis: z.array(z.string()),
  application_strategy: z.string(),
  cultural_fit: z.string()
});

const GrantOpportunitySchema = z.object({
  title: z.string(),
  organisation: z.string(),
  funding_amount: z.string(),
  match_score: z.number().min(0).max(100),
  required_criteria: z.array(z.string()),
  storyteller_qualifications: z.array(z.string()),
  suggested_project: z.string(),
  cultural_focus: z.boolean(),
  community_impact_potential: z.string()
});

export class IndividualAnalyticsService {
  private supabase = supabaseClient;

  /**
   * Analyze all transcripts for a storyteller to extract personal insights
   */
  async analyzeStorytellerTranscripts(storytellerId: string): Promise<PersonalInsights> {
    try {
      // Fetch storyteller profile and all transcripts
      const storyteller = await this.getStorytellerProfile(storytellerId);
      const transcripts = await this.getStorytellerTranscripts(storytellerId);
      
      if (transcripts.length === 0) {
        throw new Error('No transcripts found for analysis');
      }

      // Combine all transcript content
      const combinedContent = transcripts.map(t => t.transcript_content).join('\n\n');
      
      // Generate personal insights using AI SDK v5
      const insights = await generateObject({
        model: openai('gpt-4-turbo'),
        schema: PersonalInsightsSchema,
        system: `You are an expert cultural anthropologist and career counsellor specialising in Indigenous and culturally diverse storytelling. 
                 Analyze the following life stories to extract deep personal insights while respecting cultural protocols and privacy.
                 
                 Focus on:
                 - Core narrative themes that define this person's journey
                 - Fundamental values and beliefs expressed through stories
                 - Personal philosophy of life and worldview
                 - Natural strengths and talents demonstrated
                 - Areas for growth and development
                 - Cultural identity markers and connections
                 - Ways this person contributes to their community
                 
                 Be respectful of cultural contexts and avoid making assumptions about specific cultural practices.
                 Highlight universal human experiences while honouring cultural uniqueness.`,
        prompt: `Analyze these life stories from ${storyteller.display_name}:
                
                Background: ${storyteller.cultural_background || 'Not specified'}
                Bio: ${storyteller.bio || 'Not provided'}
                Location: ${storyteller.location || 'Not specified'}
                
                Transcripts:
                ${combinedContent}
                
                Extract personal insights that would help this storyteller understand their unique strengths, 
                values, and potential for professional and personal development.`
      });

      const personalInsights: PersonalInsights = {
        storyteller_id: storytellerId,
        ...insights.object,
        professional_competencies: [], // Will be populated separately
        impact_stories: [], // Will be populated separately
        generated_at: new Date().toISOString()
      };

      // Save insights to database
      await this.savePersonalInsights(personalInsights);

      return personalInsights;
    } catch (error) {
      console.error('Error analysing storyteller transcripts:', error);
      throw error;
    }
  }

  /**
   * Extract professional competencies and skills from transcripts
   */
  async extractProfessionalCompetencies(storytellerId: string): Promise<ProfessionalCompetency[]> {
    try {
      const transcripts = await this.getStorytellerTranscripts(storytellerId);
      const combinedContent = transcripts.map(t => t.transcript_content).join('\n\n');

      const competenciesResult = await generateObject({
        model: openai('gpt-4-turbo'),
        schema: z.object({
          competencies: z.array(ProfessionalCompetencySchema)
        }),
        system: `You are an expert career counsellor and skills assessor. Analyze life stories to identify 
                 professional competencies, skills, and abilities that have market value.
                 
                 Look for:
                 - Technical skills and knowledge areas
                 - Leadership and management abilities
                 - Communication and interpersonal skills
                 - Problem-solving and analytical capabilities
                 - Creative and artistic talents
                 - Cultural and linguistic competencies
                 - Community organising and social skills
                 - Teaching and mentoring abilities
                 - Traditional knowledge and practices (if applicable)
                 
                 For each skill, assess the level based on evidence in the stories and provide 
                 realistic development recommendations.`,
        prompt: `Extract professional competencies from these life stories:
                
                ${combinedContent}
                
                Identify skills that have professional value, assess competency levels based on 
                evidence in the stories, and provide development recommendations for each skill.`
      });

      return competenciesResult.object.competencies;
    } catch (error) {
      console.error('Error extracting professional competencies:', error);
      throw error;
    }
  }

  /**
   * Identify impactful stories suitable for different professional contexts
   */
  async extractImpactStories(storytellerId: string): Promise<ImpactStory[]> {
    try {
      const transcripts = await this.getStorytellerTranscripts(storytellerId);
      const combinedContent = transcripts.map(t => t.transcript_content).join('\n\n');

      const impactStoriesResult = await generateObject({
        model: openai('gpt-4-turbo'),
        schema: z.object({
          impact_stories: z.array(ImpactStorySchema)
        }),
        system: `You are an expert in professional storytelling and impact measurement. Analyze personal 
                 narratives to identify stories that demonstrate measurable impact, achievement, and value.
                 
                 Look for stories that show:
                 - Leadership and initiative-taking
                 - Problem-solving and innovation
                 - Community building and collaboration
                 - Overcoming challenges and resilience
                 - Teaching and knowledge sharing
                 - Cultural preservation and transmission
                 - Mentoring and supporting others
                 - Creative solutions and artistic expression
                 
                 For each story, identify measurable outcomes and specify which professional contexts 
                 it would be most suitable for (resume, grant applications, interviews, portfolios).`,
        prompt: `Extract impactful achievement stories from these narratives:
                
                ${combinedContent}
                
                Identify specific stories that demonstrate measurable impact, leadership, or achievement 
                that could be used in professional contexts.`
      });

      return impactStoriesResult.object.impact_stories;
    } catch (error) {
      console.error('Error extracting impact stories:', error);
      throw error;
    }
  }

  /**
   * Generate career recommendations based on storyteller profile and competencies
   */
  async generateCareerRecommendations(storytellerId: string, competencies: ProfessionalCompetency[]): Promise<CareerRecommendation[]> {
    try {
      const storyteller = await this.getStorytellerProfile(storytellerId);
      
      const skillsList = competencies.map(c => `${c.skill} (${c.level})`).join(', ');

      const recommendationsResult = await generateObject({
        model: openai('gpt-4-turbo'),
        schema: z.object({
          recommendations: z.array(CareerRecommendationSchema)
        }),
        system: `You are a career counsellor specialising in matching diverse professionals with opportunities 
                 that value their unique experiences and cultural perspectives.
                 
                 Consider:
                 - Cultural organisations and Indigenous-led initiatives
                 - Education and community development roles
                 - Creative industries and storytelling professions
                 - Social services and community support roles
                 - Government and policy positions
                 - Non-profit and charitable organisations
                 - Cultural preservation and heritage roles
                 - Consulting and advisory positions
                 
                 Focus on opportunities that would value storytelling abilities, cultural knowledge, 
                 and community connection skills.`,
        prompt: `Generate career recommendations for ${storyteller.display_name}:
                
                Background: ${storyteller.cultural_background || 'Diverse'}
                Location: ${storyteller.location || 'Location flexible'}
                Skills: ${skillsList}
                Experience: ${storyteller.years_of_experience || 'Varied'} years
                Specialties: ${storyteller.specialties?.join(', ') || 'Multiple areas'}
                
                Recommend realistic career opportunities that match their skills and would value 
                their storytelling and cultural expertise.`
      });

      return recommendationsResult.object.recommendations;
    } catch (error) {
      console.error('Error generating career recommendations:', error);
      throw error;
    }
  }

  /**
   * Find grant opportunities that match storyteller's profile and impact potential
   */
  async findGrantOpportunities(storytellerId: string, impactStories: ImpactStory[]): Promise<GrantOpportunity[]> {
    try {
      const storyteller = await this.getStorytellerProfile(storytellerId);
      const impactSummary = impactStories.map(story => 
        `${story.title}: ${story.description} - ${story.measurable_outcomes.join(', ')}`
      ).join('\n');

      const grantsResult = await generateObject({
        model: openai('gpt-4-turbo'),
        schema: z.object({
          opportunities: z.array(GrantOpportunitySchema)
        }),
        system: `You are a grant writing consultant specialising in funding opportunities for diverse 
                 communities and cultural preservation projects.
                 
                 Focus on:
                 - Cultural preservation and heritage grants
                 - Community development funding
                 - Education and storytelling grants
                 - Indigenous and minority-focused funding
                 - Arts and creative expression grants
                 - Social innovation and community impact funds
                 - Mentorship and leadership development grants
                 - Digital storytelling and media grants
                 
                 Match opportunities to demonstrated impact and community connection.`,
        prompt: `Find grant opportunities for ${storyteller.display_name}:
                
                Background: ${storyteller.cultural_background || 'Diverse community member'}
                Location: ${storyteller.location || 'Various locations'}
                
                Demonstrated Impact:
                ${impactSummary}
                
                Recommend grant opportunities that align with their demonstrated community impact, 
                cultural work, and storytelling expertise.`
      });

      return grantsResult.object.opportunities;
    } catch (error) {
      console.error('Error finding grant opportunities:', error);
      throw error;
    }
  }

  /**
   * Create a comprehensive personal development plan
   */
  async createDevelopmentPlan(
    storytellerId: string,
    insights: PersonalInsights,
    competencies: ProfessionalCompetency[]
  ): Promise<DevelopmentPlan> {
    try {
      const storyteller = await this.getStorytellerProfile(storytellerId);

      const developmentText = await generateText({
        model: openai('gpt-4-turbo'),
        system: `You are a personal development coach specialising in culturally-informed career planning.
                 Create comprehensive development plans that honour cultural values while building 
                 professional capabilities.`,
        prompt: `Create a personal development plan for ${storyteller.display_name}:
                
                Core Values: ${insights.core_values.join(', ')}
                Strengths: ${insights.strengths.join(', ')}
                Growth Areas: ${insights.growth_areas.join(', ')}
                Cultural Background: ${storyteller.cultural_background || 'Diverse'}
                
                Professional Competencies:
                ${competencies.map(c => `- ${c.skill} (${c.level}): ${c.development_recommendations.join(', ')}`).join('\n')}
                
                Create a detailed development plan with:
                1. 3-5 short-term goals (6 months - 1 year)
                2. 2-3 long-term goals (2-5 years)
                3. Skill development pathways
                4. Networking recommendations
                5. Educational opportunities
                6. Cultural preservation opportunities
                7. Mentorship suggestions
                
                Format as JSON with clear structure for goals, timelines, and recommendations.`
      });

      // Parse the development plan (simplified version)
      const developmentPlan: DevelopmentPlan = {
        storyteller_id: storytellerId,
        short_term_goals: [
          {
            title: "Strengthen Professional Portfolio",
            description: "Document and showcase key achievements and skills",
            timeline: "3-6 months",
            success_metrics: ["Updated resume", "Professional portfolio", "LinkedIn profile"],
            required_skills: ["Writing", "Digital literacy"],
            resources_needed: ["Computer access", "Professional development time"]
          }
        ],
        long_term_goals: [
          {
            title: "Community Leadership Role",
            description: "Take on formal leadership in community initiatives",
            timeline: "2-3 years",
            success_metrics: ["Leadership position obtained", "Community impact measured"],
            required_skills: ["Leadership", "Project management"],
            resources_needed: ["Leadership training", "Mentorship"]
          }
        ],
        skill_development_path: competencies.map(comp => ({
          skill: comp.skill,
          current_level: comp.level,
          target_level: comp.level === 'beginner' ? 'intermediate' : 
                       comp.level === 'intermediate' ? 'advanced' : 'expert',
          learning_resources: comp.development_recommendations,
          practice_opportunities: ["Community projects", "Volunteer opportunities"],
          timeline: "6-12 months"
        })),
        networking_recommendations: [
          "Connect with cultural organisations",
          "Join professional associations",
          "Attend community events"
        ],
        educational_opportunities: [
          "Cultural leadership programs",
          "Professional development workshops",
          "Online skill-building courses"
        ],
        cultural_preservation_opportunities: [
          "Document traditional knowledge",
          "Mentor younger community members",
          "Participate in cultural events"
        ],
        mentorship_suggestions: [
          "Seek experienced community leaders",
          "Connect with professionals in target fields",
          "Engage with cultural elders"
        ],
        created_at: new Date().toISOString()
      };

      // Save development plan to database
      await this.saveDevelopmentPlan(developmentPlan);

      return developmentPlan;
    } catch (error) {
      console.error('Error creating development plan:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive analysis for a storyteller
   */
  async getStorytellerAnalysis(storytellerId: string): Promise<{
    insights: PersonalInsights;
    competencies: ProfessionalCompetency[];
    impactStories: ImpactStory[];
    careerRecommendations: CareerRecommendation[];
    grantOpportunities: GrantOpportunity[];
    developmentPlan: DevelopmentPlan;
  }> {
    try {
      // Check if analysis already exists and is recent
      const existingAnalysis = await this.getExistingAnalysis(storytellerId);
      if (existingAnalysis && this.isAnalysisRecent(existingAnalysis.generated_at)) {
        return existingAnalysis;
      }

      // Generate new analysis
      const insights = await this.analyzeStorytellerTranscripts(storytellerId);
      const competencies = await this.extractProfessionalCompetencies(storytellerId);
      const impactStories = await this.extractImpactStories(storytellerId);
      const careerRecommendations = await this.generateCareerRecommendations(storytellerId, competencies);
      const grantOpportunities = await this.findGrantOpportunities(storytellerId, impactStories);
      const developmentPlan = await this.createDevelopmentPlan(storytellerId, insights, competencies);

      // Update insights with competencies and impact stories
      insights.professional_competencies = competencies;
      insights.impact_stories = impactStories;
      await this.savePersonalInsights(insights);

      return {
        insights,
        competencies,
        impactStories,
        careerRecommendations,
        grantOpportunities,
        developmentPlan
      };
    } catch (error) {
      console.error('Error getting storyteller analysis:', error);
      throw error;
    }
  }

  // Helper methods
  private async getStorytellerProfile(storytellerId: string): Promise<StorytellerProfile> {
    // First, check storytellers table (new data model)
    const { data: storytellerData, error: storytellerError } = await this.supabase
      .from('storytellers')
      .select('*')
      .eq('id', storytellerId)
      .single();

    if (storytellerData && !storytellerError) {
      return storytellerData;
    }

    // Fall back to profiles table for backwards compatibility
    const { data: profileData, error: profileError } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', storytellerId)
      .single();

    if (profileError) throw profileError;
    return profileData;
  }

  private async getStorytellerTranscripts(storytellerId: string): Promise<TranscriptAnalysis[]> {
    const { data, error } = await this.supabase
      .from('transcripts')
      .select('*')
      .eq('storyteller_id', storytellerId);

    if (error) throw error;
    return data || [];
  }

  private async savePersonalInsights(insights: PersonalInsights): Promise<void> {
    const { error } = await this.supabase
      .from('personal_insights')
      .upsert(insights, { onConflict: 'storyteller_id' });

    if (error) throw error;
  }

  private async saveDevelopmentPlan(plan: DevelopmentPlan): Promise<void> {
    const { error } = await this.supabase
      .from('development_plans')
      .upsert(plan, { onConflict: 'storyteller_id' });

    if (error) throw error;
  }

  private async getExistingAnalysis(storytellerId: string): Promise<any | null> {
    // Implementation would fetch existing analysis from database
    return null; // Simplified for now
  }

  private isAnalysisRecent(generatedAt: string): boolean {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return new Date(generatedAt) > oneWeekAgo;
  }

  /**
   * Analyze a single transcript text directly (for immediate analysis)
   */
  async analyzeTranscript(storytellerId: string, transcriptText: string): Promise<PersonalInsights> {
    try {
      // Get storyteller profile for context
      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', storytellerId)
        .single();

      if (error) throw error;

      const storyteller = {
        id: storytellerId,
        display_name: profile.display_name || 'Anonymous',
        cultural_background: profile.cultural_background || 'Not specified',
        location: profile.location_data || 'Not specified',
        bio: profile.bio || 'Not provided'
      };

      // Generate personal insights using AI SDK v5
      const insights = await generateObject({
        model: openai('gpt-4-turbo'),
        schema: PersonalInsightsSchema,
        system: `You are an expert cultural anthropologist and career counsellor specialising in Indigenous and culturally diverse storytelling. 
                 Analyze the following transcript to extract deep personal insights while respecting cultural protocols and privacy.
                 
                 Focus on:
                 - Core narrative themes that define this person's journey
                 - Fundamental values and beliefs expressed through stories
                 - Personal philosophy of life and worldview
                 - Natural strengths and talents demonstrated
                 - Areas for growth and development
                 - Cultural identity markers and connections
                 - Ways this person contributes to their community
                 
                 Be respectful of cultural contexts and avoid making assumptions about specific cultural practices.
                 Highlight universal human experiences while honouring cultural uniqueness.`,
        prompt: `Analyze this transcript from ${storyteller.display_name}:
                
                Background: ${storyteller.cultural_background}
                Bio: ${storyteller.bio}
                Location: ${storyteller.location}
                
                Transcript:
                ${transcriptText}
                
                Extract personal insights that would help this storyteller understand their unique strengths, 
                values, and potential for professional and personal development.`
      });

      const personalInsights: PersonalInsights = {
        storyteller_id: storytellerId,
        ...insights.object,
        professional_competencies: [], // Will be populated separately
        impact_stories: [], // Will be populated separately
        generated_at: new Date().toISOString()
      };

      // Save insights to database for future reference
      try {
        await this.savePersonalInsights(personalInsights);
      } catch (saveError) {
        console.warn('Could not save insights to database:', saveError);
        // Continue without failing - return the analysis anyway
      }

      return personalInsights;
    } catch (error) {
      console.error('Error analysing transcript:', error);
      throw error;
    }
  }
}

export const individualAnalyticsService = new IndividualAnalyticsService();
import { createLLMClient } from './llm-client'

const llm = createLLMClient()

export interface ProjectProfile {
  // Core Purpose
  mission: string
  primary_goals: string[]
  target_population: string

  // Origin Story
  origin_story: string
  community_need: string
  who_initiated: string

  // How It Works
  program_model: string
  key_activities: string[]
  cultural_approaches: string[]
  cultural_protocols: string[]

  // Expected Outcomes
  outcome_categories: {
    category: string
    examples: string[]
    keywords: string[]
  }[]
  short_term_outcomes: string[] // 0-6 months
  medium_term_outcomes: string[] // 6-24 months
  long_term_outcomes: string[] // 2+ years

  // Community-Defined Success
  success_indicators: {
    name: string
    description: string
    why_matters: string
  }[]
  positive_language: string[] // Words indicating success
  challenge_language: string[] // Words about obstacles
  transformation_markers: string[] // Signs of change

  // Impact Domains
  individual_impact: string[]
  family_impact: string[]
  community_impact: string[]
  systems_impact: string[]

  // Cultural Context
  cultural_values: string[]
  indigenous_frameworks: string[]
  community_wisdom: string[]

  // Metadata
  completeness_score: number // 0-100
}

const systemPrompt = `You are an expert in impact measurement, theory of change, and culturally-responsive evaluation, particularly for Indigenous and community-led programs.

Your task is to analyze a seed interview about a project and extract a comprehensive project profile that will guide AI analysis of storyteller transcripts.

Focus on:
1. Understanding the project's TRUE purpose (not just stated goals)
2. Identifying community-defined success indicators
3. Recognizing cultural approaches and values
4. Extracting outcome categories with specific examples
5. Finding language patterns that indicate success or challenge
6. Understanding how change happens in this context

Be culturally humble - if something isn't clear or seems sacred/private, note that respectfully.`

export async function extractProjectProfile(
  interviewTranscript: string,
  projectName: string
): Promise<ProjectProfile> {
  const userPrompt = `
PROJECT NAME: ${projectName}

SEED INTERVIEW TRANSCRIPT:
${interviewTranscript}

Extract a comprehensive project profile that will help AI understand:
- What this project is trying to achieve
- How it works and why
- What success looks like (community-defined)
- Cultural context and values
- Expected outcomes at different time scales
- Language patterns that indicate positive or challenging experiences

Return as structured JSON matching the ProjectProfile interface.

For each outcome category, provide:
- A clear category name
- 3-5 concrete examples of what that looks like
- 5-10 keywords/phrases to watch for in transcripts

For success indicators, identify what the COMMUNITY sees as success, not just what funders want to see.

Assign a completeness_score (0-100) based on how much information you were able to extract.`

  try {
    const response = await llm.createChatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      maxTokens: 4000,
      responseFormat: 'json'
    })

    return JSON.parse(response) as ProjectProfile
  } catch (error: any) {
    console.error('Error extracting project profile:', error)
    throw error
  }
}

// Quick extraction from simple description (for quick setup model)
export async function extractQuickProfile(description: string, projectName: string) {
  const userPrompt = `
PROJECT NAME: ${projectName}

PROJECT DESCRIPTION:
${description}

This is a brief project description. Extract key elements to help AI analysis:
- Main purpose/mission (1 sentence)
- 3-5 primary goals
- 2-3 outcome categories with example keywords
- 5-10 positive language indicators
- Target population

Return as JSON with fields: mission, primary_goals, outcome_categories (with category, examples, keywords), positive_language, target_population.`

  try {
    const response = await llm.createChatCompletion({
      messages: [
        { role: 'system', content: 'Extract project context from description to guide AI analysis.' },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      maxTokens: 1500,
      responseFormat: 'json'
    })

    return JSON.parse(response)
  } catch (error: any) {
    console.error('Error extracting quick profile:', error)
    throw error
  }
}

/**
 * Seed Interview Scripts
 *
 * Based on world-class impact measurement frameworks:
 * - Theory of Change (UN, W.K. Kellogg Foundation)
 * - Logic Model Framework
 * - Indigenous Leadership and Community Self-Determination
 * - Social Impact Strategy frameworks
 */

export interface InterviewQuestion {
  id: string
  section: string
  question: string
  prompt: string // What to say/ask during interview
  guidingNotes?: string // Notes for interviewer
  expectedInsights: string[] // What we hope to learn
}

/**
 * PROJECT SEED INTERVIEW SCRIPT
 *
 * Focus: Logic Model, Theory of Change, Impact Pathways
 * Aligned with: Project-specific outcomes, program evaluation
 */
export const PROJECT_INTERVIEW_SCRIPT: InterviewQuestion[] = [
  // SECTION 1: Project Purpose & Context
  {
    id: 'project_purpose',
    section: 'Project Purpose & Context',
    question: 'What is this project and why does it exist?',
    prompt: 'Let\'s start with the basics. In your own words, tell me about this project. What is it called, and why did you decide to start it?',
    guidingNotes: 'Listen for: the problem being addressed, community need, personal motivation',
    expectedInsights: ['Project purpose', 'Problem statement', 'Community context']
  },
  {
    id: 'target_population',
    section: 'Project Purpose & Context',
    question: 'Who is this project for?',
    prompt: 'Who are the people or communities you\'re working with in this project? Can you describe them for me?',
    guidingNotes: 'Listen for: demographics, geographic location, cultural context, community characteristics',
    expectedInsights: ['Target population', 'Geographic scope', 'Cultural context']
  },
  {
    id: 'community_voice',
    section: 'Project Purpose & Context',
    question: 'How did the community help shape this project?',
    prompt: 'Tell me about how the community\'s voice is part of this project. Did they help design it? Are they leading it?',
    guidingNotes: 'Listen for: community consultation, co-design, community leadership, self-determination',
    expectedInsights: ['Community engagement', 'Co-design process', 'Community ownership']
  },

  // SECTION 2: Activities & Inputs (Logic Model)
  {
    id: 'key_activities',
    section: 'Activities & Approach',
    question: 'What does the project actually do?',
    prompt: 'Walk me through what actually happens in this project. What are the main activities or programs you run?',
    guidingNotes: 'Listen for: specific activities, frequency, duration, delivery methods',
    expectedInsights: ['Key activities', 'Program model', 'Delivery approach']
  },
  {
    id: 'cultural_approaches',
    section: 'Activities & Approach',
    question: 'How is culture woven into your approach?',
    prompt: 'Is there anything culturally specific about how you run this project? Are there traditional practices, languages, or ways of working that are important?',
    guidingNotes: 'Listen for: cultural protocols, Indigenous knowledge, language revitalization, traditional practices',
    expectedInsights: ['Cultural approaches', 'Traditional knowledge integration', 'Cultural protocols']
  },
  {
    id: 'program_model',
    section: 'Activities & Approach',
    question: 'What\'s your theory of how this works?',
    prompt: 'If someone asked you why this project works, what would you say? What\'s your theory about how these activities lead to change?',
    guidingNotes: 'Listen for: causal assumptions, change mechanisms, evidence or experience-based reasoning',
    expectedInsights: ['Program logic', 'Theory of change', 'Change mechanisms']
  },

  // SECTION 3: Outcomes & Impact (Theory of Change)
  {
    id: 'immediate_outcomes',
    section: 'Outcomes & Impact',
    question: 'What changes do you see right away?',
    prompt: 'When people participate in this project, what changes do you notice happening right away or in the first few months? Even small things count.',
    guidingNotes: 'Listen for: immediate/short-term outcomes (0-6 months), observable changes, early indicators',
    expectedInsights: ['Short-term outcomes', 'Immediate impact', 'Early indicators']
  },
  {
    id: 'medium_term_outcomes',
    section: 'Outcomes & Impact',
    question: 'What deeper changes happen over time?',
    prompt: 'As people stay involved or after they\'ve finished the program, what deeper changes do you see happening? What develops over the next 6-18 months?',
    guidingNotes: 'Listen for: medium-term outcomes (6-18 months), skill development, behavior change, relationship building',
    expectedInsights: ['Medium-term outcomes', 'Sustained change', 'Skill development']
  },
  {
    id: 'long_term_impact',
    section: 'Outcomes & Impact',
    question: 'What\'s your vision for long-term impact?',
    prompt: 'If this project works exactly as you hope over the next few years, what will have changed for the people and community? What\'s the ultimate impact you\'re working toward?',
    guidingNotes: 'Listen for: long-term impact (18+ months), community transformation, systemic change, wellbeing improvements',
    expectedInsights: ['Long-term impact', 'Community transformation', 'Ultimate vision']
  },

  // SECTION 4: Success & Evidence
  {
    id: 'success_stories',
    section: 'Success & Evidence',
    question: 'Can you share a story of when this project made a difference?',
    prompt: 'Think of a time when you saw this project really make a difference in someone\'s life. Can you tell me that story?',
    guidingNotes: 'Listen for: specific examples, turning points, evidence of impact, emotional resonance',
    expectedInsights: ['Impact evidence', 'Success stories', 'Change narratives']
  },
  {
    id: 'success_measures',
    section: 'Success & Evidence',
    question: 'How do you know when this project is working?',
    prompt: 'What are the signs that tell you this project is succeeding? What do you look for or measure?',
    guidingNotes: 'Listen for: indicators, metrics, qualitative signs, community feedback, cultural markers of success',
    expectedInsights: ['Success criteria', 'Indicators', 'Measurement approaches']
  },

  // SECTION 5: Timeline & Scale
  {
    id: 'timeframe',
    section: 'Timeline & Sustainability',
    question: 'What\'s the timeline for this project?',
    prompt: 'When did this project start, or when will it start? How long will it run? Is this a short-term project or something ongoing?',
    guidingNotes: 'Listen for: start date, duration, sustainability plans, funding timeline',
    expectedInsights: ['Timeline', 'Project duration', 'Sustainability']
  }
]

/**
 * ORGANIZATION SEED INTERVIEW SCRIPT
 *
 * Focus: Mission, Vision, Theory of Change, Organizational Strategy
 * Aligned with: Indigenous leadership, community self-determination, organizational development
 */
export const ORGANIZATION_INTERVIEW_SCRIPT: InterviewQuestion[] = [
  // SECTION 1: Mission, Vision & History
  {
    id: 'org_story',
    section: 'Mission, Vision & History',
    question: 'Tell me the story of your organization',
    prompt: 'Let\'s start at the beginning. How did your organization come to be? What\'s the story behind why it exists?',
    guidingNotes: 'Listen for: founding story, community need, cultural context, organizational journey',
    expectedInsights: ['Founding story', 'Historical context', 'Organizational journey']
  },
  {
    id: 'org_mission',
    section: 'Mission, Vision & History',
    question: 'What is your organization\'s core mission?',
    prompt: 'In your own words, what is your organization here to do? What\'s your fundamental purpose?',
    guidingNotes: 'Listen for: core purpose, who they serve, primary focus, underlying values',
    expectedInsights: ['Mission statement', 'Core purpose', 'Primary focus']
  },
  {
    id: 'org_vision',
    section: 'Mission, Vision & History',
    question: 'What\'s your vision for the future?',
    prompt: 'Imagine 10 years from now, if your organization achieves everything you hope for. What does your community look like? What has changed?',
    guidingNotes: 'Listen for: aspirational future, community transformation, systemic change, cultural revitalization',
    expectedInsights: ['Vision statement', 'Future aspirations', 'Long-term goals']
  },
  {
    id: 'org_values',
    section: 'Mission, Vision & History',
    question: 'What values guide your work?',
    prompt: 'What principles or values are non-negotiable in how your organization operates? What must always be true about your work?',
    guidingNotes: 'Listen for: cultural values, ethical principles, traditional wisdom, community accountability',
    expectedInsights: ['Core values', 'Guiding principles', 'Cultural protocols']
  },

  // SECTION 2: Community & Culture
  {
    id: 'community_served',
    section: 'Community & Culture',
    question: 'Who does your organization serve?',
    prompt: 'Tell me about the communities and people your organization works with. Who are they, and what\'s their connection to your organization?',
    guidingNotes: 'Listen for: target populations, geographic scope, cultural identity, community relationships',
    expectedInsights: ['Communities served', 'Geographic scope', 'Cultural context']
  },
  {
    id: 'indigenous_leadership',
    section: 'Community & Culture',
    question: 'How is Indigenous leadership central to your organization?',
    prompt: 'Can you talk about how Indigenous knowledge, leadership, and self-determination shape your organization? How is community voice embedded in how you work?',
    guidingNotes: 'Listen for: Indigenous governance, traditional knowledge systems, community control, cultural authority',
    expectedInsights: ['Indigenous leadership', 'Community governance', 'Cultural authority']
  },
  {
    id: 'cultural_strengths',
    section: 'Community & Culture',
    question: 'What are your community\'s unique cultural strengths?',
    prompt: 'Every community has its own strengths, traditions, and ways of doing things. What makes your community special? What cultural assets do you build on?',
    guidingNotes: 'Listen for: traditional practices, cultural knowledge, community resilience, cultural continuity',
    expectedInsights: ['Cultural strengths', 'Traditional knowledge', 'Community assets']
  },

  // SECTION 3: Theory of Change & Impact Model
  {
    id: 'change_approach',
    section: 'Theory of Change & Impact',
    question: 'How does your organization create change?',
    prompt: 'Take me through your theory of change. When your organization does its work, what happens? How does that lead to the impact you\'re seeking?',
    guidingNotes: 'Listen for: causal pathways, change mechanisms, program logic, evidence of effectiveness',
    expectedInsights: ['Theory of change', 'Change mechanisms', 'Impact pathways']
  },
  {
    id: 'programs_overview',
    section: 'Theory of Change & Impact',
    question: 'What are your main programs and services?',
    prompt: 'Give me an overview of the main programs or services your organization offers. What are the big buckets of work you do?',
    guidingNotes: 'Listen for: program portfolio, service delivery, strategic focus areas',
    expectedInsights: ['Program portfolio', 'Service delivery', 'Strategic focus']
  },
  {
    id: 'holistic_approach',
    section: 'Theory of Change & Impact',
    question: 'How do you address the whole person and community?',
    prompt: 'Many Indigenous organizations work holistically - addressing physical, mental, emotional, spiritual, and cultural wellbeing. How does that show up in your work?',
    guidingNotes: 'Listen for: holistic service delivery, wraparound supports, interconnected programs, cultural healing',
    expectedInsights: ['Holistic approach', 'Integrated services', 'Cultural wellbeing']
  },

  // SECTION 4: Outcomes & Impact
  {
    id: 'immediate_org_outcomes',
    section: 'Outcomes & Impact',
    question: 'What immediate changes does your organization create?',
    prompt: 'When people or communities engage with your organization, what are the immediate or short-term changes you see? What happens in the first few months?',
    guidingNotes: 'Listen for: short-term outcomes, immediate benefits, early indicators across all programs',
    expectedInsights: ['Short-term organizational outcomes', 'Immediate impact', 'Early indicators']
  },
  {
    id: 'medium_org_outcomes',
    section: 'Outcomes & Impact',
    question: 'What develops over time?',
    prompt: 'As people stay connected to your organization or after they\'ve engaged with your programs, what develops over 6-18 months? What deeper changes emerge?',
    guidingNotes: 'Listen for: medium-term outcomes, sustained engagement, skill building, relationship strengthening',
    expectedInsights: ['Medium-term organizational outcomes', 'Sustained change', 'Capacity building']
  },
  {
    id: 'long_term_org_impact',
    section: 'Outcomes & Impact',
    question: 'What\'s your ultimate impact?',
    prompt: 'Looking at the bigger picture, what is the ultimate, long-term impact your organization is working to create? What fundamental changes do you hope to see?',
    guidingNotes: 'Listen for: systemic change, community transformation, cultural revitalization, self-determination',
    expectedInsights: ['Long-term organizational impact', 'Systemic change', 'Community transformation']
  },

  // SECTION 5: Evidence & Success
  {
    id: 'org_success_story',
    section: 'Evidence & Success',
    question: 'Can you share a powerful story of your organization\'s impact?',
    prompt: 'Tell me a story that captures what your organization does at its best. A time when you really saw the impact of your work.',
    guidingNotes: 'Listen for: transformative moments, community impact, cultural healing, evidence of change',
    expectedInsights: ['Impact stories', 'Evidence of success', 'Transformation narratives']
  },
  {
    id: 'org_success_indicators',
    section: 'Evidence & Success',
    question: 'How do you measure success?',
    prompt: 'What tells you that your organization is succeeding? What do you measure or look for? And are there cultural ways of knowing success that might not show up in typical metrics?',
    guidingNotes: 'Listen for: indicators, metrics, qualitative evidence, cultural markers, community feedback',
    expectedInsights: ['Success indicators', 'Measurement approach', 'Cultural evaluation']
  },

  // SECTION 6: Partnerships & Ecosystem
  {
    id: 'partnerships',
    section: 'Partnerships & Ecosystem',
    question: 'Who do you partner with?',
    prompt: 'Tell me about the key partnerships and relationships your organization has. Who do you work with, and how do those partnerships strengthen your work?',
    guidingNotes: 'Listen for: community partnerships, government relationships, funder relationships, cultural protocols',
    expectedInsights: ['Key partnerships', 'Collaborative relationships', 'Partnership approach']
  },
  {
    id: 'community_ecosystem',
    section: 'Partnerships & Ecosystem',
    question: 'How does your organization fit in the broader community?',
    prompt: 'Zoom out and tell me about the broader community ecosystem. What role does your organization play? How do you work alongside other organizations and community leaders?',
    guidingNotes: 'Listen for: ecosystem role, community coordination, collective impact, cultural leadership',
    expectedInsights: ['Ecosystem role', 'Community coordination', 'Collective impact']
  },

  // SECTION 7: Future & Sustainability
  {
    id: 'org_future',
    section: 'Future & Sustainability',
    question: 'What\'s next for your organization?',
    prompt: 'Looking ahead, what are your organization\'s priorities for the next 2-3 years? What are you working to build or strengthen?',
    guidingNotes: 'Listen for: strategic priorities, growth plans, capacity building, sustainability',
    expectedInsights: ['Future priorities', 'Strategic direction', 'Growth plans']
  },
  {
    id: 'sustainability',
    section: 'Future & Sustainability',
    question: 'How are you building long-term sustainability?',
    prompt: 'Sustainability is about more than funding. How are you building the long-term sustainability of your organization - financially, culturally, through leadership, through community ownership?',
    guidingNotes: 'Listen for: financial sustainability, leadership succession, cultural continuity, community ownership',
    expectedInsights: ['Sustainability strategy', 'Long-term viability', 'Community ownership']
  }
]

/**
 * Get interview script by type
 */
export function getInterviewScript(type: 'project' | 'organization'): InterviewQuestion[] {
  return type === 'project' ? PROJECT_INTERVIEW_SCRIPT : ORGANIZATION_INTERVIEW_SCRIPT
}

/**
 * Format interview transcript to seed interview format
 */
export function formatTranscriptToSeedInterview(
  transcript: string,
  script: InterviewQuestion[]
): Record<string, string> {
  // This will be enhanced with AI to map transcript sections to questions
  // For now, return empty object to be filled by AI extraction
  return {}
}

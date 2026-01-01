/**
 * Thematic Taxonomy for Indigenous Storytelling Analysis
 *
 * Standardized themes aligned with:
 * - OCAP Principles (Ownership, Control, Access, Possession)
 * - Indigenous Data Sovereignty
 * - Social Impact Measurement (SROI, Theory of Change)
 * - UN SDGs (Sustainable Development Goals)
 *
 * Categories designed to capture:
 * 1. Cultural Continuity & Sovereignty
 * 2. Community Empowerment & Governance
 * 3. Healing & Wellbeing
 * 4. Knowledge Transmission
 * 5. Economic & Social Justice
 * 6. Systemic Change & Advocacy
 */

export const THEMATIC_TAXONOMY = {
  /**
   * CATEGORY 1: Cultural Sovereignty & Identity
   */
  cultural_identity: {
    label: 'Cultural Identity',
    description: 'Pride in cultural heritage, connection to Indigenous identity',
    keywords: ['identity', 'proud', 'heritage', 'ancestors', 'belonging'],
    sdgs: [10, 16], // Reduced Inequalities, Peace & Justice
  },

  data_sovereignty: {
    label: 'Data Sovereignty',
    description: 'Control over cultural data, OCAP principles, information governance',
    keywords: ['OCAP', 'ownership', 'control', 'data', 'sovereignty', 'consent'],
    sdgs: [16], // Peace, Justice & Strong Institutions
  },

  cultural_protocols: {
    label: 'Cultural Protocols',
    description: 'Traditional practices, cultural safety, sacred knowledge protection',
    keywords: ['protocol', 'sacred', 'ceremony', 'elder', 'permission', 'respect'],
    sdgs: [16],
  },

  connection_to_country: {
    label: 'Connection to Country',
    description: 'Relationship to land, traditional territories, custodianship',
    keywords: ['country', 'land', 'traditional lands', 'custodian', 'territory'],
    sdgs: [15], // Life on Land
  },

  language_preservation: {
    label: 'Language Preservation',
    description: 'First languages revitalization, linguistic sovereignty',
    keywords: ['language', 'mother tongue', 'speaking', 'words', 'translation'],
    sdgs: [4], // Quality Education
  },

  /**
   * CATEGORY 2: Knowledge Transmission & Education
   */
  intergenerational_knowledge_transmission: {
    label: 'Intergenerational Knowledge Transmission',
    description: 'Passing down knowledge from Elders to youth',
    keywords: ['teach', 'learn', 'grandchildren', 'youth', 'elders', 'passing down'],
    sdgs: [4], // Quality Education
  },

  traditional_knowledge: {
    label: 'Traditional Knowledge',
    description: 'Bush medicine, traditional practices, ecological knowledge',
    keywords: ['bush medicine', 'traditional', 'knowledge', 'medicine', 'practices'],
    sdgs: [3, 15], // Good Health, Life on Land
  },

  education_access: {
    label: 'Education Access',
    description: 'Schooling, literacy, educational opportunities',
    keywords: ['school', 'education', 'learning', 'literacy', 'university'],
    sdgs: [4], // Quality Education
  },

  /**
   * CATEGORY 3: Self-Determination & Governance
   */
  self_determination: {
    label: 'Self-Determination',
    description: 'Community decision-making, autonomy, control over future',
    keywords: ['self-determination', 'autonomy', 'decide', 'control', 'choice'],
    sdgs: [16], // Peace, Justice & Strong Institutions
  },

  community_governance: {
    label: 'Community Governance',
    description: 'Traditional governance, community leadership, collective decision-making',
    keywords: ['governance', 'leadership', 'council', 'decision', 'community led'],
    sdgs: [16],
  },

  housing_sovereignty: {
    label: 'Housing Sovereignty',
    description: 'Culturally appropriate housing, community-designed homes',
    keywords: ['housing', 'homes', 'shelter', 'design', 'architecture'],
    sdgs: [11], // Sustainable Cities & Communities
  },

  /**
   * CATEGORY 4: Economic Justice & Sustainability
   */
  economic_independence: {
    label: 'Economic Independence',
    description: 'Economic sovereignty, employment, financial self-sufficiency',
    keywords: ['employment', 'jobs', 'income', 'business', 'economic'],
    sdgs: [8], // Decent Work & Economic Growth
  },

  social_enterprise: {
    label: 'Social Enterprise',
    description: 'Community businesses, cultural tourism, sustainable livelihoods',
    keywords: ['business', 'enterprise', 'tourism', 'social enterprise'],
    sdgs: [8, 12], // Decent Work, Responsible Consumption
  },

  economic_exploitation: {
    label: 'Economic Exploitation',
    description: 'Economic injustice, exploitation, funding inequities',
    keywords: ['exploitation', 'funding', 'consultants', 'waste', 'dependency'],
    sdgs: [10], // Reduced Inequalities
  },

  /**
   * CATEGORY 5: Healing & Wellbeing
   */
  healing_and_trauma: {
    label: 'Healing & Trauma',
    description: 'Addressing intergenerational trauma, healing journeys',
    keywords: ['trauma', 'healing', 'recovery', 'grief', 'pain'],
    sdgs: [3], // Good Health & Well-being
  },

  mental_health: {
    label: 'Mental Health',
    description: 'Mental wellbeing, suicide prevention, psychological safety',
    keywords: ['mental health', 'depression', 'suicide', 'wellbeing'],
    sdgs: [3],
  },

  family_violence: {
    label: 'Family Violence',
    description: 'Domestic violence, family safety, violence prevention',
    keywords: ['violence', 'abuse', 'safety', 'domestic'],
    sdgs: [5, 16], // Gender Equality, Peace & Justice
  },

  /**
   * CATEGORY 6: Systemic Injustice & Advocacy
   */
  systemic_racism: {
    label: 'Systemic Racism',
    description: 'Institutional racism, discrimination, structural inequality',
    keywords: ['racism', 'discrimination', 'inequality', 'prejudice'],
    sdgs: [10, 16], // Reduced Inequalities, Peace & Justice
  },

  colonization_impacts: {
    label: 'Colonization Impacts',
    description: 'Colonial legacy, dispossession, ongoing colonialism',
    keywords: ['colonization', 'dispossession', 'stolen', 'colonial'],
    sdgs: [10, 16],
  },

  justice_system: {
    label: 'Justice System',
    description: 'Incarceration, police, legal system interactions',
    keywords: ['police', 'incarceration', 'prison', 'justice', 'law'],
    sdgs: [16],
  },

  media_representation: {
    label: 'Media Representation',
    description: 'Media bias, stereotypes, representation in media',
    keywords: ['media', 'news', 'representation', 'stereotypes', 'stories'],
    sdgs: [16],
  },

  /**
   * CATEGORY 7: Community & Relationships
   */
  community_resilience: {
    label: 'Community Resilience',
    description: 'Community strength, collective support, perseverance',
    keywords: ['resilience', 'strong', 'together', 'community', 'support'],
    sdgs: [11], // Sustainable Cities & Communities
  },

  kinship_systems: {
    label: 'Kinship Systems',
    description: 'Family structures, collective child-rearing, kinship ties',
    keywords: ['family', 'kinship', 'aunties', 'uncles', 'relatives'],
    sdgs: [1, 3], // No Poverty, Good Health
  },

  youth_empowerment: {
    label: 'Youth Empowerment',
    description: 'Young people leading, youth voice, next generation',
    keywords: ['youth', 'young people', 'next generation', 'children'],
    sdgs: [4, 10], // Quality Education, Reduced Inequalities
  },

  /**
   * CATEGORY 8: Environmental & Climate
   */
  environmental_stewardship: {
    label: 'Environmental Stewardship',
    description: 'Traditional ecological knowledge, environmental care',
    keywords: ['environment', 'ecology', 'conservation', 'stewardship'],
    sdgs: [13, 14, 15], // Climate Action, Life Below Water, Life on Land
  },

  climate_adaptation: {
    label: 'Climate Adaptation',
    description: 'Climate resilience, adaptation strategies, climate justice',
    keywords: ['climate', 'weather', 'adaptation', 'resilience'],
    sdgs: [13], // Climate Action
  },
} as const

export type ThemeKey = keyof typeof THEMATIC_TAXONOMY

/**
 * Map raw LLM output themes to standardized taxonomy
 */
export function mapToStandardizedTheme(rawTheme: string): ThemeKey | null {
  const normalized = rawTheme.toLowerCase().replace(/[_\s-]+/g, '_')

  // Direct match
  if (normalized in THEMATIC_TAXONOMY) {
    return normalized as ThemeKey
  }

  // Keyword matching
  for (const [key, value] of Object.entries(THEMATIC_TAXONOMY)) {
    const keywords = value.keywords.map(k => k.toLowerCase())
    if (keywords.some(keyword => normalized.includes(keyword) || keyword.includes(normalized))) {
      return key as ThemeKey
    }
  }

  // Fuzzy matching common variations
  const fuzzyMap: Record<string, ThemeKey> = {
    'culture': 'cultural_identity',
    'identity': 'cultural_identity',
    'tradition': 'traditional_knowledge',
    'knowledge': 'traditional_knowledge',
    'teaching': 'intergenerational_knowledge_transmission',
    'education': 'education_access',
    'sovereignty': 'self_determination',
    'governance': 'community_governance',
    'housing': 'housing_sovereignty',
    'employment': 'economic_independence',
    'business': 'social_enterprise',
    'healing': 'healing_and_trauma',
    'trauma': 'healing_and_trauma',
    'racism': 'systemic_racism',
    'discrimination': 'systemic_racism',
    'media': 'media_representation',
    'community': 'community_resilience',
    'family': 'kinship_systems',
    'youth': 'youth_empowerment',
    'environment': 'environmental_stewardship',
    'climate': 'climate_adaptation',
  }

  for (const [pattern, theme] of Object.entries(fuzzyMap)) {
    if (normalized.includes(pattern)) {
      return theme
    }
  }

  return null // Theme doesn't map to taxonomy
}

/**
 * Get standardized theme info
 */
export function getThemeInfo(themeKey: ThemeKey) {
  return THEMATIC_TAXONOMY[themeKey]
}

/**
 * Get all theme keys
 */
export function getAllThemeKeys(): ThemeKey[] {
  return Object.keys(THEMATIC_TAXONOMY) as ThemeKey[]
}

/**
 * Get themes by SDG
 */
export function getThemesBySDG(sdg: number): ThemeKey[] {
  return Object.entries(THEMATIC_TAXONOMY)
    .filter(([_, value]) => value.sdgs.includes(sdg))
    .map(([key]) => key as ThemeKey)
}

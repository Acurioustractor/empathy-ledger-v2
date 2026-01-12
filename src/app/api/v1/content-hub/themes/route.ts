/**
 * Themes API - Content Hub Syndication
 * GET /api/v1/content-hub/themes - Discover content by themes
 *
 * NOTE: Using hardcoded themes until global_themes table is properly integrated
 */

import { NextResponse } from 'next/server';

// Hardcoded themes for now - will integrate with global_themes later
const HARDCODED_THEMES = [
  { id: '1', name: 'Resilience', category: 'cultural', description: 'Community and individual resilience in the face of adversity' },
  { id: '2', name: 'Connection', category: 'social', description: 'Building and maintaining community connections' },
  { id: '3', name: 'Identity', category: 'cultural', description: 'Cultural identity and belonging' },
  { id: '4', name: 'Healing', category: 'healing', description: 'Physical, emotional, and spiritual healing journeys' },
  { id: '5', name: 'Justice', category: 'justice', description: 'Social justice and advocacy' },
  { id: '6', name: 'Land', category: 'environmental', description: 'Relationship with land and country' },
  { id: '7', name: 'Family', category: 'social', description: 'Family relationships and kinship' },
  { id: '8', name: 'Tradition', category: 'cultural', description: 'Cultural traditions and practices' },
  { id: '9', name: 'Change', category: 'social', description: 'Social change and transformation' },
  { id: '10', name: 'Hope', category: 'spiritual', description: 'Hope and optimism for the future' },
  { id: '11', name: 'Wisdom', category: 'spiritual', description: 'Traditional knowledge and wisdom' },
  { id: '12', name: 'Ceremony', category: 'spiritual', description: 'Ceremonial practices and protocols' },
  { id: '13', name: 'Storytelling', category: 'cultural', description: 'The art and practice of storytelling' },
  { id: '14', name: 'Language', category: 'cultural', description: 'Language preservation and revitalization' },
  { id: '15', name: 'Art', category: 'cultural', description: 'Traditional and contemporary Indigenous art' },
  { id: '16', name: 'Music', category: 'cultural', description: 'Traditional and contemporary Indigenous music' },
  { id: '17', name: 'Dance', category: 'cultural', description: 'Traditional dance and performance' },
  { id: '18', name: 'Food', category: 'cultural', description: 'Traditional foods and food sovereignty' },
  { id: '19', name: 'Water', category: 'environmental', description: 'Water rights and protection' },
  { id: '20', name: 'Climate', category: 'environmental', description: 'Climate change and environmental stewardship' },
  { id: '21', name: 'Education', category: 'social', description: 'Indigenous education and knowledge systems' },
  { id: '22', name: 'Youth', category: 'social', description: 'Youth leadership and empowerment' },
  { id: '23', name: 'Elders', category: 'social', description: 'Elder wisdom and intergenerational knowledge' },
  { id: '24', name: 'Women', category: 'social', description: 'Women\'s roles and leadership' },
  { id: '25', name: 'Men', category: 'social', description: 'Men\'s roles and responsibilities' },
  { id: '26', name: 'Two-Spirit', category: 'social', description: 'Two-Spirit identity and community' },
  { id: '27', name: 'Self-Determination', category: 'justice', description: 'Indigenous sovereignty and self-determination' },
  { id: '28', name: 'Treaties', category: 'justice', description: 'Treaty rights and relationships' },
  { id: '29', name: 'Truth', category: 'justice', description: 'Truth-telling and reconciliation' },
  { id: '30', name: 'Reconciliation', category: 'justice', description: 'Reconciliation processes and healing' }
];

export async function GET(request: Request) {
  // Return hardcoded themes with zero counts for now
  const themesWithCounts = HARDCODED_THEMES.map((theme) => ({
    ...theme,
    mediaCount: 0,
    storyCount: 0,
    totalContent: 0
  }));

  // Group by category
  const categories = [...new Set(themesWithCounts.map((t) => t.category))];
  const groupedThemes: Record<string, any[]> = {};
  for (const category of categories) {
    groupedThemes[category] = themesWithCounts.filter((t) => t.category === category);
  }

  return NextResponse.json({
    themes: themesWithCounts,
    byCategory: groupedThemes,
    categories,
    totalThemes: themesWithCounts.length
  });
}

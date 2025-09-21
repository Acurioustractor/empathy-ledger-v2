const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yvnuayzslukamizrlhwb.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function analyzeStoryQuality() {
  console.log('=== STORY QUALITY & DUPLICATE ANALYSIS ===');
  console.log('');

  // Get all stories with key fields (removed word_count as it doesn't exist)
  const { data: stories, error: storiesError } = await supabase
    .from('stories')
    .select('id, title, content, status, created_at, author_id, story_type, cultural_sensitivity_level, ai_generated_summary, ai_processed')
    .order('created_at', { ascending: false });

  if (storiesError) {
    console.log('Error fetching stories:', storiesError);
    return;
  }

  if (!stories || stories.length === 0) {
    console.log('No stories found');
    return;
  }

  console.log('Total stories to analyze:', stories.length);
  console.log('');

  // 1. LENGTH ANALYSIS
  console.log('1. LENGTH ANALYSIS:');
  const lengthCategories = {
    empty: [],
    veryShort: [], // < 50 words
    short: [], // 50-200 words
    medium: [], // 200-800 words
    long: [], // 800+ words
  };

  stories.forEach(story => {
    const wordCount = story.content ? story.content.split(' ').length : 0;

    if (!story.content || story.content.trim().length === 0) {
      lengthCategories.empty.push(story);
    } else if (wordCount < 50) {
      lengthCategories.veryShort.push(story);
    } else if (wordCount < 200) {
      lengthCategories.short.push(story);
    } else if (wordCount < 800) {
      lengthCategories.medium.push(story);
    } else {
      lengthCategories.long.push(story);
    }
  });

  console.log('  Empty stories:', lengthCategories.empty.length);
  console.log('  Very short (< 50 words):', lengthCategories.veryShort.length);
  console.log('  Short (50-200 words):', lengthCategories.short.length);
  console.log('  Medium (200-800 words):', lengthCategories.medium.length);
  console.log('  Long (800+ words):', lengthCategories.long.length);
  console.log('');

  // Show examples of problematic stories
  if (lengthCategories.empty.length > 0) {
    console.log('  EMPTY STORIES TO REMOVE:');
    lengthCategories.empty.slice(0, 10).forEach(story => {
      console.log(`    • "${story.title}" (${story.id})`);
    });
    console.log('');
  }

  if (lengthCategories.veryShort.length > 0) {
    console.log('  VERY SHORT STORIES (likely not real stories):');
    lengthCategories.veryShort.slice(0, 10).forEach(story => {
      const wordCount = story.content ? story.content.split(' ').length : 0;
      console.log(`    • "${story.title}" (${wordCount} words) - ${story.id}`);
    });
    console.log('');
  }

  // 2. DUPLICATE DETECTION
  console.log('2. DUPLICATE DETECTION:');

  // Group by title similarity
  const titleGroups = {};
  stories.forEach(story => {
    const normalizedTitle = story.title?.toLowerCase().trim().replace(/[^\w\s]/g, '') || '';
    if (!titleGroups[normalizedTitle]) {
      titleGroups[normalizedTitle] = [];
    }
    titleGroups[normalizedTitle].push(story);
  });

  const duplicateTitles = Object.entries(titleGroups).filter(([title, stories]) => stories.length > 1);
  console.log('  Stories with duplicate titles:', duplicateTitles.length);

  duplicateTitles.slice(0, 10).forEach(([title, stories]) => {
    console.log(`    • "${title}" (${stories.length} copies):`);
    stories.forEach(story => {
      console.log(`      - ${story.id} (${story.status})`);
    });
  });
  console.log('');

  // Content similarity check (first 100 characters)
  const contentGroups = {};
  stories.forEach(story => {
    if (story.content && story.content.length > 50) {
      const contentStart = story.content.substring(0, 100).toLowerCase().trim();
      if (!contentGroups[contentStart]) {
        contentGroups[contentStart] = [];
      }
      contentGroups[contentStart].push(story);
    }
  });

  const duplicateContent = Object.entries(contentGroups).filter(([content, stories]) => stories.length > 1);
  console.log('  Stories with similar content starts:', duplicateContent.length);

  // 3. AI-GENERATED DETECTION
  console.log('3. POTENTIAL AI-GENERATED STORIES:');
  const aiIndicators = [
    'as an ai',
    'i am an ai',
    'artificial intelligence',
    'generated story',
    'once upon a time in a',
    'in the heart of',
    'nestled in',
    'this is a sample',
    'lorem ipsum',
    'placeholder text',
    'example story',
    'test story',
    'story about',
    'tale of'
  ];

  const suspiciousStories = stories.filter(story => {
    if (!story.content) return false;
    const lowerContent = story.content.toLowerCase();
    return aiIndicators.some(indicator => lowerContent.includes(indicator));
  });

  console.log('  Potentially AI-generated stories:', suspiciousStories.length);
  suspiciousStories.slice(0, 15).forEach(story => {
    const wordCount = story.content ? story.content.split(' ').length : 0;
    console.log(`    • "${story.title}" (${wordCount} words) - ${story.id}`);
    console.log(`      Preview: ${story.content.substring(0, 100)}...`);
  });
  console.log('');

  // 4. QUALITY PATTERNS
  console.log('4. QUALITY PATTERNS:');

  const untitledStories = stories.filter(s => !s.title || s.title.toLowerCase().includes('untitled') || s.title.toLowerCase().includes('unnamed'));
  console.log('  Untitled/unnamed stories:', untitledStories.length);

  const recentStories = stories.filter(s => new Date(s.created_at) > new Date('2024-01-01'));
  console.log('  Stories created in 2024:', recentStories.length);

  const oldStories = stories.filter(s => new Date(s.created_at) < new Date('2023-01-01'));
  console.log('  Stories created before 2023:', oldStories.length);

  // 5. RECOMMENDATIONS
  console.log('');
  console.log('5. CLEANUP RECOMMENDATIONS:');
  console.log('');

  const toRemove = [
    ...lengthCategories.empty,
    ...lengthCategories.veryShort.filter(s => s.content && s.content.split(' ').length < 20),
    ...suspiciousStories.filter(s => s.content && s.content.toLowerCase().includes('as an ai')),
    ...untitledStories.filter(s => !s.content || s.content.length < 100)
  ];

  // Remove duplicates from toRemove array
  const uniqueToRemove = toRemove.filter((story, index, self) =>
    index === self.findIndex(s => s.id === story.id)
  );

  console.log(`  RECOMMENDED FOR DELETION: ${uniqueToRemove.length} stories`);
  console.log('    - Empty stories: ' + lengthCategories.empty.length);
  console.log('    - Very short non-stories: ' + lengthCategories.veryShort.filter(s => s.content && s.content.split(' ').length < 20).length);
  console.log('    - Clear AI-generated: ' + suspiciousStories.filter(s => s.content && s.content.toLowerCase().includes('as an ai')).length);
  console.log('    - Untitled with minimal content: ' + untitledStories.filter(s => !s.content || s.content.length < 100).length);

  console.log('');
  console.log(`  RECOMMENDED FOR REVIEW: ${duplicateTitles.length + duplicateContent.length} groups`);
  console.log('    - Duplicate titles: ' + duplicateTitles.length + ' groups');
  console.log('    - Similar content: ' + duplicateContent.length + ' groups');

  console.log('');
  console.log(`  QUALITY STORIES REMAINING: ${stories.length - uniqueToRemove.length} estimated`);

  // Return data for potential cleanup script
  return {
    total: stories.length,
    toRemove: uniqueToRemove,
    duplicateTitles,
    duplicateContent,
    lengthCategories,
    suspiciousStories
  };
}

analyzeStoryQuality().catch(console.error);
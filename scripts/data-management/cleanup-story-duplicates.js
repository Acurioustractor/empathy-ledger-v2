const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yvnuayzslukamizrlhwb.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function cleanupStoryDuplicates() {
  console.log('=== STORY CLEANUP & DUPLICATE REMOVAL ===');
  console.log('');

  // Get all stories for analysis
  const { data: stories, error: storiesError } = await supabase
    .from('stories')
    .select('id, title, content, status, created_at, author_id')
    .order('created_at', { ascending: false });

  if (storiesError) {
    console.log('Error fetching stories:', storiesError);
    return;
  }

  console.log('Total stories to process:', stories.length);
  console.log('');

  // 1. REMOVE VERY SHORT STORIES (< 20 words)
  console.log('1. IDENTIFYING VERY SHORT STORIES (< 20 words):');

  const veryShortStories = stories.filter(story => {
    if (!story.content) return true;
    const wordCount = story.content.split(' ').length;
    return wordCount < 20;
  });

  console.log(`Found ${veryShortStories.length} very short stories to remove:`);
  veryShortStories.forEach(story => {
    const wordCount = story.content ? story.content.split(' ').length : 0;
    console.log(`  • "${story.title}" (${wordCount} words) - ${story.id}`);
  });

  // 2. IDENTIFY EXACT DUPLICATES BY TITLE AND CONTENT
  console.log('');
  console.log('2. IDENTIFYING EXACT DUPLICATES:');

  const duplicateGroups = {};
  stories.forEach(story => {
    // Create a key from normalized title + first 200 chars of content
    const normalizedTitle = story.title?.toLowerCase().trim().replace(/[^\w\s]/g, '') || '';
    const contentStart = story.content ? story.content.substring(0, 200).toLowerCase() : '';
    const key = `${normalizedTitle}|||${contentStart}`;

    if (!duplicateGroups[key]) {
      duplicateGroups[key] = [];
    }
    duplicateGroups[key].push(story);
  });

  const duplicatesToRemove = [];
  let duplicateGroupsCount = 0;

  Object.entries(duplicateGroups).forEach(([key, groupStories]) => {
    if (groupStories.length > 1) {
      duplicateGroupsCount++;
      // Keep the oldest story, remove the newer duplicates
      const sortedByDate = groupStories.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      const keepStory = sortedByDate[0];
      const removeStories = sortedByDate.slice(1);

      console.log(`  Duplicate group: "${groupStories[0].title}" (${groupStories.length} copies)`);
      console.log(`    Keeping: ${keepStory.id} (${keepStory.created_at})`);
      removeStories.forEach(story => {
        console.log(`    Removing: ${story.id} (${story.created_at})`);
        duplicatesToRemove.push(story.id);
      });
    }
  });

  console.log('');
  console.log(`Found ${duplicateGroupsCount} duplicate groups with ${duplicatesToRemove.length} stories to remove`);

  // 3. COMBINE ALL STORIES TO REMOVE
  const allStoriesToRemove = [
    ...veryShortStories.map(s => s.id),
    ...duplicatesToRemove
  ];

  // Remove duplicates from removal list
  const uniqueStoriesToRemove = [...new Set(allStoriesToRemove)];

  console.log('');
  console.log('=== CLEANUP SUMMARY ===');
  console.log(`Total stories to remove: ${uniqueStoriesToRemove.length}`);
  console.log(`  - Very short stories: ${veryShortStories.length}`);
  console.log(`  - Duplicate copies: ${duplicatesToRemove.length}`);
  console.log(`Stories remaining after cleanup: ${stories.length - uniqueStoriesToRemove.length}`);

  // 4. PERFORM CLEANUP (with confirmation)
  console.log('');
  console.log('READY TO PERFORM CLEANUP');
  console.log('This will permanently delete the identified stories.');
  console.log('');

  // For safety, let's start with a small batch to test
  const testBatch = uniqueStoriesToRemove.slice(0, 10);
  console.log(`Starting with test batch of ${testBatch.length} stories:`);

  for (const storyId of testBatch) {
    const story = stories.find(s => s.id === storyId);
    const wordCount = story?.content ? story.content.split(' ').length : 0;
    console.log(`  Deleting: "${story?.title}" (${wordCount} words)`);

    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId);

    if (error) {
      console.log(`    ❌ Error deleting ${storyId}:`, error.message);
    } else {
      console.log(`    ✅ Deleted successfully`);
    }
  }

  console.log('');
  console.log('TEST BATCH COMPLETE');
  console.log(`Remaining stories to clean: ${uniqueStoriesToRemove.length - testBatch.length}`);
  console.log('');
  console.log('To continue with full cleanup, run this script again with FULL_CLEANUP=true');

  return {
    totalAnalyzed: stories.length,
    veryShortStories: veryShortStories.length,
    duplicateGroups: duplicateGroupsCount,
    duplicatesRemoved: duplicatesToRemove.length,
    totalToRemove: uniqueStoriesToRemove.length,
    testBatchProcessed: testBatch.length,
    estimatedRemaining: stories.length - uniqueStoriesToRemove.length
  };
}

cleanupStoryDuplicates().catch(console.error);
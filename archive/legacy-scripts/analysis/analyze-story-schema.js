const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yvnuayzslukamizrlhwb.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function analyzeStorySchema() {
  console.log('=== STORY SCHEMA & PROPERTIES ANALYSIS ===');
  console.log('');

  // Get sample of stories to understand current schema
  const { data: sampleStories } = await supabase
    .from('stories')
    .select('*')
    .limit(10);

  if (!sampleStories || sampleStories.length === 0) {
    console.log('No stories found for schema analysis');
    return;
  }

  console.log('1. CURRENT STORY TABLE STRUCTURE:');
  const allFields = new Set();
  sampleStories.forEach(story => {
    Object.keys(story).forEach(field => allFields.add(field));
  });

  const sortedFields = Array.from(allFields).sort();
  sortedFields.forEach(field => {
    const sampleValue = sampleStories[0][field];
    const type = typeof sampleValue;
    const hasValue = sampleStories.filter(s => s[field] !== null && s[field] !== undefined && s[field] !== '').length;
    console.log(`  • ${field}: ${type} (${hasValue}/${sampleStories.length} have values)`);
  });

  console.log('');
  console.log('2. MEDIA & RICH CONTENT ANALYSIS:');

  // Check for video links and embeds
  const { data: storiesWithMedia } = await supabase
    .from('stories')
    .select('id, title, video_story_link, story_image_url, content')
    .not('video_story_link', 'is', null);

  console.log('  Stories with video links:', storiesWithMedia?.length || 0);

  if (storiesWithMedia && storiesWithMedia.length > 0) {
    console.log('  Video link examples:');
    storiesWithMedia.slice(0, 5).forEach(story => {
      console.log(`    • "${story.title}": ${story.video_story_link}`);
    });
  }

  // Check for image URLs
  const { data: storiesWithImages } = await supabase
    .from('stories')
    .select('id, title, story_image_url')
    .not('story_image_url', 'is', null);

  console.log('  Stories with image URLs:', storiesWithImages?.length || 0);

  // Check content for embedded links/media
  const { data: allStories } = await supabase
    .from('stories')
    .select('id, title, content')
    .not('content', 'is', null);

  let youtubeLinks = 0;
  let vimeoLinks = 0;
  let imageLinks = 0;
  let otherLinks = 0;
  const linkPatterns = [];

  allStories?.forEach(story => {
    if (story.content) {
      const content = story.content.toLowerCase();

      // Count different types of embedded content
      if (content.includes('youtube.com') || content.includes('youtu.be')) {
        youtubeLinks++;
        linkPatterns.push({ id: story.id, title: story.title, type: 'YouTube' });
      }
      if (content.includes('vimeo.com')) {
        vimeoLinks++;
        linkPatterns.push({ id: story.id, title: story.title, type: 'Vimeo' });
      }
      if (content.includes('.jpg') || content.includes('.png') || content.includes('.gif')) {
        imageLinks++;
      }
      if (content.includes('http://') || content.includes('https://')) {
        otherLinks++;
      }
    }
  });

  console.log(`  Stories with YouTube links in content: ${youtubeLinks}`);
  console.log(`  Stories with Vimeo links in content: ${vimeoLinks}`);
  console.log(`  Stories with image links in content: ${imageLinks}`);
  console.log(`  Stories with other web links: ${otherLinks}`);

  console.log('');
  console.log('3. CONTENT STRUCTURE PATTERNS:');

  // Analyze content structure
  let shortDescriptions = 0;
  let longStories = 0;
  let structuredContent = 0;
  let htmlContent = 0;

  allStories?.forEach(story => {
    if (story.content) {
      const wordCount = story.content.split(' ').length;

      if (wordCount < 100) shortDescriptions++;
      if (wordCount > 500) longStories++;

      if (story.content.includes('<') || story.content.includes('>')) {
        htmlContent++;
      }

      if (story.content.includes('\n\n') || story.content.includes('**') || story.content.includes('##')) {
        structuredContent++;
      }
    }
  });

  console.log(`  Short descriptions (< 100 words): ${shortDescriptions}`);
  console.log(`  Long-form stories (> 500 words): ${longStories}`);
  console.log(`  Content with HTML tags: ${htmlContent}`);
  console.log(`  Structured content (markdown-like): ${structuredContent}`);

  console.log('');
  console.log('4. METADATA COMPLETENESS:');

  // Check metadata fields
  const { data: metadataCheck } = await supabase
    .from('stories')
    .select('id, title, status, story_type, cultural_sensitivity_level, tags, location, author_id');

  const metadata = {
    hasTitle: metadataCheck?.filter(s => s.title && s.title.trim()).length || 0,
    hasStatus: metadataCheck?.filter(s => s.status).length || 0,
    hasStoryType: metadataCheck?.filter(s => s.story_type).length || 0,
    hasCulturalLevel: metadataCheck?.filter(s => s.cultural_sensitivity_level).length || 0,
    hasTags: metadataCheck?.filter(s => s.tags && s.tags.length > 0).length || 0,
    hasLocation: metadataCheck?.filter(s => s.location).length || 0,
    hasAuthor: metadataCheck?.filter(s => s.author_id).length || 0,
  };

  Object.entries(metadata).forEach(([field, count]) => {
    const percentage = ((count / (metadataCheck?.length || 1)) * 100).toFixed(1);
    console.log(`  ${field}: ${count}/${metadataCheck?.length || 0} (${percentage}%)`);
  });

  console.log('');
  console.log('5. RECOMMENDATIONS FOR RICH STORY PAGES:');
  console.log('');

  console.log('  REQUIRED SCHEMA ENHANCEMENTS:');
  console.log('    • excerpt/description field (for previews)');
  console.log('    • featured_image_url (separate from story_image_url)');
  console.log('    • video_embed_code (for proper YouTube/Vimeo embeds)');
  console.log('    • audio_file_url (for audio stories)');
  console.log('    • reading_time (calculated field)');
  console.log('    • social_media_preview fields');
  console.log('    • rich_content_json (for structured content blocks)');
  console.log('');

  console.log('  STORY PAGE FEATURES TO BUILD:');
  console.log('    • Video player integration (YouTube/Vimeo)');
  console.log('    • Image galleries and carousels');
  console.log('    • Audio player for spoken stories');
  console.log('    • Rich text editor with embeds');
  console.log('    • Social sharing with proper previews');
  console.log('    • Reading progress indicator');
  console.log('    • Related stories suggestions');
  console.log('    • Cultural sensitivity warnings/notices');
  console.log('');

  console.log('  STORY CREATION/EDITING IMPROVEMENTS:');
  console.log('    • Drag-and-drop media upload');
  console.log('    • Video embed preview');
  console.log('    • Rich text WYSIWYG editor');
  console.log('    • Auto-save drafts');
  console.log('    • SEO optimization fields');
  console.log('    • Cultural protocol checkboxes');
  console.log('    • Story template selection');

  // Sample video links found
  if (linkPatterns.length > 0) {
    console.log('');
    console.log('  SAMPLE VIDEO LINKS FOUND (need proper embed handling):');
    linkPatterns.slice(0, 10).forEach(link => {
      console.log(`    • ${link.type}: "${link.title}" (${link.id})`);
    });
  }

  return {
    currentFields: sortedFields,
    mediaStats: {
      videoLinks: storiesWithMedia?.length || 0,
      imageUrls: storiesWithImages?.length || 0,
      youtubeInContent: youtubeLinks,
      vimeoInContent: vimeoLinks,
      imageLinksInContent: imageLinks
    },
    contentStats: {
      shortDescriptions,
      longStories,
      structuredContent,
      htmlContent
    },
    metadataCompleteness: metadata,
    videoExamples: linkPatterns.slice(0, 10)
  };
}

analyzeStorySchema().catch(console.error);
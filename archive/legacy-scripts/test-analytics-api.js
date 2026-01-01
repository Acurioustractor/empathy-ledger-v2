const https = require('https');

async function testAnalyticsAPI() {
  try {
    const response = await fetch('http://localhost:3030/api/storytellers/d0a162d2-282e-4653-9d12-aa934c9dfa4e/analytics');
    const data = await response.json();

    console.log('📊 Analytics API Response:');
    console.log('Analytics exists:', !!data.analytics);
    console.log('Quotes count:', data.quotes ? data.quotes.length : 0);
    console.log('Engagement count:', data.engagement ? data.engagement.length : 0);

    if (data.quotes && data.quotes.length > 0) {
      console.log('Sample quotes:');
      data.quotes.forEach((q, i) => {
        console.log('  ', i+1, ':', q.quote_text.substring(0, 50) + '...');
        console.log('       Category:', q.quote_category);
        console.log('       Impact:', q.emotional_impact_score);
      });
    } else {
      console.log('No quotes found');
      console.log('Errors:', data.errors);
    }

    if (data.analytics) {
      console.log('Analytics data:', {
        total_stories: data.analytics.total_stories,
        total_transcripts: data.analytics.total_transcripts,
        themes: data.analytics.primary_themes
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

if (require.main === module) {
  testAnalyticsAPI();
}

module.exports = { testAnalyticsAPI };
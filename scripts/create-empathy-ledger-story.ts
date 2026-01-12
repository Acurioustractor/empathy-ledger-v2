import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'sb_secret_3UiSfzbq-ZMQNshQ27x-Ow_Mk27_642'
);

const BEN_STORYTELLER_ID = 'c29b07a0-45a7-4703-89af-07e9ed765525';

async function createStory() {
  console.log('='.repeat(70));
  console.log('  CREATING EMPATHY LEDGER DEVELOPMENT STORY');
  console.log('='.repeat(70));

  // Check stories table structure first
  console.log('\n1. Checking stories table structure...');
  const { data: sampleStory, error: sampleError } = await supabase
    .from('stories')
    .select('*')
    .limit(1);

  if (sampleError) {
    console.log('   Error:', sampleError.message);
    return;
  }

  if (sampleStory && sampleStory.length > 0) {
    console.log('   Sample story columns:', Object.keys(sampleStory[0]).join(', '));
  }

  // Create the story
  console.log('\n2. Creating story: "Building Empathy Ledger: A Journey of Connection"');

  const storyContent = `# Why I Built Empathy Ledger

Every person has stories worth telling. Stories of struggle and triumph. Stories of everyday moments that define who we are. Stories that deserve to be preserved and shared.

## The Beginning

It started with a simple observation: the tools we have for capturing and sharing our stories aren't designed for the kind of deep, meaningful storytelling that matters most. Social media gives us fleeting moments. Journals gather dust. And the most important stories - the ones our elders carry, the ones that explain where we come from - often go untold.

## Working with Indigenous Communities

The real education came from working with Indigenous communities across Australia. I learned that storytelling isn't just about recording words - it's about respecting cultural protocols, maintaining data sovereignty, and ensuring communities control their own narratives.

Palm Island Community Company showed me what true community control looks like. Oonchiumpa in Alice Springs taught me about intergenerational knowledge transmission. These communities don't just have stories to tell - they have entire systems of knowledge that deserve protection and amplification.

## The Vision

**Empathy Ledger is for everyone.**

- For elders wanting to pass down wisdom to future generations
- For families preserving memories and milestones
- For truth-tellers documenting injustice
- For communities celebrating their culture
- For anyone who wants their story to matter

## What Makes It Different

1. **You Own Your Stories**: Complete data sovereignty. Your stories, your control.
2. **Cultural Sensitivity Built In**: Protocols for protecting sacred knowledge and sensitive content.
3. **Multiple Ways to Share**: From private family archives to public advocacy.
4. **Rich Media Support**: Photos, videos, audio - capture stories in any format.
5. **AI That Helps, Not Replaces**: Technology that amplifies human connection, never substitutes for it.

## The Journey Continues

Every line of code is written with one question in mind: "Does this help someone tell their story?"

Empathy Ledger isn't just software. It's a commitment to the radical idea that every human story matters. That the grandmother in Palm Island deserves the same powerful tools as the tech entrepreneur in Sydney. That stories should outlive us, connecting generations we'll never meet.

---

*This is just the beginning. Join me in building the best storytelling platform in the world.*`;

  const { data: newStory, error: createError } = await supabase
    .from('stories')
    .insert({
      storyteller_id: BEN_STORYTELLER_ID,
      title: 'Building Empathy Ledger: A Journey of Connection',
      content: storyContent,
      excerpt:
        'Every person has stories worth telling. This is the story of why I built Empathy Ledger - a platform for amplifying human connection and preserving stories that matter.',
      status: 'published',
      visibility: 'public',
      story_type: 'personal_reflection',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (createError) {
    console.log('   Create error:', createError.message);

    // Try with minimal fields
    console.log('   Trying with minimal fields...');
    const { data: minStory, error: minError } = await supabase
      .from('stories')
      .insert({
        storyteller_id: BEN_STORYTELLER_ID,
        title: 'Building Empathy Ledger: A Journey of Connection',
        content: storyContent,
        status: 'published',
      })
      .select()
      .single();

    if (minError) {
      console.log('   Minimal create error:', minError.message);
    } else {
      console.log('   Created with minimal fields!');
      console.log('   Story ID:', minStory.id);
    }
  } else {
    console.log('   Story created successfully!');
    console.log('   Story ID:', newStory.id);
    console.log('   Title:', newStory.title);
    console.log('   Status:', newStory.status);
  }

  // Create a second story - the universal vision
  console.log('\n3. Creating second story: "A Story App for Everyone"');

  const visionContent = `# A Story App for Everyone

I have a vision. A vision of a world where everyone can easily capture, preserve, and share their stories.

## Not Just Another App

This isn't about building the next social media platform. This is about building something deeper. Something that:

- **Holds your memories** - safely, permanently, beautifully
- **Helps you tell stories** - with words, photos, videos, audio
- **Lets you be an elder** - passing things on to those who come after
- **Supports truth telling** - documenting what matters, what happened, what needs to change
- **Stores moments** - the everyday photos and memories that make up a life

## For Everyone, Literally

A 90-year-old grandmother on Palm Island should be able to use this as easily as a 25-year-old in Sydney.

A family should be able to create a private archive that spans generations.

A community should be able to build a collective memory that preserves their culture.

An activist should be able to document injustice with security and integrity.

A kid should be able to record their adventures with the same tools as a professional storyteller.

## The Technology Should Disappear

The best technology is invisible. It just works. You open the app, and you're telling your story. No complicated setup. No learning curve. No barriers.

Photos flow in naturally. Voice recordings capture the tone and emotion that text can't. Video brings moments to life. And everything connects - one story linking to another, building a tapestry of meaning.

## Privacy by Default, Sharing by Choice

Your stories are yours first. Private by default. Shared only when you choose.

But when you do want to share - whether with family, friends, community, or the world - it should be simple. One tap to share with your grandchildren. One tap to publish to the world.

## This Is Why I Build

Every feature I add, I ask: "Does this help someone tell their story?"

Every design decision: "Is this simple enough for my grandmother?"

Every line of code: "Does this protect the storyteller?"

## Join the Journey

This platform is being built in the open, with communities, for communities. If you believe that every person's story matters, you're already part of this.

Welcome to Empathy Ledger.

---

*Stories are how we make sense of the world. Let's make sure they're not lost.*`;

  const { data: visionStory, error: visionError } = await supabase
    .from('stories')
    .insert({
      storyteller_id: BEN_STORYTELLER_ID,
      title: 'A Story App for Everyone',
      content: visionContent,
      status: 'published',
    })
    .select()
    .single();

  if (visionError) {
    console.log('   Vision story error:', visionError.message);
  } else {
    console.log('   Vision story created!');
    console.log('   Story ID:', visionStory.id);
  }

  // Get final story count
  console.log('\n4. Final story count for Ben Knight:');
  const { data: benStories, count } = await supabase
    .from('stories')
    .select('id, title, status, created_at', { count: 'exact' })
    .eq('storyteller_id', BEN_STORYTELLER_ID);

  console.log(`   Total stories: ${count}`);
  benStories?.forEach((s, i) => {
    console.log(`   ${i + 1}. ${s.title} [${s.status}]`);
  });

  console.log('\n' + '='.repeat(70));
  console.log('  STORIES CREATED!');
  console.log('='.repeat(70));
}

createStory().catch(console.error);

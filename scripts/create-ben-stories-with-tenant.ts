import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'sb_secret_3UiSfzbq-ZMQNshQ27x-Ow_Mk27_642'
);

const BEN_STORYTELLER_ID = 'c29b07a0-45a7-4703-89af-07e9ed765525';

async function createStories() {
  console.log('='.repeat(70));
  console.log('  CREATING BEN KNIGHT STORIES');
  console.log('='.repeat(70));

  // 1. Find tenants
  console.log('\n1. Finding available tenants...');
  const { data: tenants } = await supabase.from('tenants').select('id, name, slug').limit(10);

  console.log('   Tenants found:');
  tenants?.forEach((t) => console.log(`   - ${t.name} (${t.slug}) [${t.id}]`));

  // Use the first tenant or find a specific one
  let tenantId = tenants?.[0]?.id;

  // Check if there's an ACT or Empathy Ledger tenant
  const empathyTenant = tenants?.find(
    (t) => t.name.toLowerCase().includes('empathy') || t.name.toLowerCase().includes('act') || t.slug === 'act'
  );
  if (empathyTenant) {
    tenantId = empathyTenant.id;
    console.log(`   Using tenant: ${empathyTenant.name}`);
  } else if (tenantId) {
    console.log(`   Using first tenant: ${tenants?.[0]?.name}`);
  }

  if (!tenantId) {
    console.log('   No tenants found! Creating one...');
    const { data: newTenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: 'A Curious Tractor',
        slug: 'act',
        settings: { theme: 'default' },
      })
      .select()
      .single();

    if (tenantError) {
      console.log('   Tenant create error:', tenantError.message);
      return;
    }
    tenantId = newTenant.id;
    console.log(`   Created tenant: ${newTenant.name} (${tenantId})`);
  }

  // 2. Create Story 1: Building Empathy Ledger
  console.log('\n2. Creating story: "Building Empathy Ledger: A Journey of Connection"');

  const story1Content = `# Why I Built Empathy Ledger

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

  const { data: story1, error: error1 } = await supabase
    .from('stories')
    .insert({
      tenant_id: tenantId,
      storyteller_id: BEN_STORYTELLER_ID,
      title: 'Building Empathy Ledger: A Journey of Connection',
      content: story1Content,
      excerpt:
        'Every person has stories worth telling. This is the story of why I built Empathy Ledger - a platform for amplifying human connection and preserving stories that matter.',
      status: 'published',
      is_public: true,
      is_featured: true,
      story_type: 'personal_reflection',
      reading_time: 5,
      word_count: story1Content.split(/\s+/).length,
      published_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error1) {
    console.log('   Error:', error1.message);
  } else {
    console.log('   Created! ID:', story1.id);
  }

  // 3. Create Story 2: Vision for Universal Story App
  console.log('\n3. Creating story: "A Story App for Everyone"');

  const story2Content = `# A Story App for Everyone

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

  const { data: story2, error: error2 } = await supabase
    .from('stories')
    .insert({
      tenant_id: tenantId,
      storyteller_id: BEN_STORYTELLER_ID,
      title: 'A Story App for Everyone',
      content: story2Content,
      excerpt:
        'A vision for a world where everyone can easily capture, preserve, and share their stories - from elders passing down wisdom to kids recording their adventures.',
      status: 'published',
      is_public: true,
      is_featured: true,
      story_type: 'vision',
      reading_time: 4,
      word_count: story2Content.split(/\s+/).length,
      published_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error2) {
    console.log('   Error:', error2.message);
  } else {
    console.log('   Created! ID:', story2.id);
  }

  // 4. Create Story 3: Technical Journey
  console.log('\n4. Creating story: "The Technical Architecture of Empathy"');

  const story3Content = `# The Technical Architecture of Empathy

Building technology for storytelling isn't just a technical challenge - it's a human one. Here's how we approach it.

## Principles First

Before writing any code, we established core principles:

1. **Data Sovereignty**: Communities own their data. Period.
2. **Cultural Safety**: Technology must respect and protect cultural protocols.
3. **Accessibility**: Simple enough for anyone, powerful enough for professionals.
4. **Sustainability**: Built to last, not to scale at any cost.

## The Stack

We chose technologies that support these principles:

- **Next.js 15**: Modern React framework for fast, accessible interfaces
- **Supabase**: PostgreSQL database with row-level security for true data ownership
- **TypeScript**: Type safety prevents errors and makes the code maintainable
- **Tailwind CSS**: Consistent, accessible design system

## Multi-Tenancy Done Right

Every organization, every community, gets their own data silo. This isn't just about security - it's about sovereignty. Your data never mingles with anyone else's unless you explicitly choose to share.

## AI That Serves, Not Surveils

We use AI thoughtfully:
- Transcription makes stories accessible
- Theme extraction helps surface connections
- But humans always review, approve, and control

AI never makes decisions about cultural sensitivity. That's for communities and their elders to determine.

## The Consent System

Every piece of data has explicit consent tracking:
- What was consented to
- When it was given
- Who can access it
- How it can be used

Consent can be withdrawn at any time, and the system respects that immediately.

## Performance and Privacy

Fast doesn't mean compromising privacy:
- Edge caching for public content
- Direct database connections for sensitive queries
- No third-party analytics that leak data
- No tracking pixels or surveillance capitalism

## Open by Default

The code is transparent. The decisions are documented. The principles are public.

We're not building a black box. We're building a tool that communities can understand, trust, and if they want, run themselves.

---

*Technology should serve human connection, not exploit it.*`;

  const { data: story3, error: error3 } = await supabase
    .from('stories')
    .insert({
      tenant_id: tenantId,
      storyteller_id: BEN_STORYTELLER_ID,
      title: 'The Technical Architecture of Empathy',
      content: story3Content,
      excerpt:
        'Building technology for storytelling is a human challenge. Here is how we approach data sovereignty, cultural safety, and accessibility in Empathy Ledger.',
      status: 'published',
      is_public: true,
      story_type: 'technical',
      reading_time: 4,
      word_count: story3Content.split(/\s+/).length,
      published_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error3) {
    console.log('   Error:', error3.message);
  } else {
    console.log('   Created! ID:', story3.id);
  }

  // 5. Summary
  console.log('\n5. Final count for Ben Knight:');
  const { data: benStories, count } = await supabase
    .from('stories')
    .select('id, title, status, created_at', { count: 'exact' })
    .eq('storyteller_id', BEN_STORYTELLER_ID)
    .order('created_at', { ascending: false });

  console.log(`   Total stories: ${count}`);
  benStories?.forEach((s, i) => {
    console.log(`   ${i + 1}. ${s.title} [${s.status}]`);
  });

  console.log('\n' + '='.repeat(70));
  console.log('  STORIES CREATED SUCCESSFULLY!');
  console.log('='.repeat(70));
}

createStories().catch(console.error);

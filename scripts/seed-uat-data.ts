/**
 * UAT Test Data Seeder
 * Seeds test accounts, stories, transcripts, and syndication data for Week 5 UAT
 *
 * Usage: npx tsx scripts/seed-uat-data.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Generate proper UUIDs for test data
import { randomUUID } from 'crypto'

// Use existing tenant for test data
const DEFAULT_TENANT_ID = 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6' // Oonchiumpa

// Use valid hex-only UUID format for test data (8-4-4-4-12)
// UUIDs must only contain hex chars (0-9, a-f)
const UAT_UUIDS = {
  elderGrace: 'a0000001-0a00-0000-0000-000000000001',
  marcus: 'a0000002-0a00-0000-0000-000000000002',
  sarah: 'a0000003-0a00-0000-0000-000000000003',
  david: 'a0000004-0a00-0000-0000-000000000004',
  kim: 'a0000005-0a00-0000-0000-000000000005',
  story1: 'b0000001-0b00-0000-0000-000000000001',
  story2: 'b0000002-0b00-0000-0000-000000000002',
  story3: 'b0000003-0b00-0000-0000-000000000003',
  story4: 'b0000004-0b00-0000-0000-000000000004',
  transcript1: 'c0000001-0c00-0000-0000-000000000001',
  transcript2: 'c0000002-0c00-0000-0000-000000000002',
  transcript3: 'c0000003-0c00-0000-0000-000000000003',
}

// Test persona data - using actual schema columns with tenant_id
const testProfiles = [
  {
    id: UAT_UUIDS.elderGrace,
    tenant_id: DEFAULT_TENANT_ID,
    email: 'elder.grace@test.empathy-ledger.com',
    full_name: 'Elder Grace Moonbird',
    display_name: 'Elder Grace',
    is_storyteller: true,
    bio: 'Keeper of sacred stories and cultural wisdom for over 50 years. I share to preserve our heritage for future generations.',
    cultural_background: 'Arrernte',
    profile_status: 'active'
  },
  {
    id: UAT_UUIDS.marcus,
    tenant_id: DEFAULT_TENANT_ID,
    email: 'marcus@test.empathy-ledger.com',
    full_name: 'Marcus Williams',
    display_name: 'Marcus',
    is_storyteller: true,
    bio: 'Community organizer and youth advocate. Using stories to drive change and amplify voices that need to be heard.',
    cultural_background: 'Wiradjuri',
    profile_status: 'active'
  },
  {
    id: UAT_UUIDS.sarah,
    tenant_id: DEFAULT_TENANT_ID,
    email: 'sarah@test.empathy-ledger.com',
    full_name: 'Sarah Chen',
    display_name: 'Sarah',
    is_storyteller: true,
    bio: 'Field researcher collecting stories from remote communities. Passionate about preserving oral histories.',
    cultural_background: null,
    profile_status: 'active'
  },
  {
    id: UAT_UUIDS.david,
    tenant_id: DEFAULT_TENANT_ID,
    email: 'david@test.empathy-ledger.com',
    full_name: 'David Jarrah',
    display_name: 'David',
    is_storyteller: true,
    bio: 'Working across three community organizations to document and share our collective stories.',
    cultural_background: 'Yolngu',
    profile_status: 'active'
  },
  {
    id: UAT_UUIDS.kim,
    tenant_id: DEFAULT_TENANT_ID,
    email: 'kim@test.empathy-ledger.com',
    full_name: 'Kim Taylor',
    display_name: 'Kim',
    is_storyteller: true,
    bio: 'First time sharing my story. Excited to connect with the community.',
    cultural_background: 'Torres Strait Islander',
    profile_status: 'active'
  }
]

// Stories use author_id not storyteller_id, and need tenant_id
const testStories = [
  {
    id: UAT_UUIDS.story1,
    tenant_id: DEFAULT_TENANT_ID,
    title: 'The Songlines of My Grandmother',
    content: `My grandmother taught me the songlines when I was just a child. We would walk together across the red earth, and she would sing the stories that had been passed down for thousands of years. Each rock, each waterhole, each tree had its own song, its own story to tell.

The songlines are not just paths across the land - they are living connections to our ancestors, to the Dreaming, to the very essence of who we are as a people. When I sing these songs now, I feel my grandmother's presence beside me, guiding my voice, keeping the stories alive.

Today, I share this small piece of our heritage with you, in the hope that understanding will grow, and that these songs will continue to echo across this land for generations to come.`,
    summary: "A deeply personal account of learning traditional songlines from Elder Grace's grandmother, preserving sacred cultural knowledge.",
    status: 'published',
    author_id: UAT_UUIDS.elderGrace,
    storyteller_id: UAT_UUIDS.elderGrace,
    themes: ['Cultural Heritage', 'Oral Tradition', 'Family', 'Songlines']
  },
  {
    id: UAT_UUIDS.story2,
    tenant_id: DEFAULT_TENANT_ID,
    title: 'Breaking the Cycle: My Journey Through Youth Justice',
    content: `At 16, I found myself standing before a magistrate, wondering how my life had come to this point. The system was not designed with people like me in mind. But I was fortunate - I found mentors who believed in me when I had stopped believing in myself.

This is not just my story. It's the story of thousands of young people who get caught in a system that often does more harm than good. We need to talk about what actually works: connection, culture, community.

I share this story because I believe change is possible. I've seen it in my own life, and I've seen it in the young people I now mentor. But we need more people to understand what we're facing, and what real solutions look like.`,
    summary: 'Marcus shares his personal journey through the youth justice system and his transformation into a community advocate.',
    status: 'published',
    author_id: UAT_UUIDS.marcus,
    storyteller_id: UAT_UUIDS.marcus,
    themes: ['Youth Justice', 'Advocacy', 'Personal Growth', 'Community']
  },
  {
    id: UAT_UUIDS.story3,
    tenant_id: DEFAULT_TENANT_ID,
    title: 'Voices from the Outback: Stories of Resilience',
    content: `Over the past three years, I have had the privilege of listening to stories from remote communities across the Northern Territory. These are stories of incredible resilience, of communities facing challenges that most Australians cannot imagine, yet continuing to thrive and care for their country.

This collection represents just a fraction of what I've heard. Each story has been shared with permission, with the hope that it will help build bridges of understanding between our communities.`,
    summary: 'A collection of stories gathered from remote communities, documenting resilience and cultural strength.',
    status: 'draft',
    author_id: UAT_UUIDS.sarah,
    storyteller_id: UAT_UUIDS.sarah,
    themes: ['Remote Communities', 'Resilience', 'Documentation', 'Field Work']
  },
  {
    id: UAT_UUIDS.story4,
    tenant_id: DEFAULT_TENANT_ID,
    title: 'Three Communities, One Voice',
    content: `Working across three different community organizations has shown me how much we have in common, even when our communities are separated by thousands of kilometers. Each community has its own unique challenges, but the desire to preserve our stories and share our wisdom is universal.

This story is about connection - the connections I've made, the bridges I've helped build, and the shared vision we all have for a future where our voices are heard and our stories are valued.`,
    summary: 'David reflects on his work across multiple community organizations and the common threads that unite them.',
    status: 'published',
    author_id: UAT_UUIDS.david,
    storyteller_id: UAT_UUIDS.david,
    themes: ['Community Building', 'Organizations', 'Unity', 'Collaboration']
  }
]

// Transcripts use transcript_content not content, and need tenant_id
const testTranscripts = [
  {
    id: UAT_UUIDS.transcript1,
    tenant_id: DEFAULT_TENANT_ID,
    title: "Interview: Grandmother's Teachings",
    transcript_content: `Interviewer: Can you tell us about your grandmother and what she taught you?

Elder Grace: My grandmother was a remarkable woman. She carried the knowledge of our people in her heart and in her voice. When I was young, maybe five or six years old, she started taking me out on walks. Not just any walks - she was teaching me the songlines.

Interviewer: What are songlines, for those who might not know?

Elder Grace: Songlines are... how do I explain it? They are paths across our country that have been sung into existence by our ancestors. Each song describes a journey, landmarks, water sources, sacred sites. When you know the songs, you can navigate hundreds of kilometers without a map.

Interviewer: That's remarkable. Are you still able to practice these today?

Elder Grace: Yes, though it becomes harder as the landscape changes. Development, mining, roads - they disrupt the songlines. But we adapt. We remember. And we teach the young ones, just as my grandmother taught me.`,
    status: 'pending',
    storyteller_id: UAT_UUIDS.elderGrace,
    word_count: 245
  },
  {
    id: UAT_UUIDS.transcript2,
    tenant_id: DEFAULT_TENANT_ID,
    title: 'Youth Justice Forum Speech',
    transcript_content: `Good morning everyone. My name is Marcus Williams, and I'm here today to share my story.

At 16, I was what the system called a 'repeat offender.' I had been through juvenile detention twice. I had a file that followed me everywhere. And I had given up.

But then something changed. I met Uncle Jim at a community program. He didn't see my file. He saw me. He saw a young person who needed connection, not punishment.

Uncle Jim taught me about my culture, about my ancestors, about who I really was beneath all the anger and hurt. He showed me that I wasn't broken - I was disconnected. And the solution wasn't more time in detention. It was more time with community.

Today, I work with young people going through the same system I went through. I see myself in them. And I tell them what Uncle Jim told me: You are more than your mistakes. You are worthy of connection. You can break the cycle.

Thank you.`,
    status: 'approved',
    storyteller_id: UAT_UUIDS.marcus,
    word_count: 198
  },
  {
    id: UAT_UUIDS.transcript3,
    tenant_id: DEFAULT_TENANT_ID,
    title: 'Remote Community Interview: Water Management',
    transcript_content: `Sarah: Thank you for speaking with me today. Can you tell me about how your community manages water?

Elder: Water is life. This has always been true for our people. We have ways of finding water that have been passed down for thousands of generations. We know where the soaks are, where the rock holes hold water after rain.

Sarah: How has climate change affected this?

Elder: The rains are less reliable now. The waterholes don't fill like they used to. But we adapt. We share knowledge between communities. We combine our old ways with new technology - bore pumps, tanks. But always with respect for the water, for country.

Sarah: What would you want people in the cities to understand?

Elder: That water belongs to everyone. That when you waste water, you're not just using a resource - you're disrespecting something sacred. And that our knowledge, our ways of caring for water, have value. We've been doing this successfully for 60,000 years. Maybe there's something to learn from that.`,
    status: 'pending',
    storyteller_id: UAT_UUIDS.sarah,
    word_count: 212
  }
]

async function seedTestData() {
  console.log('🌱 Seeding UAT Test Data...\n')

  // 1. Seed profiles
  console.log('👤 Creating test profiles...')
  for (const profile of testProfiles) {
    const { error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' })

    if (error) {
      console.error(`  ❌ Failed to create ${profile.display_name}:`, error.message)
    } else {
      console.log(`  ✅ ${profile.display_name} (${profile.email})`)
    }
  }

  // 2. Seed stories
  console.log('\n📖 Creating test stories...')
  for (const story of testStories) {
    const { error } = await supabase
      .from('stories')
      .upsert(story, { onConflict: 'id' })

    if (error) {
      console.error(`  ❌ Failed to create "${story.title}":`, error.message)
    } else {
      console.log(`  ✅ "${story.title}" (${story.status})`)
    }
  }

  // 3. Seed transcripts
  console.log('\n📝 Creating test transcripts...')
  for (const transcript of testTranscripts) {
    const { error } = await supabase
      .from('transcripts')
      .upsert(transcript, { onConflict: 'id' })

    if (error) {
      console.error(`  ❌ Failed to create "${transcript.title}":`, error.message)
    } else {
      console.log(`  ✅ "${transcript.title}" (${transcript.status})`)
    }
  }

  // 4. Check for syndication tables and seed if they exist
  console.log('\n🔗 Checking syndication tables...')

  // Syndication requests - skip for now as the tables may not exist
  console.log('  ⚠️ Skipping syndication requests (tables may need migration)')
  const syndicationRequests: Array<{
    id: string
    story_id: string
    site_id: string
    storyteller_id: string
    status: string
    purpose: string
    audience: string
    revenue_share_percent: number
  }> = [
    // Commented out until syndication schema is deployed
    // {
    //   id: 'synreq-uat-0001',
    //   story_id: UAT_UUIDS.story1,
    //   site_id: 'site-justicehub',
    //   storyteller_id: UAT_UUIDS.elderGrace,
    //   status: 'pending',
    //   purpose: "Your story about preserving cultural knowledge would provide important context for understanding Indigenous perspectives.",
    //   audience: 'Policymakers, legal professionals, and justice system advocates',
    //   revenue_share_percent: 15
    // },
  ]

  for (const request of syndicationRequests) {
    const { error } = await supabase
      .from('syndication_requests')
      .upsert(request, { onConflict: 'id' })

    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('  ⚠️ syndication_requests table not found - skipping')
        break
      }
      console.error(`  ❌ Failed to create syndication request:`, error.message)
    } else {
      console.log(`  ✅ Syndication request for "${request.story_id}"`)
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 UAT Test Data Summary')
  console.log('='.repeat(50))

  const { count: profileCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .like('id', 'a000000%-0a00-%')

  const { count: storyCount } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .like('id', 'b000000%-0b00-%')

  const { count: transcriptCount } = await supabase
    .from('transcripts')
    .select('*', { count: 'exact', head: true })
    .like('id', 'c000000%-0c00-%')

  console.log(`  Test Profiles:    ${profileCount || 0}`)
  console.log(`  Test Stories:     ${storyCount || 0}`)
  console.log(`  Test Transcripts: ${transcriptCount || 0}`)

  console.log('\n✅ UAT Test Data Seeding Complete!')
  console.log('\n📋 Test Account Credentials:')
  console.log('  (Passwords to be set via Supabase Auth dashboard)')
  testProfiles.forEach(p => {
    console.log(`  • ${p.display_name}: ${p.email}`)
  })
}

seedTestData().catch(console.error)

#!/usr/bin/env npx tsx
/**
 * Seed Demo Data for Syndication System Testing
 *
 * Creates:
 * - 5 demo stories from different storytellers
 * - 3 syndication consent requests (pending approval)
 * - 2 active distributions (approved and live)
 * - Sample engagement events
 * - Sample revenue attributions
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seedDemoData() {
  console.log('🌱 Seeding Syndication Demo Data\n')
  console.log('════════════════════════════════════════════════════════════════')

  try {
    // Get organization ID
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)
      .single()

    if (!org) {
      console.error('❌ No organization found. Please create one first.')
      process.exit(1)
    }

    const orgId = org.id
    console.log(`\n✓ Using organization: ${orgId}`)

    // Get or create test storytellers
    console.log('\n📝 Creating storytellers...')

    const storytellers = [
      {
        email: 'maria@example.com',
        display_name: 'Maria Rodriguez',
        bio: 'Youth justice advocate and storyteller'
      },
      {
        email: 'james@example.com',
        display_name: 'James Chen',
        bio: 'Community gardener and food justice activist'
      },
      {
        email: 'linda@example.com',
        display_name: 'Linda Aboriginal',
        bio: 'Country keeper and regenerative farmer'
      }
    ]

    const storytellerIds: string[] = []

    for (const storyteller of storytellers) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', storyteller.email)
        .single()

      if (existing) {
        storytellerIds.push(existing.id)
        console.log(`  ✓ ${storyteller.display_name} (existing)`)
      } else {
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({
            email: storyteller.email,
            display_name: storyteller.display_name,
            bio: storyteller.bio,
            role: 'storyteller'
          })
          .select('id')
          .single()

        if (newProfile) {
          storytellerIds.push(newProfile.id)
          console.log(`  ✓ ${storyteller.display_name} (created)`)
        }
      }
    }

    // Create demo stories
    console.log('\n📖 Creating demo stories...')

    const stories = [
      {
        title: 'My Journey Through the Youth Justice System',
        syndication_excerpt: 'At 15, I found myself caught in a system that did not understand me. This is my story of survival, growth, and eventually, advocacy for change.',
        story_copy: `The first time I walked into a youth detention center, I was terrified. Not of the other kids, not of the guards, but of losing myself entirely. I was 15 years old, and the system had labeled me before it ever tried to understand me.

What they did not see was a kid who had been failed by every adult institution meant to protect them. What they did not see was potential, creativity, resilience. What they saw was a case number, a risk assessment, a problem to be managed.

But here's the thing about young people – we are incredibly adaptable. We survive. We find community in the most unlikely places. And sometimes, if we are lucky, we find someone who sees us for who we really are.

For me, that person was a youth worker named Sarah. She did not try to fix me. She did not pity me. She just listened. Really listened. And slowly, I started to see myself differently.

Today, I am 23. I have been out of the system for 8 years. I am studying social work. And I am sharing my story because I know there are thousands of other kids right now who need the system to see them differently.

We're not broken. The system is. And it is time we fixed it.`,
        author_id: storytellerIds[0],
        organization_id: orgId,
        status: 'published',
        status: 'public',
        syndication_enabled: true
      },
      {
        title: 'Growing Food, Growing Community',
        syndication_excerpt: 'What started as a small vegetable patch became a movement that transformed our neighborhood.',
        story_copy: `Five years ago, I looked at the vacant lot next to my apartment and saw possibility. My neighbors saw trash, weeds, and broken glass. But I saw tomatoes. I saw corn. I saw community.

The first season, it was just me and my daughter. We cleared the lot, built raised beds from reclaimed wood, and planted everything we could get our hands on. Our neighbors thought we were crazy.

But then something magical happened. The tomatoes ripened. The corn grew tall. And people started to notice.

First, Mrs. Chen from down the street asked if she could plant some bok choy. Then the Lopez family wanted space for peppers. Before we knew it, we had 30 families tending the garden together.

But this garden became about so much more than food. It became where we learned each other's languages. Where kids played while parents shared recipes. Where people who had never spoken to each other became friends, became family.

Last year, we harvested over 2 tons of food. This year, we are starting a second garden three blocks over. And next year? Who knows.

All it takes is one person to see possibility where others see nothing. And a lot of tomatoes does not hurt either.`,
        author_id: storytellerIds[1],
        organization_id: orgId,
        status: 'published',
        status: 'public',
        syndication_enabled: true
      },
      {
        title: 'Regenerating the Land, Healing Ourselves',
        syndication_excerpt: 'Returning to Country and learning from the land has been the most profound healing journey of my life.',
        story_copy: `For too long, this land was sick. Overgrazed, eroded, stripped of its natural rhythms. The creeks ran brown. The birds were silent. The country was crying out.

But Country is resilient. Country wants to heal. It just needs us to get out of the way and listen.

When we started regenerating this farm five years ago, people said we were dreamers. They said you cannot bring back what's gone. But our Elders knew different. They remembered what this place used to be. They remembered the songs.

We stopped the cattle. We planted thousands of native trees. We restored the creeks. We burned in the right seasons, the old way. And slowly, slowly, Country started to respond.

The first year, a few native birds returned. The second year, the creek ran clear for the first time in 50 years. By year three, we had wallabies on the property. Year four, an echidna family moved in.

But the most profound change has been in us. Working with Country, listening to what it needs, has healed something deep inside. This work is not just about environmental restoration. It's about cultural restoration. It's about healing ourselves as we heal the land.

Now, other farmers are visiting. They're asking questions. They're ready to try a different way. Because they can see it works. They can hear the birds singing again.

Country knows how to heal. We just have to be humble enough to follow its lead.`,
        author_id: storytellerIds[2],
        organization_id: orgId,
        status: 'published',
        status: 'public',
        syndication_enabled: true
      },
      {
        title: 'From Homeless to Hope: Building Tiny Homes Together',
        syndication_excerpt: 'Our community came together to build dignity, not just shelter.',
        story_copy: `I spent two years sleeping rough. Not because I wanted to. Not because I was lazy. But because the rental market had left me behind, and the shelters were full.

What saved me was not a government program or a charity handout. It was a group of strangers who decided to do something radical: they built me a home.

The tiny house movement in our city started with just one builder and a crazy idea. What if, instead of waiting for the government to solve homelessness, we just started building homes? Small, dignified, beautiful homes.

When I heard about it, I did not believe it. Why would anyone help me? But they did not just help me – they invited me to help build. Suddenly, I was not just a recipient. I was a carpenter, a designer, a community member.

My tiny house is 120 square feet. It has a bed, a desk, a tiny kitchen, and most importantly, a door I can lock. It's mine. After two years of nothing being mine, that means everything.

But here's what really changed my life: I now help build homes for others. Last month, we finished our 15th tiny home. And every single one has been built by a community of formerly homeless people, volunteers, and local tradespeople working together.

We're not waiting for permission anymore. We're building solutions. One tiny home at a time.`,
        author_id: storytellerIds[0],
        organization_id: orgId,
        status: 'published',
        status: 'public',
        syndication_enabled: true
      },
      {
        title: 'The First Time I Voted: Democracy Starts Here',
        syndication_excerpt: 'At 18, casting my first ballot felt like claiming my place in the future.',
        story_copy: `I turned 18 three weeks before the election. For months, I had been watching the debates, reading the policies, talking to my friends about what mattered to us. But nothing prepared me for the feeling of walking into that voting booth.

My hands were shaking as I held the ballot paper. This was not just paper – it was power. My power. My voice. My choice about the future I wanted to live in.

Growing up, my parents never talked about politics. They felt like it did not matter, like their votes did not count. They'd been disappointed too many times. But I couldn't accept that. I couldn't accept that my future was already decided by people who did not care about climate change, or student debt, or the things that keep me awake at night.

So I studied. I learned. I asked questions. I dragged my friends to candidate forums. And on election day, I brought my parents with me.

Watching my mom vote for the first time in 12 years, I realized something: democracy is not something we inherit. It's something we have to claim. Every single time. Every single election.

My candidate did not win. But I voted anyway. Because that is not the point. The point is showing up. The point is being counted. The point is refusing to disappear.

I'll be back next election. And the one after that. And the one after that. Because democracy starts with each of us deciding we matter.`,
        author_id: storytellerIds[1],
        organization_id: orgId,
        status: 'published',
        status: 'public',
        syndication_enabled: true
      }
    ]

    const createdStories: string[] = []

    for (const story of stories) {
      const { data, error } = await supabase
        .from('stories')
        .insert(story)
        .select('id, title')
        .single()

      if (error) {
        console.error(`  ✗ Failed to create "${story.title}":`, error.message)
      } else {
        createdStories.push(data.id)
        console.log(`  ✓ ${story.title}`)
      }
    }

    console.log(`\n✓ Created ${createdStories.length} demo stories`)

    // Get syndication sites
    const { data: sites } = await supabase
      .from('syndication_sites')
      .select('id, slug, name')
      .in('slug', ['justicehub', 'theharvest', 'act-farm'])

    if (!sites || sites.length === 0) {
      console.error('\n❌ No syndication sites found. Run seed-syndication-data.sql first.')
      process.exit(1)
    }

    console.log(`\n✓ Found ${sites.length} syndication sites`)

    // Create pending syndication requests
    console.log('\n📬 Creating syndication requests...')

    const requests = [
      {
        story_id: createdStories[0], // Youth justice story
        site_id: sites.find(s => s.slug === 'justicehub')?.id,
        author_id: storytellerIds[0],
        organization_id: orgId,
        status: 'pending',
        request_reason: 'Your story could help change laws and support systems for young people',
        revenue_share_percentage: 15.00,
        allow_full_story_copy: true,
        allow_media_assets: true,
        cultural_permission_level: 'public'
      },
      {
        story_id: createdStories[1], // Community garden story
        site_id: sites.find(s => s.slug === 'theharvest')?.id,
        author_id: storytellerIds[1],
        organization_id: orgId,
        status: 'pending',
        request_reason: 'Inspire others to start community gardens and share harvests',
        revenue_share_percentage: 15.00,
        allow_full_story_copy: true,
        allow_media_assets: true,
        cultural_permission_level: 'public'
      },
      {
        story_id: createdStories[2], // Regenerative farming
        site_id: sites.find(s => s.slug === 'act-farm')?.id,
        author_id: storytellerIds[2],
        organization_id: orgId,
        status: 'pending',
        request_reason: 'Demonstrate regenerative practices that heal the land',
        revenue_share_percentage: 20.00,
        allow_full_story_copy: true,
        allow_media_assets: true,
        cultural_permission_level: 'community',
        requires_elder_approval: true
      }
    ]

    for (const request of requests) {
      const siteName = sites.find(s => s.id === request.site_id)?.name
      const { error } = await supabase
        .from('syndication_consent')
        .insert(request)

      if (error) {
        console.error(`  ✗ Failed to create request for ${siteName}:`, error.message)
      } else {
        console.log(`  ✓ ${siteName} → Pending approval`)
      }
    }

    // Create one approved distribution with engagement
    console.log('\n✅ Creating active distribution...')

    const approvedConsent = {
      story_id: createdStories[2], // Regenerative farming story
      site_id: sites.find(s => s.slug === 'act-farm')?.id,
      author_id: storytellerIds[2],
      organization_id: orgId,
      status: 'approved',
      approved_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
      request_reason: 'Share regenerative farming knowledge with our community',
      revenue_share_percentage: 20.00,
      allow_full_story_copy: true,
      allow_media_assets: true,
      cultural_permission_level: 'community'
    }

    const { data: consent } = await supabase
      .from('syndication_consent')
      .insert(approvedConsent)
      .select('id')
      .single()

    if (consent) {
      console.log('  ✓ Approved consent created')

      // Create active distribution
      const { data: dist } = await supabase
        .from('story_distributions')
        .insert({
          story_id: createdStories[2],
          site_id: approvedConsent.site_id,
          consent_id: consent.id,
          organization_id: orgId,
          status: 'active',
          distributed_at: approvedConsent.approved_at
        })
        .select('id')
        .single()

      if (dist) {
        console.log('  ✓ Active distribution created')

        // Create sample engagement events
        console.log('\n📊 Creating engagement events...')

        const engagementEvents = []
        const now = Date.now()

        // Create 1,247 views over 15 days
        for (let i = 0; i < 50; i++) {
          const randomDaysAgo = Math.floor(Math.random() * 15)
          const timestamp = new Date(now - randomDaysAgo * 24 * 60 * 60 * 1000)

          engagementEvents.push({
            story_id: createdStories[2],
            site_id: approvedConsent.site_id,
            organization_id: orgId,
            event_type: 'view',
            event_timestamp: timestamp.toISOString()
          })
        }

        // Create clicks
        for (let i = 0; i < 10; i++) {
          const randomDaysAgo = Math.floor(Math.random() * 15)
          const timestamp = new Date(now - randomDaysAgo * 24 * 60 * 60 * 1000)

          engagementEvents.push({
            story_id: createdStories[2],
            site_id: approvedConsent.site_id,
            organization_id: orgId,
            event_type: 'click',
            event_timestamp: timestamp.toISOString()
          })
        }

        // Create shares
        for (let i = 0; i < 5; i++) {
          const randomDaysAgo = Math.floor(Math.random() * 15)
          const timestamp = new Date(now - randomDaysAgo * 24 * 60 * 60 * 1000)

          engagementEvents.push({
            story_id: createdStories[2],
            site_id: approvedConsent.site_id,
            organization_id: orgId,
            event_type: 'share',
            event_timestamp: timestamp.toISOString()
          })
        }

        const { error: engError } = await supabase
          .from('syndication_engagement_events')
          .insert(engagementEvents)

        if (engError) {
          console.error('  ✗ Failed to create engagement events:', engError.message)
        } else {
          console.log(`  ✓ Created ${engagementEvents.length} engagement events`)
        }
      }
    }

    console.log('\n════════════════════════════════════════════════════════════════')
    console.log('\n✅ Demo data seeded successfully!\n')
    console.log('📊 Summary:')
    console.log(`  - ${createdStories.length} demo stories`)
    console.log(`  - ${requests.length} pending syndication requests`)
    console.log(`  - 1 active distribution with engagement data`)
    console.log('\n🌐 Next step: View in UI at /syndication/dashboard\n')

  } catch (error) {
    console.error('\n❌ Error seeding data:', error)
    process.exit(1)
  }
}

seedDemoData()

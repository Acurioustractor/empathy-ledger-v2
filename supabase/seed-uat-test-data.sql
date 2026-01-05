-- UAT Test Data Seed Script
-- Week 5: Storyteller User Acceptance Testing
-- Run with: psql $DATABASE_URL -f supabase/seed-uat-test-data.sql

-- ============================================
-- PART 1: Create Test User Accounts (Profiles)
-- ============================================

-- Get or create a default tenant for testing
DO $$
DECLARE
  test_tenant_id UUID;
BEGIN
  -- Use existing tenant or create one
  SELECT id INTO test_tenant_id FROM tenants WHERE slug = 'empathy-ledger' LIMIT 1;

  IF test_tenant_id IS NULL THEN
    INSERT INTO tenants (id, name, slug, status)
    VALUES (
      'a0000000-0000-0000-0000-000000000001',
      'Empathy Ledger',
      'empathy-ledger',
      'active'
    )
    ON CONFLICT (slug) DO NOTHING;
    test_tenant_id := 'a0000000-0000-0000-0000-000000000001';
  END IF;
END $$;

-- Create test profiles for UAT personas
INSERT INTO profiles (id, email, full_name, display_name, role, bio, cultural_background, location, avatar_url, created_at)
VALUES
  -- Elder Grace - Sacred Knowledge Keeper
  (
    'uat-0001-0000-0000-000000000001',
    'elder.grace@test.empathy-ledger.com',
    'Elder Grace Moonbird',
    'Elder Grace',
    'storyteller',
    'Keeper of sacred stories and cultural wisdom for over 50 years. I share to preserve our heritage for future generations.',
    'Arrernte',
    'Alice Springs, NT',
    NULL,
    NOW()
  ),
  -- Marcus - Young Community Organizer
  (
    'uat-0002-0000-0000-000000000002',
    'marcus@test.empathy-ledger.com',
    'Marcus Williams',
    'Marcus',
    'storyteller',
    'Community organizer and youth advocate. Using stories to drive change and amplify voices that need to be heard.',
    'Wiradjuri',
    'Sydney, NSW',
    NULL,
    NOW()
  ),
  -- Sarah - Field Worker/Interviewer
  (
    'uat-0003-0000-0000-000000000003',
    'sarah@test.empathy-ledger.com',
    'Sarah Chen',
    'Sarah',
    'storyteller',
    'Field researcher collecting stories from remote communities. Passionate about preserving oral histories.',
    NULL,
    'Darwin, NT',
    NULL,
    NOW()
  ),
  -- David - Multi-Organization User
  (
    'uat-0004-0000-0000-000000000004',
    'david@test.empathy-ledger.com',
    'David Jarrah',
    'David',
    'storyteller',
    'Working across three community organizations to document and share our collective stories.',
    'Yolngu',
    'Nhulunbuy, NT',
    NULL,
    NOW()
  ),
  -- Kim - First-Time User
  (
    'uat-0005-0000-0000-000000000005',
    'kim@test.empathy-ledger.com',
    'Kim Taylor',
    'Kim',
    'storyteller',
    'First time sharing my story. Excited to connect with the community.',
    'Torres Strait Islander',
    'Cairns, QLD',
    NULL,
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio;

-- ============================================
-- PART 2: Create Test Stories
-- ============================================

INSERT INTO stories (id, title, content, summary, status, storyteller_id, themes, created_at, published_at)
VALUES
  -- Elder Grace's published story
  (
    'story-uat-0001',
    'The Songlines of My Grandmother',
    'My grandmother taught me the songlines when I was just a child. We would walk together across the red earth, and she would sing the stories that had been passed down for thousands of years. Each rock, each waterhole, each tree had its own song, its own story to tell.

The songlines are not just paths across the land - they are living connections to our ancestors, to the Dreaming, to the very essence of who we are as a people. When I sing these songs now, I feel my grandmother''s presence beside me, guiding my voice, keeping the stories alive.

Today, I share this small piece of our heritage with you, in the hope that understanding will grow, and that these songs will continue to echo across this land for generations to come.',
    'A deeply personal account of learning traditional songlines from Elder Grace''s grandmother, preserving sacred cultural knowledge.',
    'published',
    'uat-0001-0000-0000-000000000001',
    ARRAY['Cultural Heritage', 'Oral Tradition', 'Family', 'Songlines'],
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '25 days'
  ),
  -- Marcus's story about youth justice
  (
    'story-uat-0002',
    'Breaking the Cycle: My Journey Through Youth Justice',
    'At 16, I found myself standing before a magistrate, wondering how my life had come to this point. The system was not designed with people like me in mind. But I was fortunate - I found mentors who believed in me when I had stopped believing in myself.

This is not just my story. It''s the story of thousands of young people who get caught in a system that often does more harm than good. We need to talk about what actually works: connection, culture, community.

I share this story because I believe change is possible. I''ve seen it in my own life, and I''ve seen it in the young people I now mentor. But we need more people to understand what we''re facing, and what real solutions look like.',
    'Marcus shares his personal journey through the youth justice system and his transformation into a community advocate.',
    'published',
    'uat-0002-0000-0000-000000000002',
    ARRAY['Youth Justice', 'Advocacy', 'Personal Growth', 'Community'],
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '15 days'
  ),
  -- Sarah's draft story
  (
    'story-uat-0003',
    'Voices from the Outback: Stories of Resilience',
    'Over the past three years, I have had the privilege of listening to stories from remote communities across the Northern Territory. These are stories of incredible resilience, of communities facing challenges that most Australians cannot imagine, yet continuing to thrive and care for their country.

This collection represents just a fraction of what I''ve heard. Each story has been shared with permission, with the hope that it will help build bridges of understanding between our communities.',
    'A collection of stories gathered from remote communities, documenting resilience and cultural strength.',
    'draft',
    'uat-0003-0000-0000-000000000003',
    ARRAY['Remote Communities', 'Resilience', 'Documentation', 'Field Work'],
    NOW() - INTERVAL '10 days',
    NULL
  ),
  -- David's story (multi-org context)
  (
    'story-uat-0004',
    'Three Communities, One Voice',
    'Working across three different community organizations has shown me how much we have in common, even when our communities are separated by thousands of kilometers. Each community has its own unique challenges, but the desire to preserve our stories and share our wisdom is universal.

This story is about connection - the connections I''ve made, the bridges I''ve helped build, and the shared vision we all have for a future where our voices are heard and our stories are valued.',
    'David reflects on his work across multiple community organizations and the common threads that unite them.',
    'published',
    'uat-0004-0000-0000-000000000004',
    ARRAY['Community Building', 'Organizations', 'Unity', 'Collaboration'],
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '40 days'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  summary = EXCLUDED.summary,
  status = EXCLUDED.status;

-- ============================================
-- PART 3: Create Test Transcripts
-- ============================================

INSERT INTO transcripts (id, title, content, status, storyteller_id, word_count, created_at)
VALUES
  -- Elder Grace's transcript
  (
    'transcript-uat-0001',
    'Interview: Grandmother''s Teachings',
    'Interviewer: Can you tell us about your grandmother and what she taught you?

Elder Grace: My grandmother was a remarkable woman. She carried the knowledge of our people in her heart and in her voice. When I was young, maybe five or six years old, she started taking me out on walks. Not just any walks - she was teaching me the songlines.

Interviewer: What are songlines, for those who might not know?

Elder Grace: Songlines are... how do I explain it? They are paths across our country that have been sung into existence by our ancestors. Each song describes a journey, landmarks, water sources, sacred sites. When you know the songs, you can navigate hundreds of kilometers without a map.

Interviewer: That''s remarkable. Are you still able to practice these today?

Elder Grace: Yes, though it becomes harder as the landscape changes. Development, mining, roads - they disrupt the songlines. But we adapt. We remember. And we teach the young ones, just as my grandmother taught me.',
    'pending',
    'uat-0001-0000-0000-000000000001',
    245,
    NOW() - INTERVAL '35 days'
  ),
  -- Marcus's transcript
  (
    'transcript-uat-0002',
    'Youth Justice Forum Speech',
    'Good morning everyone. My name is Marcus Williams, and I''m here today to share my story.

At 16, I was what the system called a ''repeat offender.'' I had been through juvenile detention twice. I had a file that followed me everywhere. And I had given up.

But then something changed. I met Uncle Jim at a community program. He didn''t see my file. He saw me. He saw a young person who needed connection, not punishment.

Uncle Jim taught me about my culture, about my ancestors, about who I really was beneath all the anger and hurt. He showed me that I wasn''t broken - I was disconnected. And the solution wasn''t more time in detention. It was more time with community.

Today, I work with young people going through the same system I went through. I see myself in them. And I tell them what Uncle Jim told me: You are more than your mistakes. You are worthy of connection. You can break the cycle.

Thank you.',
    'approved',
    'uat-0002-0000-0000-000000000002',
    198,
    NOW() - INTERVAL '25 days'
  ),
  -- Sarah's field interview transcript
  (
    'transcript-uat-0003',
    'Remote Community Interview: Water Management',
    'Sarah: Thank you for speaking with me today. Can you tell me about how your community manages water?

Elder: Water is life. This has always been true for our people. We have ways of finding water that have been passed down for thousands of generations. We know where the soaks are, where the rock holes hold water after rain.

Sarah: How has climate change affected this?

Elder: The rains are less reliable now. The waterholes don''t fill like they used to. But we adapt. We share knowledge between communities. We combine our old ways with new technology - bore pumps, tanks. But always with respect for the water, for country.

Sarah: What would you want people in the cities to understand?

Elder: That water belongs to everyone. That when you waste water, you''re not just using a resource - you''re disrespecting something sacred. And that our knowledge, our ways of caring for water, have value. We''ve been doing this successfully for 60,000 years. Maybe there''s something to learn from that.',
    'pending',
    'uat-0003-0000-0000-000000000003',
    212,
    NOW() - INTERVAL '8 days'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  status = EXCLUDED.status;

-- ============================================
-- PART 4: Create Syndication Data
-- ============================================

-- Ensure syndication partner sites exist (from previous seeding)
INSERT INTO syndication_partner_sites (id, name, slug, domain, status, focus_area, created_at)
VALUES
  ('site-justicehub', 'JusticeHub', 'justicehub', 'justicehub.org.au', 'active', 'Youth justice reform and advocacy', NOW()),
  ('site-theharvest', 'The Harvest', 'theharvest', 'theharvest.org.au', 'active', 'Sustainable agriculture and food sovereignty', NOW()),
  ('site-actfarm', 'ACT Farm', 'actfarm', 'actfarm.org.au', 'active', 'Agricultural communities and rural stories', NOW()),
  ('site-firstvoices', 'First Voices', 'firstvoices', 'firstvoices.org.au', 'pending', 'Language preservation and education', NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status;

-- Create pending syndication requests for UAT testing
INSERT INTO syndication_requests (id, story_id, site_id, storyteller_id, status, purpose, audience, revenue_share_percent, created_at)
VALUES
  -- Pending request for Elder Grace's story from JusticeHub
  (
    'synreq-uat-0001',
    'story-uat-0001',
    'site-justicehub',
    'uat-0001-0000-0000-000000000001',
    'pending',
    'Your story about preserving cultural knowledge through songlines would provide important context for understanding Indigenous perspectives in justice reform.',
    'Policymakers, legal professionals, and justice system advocates',
    15,
    NOW() - INTERVAL '3 days'
  ),
  -- Pending request for Marcus's story from First Voices
  (
    'synreq-uat-0002',
    'story-uat-0002',
    'site-firstvoices',
    'uat-0002-0000-0000-000000000002',
    'pending',
    'Your journey through the youth justice system and transformation would inspire young people learning about their cultural identity.',
    'Youth educators, language programs, and community organizations',
    15,
    NOW() - INTERVAL '2 days'
  ),
  -- Pending request for David's story from The Harvest
  (
    'synreq-uat-0003',
    'story-uat-0004',
    'site-theharvest',
    'uat-0004-0000-0000-000000000004',
    'pending',
    'Your work connecting communities would resonate with our audience interested in collaborative food growing and land management.',
    'Community gardeners, sustainable agriculture advocates, and rural communities',
    15,
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  purpose = EXCLUDED.purpose;

-- Create an active distribution for testing (Elder Grace approved ACT Farm previously)
INSERT INTO syndication_distributions (id, story_id, site_id, storyteller_id, status, approved_at, views, clicks, shares, created_at)
VALUES
  (
    'syndist-uat-0001',
    'story-uat-0001',
    'site-actfarm',
    'uat-0001-0000-0000-000000000001',
    'active',
    NOW() - INTERVAL '20 days',
    1247,
    89,
    23,
    NOW() - INTERVAL '20 days'
  ),
  (
    'syndist-uat-0002',
    'story-uat-0004',
    'site-justicehub',
    'uat-0004-0000-0000-000000000004',
    'active',
    NOW() - INTERVAL '35 days',
    856,
    42,
    15,
    NOW() - INTERVAL '35 days'
  )
ON CONFLICT (id) DO UPDATE SET
  views = EXCLUDED.views,
  clicks = EXCLUDED.clicks,
  shares = EXCLUDED.shares;

-- Create revenue records for testing
INSERT INTO syndication_revenue (id, distribution_id, storyteller_id, amount, period_start, period_end, status, created_at)
VALUES
  (
    'synrev-uat-0001',
    'syndist-uat-0001',
    'uat-0001-0000-0000-000000000001',
    125.50,
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '30 days',
    'paid',
    NOW() - INTERVAL '25 days'
  ),
  (
    'synrev-uat-0002',
    'syndist-uat-0001',
    'uat-0001-0000-0000-000000000001',
    187.25,
    NOW() - INTERVAL '30 days',
    NOW(),
    'pending',
    NOW() - INTERVAL '1 day'
  ),
  (
    'synrev-uat-0003',
    'syndist-uat-0002',
    'uat-0004-0000-0000-000000000004',
    95.75,
    NOW() - INTERVAL '30 days',
    NOW(),
    'pending',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO UPDATE SET
  amount = EXCLUDED.amount,
  status = EXCLUDED.status;

-- ============================================
-- PART 5: Verification Queries
-- ============================================

-- Output summary of seeded data
SELECT '=== UAT Test Data Summary ===' AS info;

SELECT 'Test Profiles Created:' AS category, COUNT(*) AS count
FROM profiles WHERE id LIKE 'uat-%';

SELECT 'Test Stories Created:' AS category, COUNT(*) AS count
FROM stories WHERE id LIKE 'story-uat-%';

SELECT 'Test Transcripts Created:' AS category, COUNT(*) AS count
FROM transcripts WHERE id LIKE 'transcript-uat-%';

SELECT 'Pending Syndication Requests:' AS category, COUNT(*) AS count
FROM syndication_requests WHERE status = 'pending' AND id LIKE 'synreq-uat-%';

SELECT 'Active Distributions:' AS category, COUNT(*) AS count
FROM syndication_distributions WHERE status = 'active' AND id LIKE 'syndist-uat-%';

SELECT 'Revenue Records:' AS category, COUNT(*) AS count
FROM syndication_revenue WHERE id LIKE 'synrev-uat-%';

SELECT '=== UAT Test Data Seeding Complete ===' AS info;

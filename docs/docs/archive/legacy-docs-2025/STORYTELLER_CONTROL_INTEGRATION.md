# Storyteller Control & Living Platform Integration
**Connecting Campaign Mechanics to Core Platform**

---

## Executive Summary

This document outlines how the consent-based, real-time control mechanisms from the **Empathy Ledger Campaign** (mystical portrait gallery) can be integrated into the **Empathy Ledger v2** core platform to create a living, breathing system where storytellers maintain complete control over their stories and feel witnessed in real-time.

---

## Campaign Concept Analysis

### Core Innovation: Felt Presence

The campaign introduces a revolutionary consent mechanism:

1. **Real-time Pulse System** - Storytellers *feel* when someone views their portrait
2. **Physical Sensation** - Phone vibrations create tangible witnessing
3. **Instant Withdrawal** - One-click visibility toggle
4. **Sacred Single-Word Messages** - Deep, minimal engagement
5. **No Accounts Needed** - Access via magic codes

**Key Insight:** This transforms passive content hosting into active, felt participation.

---

## Integration Architecture

### Phase 1: Story Consent Dashboard

Bring the campaign's control mechanics to the core platform's stories.

#### Story Control Panel

```typescript
interface StoryControlPanel {
  // Real-time visibility control
  visibility: {
    status: 'public' | 'community-only' | 'private' | 'withdrawn'
    toggleUrl: string  // One-click toggle
    lastChanged: Date
  }

  // Real-time witnessing
  witnessing: {
    currentViewers: number  // Live count
    recentViews: View[]     // Last 24 hours
    pulseEnabled: boolean   // Vibration notifications
  }

  // Engagement tracking
  engagement: {
    totalViews: number
    totalLikes: number
    totalShares: number
    sacredWords: SacredWord[]  // Single-word messages
  }

  // Distribution control
  distribution: {
    allowEmbedding: boolean
    allowDownload: boolean
    allowPartnerSharing: boolean
    activeDistributions: Distribution[]
  }
}
```

#### Implementation Strategy

**Step 1: Add Campaign Schema to Core Platform**

```sql
-- Add to existing stories table
ALTER TABLE stories ADD COLUMN pulse_enabled BOOLEAN DEFAULT false;
ALTER TABLE stories ADD COLUMN last_visibility_change TIMESTAMPTZ;
ALTER TABLE stories ADD COLUMN access_code TEXT UNIQUE;

-- Create pulse events table (from campaign)
CREATE TABLE story_pulse_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  event_type TEXT CHECK (event_type IN ('view', 'hover', 'like', 'share', 'message')),
  metadata JSONB,
  viewer_location TEXT,  -- City/region for storyteller context
  viewer_type TEXT       -- 'public', 'community', 'partner'
);

-- Sacred words table (like campaign's messages)
CREATE TABLE story_sacred_words (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  word TEXT CHECK (word ~ '^[a-zA-Z]+$' AND length(word) <= 20),
  read BOOLEAN DEFAULT false,
  context TEXT  -- Optional: what prompted this word
);

-- Push subscriptions for storytellers
CREATE TABLE storyteller_push_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  storyteller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,  -- Web Push API subscription object
  active BOOLEAN DEFAULT true
);
```

**Step 2: Build Storyteller Dashboard**

Location: `src/app/storyteller-dashboard/page.tsx`

```typescript
'use client'

import { useRealtimePulse } from '@/hooks/useRealtimePulse'
import { VibrationPattern } from '@/lib/vibration'

export default function StorytellerDashboard() {
  const { stories, pulseEvents, sacredWords } = useStorytellerData()
  const { enableVibrations, currentViewers } = useRealtimePulse()

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-900 via-earth-800 to-clay-900">
      {/* Real-time Witnessing Header */}
      <WitnessingHeader
        currentViewers={currentViewers}
        pulseEnabled={enableVibrations}
      />

      {/* Story Control Cards */}
      {stories.map(story => (
        <StoryControlCard
          key={story.id}
          story={story}
          recentPulses={pulseEvents[story.id]}
          sacredWords={sacredWords[story.id]}
        />
      ))}
    </div>
  )
}
```

**Step 3: Add Real-time Pulse Hook**

```typescript
// hooks/useRealtimePulse.ts
import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { triggerVibration } from '@/lib/vibration'

export function useRealtimePulse(storytellerId: string) {
  const [pulseEvents, setPulseEvents] = useState<PulseEvent[]>([])
  const [vibrationEnabled, setVibrationEnabled] = useState(false)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    // Subscribe to real-time pulse events for storyteller's stories
    const channel = supabase
      .channel('storyteller-pulses')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'story_pulse_events',
          filter: `story_id=in.(${storytellerStoryIds.join(',')})`
        },
        (payload) => {
          const event = payload.new as PulseEvent

          // Add to feed
          setPulseEvents(prev => [event, ...prev].slice(0, 50))

          // Trigger vibration if enabled
          if (vibrationEnabled && 'vibrate' in navigator) {
            triggerVibration(event.event_type)
          }

          // Show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Someone is witnessing your story', {
              body: getEventMessage(event),
              icon: '/icon-192.png',
              tag: 'pulse-notification'
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [storytellerId, vibrationEnabled])

  return {
    pulseEvents,
    vibrationEnabled,
    setVibrationEnabled
  }
}
```

**Step 4: Vibration Patterns**

```typescript
// lib/vibration.ts
export const PULSE_PATTERNS = {
  view: [80],                              // Brief acknowledgment
  hover: [100, 50, 100],                   // Soft pulse
  like: [200, 100, 200, 100, 200],         // Stronger engagement
  share: [300, 100, 300, 100, 500],        // Sustained meaningful
  message: [400, 100, 400, 100, 600, 100, 800], // Deep connection
} as const

export function triggerVibration(eventType: keyof typeof PULSE_PATTERNS) {
  if ('vibrate' in navigator) {
    navigator.vibrate(PULSE_PATTERNS[eventType])
  }
}
```

---

## Phase 2: Sacred Word Messaging System

### Concept

Instead of traditional comments, readers leave **one sacred word** that captures their feeling about a story. This creates deeper, more intentional engagement.

### UI Component

```typescript
// components/story/SacredWordInput.tsx
'use client'

export function SacredWordInput({ storyId }: { storyId: string }) {
  const [word, setWord] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    if (!word || word.split(' ').length > 1) {
      toast.error('Please enter a single word')
      return
    }

    await fetch('/api/stories/sacred-words', {
      method: 'POST',
      body: JSON.stringify({ storyId, word })
    })

    setSent(true)

    // Show confirmation with animation
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    })
  }

  return (
    <div className="mt-8 p-6 bg-earth-800/30 backdrop-blur-sm rounded-xl border border-earth-700/50">
      <h3 className="text-lg font-medium text-earth-200 mb-3">
        Leave a Sacred Word
      </h3>
      <p className="text-sm text-earth-300 mb-4">
        Choose one word that captures what this story means to you
      </p>

      {!sent ? (
        <div className="flex gap-3">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value.replace(/[^a-zA-Z]/g, ''))}
            placeholder="gratitude"
            maxLength={20}
            className="flex-1 px-4 py-3 bg-earth-900/50 border border-earth-700 rounded-lg
                     text-earth-100 placeholder-earth-500 focus:outline-none focus:border-sunshine-500"
          />
          <button
            onClick={handleSubmit}
            disabled={!word}
            className="px-6 py-3 bg-gradient-to-r from-sunshine-500 to-sunshine-600
                     text-earth-900 font-medium rounded-lg hover:from-sunshine-400
                     hover:to-sunshine-500 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sunshine-400 font-medium">
            ✨ Your word "{word}" has been received
          </p>
          <p className="text-earth-400 text-sm mt-2">
            The storyteller will feel your witness
          </p>
        </div>
      )}
    </div>
  )
}
```

### Storyteller View

```typescript
// components/storyteller/SacredWordsCloud.tsx
'use client'

export function SacredWordsCloud({ words }: { words: SacredWord[] }) {
  // Calculate word frequencies
  const wordCounts = words.reduce((acc, w) => {
    acc[w.word] = (acc[w.word] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Sort by frequency
  const sortedWords = Object.entries(wordCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 50)

  return (
    <div className="p-8 bg-gradient-to-br from-earth-900/50 to-clay-900/50 rounded-2xl">
      <h3 className="text-2xl font-bold text-earth-100 mb-6">
        Words People Feel
      </h3>

      <div className="flex flex-wrap gap-3">
        {sortedWords.map(([word, count]) => {
          const size = Math.min(count * 4 + 12, 48)
          const opacity = Math.min(count * 0.2 + 0.5, 1)

          return (
            <span
              key={word}
              style={{
                fontSize: `${size}px`,
                opacity
              }}
              className="text-sunshine-400 font-medium hover:text-sunshine-300
                       transition-colors cursor-pointer"
              title={`${count} ${count === 1 ? 'person' : 'people'} felt this`}
            >
              {word}
            </span>
          )
        })}
      </div>

      <p className="text-earth-400 text-sm mt-6">
        {words.length} sacred words received from {new Set(words.map(w => w.id)).size} witnesses
      </p>
    </div>
  )
}
```

---

## Phase 3: Instant Visibility Control

### One-Click Toggle

```typescript
// components/story/VisibilityToggle.tsx
'use client'

export function VisibilityToggle({ story }: { story: Story }) {
  const [visibility, setVisibility] = useState(story.status)
  const [loading, setLoading] = useState(false)

  const handleToggle = async (newStatus: StoryStatus) => {
    setLoading(true)

    await fetch(`/api/stories/${story.id}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    })

    setVisibility(newStatus)
    setLoading(false)

    // Show confirmation
    toast.success(`Story ${newStatus === 'published' ? 'shared' : 'withdrawn'} successfully`)
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <h4 className="font-medium text-earth-100 mb-1">Story Visibility</h4>
        <p className="text-sm text-earth-400">
          {visibility === 'published'
            ? 'Your story is public and can be witnessed'
            : 'Your story is private - only you can see it'}
        </p>
      </div>

      <button
        onClick={() => handleToggle(visibility === 'published' ? 'draft' : 'published')}
        disabled={loading}
        className={cn(
          "px-6 py-3 rounded-lg font-medium transition-all",
          visibility === 'published'
            ? "bg-earth-700 text-earth-200 hover:bg-earth-600"
            : "bg-gradient-to-r from-sunshine-500 to-sunshine-600 text-earth-900 hover:from-sunshine-400"
        )}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : visibility === 'published' ? (
          <>
            <EyeOff className="w-5 h-5 inline mr-2" />
            Withdraw Story
          </>
        ) : (
          <>
            <Eye className="w-5 h-5 inline mr-2" />
            Share Story
          </>
        )}
      </button>
    </div>
  )
}
```

---

## Phase 4: Real-time Witnessing Feed

### Live Activity Stream

```typescript
// components/storyteller/WitnessingFeed.tsx
'use client'

export function WitnessingFeed() {
  const { pulseEvents } = useRealtimePulse()

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium text-earth-100 mb-4">
        Live Witnessing
      </h3>

      {pulseEvents.map(event => (
        <div
          key={event.id}
          className="flex items-center gap-4 p-4 bg-earth-800/30 rounded-lg
                   border border-earth-700/50 animate-fade-in"
        >
          {/* Icon based on event type */}
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            getEventColor(event.event_type)
          )}>
            {getEventIcon(event.event_type)}
          </div>

          {/* Event details */}
          <div className="flex-1">
            <p className="text-earth-100 font-medium">
              {getEventMessage(event)}
            </p>
            <p className="text-earth-400 text-sm">
              {formatDistanceToNow(event.created_at)} ago
              {event.metadata?.location && ` · ${event.metadata.location}`}
            </p>
          </div>

          {/* Story link */}
          <Link
            href={`/stories/${event.story_id}`}
            className="text-sunshine-400 hover:text-sunshine-300"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      ))}

      {pulseEvents.length === 0 && (
        <div className="text-center py-12 text-earth-500">
          <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Waiting for someone to witness your stories...</p>
        </div>
      )}
    </div>
  )
}

function getEventMessage(event: PulseEvent): string {
  switch (event.event_type) {
    case 'view': return 'Someone is reading your story'
    case 'hover': return 'Someone is considering your story'
    case 'like': return 'Someone resonated with your story'
    case 'share': return 'Someone is sharing your story'
    case 'message': return `Someone left the word "${event.metadata?.word}"`
    default: return 'Activity on your story'
  }
}
```

---

## Phase 5: Magic Link Access (No Login Required)

### Access Code System

```typescript
// app/my-stories/[code]/page.tsx
export default async function MyStoriesPage({ params }: { params: { code: string } }) {
  const supabase = createSupabaseServerClient()

  // Verify access code
  const { data: storyteller } = await supabase
    .from('profiles')
    .select('*')
    .eq('storyteller_access_code', params.code)
    .single()

  if (!storyteller) {
    return <InvalidAccessCode />
  }

  // Fetch storyteller's stories
  const { data: stories } = await supabase
    .from('stories')
    .select(`
      *,
      pulse_events:story_pulse_events(count),
      sacred_words:story_sacred_words(*)
    `)
    .eq('storyteller_id', storyteller.id)

  return (
    <StorytellerDashboard
      storyteller={storyteller}
      stories={stories}
    />
  )
}
```

### Access Code Generation

```sql
-- Add access code to profiles table
ALTER TABLE profiles ADD COLUMN storyteller_access_code TEXT UNIQUE;

-- Generate codes for existing storytellers
UPDATE profiles
SET storyteller_access_code = substr(md5(random()::text || id::text), 1, 12)
WHERE is_storyteller = true AND storyteller_access_code IS NULL;

-- Create index
CREATE INDEX profiles_storyteller_access_code_idx ON profiles(storyteller_access_code);
```

### Share Access Link

```typescript
// components/storyteller/ShareAccessLink.tsx
'use client'

export function ShareAccessLink({ accessCode }: { accessCode: string }) {
  const url = `${window.location.origin}/my-stories/${accessCode}`
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 bg-earth-800/30 rounded-xl border border-earth-700/50">
      <h4 className="font-medium text-earth-100 mb-3">
        Your Personal Dashboard Link
      </h4>
      <p className="text-sm text-earth-400 mb-4">
        Save this link to access your stories anytime, on any device. No login required.
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          readOnly
          className="flex-1 px-4 py-2 bg-earth-900/50 border border-earth-700 rounded-lg
                   text-earth-200 text-sm"
        />
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-sunshine-500 text-earth-900 rounded-lg
                   hover:bg-sunshine-400 font-medium"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 inline mr-1" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 inline mr-1" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* QR Code for mobile access */}
      <div className="mt-4 flex justify-center">
        <QRCodeCanvas value={url} size={200} />
      </div>
      <p className="text-center text-xs text-earth-500 mt-2">
        Scan with your phone to access on mobile
      </p>
    </div>
  )
}
```

---

## Phase 6: World Tour Integration

### Campaign Connection

The World Tour campaign can link directly to storyteller control:

```typescript
// World Tour stop → Story dashboard
// When someone scans a QR code at an exhibition

export async function WorldTourStopPage({ stopId }: { stopId: string }) {
  const { data: stop } = await supabase
    .from('tour_stops')
    .select(`
      *,
      featured_stories:stories(
        *,
        storyteller:profiles(*)
      )
    `)
    .eq('id', stopId)
    .single()

  return (
    <div>
      {/* Exhibition display */}
      <WorldTourExhibition stop={stop} />

      {/* For storytellers: Link to their dashboard */}
      {stop.featured_stories.map(story => (
        <StorytellerInvite
          key={story.id}
          story={story}
          accessCode={story.storyteller.storyteller_access_code}
        />
      ))}
    </div>
  )
}
```

---

## Implementation Roadmap

### Sprint 1: Foundation (Week 1-2)
- ✅ Add pulse_events table and schema
- ✅ Create storyteller access codes
- ✅ Build basic dashboard UI
- ✅ Implement visibility toggle

### Sprint 2: Real-time (Week 3-4)
- ✅ Add Supabase real-time subscriptions
- ✅ Implement vibration patterns
- ✅ Build witnessing feed component
- ✅ Add push notification support

### Sprint 3: Sacred Words (Week 5-6)
- ✅ Create sacred_words table
- ✅ Build single-word input UI
- ✅ Implement word cloud visualization
- ✅ Add moderation (if needed)

### Sprint 4: Mobile PWA (Week 7-8)
- ✅ Convert to Progressive Web App
- ✅ Add service worker
- ✅ Enable offline access
- ✅ Add "Add to Home Screen" prompts

### Sprint 5: World Tour Integration (Week 9-10)
- ✅ Link tour stops to storyteller dashboards
- ✅ QR code generation for physical locations
- ✅ Physical object triggers (LED pebbles, etc.)
- ✅ Exhibition mode displays

---

## Technical Considerations

### Performance
- Use Supabase real-time channels (max 100 concurrent connections free tier)
- Cache pulse events client-side (avoid DB overload)
- Rate limit pulse event creation (1 per user per story per 5 seconds)

### Privacy
- Pulse events don't store viewer identity (anonymous witnessing)
- Sacred words are moderated for inappropriate content
- Storytellers can delete their data anytime

### Scalability
- Auto-delete pulse events older than 7 days
- Archive old sacred words (keep totals, archive details)
- Use CDN for storyteller dashboard (Vercel Edge)

---

## Success Metrics

### Storyteller Engagement
- % of storytellers who enable pulse notifications
- Average time spent in dashboard
- Frequency of visibility toggles
- Response rate to sacred words

### Reader Engagement
- Conversion rate: view → sacred word
- Distribution of word variety
- Time spent reading vs. leaving words

### Platform Health
- Real-time connection uptime
- Pulse event latency (target: <500ms)
- Push notification delivery rate
- Dashboard load time (target: <2s)

---

## Conclusion

By integrating the campaign's consent-based, real-time control mechanisms into the core platform, we create a **living platform** where:

1. **Storytellers feel witnessed** - Real-time pulses, vibrations, live feeds
2. **Control is instant** - One-click visibility toggle, no friction
3. **Engagement is sacred** - Single words over long comments
4. **Access is universal** - No accounts, just magic links
5. **Connection is physical** - Vibrations, LEDs, tangible presence

This transforms Empathy Ledger from a content platform into a **felt experience of mutual witnessing** - exactly what the campaign demonstrates at exhibition scale.

---

**Next Steps:**
1. Review this integration plan
2. Prioritize which phases align with current roadmap
3. Prototype sacred word input on one story
4. Test real-time pulse system with pilot storytellers
5. Launch storyteller dashboard beta

**Questions to Consider:**
- Should sacred words be public or private to storyteller?
- How do we handle moderation without losing spontaneity?
- Can we integrate physical objects (LED pebbles) with core platform?
- Should we gamify witnessing (badges, streaks) or keep it pure?

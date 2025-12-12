# Simple Story Submission - Mobile-First UX

## Goal
Enable anyone to share a story in **under 3 minutes** on any device, with zero friction.

## Design Principles

1. **Start immediately** - No mode selection, just start telling your story
2. **One screen at a time** - Progressive disclosure, never overwhelming
3. **Voice-first option** - Speak your story, we'll transcribe it
4. **Auto-save everything** - Never lose progress
5. **Gentle guidance** - Prompts that help, not forms that block
6. **Celebrate completion** - Make finishing feel rewarding

## User Journey

### Entry Point: `/stories/share`

```
┌─────────────────────────────────────────┐
│                                         │
│   Share Your Story                      │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │                                 │   │
│   │   What would you like to        │   │
│   │   share today?                  │   │
│   │                                 │   │
│   │   [        Type here...      ]  │   │
│   │                                 │   │
│   │          or                     │   │
│   │                                 │   │
│   │       [ 🎤 Speak It ]           │   │
│   │                                 │   │
│   └─────────────────────────────────┘   │
│                                         │
│   💡 Just a few sentences is fine       │
│                                         │
└─────────────────────────────────────────┘
```

### Step 1: Tell Your Story (Core - Required)

**Just one text area.** That's it.

Features:
- Auto-expanding textarea
- Voice recording with live transcription
- Character count (encouraging, not limiting)
- Auto-save every 5 seconds
- Gentle prompts if stuck:
  - "What happened?"
  - "How did it make you feel?"
  - "What would you want others to know?"

### Step 2: Give It a Title (Optional Enhancement)

```
┌─────────────────────────────────────────┐
│                                         │
│   ✓ Story saved!                        │
│                                         │
│   Want to give it a title?              │
│                                         │
│   [  AI suggested: "My Journey to..."  ]│
│                                         │
│   [ Use This ]  [ Write My Own ]        │
│                                         │
│        [ Skip for now → ]               │
│                                         │
└─────────────────────────────────────────┘
```

### Step 3: Add a Photo (Optional Enhancement)

```
┌─────────────────────────────────────────┐
│                                         │
│   📷 Add a photo?                       │
│                                         │
│   Photos help bring stories to life     │
│                                         │
│   [ Take Photo ]  [ Choose Photo ]      │
│                                         │
│        [ Skip for now → ]               │
│                                         │
└─────────────────────────────────────────┘
```

### Step 4: Who Can See This? (Simple Privacy)

```
┌─────────────────────────────────────────┐
│                                         │
│   🔒 Who should see your story?         │
│                                         │
│   ○ Just me (private)                   │
│   ◉ My community                        │
│   ○ Everyone (public)                   │
│                                         │
│   You can change this anytime.          │
│                                         │
│        [ Save My Story → ]              │
│                                         │
└─────────────────────────────────────────┘
```

### Completion: Celebration!

```
┌─────────────────────────────────────────┐
│                                         │
│         🎉                              │
│                                         │
│   Your story has been saved!            │
│                                         │
│   What's next?                          │
│                                         │
│   [ View My Story ]                     │
│   [ Share Another Story ]               │
│   [ Explore Other Stories ]             │
│                                         │
└─────────────────────────────────────────┘
```

## Voice Recording Flow

```
┌─────────────────────────────────────────┐
│                                         │
│   🎤 Recording...                       │
│                                         │
│   ●●●●●●●○○○○○○○○  0:23                │
│                                         │
│   "I remember when we first moved       │
│    to the community, everyone           │
│    welcomed us with..."                 │
│                                         │
│   (Live transcription appears here)     │
│                                         │
│   [ ⏹ Stop Recording ]                  │
│                                         │
└─────────────────────────────────────────┘
```

## Support Features

### Gentle Prompts (Non-blocking)

If the user pauses for 30+ seconds:
```
💭 Need a prompt?
   - What moment stands out most?
   - Who was involved?
   - What changed after this?
```

### Draft Recovery

On return to page:
```
┌─────────────────────────────────────────┐
│                                         │
│   Welcome back! 👋                      │
│                                         │
│   You have an unfinished story:         │
│   "Started 2 hours ago"                 │
│                                         │
│   [ Continue Story ]  [ Start Fresh ]   │
│                                         │
└─────────────────────────────────────────┘
```

### Accessibility

- Large touch targets (min 44px)
- High contrast text
- Screen reader support
- Reduced motion option
- Voice-only mode available

## Technical Implementation

### Route
`/stories/share` - New simplified entry point

### Component
`SimpleStoryCreator.tsx` - Single component, minimal dependencies

### Data Model
```typescript
interface SimpleStory {
  id: string
  content: string           // The story itself
  title?: string            // Optional, AI-suggested default
  media?: string[]          // Optional photos
  visibility: 'private' | 'community' | 'public'
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}
```

### Auto-save
- Debounced save every 5 seconds
- LocalStorage for immediate backup
- Supabase for persistence
- Visual indicator: "Saved ✓" / "Saving..."

## Mobile Considerations

- Keyboard-aware layout
- Thumb-reachable buttons
- Pull-to-refresh on story list
- Haptic feedback on save
- Offline support with sync

## Success Metrics

1. **Completion rate** - % who finish vs start
2. **Time to first save** - Should be < 60 seconds
3. **Return rate** - Users who come back to add more
4. **Upgrade rate** - Users who add optional features

---

## Implementation Status

### Completed Features (Ready for Testing)

| Feature | Status | Notes |
|---------|--------|-------|
| Core story writing flow | ✅ Done | Auto-expanding textarea with encouraging feedback |
| Voice recording | ✅ Done | MediaRecorder API, needs transcription integration |
| Auto-save to localStorage | ✅ Done | Saves every 5 seconds |
| Draft recovery modal | ✅ Done | Shows on page load if draft exists |
| Photo upload (camera/gallery) | ✅ Done | With preview, remove option |
| Guest mode | ✅ Done | Saves locally, prompts to create account |
| Privacy selection | ✅ Done | Private/Community/Public options |
| Mobile touch targets | ✅ Done | Min 48px height, haptic feedback |
| Progress bar | ✅ Done | Visual step indicator |
| Completion celebration | ✅ Done | Different for guests vs authenticated |
| Help page | ✅ Done | `/storyteller/help` with FAQs |

### Pending Features

| Feature | Priority | Notes |
|---------|----------|-------|
| Voice transcription (Whisper) | High | Recording works, needs API integration |
| Offline support with sync | Medium | For areas with poor connectivity |
| AI title generation | Low | Currently uses first line |

### Test URLs

- **Story submission**: `/stories/share`
- **Help page**: `/storyteller/help`
- **Dashboard**: `/storyteller/dashboard`

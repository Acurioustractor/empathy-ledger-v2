# Empathy Ledger Design System - Usage Guide

**Creating warm, memorable interfaces that honor human stories**

---

## 🚀 Quick Start

### Installation

The Empathy Ledger design system is built into your project at:
```
src/components/empathy-ledger/
```

### Basic Import

```typescript
import {
  EmpathyCard,
  CardHeader,
  CardContent,
  EmpathyBadge,
  QuoteCard,
  MetricDisplay
} from '@/components/empathy-ledger'
```

### Your First Card

```typescript
<EmpathyCard elevation="lifted" variant="warmth">
  <CardHeader
    title="Welcome to Empathy Ledger"
    subtitle="Where stories are preserved with care"
  />
  <CardContent>
    <p>Your content here...</p>
  </CardContent>
</EmpathyCard>
```

---

## 📦 Component Library

### Core Components

#### EmpathyCard
The foundational card component with signature warmth.

```typescript
import { EmpathyCard, CardHeader, CardContent, CardFooter } from '@/components/empathy-ledger'

<EmpathyCard
  elevation="lifted"      // flat | lifted | hovering | focused | floating
  variant="warmth"        // default | warmth | heritage | insight | connection
  interactive={true}      // Adds hover lift effect
  asPage={true}          // Adds page-like padding
>
  <CardHeader
    title="Story Title"
    subtitle="A brief description"
    badge={<Badge>New</Badge>}
    icon={<BookOpen />}
  />

  <CardContent>
    Your story content with comfortable line spacing
  </CardContent>

  <CardFooter variant="divided" alignment="right">
    <Button>Action</Button>
  </CardFooter>
</EmpathyCard>
```

**When to use:**
- Displaying any content that needs warmth and elevation
- Story previews, profile cards, content cards
- Interactive elements that need hover states

**Variants:**
- `default`: Clean background, standard border
- `warmth`: Warm gradient (cream → background), primary border
- `heritage`: Amber gradient, heritage feel
- `insight`: Accent gradient, AI insights
- `connection`: Emerald gradient, relationship focus

#### PageCard
Special variant that looks like a book page.

```typescript
<PageCard>
  <h2>Like a page in a hand-bound journal</h2>
  <p>With subtle paper texture...</p>
</PageCard>
```

#### InteractiveCard
Card with built-in click and hover handling.

```typescript
<InteractiveCard
  onClick={() => router.push('/story/123')}
  elevation="lifted"
  variant="warmth"
>
  <CardHeader title="Click me!" />
  <CardContent>I lift gently on hover</CardContent>
</InteractiveCard>
```

---

### Badges

#### EmpathyBadge
Semantic badges with cultural warmth.

```typescript
import { EmpathyBadge } from '@/components/empathy-ledger'

// Default badge
<EmpathyBadge>General Tag</EmpathyBadge>

// Cultural theme badge
<EmpathyBadge variant="cultural" theme="Land & Territory">
  Land Connection
</EmpathyBadge>

// Status badge
<EmpathyBadge variant="status">Active</EmpathyBadge>

// AI badge with confidence
<EmpathyBadge variant="ai" icon={<Sparkles />}>
  AI Suggestion
</EmpathyBadge>

// Metric badge
<EmpathyBadge variant="metric">
  <span className="font-bold">247</span>
  <span className="text-xs opacity-75">stories</span>
</EmpathyBadge>
```

**Cultural Themes** (with semantic colors):
- `Cultural Preservation & Traditions` → Amber
- `Family & Kinship` → Emerald
- `Land & Territory` → Sky Blue
- `Resistance & Resilience` → Red
- `Knowledge & Wisdom` → Violet
- `Justice & Rights` → Orange
- `Arts & Creativity` → Cyan
- `Everyday Life` → Lime

#### Specialized Badges

```typescript
import { StatusBadge, MetricBadge, CountBadge, AIBadge } from '@/components/empathy-ledger'

// Status indicator
<StatusBadge status="success">Published</StatusBadge>
<StatusBadge status="warning">Review Needed</StatusBadge>
<StatusBadge status="error">Flagged</StatusBadge>

// Metric with trend
<MetricBadge value={247} label="stories" trend="up" format="number" />
<MetricBadge value={0.87} format="percentage" />

// Count indicator
<CountBadge count={12} max={99} variant="accent" />

// AI confidence
<AIBadge confidence={0.87} showConfidence={true}>
  AI Insight
</AIBadge>
```

---

### Narrative Components

#### QuoteCard
Display meaningful quotes with reverence.

```typescript
import { QuoteCard } from '@/components/empathy-ledger'

<QuoteCard
  quote="The land remembers everything we forget"
  author="Elder Sarah"
  source="Winter Gathering 2023"
  themes={["Land & Territory", "Knowledge & Wisdom"]}
  wisdom_score={0.92}
  quotability_score={0.88}
  inspiration_score={0.95}
  context="Spoken during a teaching about traditional land practices..."
  variant="featured"      // default | featured | minimal
  showScores={true}
  showActions={true}
  onShare={() => handleShare()}
/>
```

**Variants:**
- `default`: Standard card with all features
- `featured`: Large, prominent display with decorative quote mark
- `minimal`: Simple blockquote style

**Quote Gallery:**

```typescript
import { QuoteGallery } from '@/components/empathy-ledger'

<QuoteGallery
  quotes={quotesArray}
  columns={2}  // 1 | 2 | 3
/>
```

---

### Data Visualization

#### MetricDisplay
Beautiful display of key metrics.

```typescript
import { MetricDisplay, MetricGrid } from '@/components/empathy-ledger'

<MetricDisplay
  label="Total Stories"
  value={1247}
  trend="up"                    // up | down | stable
  trendValue="+12% this month"
  format="number"               // number | percentage | currency | decimal
  icon={<BookOpen />}
  variant="warmth"              // default | warmth | insight
  size="md"                     // sm | md | lg
  subtitle="Across all communities"
/>

// Grid of metrics
<MetricGrid
  columns={3}  // 2 | 3 | 4
  metrics={[
    { label: "Stories", value: 1247, trend: "up" },
    { label: "Storytellers", value: 342, trend: "up" },
    { label: "Impact Score", value: 87, format: "percentage" }
  ]}
/>
```

#### ProgressRing
Circular progress with warmth.

```typescript
import { ProgressRing } from '@/components/empathy-ledger'

<ProgressRing
  progress={75}           // 0-100
  size="md"               // sm | md | lg
  thickness={8}
  label="Complete"
  showPercentage={true}
  color="primary"         // primary | accent | success | warning
/>
```

#### ScoreBar
Linear progress bar.

```typescript
import { ScoreBar } from '@/components/empathy-ledger'

<ScoreBar
  score={0.87}           // 0-1
  label="Wisdom Score"
  showValue={true}
  height="md"            // sm | md | lg
  color="cultural"       // primary | accent | success | cultural
/>
```

#### CompactMetric
Inline metric for lists.

```typescript
import { CompactMetric } from '@/components/empathy-ledger'

<CompactMetric label="Stories" value={42} format="number" />
<CompactMetric label="Impact" value={87} format="percentage" />
```

---

## 🎨 Design Tokens

### Colors

```typescript
// Use Tailwind classes with Empathy Ledger palette

// Primary (Editorial Warmth)
bg-primary-50   // Cream paper
bg-primary-100  // Aged parchment
bg-primary-500  // Rich earth (main)
bg-primary-700  // Deep walnut
text-primary-700

// Accent (Human warmth)
bg-accent       // Warm coral
text-accent
border-accent/20

// Cultural themes - use with EmpathyBadge variant="cultural"
```

### Spacing

```typescript
// Generous spacing for breathing room
gap-6      // Standard card gap
p-6        // Standard card padding
mb-6       // Section spacing
mt-story   // Custom 2.5rem for story elements (if defined in tailwind.config)

// Or use direct values
className="space-y-6"  // Vertical rhythm
className="gap-4"      // Comfortable proximity
```

### Typography

```typescript
// Headings - Editorial New
className="font-editorial text-2xl font-bold"

// Body - Inter
className="text-base leading-relaxed"

// Comfortable reading
className="leading-relaxed"   // 1.625 line height
className="leading-loose"     // 2.0 for poetry/quotes
```

### Shadows (Elevations)

```typescript
// Built into EmpathyCard elevation prop
elevation="flat"      // No shadow
elevation="lifted"    // Gentle lift (default)
elevation="hovering"  // Moderate elevation
elevation="focused"   // Prominent
elevation="floating"  // Modal/overlay
```

### Border Radius

```typescript
// Soft, rounded corners
className="rounded-xl"    // 12px - standard cards
className="rounded-full"  // Pills/badges
className="rounded-lg"    // 8px - smaller elements
```

---

## 🎭 Animation Patterns

### Framer Motion Variants

```typescript
import { motion } from 'framer-motion'

// Card entrance (built into EmpathyCard)
const cardEntrance = {
  initial: { opacity: 0, y: 20, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  }
}

// Hover lift (built into interactive prop)
const hoverLift = {
  hover: {
    y: -2,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
  }
}

// Count up animation (built into MetricDisplay)
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  {/* Content */}
</motion.div>
```

### Timing

```typescript
// Use these durations
duration: 0.15  // instant (quick feedback)
duration: 0.2   // fast (interactions)
duration: 0.3   // base (standard)
duration: 0.5   // slow (deliberate)
duration: 0.8   // story (storytelling pace)

// Easing curves
ease: [0.16, 1, 0.3, 1]     // ease-out (confident)
ease: [0.7, 0, 0.84, 0]     // ease-in (gentle)
ease: [0.65, 0, 0.35, 1]    // ease-in-out (smooth)
ease: [0.4, 0, 0.2, 1]      // story-ease (organic)
```

---

## 🌐 Reusability Across Sites

### As NPM Package (Future)

```bash
npm install @empathy-ledger/design-system
```

```typescript
import { EmpathyCard, QuoteCard } from '@empathy-ledger/design-system'
import '@empathy-ledger/design-system/styles.css'
```

### As Git Submodule (Current)

```bash
# In another project
git submodule add <your-repo-url> src/components/empathy-ledger

# Copy the component directory
cp -r /path/to/empathy-ledger-v2/src/components/empathy-ledger ./src/components/
```

### Theme Provider (Optional)

```typescript
// Create a theme wrapper for consistent styling
<EmpathyLedgerTheme variant="warmth">
  <YourApp />
</EmpathyLedgerTheme>
```

---

## 📱 Responsive Design

All components are mobile-first and responsive.

```typescript
// Cards stack on mobile, grid on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <EmpathyCard>Card 1</EmpathyCard>
  <EmpathyCard>Card 2</EmpathyCard>
  <EmpathyCard>Card 3</EmpathyCard>
</div>

// MetricGrid handles responsive automatically
<MetricGrid columns={3} metrics={data} />
// Becomes: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
```

---

## ♿ Accessibility

### Built-in Features

- ✅ WCAG AAA contrast ratios
- ✅ Keyboard navigation support
- ✅ Focus states (2px accent outline)
- ✅ Screen reader friendly
- ✅ Touch targets ≥44px
- ✅ Semantic HTML

### Best Practices

```typescript
// Always provide meaningful labels
<EmpathyCard aria-label="Story by Elder Sarah">
  <CardContent>...</CardContent>
</EmpathyCard>

// Use semantic HTML
<button>Action</button>  // Not <div onClick>

// Provide alt text for icons used standalone
<span aria-label="Success" role="img">✓</span>
```

---

## 🎯 Common Patterns

### Story Card

```typescript
<EmpathyCard elevation="lifted" variant="warmth" interactive>
  <CardHeader
    title="The Winter Teaching"
    subtitle="Elder Sarah"
    badge={<EmpathyBadge variant="cultural" theme="Knowledge & Wisdom">Wisdom</EmpathyBadge>}
    icon={<BookOpen />}
  />

  <CardContent>
    <p className="leading-relaxed">
      The story content goes here with comfortable spacing...
    </p>

    <div className="mt-4 flex flex-wrap gap-2">
      <EmpathyBadge variant="cultural" theme="Land & Territory">Land</EmpathyBadge>
      <EmpathyBadge variant="cultural" theme="Family & Kinship">Family</EmpathyBadge>
    </div>
  </CardContent>

  <CardFooter variant="divided" alignment="between">
    <CompactMetric label="Views" value={247} />
    <Button variant="ghost">Read More</Button>
  </CardFooter>
</EmpathyCard>
```

### Dashboard Section

```typescript
<div className="space-y-6">
  {/* Metrics Overview */}
  <MetricGrid
    columns={3}
    metrics={[
      { label: "Stories", value: 1247, trend: "up", trendValue: "+12%", icon: <BookOpen /> },
      { label: "Storytellers", value: 342, trend: "up", trendValue: "+8%" },
      { label: "Impact", value: 87, format: "percentage", trend: "stable" }
    ]}
  />

  {/* Featured Quote */}
  <QuoteCard
    quote="The land remembers everything"
    author="Elder Sarah"
    variant="featured"
    themes={["Land & Territory", "Knowledge & Wisdom"]}
    wisdom_score={0.95}
  />

  {/* Story Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {stories.map(story => (
      <EmpathyCard key={story.id} interactive>
        {/* Story card content */}
      </EmpathyCard>
    ))}
  </div>
</div>
```

### Profile Completion

```typescript
<EmpathyCard elevation="lifted" variant="insight">
  <CardHeader
    title="Complete Your Profile"
    subtitle="Help others discover your stories"
    badge={<CountBadge count={3} variant="accent" />}
  />

  <CardContent>
    <ProgressRing
      progress={75}
      size="lg"
      label="Complete"
      color="accent"
    />

    <div className="mt-6 space-y-3">
      <ScoreBar score={1.0} label="Basic Info" color="success" />
      <ScoreBar score={0.8} label="Story Details" color="primary" />
      <ScoreBar score={0.5} label="Cultural Context" color="cultural" />
    </div>
  </CardContent>

  <CardFooter>
    <Button>Continue</Button>
  </CardFooter>
</EmpathyCard>
```

---

## 🔧 Customization

### Extending Components

```typescript
// Create your own variant
import { EmpathyCard } from '@/components/empathy-ledger'

export function MyCustomCard({ children }: { children: React.ReactNode }) {
  return (
    <EmpathyCard
      elevation="floating"
      variant="warmth"
      className="border-2 border-accent"
    >
      {children}
    </EmpathyCard>
  )
}
```

### Custom Colors

```typescript
// Override with custom Tailwind classes
<EmpathyCard className="bg-gradient-to-br from-rose-50 to-background">
  <CardContent>Custom gradient background</CardContent>
</EmpathyCard>
```

---

## 📚 Examples Gallery

See complete examples in:
- `docs/design-system/EXAMPLES.md`
- `src/app/design-system-demo/` (if created)

---

## 🌟 The Empathy Ledger Signature

Every component should:
- ✅ Feel warm, not cold
- ✅ Have generous spacing
- ✅ Use soft shadows
- ✅ Include gentle animations
- ✅ Support keyboard navigation
- ✅ Work on mobile
- ✅ Honor the story being told

**When in doubt, ask: "Does this feel like a cherished memory being preserved?"**

---

For more details, see:
- [Design Identity](./EMPATHY_LEDGER_IDENTITY.md)
- [Component API Reference](./API_REFERENCE.md)

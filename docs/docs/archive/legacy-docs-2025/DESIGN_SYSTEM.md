# Empathy Ledger Design System

## Brand Philosophy

Empathy Ledger is a storytelling platform designed for Indigenous communities and organizations. The design system reflects:

- **Connection to Land**: Earth tones that evoke the natural world
- **Warmth & Trust**: Colors that feel welcoming and safe
- **Cultural Respect**: Design patterns that honor Indigenous data sovereignty
- **Accessibility**: WCAG AA compliant contrasts and interactions

---

## Color Palette

### Primary Brand Colors

#### Earth (Primary)
The foundation of our visual identity - warm, grounded, trustworthy.

| Token | Hex | HSL | Usage |
|-------|-----|-----|-------|
| `earth-50` | `#fefefe` | 0 0% 99.6% | Lightest backgrounds |
| `earth-100` | `#f7f5f3` | 30 14% 96% | Card backgrounds |
| `earth-200` | `#e6ddd6` | 28 22% 87% | Borders, dividers |
| `earth-300` | `#d4c4b9` | 28 27% 78% | Disabled states |
| `earth-400` | `#c1aa9c` | 26 29% 68% | Placeholder text |
| `earth-500` | `#a8927e` | 27 28% 58% | Secondary text |
| `earth-600` | `#8f7961` | 27 30% 47% | **Primary buttons** |
| `earth-700` | `#6b5a4a` | 27 31% 36% | Active/hover states |
| `earth-800` | `#4a3f33` | 28 31% 25% | Dark text on light |
| `earth-900` | `#2c241c` | 28 35% 14% | Darkest accents |
| `earth-950` | `#1a1511` | 30 38% 8% | Near black |

#### Clay (Secondary)
Warmer undertones for emphasis and cultural elements.

| Token | Hex | Usage |
|-------|-----|-------|
| `clay-50` | `#fdf8f6` | Warm backgrounds |
| `clay-100` | `#f2e8e0` | Card hover states |
| `clay-200` | `#e3d1c5` | Borders |
| `clay-300` | `#d3b9aa` | Decorative elements |
| `clay-400` | `#c1a08f` | Icons |
| `clay-500` | `#a8866e` | Accent text |
| `clay-600` | `#8f6d54` | **Cultural highlights** |
| `clay-700` | `#75583f` | Strong emphasis |
| `clay-800` | `#5c442b` | Dark accents |
| `clay-900` | `#3d2d1c` | Deep shadows |

#### Sage (Accent)
Green tones representing growth, healing, and nature.

| Token | Hex | Usage |
|-------|-----|-------|
| `sage-50` | `#f7f8f6` | Success backgrounds |
| `sage-100` | `#e8ebe5` | Positive highlights |
| `sage-200` | `#d2d7ca` | Progress indicators |
| `sage-300` | `#b7c2ae` | Tags, badges |
| `sage-400` | `#9cad92` | Icons |
| `sage-500` | `#7e9774` | Success states |
| `sage-600` | `#67805c` | **Elder/verified badges** |
| `sage-700` | `#526946` | Deep green |
| `sage-800` | `#3e5131` | Dark accents |
| `sage-900` | `#2a3620` | Nature elements |

### Semantic Colors

| Semantic | Light Mode | Dark Mode | Usage |
|----------|------------|-----------|-------|
| `primary` | earth-600 | earth-400 | Primary actions, links |
| `secondary` | earth-100 | earth-800 | Secondary buttons |
| `accent` | clay-600 | clay-400 | Cultural highlights |
| `success` | sage-600 | sage-400 | Positive feedback, verified |
| `warning` | amber-500 | amber-400 | Caution, pending states |
| `destructive` | red-600 | red-400 | Delete, revoke, errors |
| `muted` | earth-200 | earth-700 | Disabled, placeholders |

### Cultural Sensitivity Colors

| Level | Background | Border | Text | Icon |
|-------|------------|--------|------|------|
| Standard | `earth-50` | `earth-200` | `earth-700` | `earth-500` |
| Sensitive | `amber-50` | `amber-200` | `amber-800` | `amber-600` |
| High Sensitivity | `orange-50` | `orange-200` | `orange-800` | `orange-600` |
| Restricted/Sacred | `red-50` | `red-200` | `red-800` | `red-600` |

---

## Typography

### Font Stack

```css
--font-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
```

### Type Scale

| Name | Size | Line Height | Usage |
|------|------|-------------|-------|
| `display-2xl` | 4.5rem (72px) | 1 | Hero headlines |
| `display-xl` | 3.75rem (60px) | 1 | Page titles |
| `display-lg` | 3rem (48px) | 1.2 | Section headers |
| `display-md` | 2.25rem (36px) | 1.2 | Card titles |
| `display-sm` | 1.875rem (30px) | 1.25 | Subheadings |
| `body-xl` | 1.25rem (20px) | 1.75 | Lead paragraphs |
| `body-lg` | 1.125rem (18px) | 1.75 | Story content |
| `body-md` | 1rem (16px) | 1.5 | Body text |
| `body-sm` | 0.875rem (14px) | 1.5 | Captions, metadata |
| `body-xs` | 0.75rem (12px) | 1.5 | Timestamps, badges |

### Font Weights

| Weight | Usage |
|--------|-------|
| 400 Regular | Body text, descriptions |
| 500 Medium | Emphasis, labels, buttons |
| 600 Semibold | Headings, important labels |
| 700 Bold | Display text, strong emphasis |

---

## Spacing

Use the 4px grid system consistently:

| Token | Value | Usage |
|-------|-------|-------|
| `0.5` | 2px | Micro spacing |
| `1` | 4px | Icon padding, tight spacing |
| `2` | 8px | Button padding, gaps |
| `3` | 12px | Card padding (compact) |
| `4` | 16px | Standard padding |
| `6` | 24px | Section padding |
| `8` | 32px | Component spacing |
| `12` | 48px | Section margins |
| `16` | 64px | Large section spacing |
| `20` | 80px | Hero spacing |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 0.25rem (4px) | Badges, tags |
| `md` | 0.375rem (6px) | Buttons, inputs |
| `lg` | 0.5rem (8px) | Cards, dialogs |
| `xl` | 0.75rem (12px) | Large cards |
| `2xl` | 1rem (16px) | Hero elements |
| `full` | 9999px | Avatars, pills |

---

## Shadows

| Name | CSS | Usage |
|------|-----|-------|
| `soft` | `0 2px 8px rgba(0, 0, 0, 0.04)` | Subtle elevation |
| `cultural` | `0 4px 6px -1px rgba(107, 90, 74, 0.1)` | Brand-tinted shadow |
| `md` | Tailwind default | Cards, dropdowns |
| `lg` | Tailwind default | Modals, popovers |

---

## Component Patterns

### Buttons

#### Primary Button
```tsx
<Button className="bg-earth-600 hover:bg-earth-700 text-white">
  Primary Action
</Button>
```

#### Secondary Button
```tsx
<Button variant="outline" className="border-earth-300 text-earth-700 hover:bg-earth-50">
  Secondary
</Button>
```

#### Destructive Button
```tsx
<Button variant="destructive">
  Delete / Revoke
</Button>
```

#### Cultural Action Button
```tsx
<Button className="bg-sage-600 hover:bg-sage-700 text-white">
  <Crown className="mr-2 h-4 w-4" />
  Request Elder Review
</Button>
```

### Cards

#### Standard Card
```tsx
<Card className="bg-white border-earth-200 shadow-soft">
  <CardHeader>
    <CardTitle className="text-earth-800">Title</CardTitle>
    <CardDescription className="text-earth-500">Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

#### Cultural Card (Elevated)
```tsx
<Card className="bg-clay-50 border-clay-200 shadow-cultural">
  {/* Cultural content */}
</Card>
```

### Badges

| Type | Classes | Usage |
|------|---------|-------|
| Default | `bg-earth-100 text-earth-700` | General tags |
| Success | `bg-sage-100 text-sage-700` | Verified, approved |
| Warning | `bg-amber-100 text-amber-700` | Pending, attention |
| Destructive | `bg-red-100 text-red-700` | Errors, revoked |
| Elder | `bg-sage-100 text-sage-700 border-sage-300` | Elder approved |
| Cultural | `bg-clay-100 text-clay-700` | Cultural markers |

### Form Inputs

```tsx
<Input
  className="border-earth-200 focus:border-earth-400 focus:ring-earth-400/20"
  placeholder="Placeholder text"
/>
```

### Alerts

| Variant | Background | Border | Icon Color |
|---------|------------|--------|------------|
| Default | `earth-50` | `earth-200` | `earth-600` |
| Success | `sage-50` | `sage-200` | `sage-600` |
| Warning | `amber-50` | `amber-200` | `amber-600` |
| Destructive | `red-50` | `red-200` | `red-600` |

---

## Cultural Elements

### OCAP Principles Visual Treatment

The four OCAP principles should be visually distinguished:

```tsx
<div className="grid grid-cols-4 gap-4">
  <div className="p-4 bg-earth-50 border border-earth-200 rounded-lg">
    <h4 className="font-semibold text-earth-700">Ownership</h4>
  </div>
  <div className="p-4 bg-clay-50 border border-clay-200 rounded-lg">
    <h4 className="font-semibold text-clay-700">Control</h4>
  </div>
  <div className="p-4 bg-sage-50 border border-sage-200 rounded-lg">
    <h4 className="font-semibold text-sage-700">Access</h4>
  </div>
  <div className="p-4 bg-earth-100 border border-earth-300 rounded-lg">
    <h4 className="font-semibold text-earth-800">Possession</h4>
  </div>
</div>
```

### Elder Badge

```tsx
<Badge className="bg-sage-100 text-sage-700 border border-sage-300">
  <Crown className="mr-1 h-3 w-3" />
  Elder Approved
</Badge>
```

### Cultural Sensitivity Indicators

```tsx
// Standard
<Badge variant="outline" className="border-earth-300 text-earth-600">
  Standard
</Badge>

// Sensitive
<Badge className="bg-amber-100 text-amber-700 border border-amber-200">
  Sensitive
</Badge>

// High Sensitivity
<Badge className="bg-orange-100 text-orange-700 border border-orange-200">
  High Sensitivity
</Badge>

// Sacred/Restricted
<Badge className="bg-red-100 text-red-700 border border-red-200">
  <Shield className="mr-1 h-3 w-3" />
  Restricted
</Badge>
```

---

## Accessibility

### Color Contrast Requirements

All text must meet WCAG AA standards:
- Normal text: 4.5:1 minimum contrast ratio
- Large text (18px+ or 14px bold): 3:1 minimum

| Combination | Ratio | Status |
|-------------|-------|--------|
| earth-800 on earth-50 | 10.4:1 | Pass |
| earth-700 on earth-100 | 5.8:1 | Pass |
| earth-600 on white | 4.7:1 | Pass |
| earth-500 on white | 3.2:1 | Large text only |

### Focus States

All interactive elements must have visible focus:

```css
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-earth-500 focus:ring-offset-2;
}
```

### Touch Targets

Minimum touch target size: 44x44px

```tsx
<Button size="icon" className="min-h-[44px] min-w-[44px]">
  <Icon className="h-5 w-5" />
</Button>
```

### Screen Reader Support

Always include labels for icon-only buttons:

```tsx
<Button size="icon" aria-label="Refresh story list">
  <RefreshCw className="h-4 w-4" />
</Button>
```

---

## Animation & Motion

### Timing Functions

| Name | Value | Usage |
|------|-------|-------|
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Entrances |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exits |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Transitions |

### Duration

| Duration | Value | Usage |
|----------|-------|-------|
| Fast | 150ms | Hovers, toggles |
| Normal | 200ms | Transitions |
| Slow | 300ms | Page transitions, modals |
| Deliberate | 500ms | Loading states |

### Standard Transitions

```css
/* Hover transitions */
.transition-colors { transition: color, background-color 150ms ease-out; }

/* Layout transitions */
.transition-all { transition: all 200ms ease-in-out; }
```

---

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |

### Layout Patterns

```tsx
// 2-column with sidebar
<div className="grid gap-6 lg:grid-cols-[1fr_300px]">
  <main>{/* Content */}</main>
  <aside>{/* Sidebar */}</aside>
</div>

// Card grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {cards}
</div>

// Stats grid
<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
  {stats}
</div>
```

---

## Icons

Use Lucide React icons consistently.

### Size Scale

| Size | Class | Usage |
|------|-------|-------|
| XS | `h-3 w-3` | Inline with small text, badges |
| SM | `h-4 w-4` | Buttons, labels |
| MD | `h-5 w-5` | Card headers, navigation |
| LG | `h-6 w-6` | Feature highlights |
| XL | `h-8 w-8` | Hero icons |
| 2XL | `h-12 w-12` | Empty states |

### Cultural Icons

| Icon | Usage |
|------|-------|
| `Crown` | Elder, knowledge keeper |
| `Shield` | Protection, sacred content |
| `Users` | Community, family |
| `Heart` | Empathy, care |
| `Vault` | Story vault, ownership |
| `History` | Timeline, provenance |
| `FileCheck` | Consent, verification |

---

## Dark Mode

The design system supports dark mode via the `dark` class:

```css
.dark {
  --background: earth-950;
  --foreground: earth-100;
  --card: earth-900;
  --card-foreground: earth-100;
  --primary: earth-400;
  --primary-foreground: earth-950;
  /* ... etc */
}
```

Apply dark mode classes:

```tsx
<div className="bg-white dark:bg-earth-900 text-earth-800 dark:text-earth-100">
  Content
</div>
```

---

## File Organization

```
src/
├── app/
│   └── globals.css          # CSS variables, base styles
├── components/
│   └── ui/                   # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
└── lib/
    └── utils.ts              # cn() helper
tailwind.config.ts            # Theme configuration
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-12 | Initial design system documentation |

---

## Quick Reference

### Common Classes

```tsx
// Primary button
"bg-earth-600 hover:bg-earth-700 text-white"

// Card
"bg-white border border-earth-200 rounded-lg shadow-soft"

// Cultural card
"bg-clay-50 border border-clay-200 shadow-cultural"

// Success badge
"bg-sage-100 text-sage-700 border border-sage-200"

// Text hierarchy
"text-earth-800"  // Headings
"text-earth-600"  // Body
"text-earth-500"  // Muted/secondary

// Focus ring
"focus:ring-2 focus:ring-earth-500 focus:ring-offset-2"
```

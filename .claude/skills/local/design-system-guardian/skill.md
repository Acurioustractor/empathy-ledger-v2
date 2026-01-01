# Design System Guardian Skill

**Purpose**: Monitor and enforce design consistency, brand alignment, and accessibility standards across the entire Empathy Ledger platform - from admin pages to public frontend, ensuring Editorial Warmth design system compliance and cultural sensitivity.

## When to Use This Skill

Invoke when:
- Reviewing pull requests for design consistency
- Auditing sections of the site for brand compliance
- Checking accessibility standards (WCAG 2.1 AA)
- Ensuring cultural sensitivity in UI/UX
- Validating design system token usage
- Identifying design debt and inconsistencies
- Preparing for design system documentation
- Onboarding new developers to design standards

## What This Skill Monitors

### 1. Design System Compliance

**Editorial Warmth Palette Adherence:**
- ✅ Background colors use `bg-cream` not hardcoded hex
- ✅ Text uses `text-ink-900` for primary content
- ✅ Accents use `sunshine-yellow` for CTAs
- ✅ Cultural elements use earth/clay/sage/stone tokens
- ✅ Dark mode uses proper `dark:` variants
- ❌ No arbitrary colors (`bg-[#faf8f5]`)
- ❌ No non-design-system grays or blues

**Typography Standards:**
```typescript
// ✅ Correct usage
<Typography variant="font-display" size="display-2xl">Headline</Typography>
<Typography variant="body-lg">Body text</Typography>

// ❌ Incorrect usage
<h1 className="text-5xl font-bold">Headline</h1> // Missing design tokens
<p style={{fontSize: '18px'}}>Body text</p> // Inline styles
```

**Spacing System (8px grid):**
- ✅ Use: `p-4` (16px), `m-8` (32px), `gap-6` (24px)
- ❌ Avoid: `p-5` (20px - not on grid), arbitrary values `p-[13px]`

**Component Variant Usage:**
```typescript
// ✅ Use predefined variants
<Button variant="earth-primary">Primary Action</Button>
<Badge variant="clay-soft">Cultural Badge</Badge>

// ❌ Custom styling instead of variants
<Button className="bg-blue-500">Action</Button> // Wrong color
<div className="badge">Custom Badge</div> // Not using Badge component
```

### 2. Brand Consistency

**Voice & Terminology:**
- ✅ "Storyteller" not "user" or "contributor"
- ✅ "Story" not "post" or "content"
- ✅ "Community" not "audience" or "followers"
- ✅ "Elder" with capital E (respect)
- ✅ "Traditional territory" not "location"
- ✅ "Cultural background" not "ethnicity"

**Consistent Messaging:**
- Main tagline: "Every Story Matters"
- Primary CTA: "Capture Your Story"
- Secondary CTA: "Explore Stories"
- Contact: hello@empathyledger.com

**Logo & Branding:**
- Logo placement: Top left, 40px height
- Wordmark + icon on desktop
- Icon only on mobile (< 768px)
- Tagline in footer: "Preserving Culture Through Story"

### 3. Accessibility (WCAG 2.1 AA)

**Color Contrast:**
```typescript
// ✅ AA-compliant contrast ratios
text-ink-900 on bg-cream // 12.5:1 (AAA)
text-sage-700 on bg-white // 4.8:1 (AA)

// ❌ Insufficient contrast
text-gray-300 on bg-white // 2.1:1 (Fail)
text-sunshine-yellow on bg-cream // 1.2:1 (Fail)
```

**Keyboard Navigation:**
- ✅ All interactive elements have `focus-visible:` states
- ✅ Tab order follows visual flow
- ✅ Modal focus traps work properly
- ✅ Skip links present on all pages
- ❌ No keyboard traps (infinite loops)
- ❌ No hidden interactive elements

**ARIA Labels:**
```tsx
// ✅ Proper ARIA usage
<button aria-label="Close modal">
  <X className="w-4 h-4" />
</button>

<img src={avatar} alt={`${storyteller.display_name}'s profile photo`} />

// ❌ Missing ARIA
<button><X /></button> // No label for screen reader
<img src={avatar} /> // No alt text
```

**Touch Targets:**
- ✅ Minimum 44x44px for all touchable elements
- ✅ Adequate spacing between clickable items (8px+)
- ❌ Small buttons on mobile (< 44px)

### 4. Cultural Sensitivity

**Elder Recognition:**
```tsx
// ✅ Respectful elder display
{storyteller.is_elder && (
  <Badge variant="clay-soft" className="flex items-center gap-1">
    <Crown className="w-3 h-3" />
    Elder
  </Badge>
)}

// ❌ Casual or insufficient marking
{storyteller.is_elder && <span>Elder</span>}
```

**Cultural Context Display:**
```tsx
// ✅ Proper cultural background presentation
<div className="flex items-center gap-2 text-muted-foreground">
  <MapPin className="w-4 h-4 text-terracotta-500" />
  <span className="text-sm">
    {storyteller.cultural_background}
    {storyteller.traditional_territory && (
      <span className="italic text-xs ml-1">
        ({storyteller.traditional_territory})
      </span>
    )}
  </span>
</div>

// ❌ Insufficient context
<div>{storyteller.cultural_background}</div>
```

**Cultural Protocol Indicators:**
- ✅ Shield icon for sensitive content
- ✅ Elder approval badges
- ✅ Community-only indicators
- ✅ Traditional knowledge markers

**Language Sensitivity:**
- ✅ "Traditional territory" not "region"
- ✅ "Cultural background" not "race"
- ✅ "Knowledge keeper" not "expert"
- ✅ "Community" not "tribe" (unless specified)

### 5. Responsive Design

**Breakpoint Usage:**
```tsx
// ✅ Mobile-first, progressive enhancement
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

// ❌ Desktop-first
<div className="grid grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
```

**Mobile Optimizations:**
- ✅ Bottom navigation on mobile (< 768px)
- ✅ Horizontal scroll for cards with snap points
- ✅ Touch-friendly targets (44px min)
- ✅ Safe area insets for notched devices
- ❌ Tables without mobile optimization
- ❌ Fixed-width content overflowing

**Responsive Images:**
```tsx
// ✅ Next.js Image with responsive sizing
<Image
  src={storyteller.avatar_url}
  alt={storyteller.display_name}
  width={320}
  height={320}
  className="object-cover"
/>

// ❌ Fixed-size images
<img src={avatar} width="320" height="320" />
```

### 6. Component Consistency

**Card Components:**
```tsx
// ✅ Use shared card components
<StorytellerCard storyteller={data} variant="default" />
<StoryCard story={data} variant="featured" />

// ❌ Inline card implementations
<div className="card">
  <img src={avatar} />
  <h3>{name}</h3>
</div>
```

**Button Hierarchy:**
```tsx
// ✅ Consistent button usage
<Button variant="earth-primary">Primary Action</Button>
<Button variant="clay-secondary">Secondary</Button>
<Button variant="ghost">Tertiary</Button>

// ❌ Inconsistent button variants
<Button variant="earth-primary">Submit</Button>
<Button variant="ink-900">Save</Button> // Should also be earth-primary
```

**Form Patterns:**
- ✅ Consistent label positioning (top-left)
- ✅ Error messages below inputs in destructive color
- ✅ Required field indicators (*)
- ✅ Help text in muted-foreground
- ❌ Validation on blur vs on submit inconsistency

### 7. Loading & Error States

**Loading Patterns:**
```tsx
// ✅ Use skeleton loaders
{isLoading ? (
  <StorytellerCardSkeleton />
) : (
  <StorytellerCard storyteller={data} />
)}

// ❌ Generic spinners everywhere
{isLoading && <Spinner />}
```

**Error States:**
```tsx
// ✅ Illustrated error states
<EmptyState
  icon={<AlertCircle className="w-12 h-12 text-destructive" />}
  title="Unable to load stories"
  description="Please try again or contact support"
  action={<Button onClick={retry}>Try Again</Button>}
/>

// ❌ Text-only errors
{error && <p>Error loading stories</p>}
```

**Empty States:**
```tsx
// ✅ Encouraging empty states
<EmptyState
  icon={<BookOpen className="w-12 h-12 text-sage-500" />}
  title="No stories yet"
  description="Share your first story to get started"
  action={<Button href="/stories/new">Capture Your Story</Button>}
/>

// ❌ Blank screens
{stories.length === 0 && <div>No stories</div>}
```

### 8. Dark Mode Consistency

**Proper Dark Mode:**
```tsx
// ✅ Dark mode variants
<div className="bg-cream dark:bg-ink-950">
  <h1 className="text-ink-900 dark:text-cream">Headline</h1>
  <p className="text-ink-700 dark:text-cream-200">Body text</p>
</div>

// ❌ Missing dark mode
<div className="bg-white">
  <h1 className="text-black">Headline</h1>
</div>
```

**Dark Mode Testing:**
- ✅ All pages tested in dark mode
- ✅ Images have appropriate contrast
- ✅ Borders visible in both modes
- ✅ Shadows work in both modes
- ❌ Low-contrast elements in dark mode

## Audit Checklist

When reviewing a page or component, check:

### Design System ✓
- [ ] Uses design tokens (no hardcoded colors)
- [ ] Follows Editorial Warmth palette
- [ ] Typography uses design system variants
- [ ] Spacing follows 8px grid
- [ ] Components use predefined variants
- [ ] No arbitrary values

### Brand ✓
- [ ] Consistent voice and terminology
- [ ] Correct taglines and CTAs
- [ ] Proper logo placement and sizing
- [ ] Contact info standardized
- [ ] Cultural language used respectfully

### Accessibility ✓
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 UI)
- [ ] All interactive elements keyboard accessible
- [ ] Focus states visible and styled
- [ ] ARIA labels on icon buttons and images
- [ ] Touch targets minimum 44x44px
- [ ] Skip links present
- [ ] No keyboard traps

### Cultural Sensitivity ✓
- [ ] Elder status prominently and respectfully displayed
- [ ] Traditional territory acknowledged
- [ ] Cultural background shown with context
- [ ] Knowledge keeper indicators present
- [ ] Sensitive content flagged appropriately
- [ ] OCAP principles visible (where applicable)

### Responsive ✓
- [ ] Mobile-first breakpoint usage
- [ ] Bottom nav on mobile
- [ ] Touch-friendly targets
- [ ] Horizontal scroll optimized
- [ ] Tables work on mobile
- [ ] Safe area insets for notched devices

### Consistency ✓
- [ ] Uses shared components (not reinventing)
- [ ] Button hierarchy consistent
- [ ] Card variants match section purpose
- [ ] Form patterns standardized
- [ ] Error messages styled consistently

### States ✓
- [ ] Loading states use skeletons
- [ ] Error states have illustrations
- [ ] Empty states encouraging
- [ ] Success feedback provided
- [ ] Disabled states clearly visible

### Dark Mode ✓
- [ ] All elements have dark variants
- [ ] Tested in dark mode
- [ ] Contrast maintained
- [ ] Images work in both modes
- [ ] Borders and shadows visible

## Common Issues & Fixes

### Issue 1: Inconsistent Button Styles

**❌ Problem:**
```tsx
// Different primary buttons across site
<Button className="bg-earth-600">Save</Button>
<Button className="bg-ink-900">Submit</Button>
<Button variant="clay-primary">Continue</Button>
```

**✅ Solution:**
```tsx
// Standardize on earth-primary for all primary actions
<Button variant="earth-primary">Save</Button>
<Button variant="earth-primary">Submit</Button>
<Button variant="earth-primary">Continue</Button>
```

### Issue 2: Missing Dark Mode

**❌ Problem:**
```tsx
<div className="bg-white text-black">
  Content
</div>
```

**✅ Solution:**
```tsx
<div className="bg-cream dark:bg-ink-950 text-ink-900 dark:text-cream">
  Content
</div>
```

### Issue 3: Inaccessible Icons

**❌ Problem:**
```tsx
<button onClick={close}>
  <X className="w-4 h-4" />
</button>
```

**✅ Solution:**
```tsx
<button onClick={close} aria-label="Close dialog">
  <X className="w-4 h-4" aria-hidden="true" />
</button>
```

### Issue 4: Hardcoded Colors

**❌ Problem:**
```tsx
<div style={{backgroundColor: '#faf8f5'}}>
```

**✅ Solution:**
```tsx
<div className="bg-cream">
```

### Issue 5: Missing Loading State

**❌ Problem:**
```tsx
{data && <StorytellerCard storyteller={data} />}
```

**✅ Solution:**
```tsx
{isLoading ? (
  <StorytellerCardSkeleton />
) : data ? (
  <StorytellerCard storyteller={data} />
) : (
  <EmptyState title="Storyteller not found" />
)}
```

### Issue 6: Small Touch Targets

**❌ Problem:**
```tsx
<button className="w-6 h-6">
  <X className="w-4 h-4" />
</button>
```

**✅ Solution:**
```tsx
<button className="w-11 h-11 flex items-center justify-center"> {/* 44px */}
  <X className="w-4 h-4" />
</button>
```

### Issue 7: Inconsistent Elder Display

**❌ Problem:**
```tsx
{storyteller.is_elder && <span>Elder</span>}
```

**✅ Solution:**
```tsx
{storyteller.is_elder && (
  <Badge variant="clay-soft" className="flex items-center gap-1">
    <Crown className="w-3 h-3" />
    Elder
  </Badge>
)}
```

### Issue 8: Text-Only Errors

**❌ Problem:**
```tsx
{error && <p className="text-red-500">Error loading data</p>}
```

**✅ Solution:**
```tsx
{error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Unable to load data</AlertTitle>
    <AlertDescription>
      {error.message}
      <Button variant="ghost" onClick={retry} className="mt-2">
        Try Again
      </Button>
    </AlertDescription>
  </Alert>
)}
```

## Automated Checks

### ESLint Rules to Add

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    // Enforce design token usage
    'no-restricted-syntax': [
      'error',
      {
        selector: 'JSXAttribute[name.name="style"]',
        message: 'Inline styles forbidden. Use Tailwind classes or design tokens.'
      },
      {
        selector: 'Literal[value=/#[0-9a-fA-F]{3,8}/]',
        message: 'Hardcoded hex colors forbidden. Use design tokens.'
      }
    ],

    // Require alt text on images
    'jsx-a11y/alt-text': 'error',

    // Require ARIA labels on buttons without text
    'jsx-a11y/button-has-type': 'error',
    'jsx-a11y/aria-props': 'error',

    // Enforce semantic HTML
    'jsx-a11y/heading-has-content': 'error',
    'jsx-a11y/anchor-is-valid': 'error'
  }
};
```

### VS Code Snippets

```json
// .vscode/empathy-ledger.code-snippets
{
  "Cultural Badge": {
    "prefix": "cbadge",
    "body": [
      "<Badge variant=\"clay-soft\" className=\"flex items-center gap-1\">",
      "  <${1:Icon} className=\"w-3 h-3\" />",
      "  ${2:Label}",
      "</Badge>"
    ]
  },

  "Loading State": {
    "prefix": "loading",
    "body": [
      "{isLoading ? (",
      "  <${1:Component}Skeleton />",
      ") : ${2:data} ? (",
      "  <${1:Component} ${3:prop}={${2:data}} />",
      ") : (",
      "  <EmptyState title=\"${4:Not found}\" />",
      ")}"
    ]
  }
}
```

### GitHub Actions Workflow

```yaml
# .github/workflows/design-system-audit.yml
name: Design System Audit

on: [pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Check for hardcoded colors
        run: |
          if grep -r '#[0-9a-fA-F]\{6\}' src/ --exclude-dir=node_modules; then
            echo "Found hardcoded hex colors. Use design tokens instead."
            exit 1
          fi

      - name: Check for inline styles
        run: |
          if grep -r 'style={{' src/ --exclude-dir=node_modules; then
            echo "Found inline styles. Use Tailwind classes instead."
            exit 1
          fi

      - name: Accessibility audit
        run: npm run a11y-audit
```

## Integration with Development Workflow

### Pull Request Template

```markdown
## Design System Checklist

Before merging, ensure:

- [ ] Uses design tokens (no hardcoded colors)
- [ ] Follows Editorial Warmth palette
- [ ] Dark mode tested and working
- [ ] Accessibility reviewed (WCAG AA)
- [ ] Cultural sensitivity verified
- [ ] Loading/error states implemented
- [ ] Mobile responsive (tested on device)
- [ ] Uses shared components
- [ ] Brand voice consistent

## Design Review

- [ ] Design system guardian skill run
- [ ] Accessibility audit passed
- [ ] Mobile tested on real device
- [ ] Dark mode screenshots attached
```

### Pre-commit Hook

```bash
#!/bin/sh
# .husky/pre-commit

# Run design system checks
npm run design-system:check || {
  echo "Design system violations found. Run 'npm run design-system:fix' to auto-fix."
  exit 1
}

# Run accessibility audit on changed files
npm run a11y:check:staged
```

## Reporting Format

When using this skill, provide reports in this format:

```markdown
# Design System Audit: [Page/Component Name]

**Date**: YYYY-MM-DD
**Auditor**: [Name/Agent]
**Scope**: [Files audited]

## Overall Grade: [A/B/C/D/F]

## Findings Summary

- ✅ Strengths: [Count] compliance areas
- ⚠️ Issues: [Count] medium priority
- ❌ Critical: [Count] high priority

---

## Section-by-Section Breakdown

### [Section Name]

**Grade**: [A/B/C/D/F]

**Compliance:**
- ✅ Design tokens: [Y/N]
- ✅ Accessibility: [Y/N]
- ✅ Dark mode: [Y/N]
- ✅ Cultural sensitivity: [Y/N]
- ✅ Responsive: [Y/N]

**Issues Found:**

1. **[Issue Title]** (Priority: High/Medium/Low)
   - **Location**: [File:Line]
   - **Problem**: [Description]
   - **Fix**: [Code example]

---

## Priority Issues (Fix Immediately)

1. [Issue 1]
2. [Issue 2]

## Recommendations

1. [Recommendation 1]
2. [Recommendation 2]

## Positive Examples

- [File/component doing it right]
- [Another good example]

---

**Next Audit**: [Date]
```

## Success Metrics

Track these metrics over time:

- **Design Token Usage**: % of colors using tokens vs hardcoded
- **Accessibility Score**: % of pages passing WCAG AA
- **Dark Mode Coverage**: % of components with dark variants
- **Component Reuse**: % of UI using shared components vs custom
- **Brand Consistency**: % of pages using correct terminology
- **Loading State Coverage**: % of async operations with proper states
- **Mobile Optimization**: % of pages tested on real devices
- **Cultural Sensitivity**: % of cultural elements properly marked

## Resources

### Design System Documentation
- Color tokens: `src/app/globals.css`
- Typography: `src/components/ui/typography.tsx`
- Components: `src/components/ui/`
- Examples: `src/app/` (page implementations)

### External References
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- Tailwind CSS: https://tailwindcss.com/docs
- Next.js Accessibility: https://nextjs.org/docs/accessibility
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/

### Internal Tools
- Design system Figma: [Link]
- Component Storybook: [Link]
- Accessibility testing: `npm run a11y-audit`
- Visual regression: `npm run test:visual`

---

**Skill Version**: 1.0.0
**Last Updated**: 2025-12-26
**Maintained By**: Design & Engineering Teams

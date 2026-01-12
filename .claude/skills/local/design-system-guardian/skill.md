# Design System Guardian

Enforce design consistency, brand alignment, and accessibility standards across Empathy Ledger.

## When to Use
- PR reviews for design consistency
- Auditing brand compliance
- Checking WCAG 2.1 AA accessibility
- Validating design token usage
- Ensuring cultural sensitivity in UI

## Quick Checks

### Colors
✅ Use tokens: `bg-cream`, `text-ink-900`, `sunshine-yellow`
❌ No hardcoded hex: `bg-[#faf8f5]`

### Typography
✅ Use `<Typography variant="..." size="...">`
❌ No raw `text-5xl font-bold`

### Spacing (8px grid)
✅ `p-4` (16px), `m-8` (32px), `gap-6` (24px)
❌ `p-5` (20px), `p-[13px]`

### Components
✅ `<Button variant="earth-primary">`
❌ `<button className="bg-blue-500">`

### Terminology
✅ Storyteller, Story, Community, Elder
❌ User, Post, Audience, elder

## Reference Files
| Topic | File |
|-------|------|
| Color system | `refs/colors.md` |
| Typography | `refs/typography.md` |
| Voice & brand | `refs/voice.md` |
| Accessibility | `refs/accessibility.md` |

## Brand Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Terracotta | #D97757 | Primary accent |
| Sage | #2D5F4F | Secondary |
| Ochre | #D4A373 | Warmth |
| Cream | #F8F6F1 | Background |
| Charcoal | #2C2C2C | Text |

## Anti-Patterns
❌ Inline styles
❌ Non-semantic HTML
❌ Missing alt text
❌ Invisible focus states
❌ Disrespectful terminology

## Related Skills
- `design-component` - Component patterns
- `cultural-review` - Cultural sensitivity
- `empathy-ledger-codebase` - Architecture

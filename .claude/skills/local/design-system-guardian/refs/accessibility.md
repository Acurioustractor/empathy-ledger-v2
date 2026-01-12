# Accessibility (WCAG 2.1 AA)

## Color Contrast
- Text on cream: 4.5:1 minimum (AA)
- Large text: 3:1 minimum
- Interactive elements: 3:1 against adjacent
- Test tool: WebAIM Contrast Checker

## Focus States
```tsx
// ✅ Visible focus
className="focus:ring-2 focus:ring-sunshine-yellow focus:outline-none"

// ❌ Invisible focus
className="focus:outline-none" // Missing ring
```

## Keyboard Navigation
- All interactive elements tabbable
- Logical tab order
- Escape closes modals
- Arrow keys in dropdowns

## Screen Readers
```tsx
// ✅ Accessible
<Button aria-label="Close dialog">×</Button>
<Image src="..." alt="Elder Grace sharing story" />

// ❌ Inaccessible
<Button>×</Button> // No label
<Image src="..." alt="" /> // Empty alt
```

## Semantic HTML
- Use `<nav>`, `<main>`, `<article>`, `<aside>`
- Proper heading hierarchy (h1 → h2 → h3)
- Lists for related items
- Tables for tabular data only

## Motion
- Respect `prefers-reduced-motion`
- Pause/stop controls for animations

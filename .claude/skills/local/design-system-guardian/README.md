# Design System Guardian Skill

**Automated design consistency monitoring for Empathy Ledger**

## Quick Start

```bash
# Invoke the skill
"Review the homepage for design system compliance"
"Audit the admin section for accessibility"
"Check dark mode consistency across storyteller pages"
```

## What It Does

The Design System Guardian ensures that **every page and component** across Empathy Ledger maintains:

✅ **Design System Compliance** - Editorial Warmth palette, typography, spacing
✅ **Brand Consistency** - Voice, terminology, logos, CTAs
✅ **Accessibility Standards** - WCAG 2.1 AA compliance
✅ **Cultural Sensitivity** - Respectful Elder recognition, traditional territory display
✅ **Responsive Design** - Mobile-first, touch-friendly, safe areas
✅ **Component Reuse** - Shared components, no reinvention
✅ **Loading & Error States** - Skeletons, illustrations, feedback
✅ **Dark Mode** - Full coverage with proper contrast

## When to Use

### During Development
- Before submitting pull requests
- When creating new components
- Adding new pages or features
- Refactoring UI code

### During Review
- Code review process
- Design QA sessions
- Accessibility audits
- Pre-release checks

### Continuous Monitoring
- Weekly design system audits
- Post-deploy verification
- Regression prevention
- Technical debt tracking

## How It Works

### 1. Automated Checks

**ESLint Integration:**
- Flags hardcoded colors
- Requires ARIA labels
- Enforces semantic HTML
- Detects inline styles

**Visual Regression:**
- Screenshot comparison
- Layout shift detection
- Color palette verification

**Accessibility Testing:**
- Contrast ratio validation
- Keyboard navigation checks
- Screen reader compatibility

### 2. Manual Review

**Audit Checklist** (8 categories):
1. Design System tokens usage
2. Brand voice and terminology
3. Accessibility (WCAG AA)
4. Cultural sensitivity markers
5. Responsive breakpoints
6. Component consistency
7. State management (loading/error)
8. Dark mode coverage

### 3. Reporting

**Output Format:**
```markdown
# Design System Audit: [Component/Page]

## Overall Grade: B+

## Findings:
- ✅ 12 compliance areas
- ⚠️ 5 medium priority issues
- ❌ 2 critical fixes needed

[Detailed breakdown with code examples]
```

## Common Issues Detected

### Design System Violations
- Hardcoded hex colors (`#faf8f5` instead of `bg-cream`)
- Arbitrary spacing values (`p-[13px]` not on 8px grid)
- Custom button styles (not using variants)
- Missing dark mode variants

### Accessibility Problems
- Low contrast ratios (< 4.5:1)
- Missing ARIA labels on icon buttons
- Small touch targets (< 44px)
- No skip links
- Keyboard traps

### Brand Inconsistencies
- Wrong CTAs ("Get Started" vs "Capture Your Story")
- Terminology ("user" instead of "storyteller")
- Logo sizing variations
- Tagline differences

### Cultural Sensitivity
- Missing Elder badges
- Insufficient traditional territory context
- Generic "location" instead of cultural language
- No cultural protocol indicators

## Integration

### Pre-commit Hook

```bash
#!/bin/sh
npm run design-system:check || exit 1
```

### GitHub Actions

```yaml
- name: Design System Audit
  run: npm run design-system:audit
```

### Pull Request Template

```markdown
## Design System Checklist
- [ ] Design tokens used (no hardcoded colors)
- [ ] Accessibility reviewed (WCAG AA)
- [ ] Dark mode tested
- [ ] Mobile responsive
- [ ] Cultural sensitivity verified
```

## Example Usage

### Audit a Component

```typescript
// Invoke: "Review StorytellerCard for design compliance"

// Skill checks:
// ✅ Uses design tokens
// ✅ ARIA labels present
// ✅ Touch targets 44px+
// ⚠️ Dark mode not tested
// ❌ Hardcoded color in hover state
```

### Audit a Page

```typescript
// Invoke: "Audit /admin/analytics for consistency"

// Skill reports:
// ✅ Responsive layout
// ✅ Loading states
// ❌ Admin section not using Editorial Warmth
// ❌ Tables lack cultural variants
// ⚠️ Some charts not accessible
```

### Check Accessibility

```typescript
// Invoke: "WCAG audit on storytellers page"

// Skill validates:
// ✅ Color contrast (AA)
// ✅ Keyboard navigation
// ⚠️ Some images missing alt text
// ❌ Modal focus trap incomplete
```

## Metrics Tracked

**Over Time:**
- Design token adoption rate
- Accessibility compliance %
- Dark mode coverage %
- Component reuse ratio
- Brand consistency score
- Mobile optimization %
- Loading state coverage

**Per Audit:**
- Issues found (Critical/Medium/Low)
- Compliance score (A-F grade)
- Components reviewed
- Pages audited
- Recommendations count

## Best Practices

### For Developers

1. **Run locally before commit**
   ```bash
   npm run design-system:check
   ```

2. **Use VS Code snippets**
   - Type `cbadge` for cultural badges
   - Type `loading` for loading states

3. **Check generated report**
   - Review priority issues first
   - Apply recommended fixes
   - Re-run to verify

### For Designers

1. **Update design tokens first**
   - Add to `globals.css`
   - Document in Figma
   - Communicate to team

2. **Create component variants**
   - Add to component library
   - Include dark mode
   - Document usage

3. **Maintain Storybook**
   - Add new components
   - Include accessibility notes
   - Show all variants

### For QA

1. **Include in test plan**
   - Design system compliance
   - Accessibility checks
   - Mobile device testing

2. **Automated testing**
   - Visual regression
   - Contrast validation
   - Keyboard navigation

3. **Manual verification**
   - Dark mode testing
   - Screen reader testing
   - Real device testing

## Configuration

### Customize Rules

```json
// .design-system-guardian.json
{
  "rules": {
    "enforceDesignTokens": "error",
    "requireARIALabels": "error",
    "minimumContrast": 4.5,
    "minimumTouchTarget": 44,
    "allowArbitraryValues": false,
    "darkModeRequired": true
  },
  "ignore": [
    "src/app/test-*",
    "**/*.test.tsx"
  ]
}
```

### Custom Checks

```typescript
// Add custom validation
export const customChecks = {
  elderBadgeRequired: (component) => {
    if (component.props.storyteller?.is_elder) {
      return component.children.includes('Crown')
        ? 'pass'
        : 'fail: Missing Elder badge';
    }
    return 'pass';
  }
};
```

## Troubleshooting

**Q: Too many false positives?**
A: Adjust sensitivity in config file, add exceptions for edge cases

**Q: Slow performance?**
A: Enable caching, run on changed files only in CI

**Q: Accessibility checks failing?**
A: Review WCAG guidelines, use browser DevTools Lighthouse

**Q: Dark mode issues?**
A: Test with system preference toggle, check all CSS variables

## Resources

- **Design System**: `src/app/globals.css`
- **Component Library**: `src/components/ui/`
- **Audit Examples**: `.claude/skills/design-system-guardian/skill.md`
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/

## Support

**Issues**: Open GitHub issue with `design-system` label
**Questions**: #design-system Slack channel
**Updates**: Follow changelog in skill.md

---

**Version**: 1.0.0
**Last Updated**: 2025-12-26
**Maintained By**: Design & Engineering Teams

# Design Component

Design a new React component for Empathy Ledger following cultural design principles.

## Instructions

1. **Analyze the request**: Understand what component is needed and its purpose
2. **Check existing components**: Look for similar patterns in `src/components/`
3. **Apply cultural design**: Use the cultural color palette (clay, sage, sky, ember)
4. **Create with TypeScript**: Full type safety with proper interfaces
5. **Include accessibility**: ARIA attributes, keyboard navigation
6. **Test considerations**: Add data-testid attributes for testing

## Component Requirements

- Use shadcn/ui as base when applicable
- Apply 'use client' directive for interactive components
- Export proper TypeScript interfaces
- Include className prop with cn() for customization
- Consider dark mode support
- Follow trauma-informed design (gentle transitions)

## Output

Create the component file with:
1. TypeScript interface for props
2. Component implementation
3. Default export
4. Comments for complex logic

## Reference

- Check `.claude/agents/frontend-designer.md` for patterns
- Look at existing components in `src/components/vault/` as examples
- Use colors from `tailwind.config.ts`

---

**Component to design:** $ARGUMENTS

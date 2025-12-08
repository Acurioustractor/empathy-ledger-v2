# Contributing to Empathy Ledger

Thank you for your interest in contributing to Empathy Ledger. This platform serves Indigenous communities, and we take cultural safety and respect seriously in all contributions.

## Cultural Guidelines

Before contributing, please understand:

- **OCAP Principles**: All code must respect Ownership, Control, Access, and Possession principles
- **Cultural Sensitivity**: Consider the cultural impact of features on Indigenous communities
- **Elder Review**: Content-related features may require elder review workflows
- **Data Sovereignty**: Indigenous data must remain under community control

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Supabase account (for local development)

### Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/empathy-ledger-v2.git
   cd empathy-ledger-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## Branch Strategy

```
main (protected)
  └── develop (default for PRs)
        └── feature/your-feature-name
```

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions

### Workflow

1. Create a branch from `develop`
2. Make your changes
3. Write/update tests
4. Submit a PR to `develop`
5. After review, changes merge to `develop`
6. Periodically, `develop` is merged to `main` for release

## Code Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types (avoid `any`)
- Use interfaces for component props
- Export types from `src/types/`

### React Components

```tsx
// Component template
'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface MyComponentProps {
  title: string
  className?: string
}

export function MyComponent({ title, className }: MyComponentProps) {
  return (
    <div className={cn('base-styles', className)}>
      {title}
    </div>
  )
}
```

### Styling

- Use Tailwind CSS classes
- Follow the design system in `docs/DESIGN_SYSTEM.md`
- Use brand colours: `earth-*`, `clay-*`, `sage-*`
- Avoid inline styles

### Accessibility

- All interactive elements need ARIA labels
- Minimum touch target: 44x44px
- Colour contrast: WCAG AA (4.5:1)
- Test with screen readers

## Pull Request Process

### Before Submitting

- [ ] Code passes `npm run lint`
- [ ] Code passes `npm run type-check`
- [ ] Tests pass `npm test`
- [ ] Build succeeds `npm run build`
- [ ] Documentation updated if needed

### PR Template

When creating a PR, include:

```markdown
## Summary
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Refactoring

## Cultural Considerations
Describe any cultural safety implications

## Testing
How was this tested?

## Screenshots
If UI changes, include before/after screenshots
```

### Review Process

1. Automated checks must pass
2. At least 1 code review approval
3. Cultural safety review if content-related
4. Documentation updated

## Documentation

### Where to Put Documentation

| Type | Location |
|------|----------|
| API documentation | `docs/api/` |
| Architecture decisions | `docs/architecture/` |
| User guides | `docs/guides/` |
| Cultural protocols | `docs/cultural/` |
| Design system | `docs/design/` |

### Documentation Standards

- Use Australian English spelling (colour, organisation)
- Include code examples where applicable
- Update table of contents if adding sections
- Link to related documentation

## Testing

### Running Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

### Writing Tests

- Place tests adjacent to source files or in `tests/`
- Use descriptive test names
- Test accessibility requirements
- Mock external services

## Cultural Safety Considerations

When working on features that handle:

- **User content**: Consider consent workflows
- **Personal stories**: Implement cultural sensitivity levels
- **Community data**: Ensure OCAP compliance
- **Elder features**: Include review workflows
- **Sensitive content**: Add appropriate warnings

### Questions?

If unsure about cultural implications, ask in the PR or create a discussion.

## Getting Help

- **Issues**: Report bugs or request features
- **Discussions**: Ask questions or propose ideas
- **Documentation**: Check `docs/` for guides

## Code of Conduct

We are committed to providing a welcoming and inclusive experience. Please:

- Be respectful of Indigenous cultures and protocols
- Use inclusive language
- Welcome newcomers
- Give constructive feedback
- Report harassment or concerns

## Recognition

Contributors are recognised in:
- The GitHub contributors page
- Release notes for significant contributions

---

Thank you for helping build a platform that serves Indigenous communities with respect and integrity.

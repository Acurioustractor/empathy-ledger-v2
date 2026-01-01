# Getting Started - Empathy Ledger v2

**World-class Indigenous storytelling platform rebuild**

---

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/Acurioustractor/empathy-ledger-v2.git
cd empathy-ledger-v2
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Start development
./scripts/start-sprint-1.sh

# OR manually:
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Project Overview

### Mission
Platform for Indigenous communities and organizations to:
- **Storytellers**: Share oral narratives with full data sovereignty (OCAP®)
- **Organizations**: Track impact, manage projects, analyze SROI
- **Public**: Discover powerful stories with cultural safety protocols

### Core Principles
- **Indigenous Data Sovereignty**: OCAP® (Ownership, Control, Access, Possession)
- **Cultural Safety Non-Negotiable**: Elder review, sacred content protection
- **ALMA Integration**: Adaptive Learning for Meaningful Accountability
- **Trauma-Informed Design**: Gentle transitions, consent-first

---

## Current Status

✅ **Complete Strategic Foundation** (13,754 lines of planning)
- 120-page strategic plan with mission alignment
- 16-week sprint breakdown (8 sprints × 2 weeks)
- Complete brand & UI style guide (Editorial Warmth)
- All 53+ page routes architecture
- Smart gallery system design
- GitHub + Vercel deployment automation

🚧 **Next: Sprint 1** (Jan 6-17, 2026)
- Avatar component with fallback chain
- ProfilePage component
- PrivacySettingsPanel
- ALMA settings panel
- Profile edit functionality

---

## Documentation

### Strategic Planning
- **[Complete Strategic Plan](docs/EMPATHY_LEDGER_COMPLETE_STRATEGIC_PLAN.md)** - Full 120-page blueprint
- **[Sprint Plan](docs/SPRINT_PLAN_DETAILED.md)** - Day-by-day sprint breakdown
- **[Brand Guide](docs/BRAND_AND_UI_STYLE_GUIDE.md)** - Editorial Warmth design system
- **[Page Architecture](docs/COMPLETE_PAGE_ARCHITECTURE_WITH_MEDIA.md)** - All 53+ routes mapped
- **[Smart Gallery Guide](docs/SMART_GALLERY_QUICK_REFERENCE.md)** - Developer quick reference

### Development Workflow
- **[Development Workflow](.github/DEVELOPMENT_WORKFLOW.md)** - Complete GitHub + Vercel guide
- **[Mission Wiki](docs/EMPATHY_LEDGER_WIKI.md)** - Mission foundation
- **[Messaging Review](docs/EMPATHY_LEDGER_MESSAGING_REVIEW.md)** - Brand voice guidelines

### Database
- **171 production tables** (37% Priority 1 - Cultural Safety)
- **228 RLS policies** for multi-tenant isolation
- **88 stored functions** for business logic
- **208 transcripts**, 226 storytellers, 65+ organizations

---

## Tech Stack

### Frontend
- **Next.js 15** with App Router and Turbopack
- **React 19** with Server Components
- **TypeScript 5** with strict mode
- **Tailwind CSS 4** with Editorial Warmth palette
- **shadcn/ui** component library

### Backend
- **Supabase** (PostgreSQL + Auth + Storage + Realtime)
- **Row Level Security (RLS)** for multi-tenant isolation
- **Edge Functions** for serverless compute
- **Storage Buckets** for media assets

### AI & Analytics
- **OpenAI GPT-4** for theme extraction, impact analysis
- **Whisper** for audio transcription
- **Claude** (Sonnet 4.5) for story curation
- **ACT Farmhand** multi-agent system (ALMA, Impact Analyzer, Theme Extractor)

### Testing & CI/CD
- **Vitest** for unit tests
- **Playwright** for E2E tests
- **GitHub Actions** for CI/CD
- **Vercel** for deployment
- **Lighthouse** for performance audits

---

## Development Workflow

### Branch Strategy

```
main (production) → empathy-ledger.com
  ↑
develop (staging) → develop.empathy-ledger.com
  ↑
feat/sprint-1-profile-pages → unique-preview.vercel.app
```

### Creating a Feature

```bash
# 1. Create branch from develop
git checkout develop
git pull origin develop
git checkout -b feat/your-feature-name

# 2. Make changes
# ... code ...

# 3. Run tests
npm run pre-pr

# 4. Create PR
gh pr create --base develop --fill

# 5. Wait for CI/CD checks
# 6. Get approval, merge
gh pr merge --squash --delete-branch
```

### Deploying to Production

```bash
# End of sprint (every 2 weeks)
# Create release PR from develop to main
gh pr create --base main --head develop --title "Release: Sprint 1"

# After approval, merge triggers:
# 1. Automatic deployment to production
# 2. GitHub release tag
# 3. ACT Notion deployment log
# 4. Slack notification
```

---

## Sprint Schedule (16 weeks)

| Sprint | Dates | Focus | Deploy to Main |
|--------|-------|-------|----------------|
| Sprint 1 | Jan 6-17 | Profile Pages & Privacy | Jan 17 |
| Sprint 2 | Jan 20-31 | Smart Gallery System | Jan 31 |
| Sprint 3 | Feb 3-14 | Cultural Protection | Feb 14 |
| Sprint 4 | Feb 17-28 | Gallery Connections | Feb 28 |
| Sprint 5 | Mar 3-14 | Organization Pages | Mar 14 |
| Sprint 6 | Mar 17-28 | Project Management | Mar 28 |
| Sprint 7 | Mar 31-Apr 11 | AI Processing Pipeline | Apr 11 |
| Sprint 8 | Apr 14-25 | Security & Launch | Apr 25 🚀 |

---

## Key Commands

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production build
npm run start

# Lint code
npm run lint
npm run lint:fix

# Type check
npm run type-check
```

### Testing

```bash
# Run all tests
npm run test:all

# Unit tests
npm run test
npm run test:watch
npm run test:coverage

# E2E tests
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:debug

# Visual regression
npm run test:visual
npm run test:visual:update

# Pre-PR checks
npm run pre-pr
```

### Database

```bash
# Start local Supabase
npm run db:start

# Stop local Supabase
npm run db:stop

# Reset database
npm run db:reset

# Run migrations
npm run db:migrate

# Check status
npm run db:status

# Generate TypeScript types
npm run db:types
```

### Deployment

```bash
# Deploy to production
npm run deploy

# Deploy preview
npm run deploy:preview

# Via Vercel CLI
vercel --prod
vercel ls
vercel logs <deployment-url>
```

---

## Environment Variables

### Required Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Optional Variables

```bash
# OpenAI (for AI analysis)
OPENAI_API_KEY=your-openai-key

# Notion (for sprint tracking)
NOTION_TOKEN=your-notion-token
NOTION_DATABASE_ID=your-database-id

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

See [`.env.example`](.env.example) for complete list.

---

## Project Structure

```
empathy-ledger-v2/
├── .github/
│   ├── workflows/          # GitHub Actions (CI/CD, deploy)
│   └── DEVELOPMENT_WORKFLOW.md
├── docs/                   # Strategic planning (13,754 lines)
│   ├── EMPATHY_LEDGER_COMPLETE_STRATEGIC_PLAN.md
│   ├── SPRINT_PLAN_DETAILED.md
│   ├── BRAND_AND_UI_STYLE_GUIDE.md
│   ├── COMPLETE_PAGE_ARCHITECTURE_WITH_MEDIA.md
│   └── SMART_GALLERY_QUICK_REFERENCE.md
├── scripts/
│   └── start-sprint-1.sh   # Sprint startup automation
├── src/
│   ├── app/                # Next.js App Router pages
│   ├── components/         # React components
│   ├── lib/                # Utilities, database, AI
│   └── hooks/              # Custom React hooks
├── supabase/
│   └── migrations/         # Database migrations
├── tests/
│   ├── unit/               # Vitest unit tests
│   └── e2e/                # Playwright E2E tests
├── package.json            # 25 npm scripts
└── vercel.json             # Vercel configuration
```

---

## Design System (Editorial Warmth)

### Colors

```typescript
// Primary
ochre: '#96643a'        // Earth, ancestry, land
terracotta: '#b84a32'   // Warmth, humanity, heart
sage: '#5c6d51'         // Growth, healing, future
charcoal: '#42291a'     // Depth, grounding
cream: '#faf6f1'        // Space, openness

// Cultural Color Coding
clay: '#96643a'         // Culture & Heritage
sage: '#5c6d51'         // Environment & Land
sky: '#7fa7c1'          // Youth & Future
ember: '#b84a32'        // Action & Impact
```

### Typography

```typescript
// Headings: IBM Plex Serif (warmth, authority)
font-serif: ['IBM Plex Serif', 'Georgia', 'serif']

// Body: IBM Plex Sans (clarity, accessibility)
font-sans: ['IBM Plex Sans', 'system-ui', 'sans-serif']

// Mono: IBM Plex Mono (code, data)
font-mono: ['IBM Plex Mono', 'monospace']
```

### Components

All components follow:
- Trauma-informed design (gentle transitions)
- WCAG 2.1 AA accessibility
- Cultural safety patterns
- Sacred content protection

See [Brand Guide](docs/BRAND_AND_UI_STYLE_GUIDE.md) for complete patterns.

---

## Database Architecture

### Mission Pillars (8 core pillars)

1. **Cultural Safety** (37% of tables - Priority 1)
2. **Storyteller Empowerment** (consent, privacy, control)
3. **Impact Measurement** (SROI, ripple effects, outcomes)
4. **Community Governance** (elder review, cultural protocols)
5. **Data Sovereignty** (OCAP®, multi-tenant RLS)
6. **AI-Powered Insights** (theme extraction, impact analysis)
7. **Accessibility** (trauma-informed, WCAG 2.1 AA)
8. **Transparency** (audit logs, consent tracking)

### Key Tables

- `profiles` (164 cols) - 226 storytellers
- `transcripts` (59 cols) - 208 oral narratives
- `organizations` (65 cols) - 65+ organizations
- `media_assets` (66 cols) - Photos, videos, audio
- `storyteller_connections` (33 cols) - AI-discovered connections
- `elder_review_queue` (16 cols) - Cultural safety core
- `cultural_protocols` (16 cols) - OCAP compliance

See [Mission Map](docs/database/mission-map.md) for complete mapping.

---

## Troubleshooting

### Port already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### Supabase connection issues

```bash
# Check Supabase status
npm run db:status

# Restart Supabase
npm run db:stop
npm run db:start

# Check .env.local has correct credentials
cat .env.local | grep SUPABASE
```

### Build errors

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules
npm install

# Rebuild
npm run build
```

### TypeScript errors

```bash
# Regenerate database types
npm run db:types

# Run type check
npm run type-check
```

---

## Contributing

### Code Style

- **ESLint**: `npm run lint`
- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier (automatic via ESLint)
- **Commits**: Conventional Commits format

### PR Checklist

- [ ] All tests passing (`npm run test:all`)
- [ ] Build succeeds (`npm run build`)
- [ ] Lighthouse score > 90
- [ ] No accessibility regressions
- [ ] Cultural safety review (if applicable)
- [ ] Documentation updated
- [ ] PR template filled out

### Cultural Safety Review

Required for:
- Content moderation features
- AI analysis changes
- Privacy/consent flows
- Sacred content handling

---

## Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/Acurioustractor/empathy-ledger-v2/issues)
- **Workflow**: [Development Workflow](.github/DEVELOPMENT_WORKFLOW.md)
- **Sprints**: [Sprint Plan](docs/SPRINT_PLAN_DETAILED.md)

---

## License

Proprietary - ACT Global Infrastructure

All Indigenous knowledge and cultural content remains the intellectual property of the respective storytellers and communities, governed by OCAP® principles.

---

**Built with care for Indigenous communities worldwide**

🤖 Generated with [Claude Code](https://claude.com/claude-code)

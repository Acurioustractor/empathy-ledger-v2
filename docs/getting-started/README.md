# Getting Started with Empathy Ledger v2

Welcome to Empathy Ledger! This guide will get you from zero to productive development in ~30 minutes.

## Quick Navigation

### 🚀 New to the Project?
**Start here** → [installation.md](installation.md) (15-20 minutes)

### 🔐 Setting Up Authentication?
**Next step** → [authentication.md](authentication.md) (10 minutes)

### 💻 Ready to Code?
**Common workflows** → [common-tasks.md](common-tasks.md) (reference)

### 🎯 Current Priorities?
**Team priorities** → [current-priorities.md](current-priorities.md) (updated regularly)

---

## Complete Learning Path

### 1. Installation (15-20 min)
[installation.md](installation.md)

**What you'll learn:**
- Install prerequisites (Node.js, Git, Supabase CLI)
- Clone repository and install dependencies
- Configure environment variables
- Set up database connection
- Verify installation works

**By the end:**
- ✅ Dev server running at http://localhost:3005
- ✅ Database connected
- ✅ Ready to build features

---

### 2. Authentication (10 min)
[authentication.md](authentication.md)

**What you'll learn:**
- How Supabase Auth works
- Create test users
- Understand roles and permissions
- Configure Row-Level Security (RLS)
- Implement auth in components

**By the end:**
- ✅ Can sign in/sign out
- ✅ Understand role hierarchy
- ✅ Know how RLS enforces access

---

### 3. Common Tasks (ongoing reference)
[common-tasks.md](common-tasks.md)

**What's covered:**
- Daily development workflow
- Database operations (pull/push/migrate)
- Story management (create/share/analyze)
- User management
- Testing (unit + E2E)
- Deployment workflow
- Troubleshooting guide

**Use this as:**
- Quick command reference
- "How do I..." guide
- Troubleshooting checklist

---

## Your First 30 Minutes

### Minutes 0-15: Installation
```bash
# 1. Clone repository
git clone https://github.com/your-org/empathy-ledger-v2.git
cd empathy-ledger-v2

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Start dev server
npm run dev

# 5. Open http://localhost:3005
```

**See:** [installation.md](installation.md) for detailed steps

---

### Minutes 15-25: Create First User
```bash
# 1. Navigate to http://localhost:3005
# 2. Click "Sign In" → "Sign Up"
# 3. Create account:
#    - Email: your-email@example.com
#    - Password: SecurePassword123!
#    - Display Name: Your Name

# 4. Assign organization (via SQL or admin UI)
```

**See:** [authentication.md](authentication.md#step-3-assign-organization-and-role)

---

### Minutes 25-30: Explore
```bash
# Browse the codebase
ls src/
ls src/app/         # Next.js 15 app router
ls src/components/  # React components
ls src/lib/         # Services and utilities

# Check database schema
npm run db:types

# Run tests
npm run test
```

**See:** [common-tasks.md](common-tasks.md) for more commands

---

## Key Concepts

### Multi-Tenant Architecture
Every user belongs to an **organization** (tenant). All database queries automatically filter by `tenant_id` to ensure data isolation.

```typescript
// Automatic tenant isolation via RLS
const { data } = await supabase
  .from('stories')
  .select('*')
// Only returns stories from user's organization
```

### Role-Based Access Control
Users have **roles** that determine permissions:

| Role | Level | Can Do |
|------|-------|--------|
| Elder | 100 | Everything + cultural authority |
| Admin | 70 | Manage users and settings |
| Storyteller | 50 | Create and edit stories |
| Community Member | 40 | View and participate |
| Guest | 10 | Read-only access |

### Row-Level Security (RLS)
Database policies automatically enforce:
- **Tenant isolation**: Users only see their org's data
- **Role permissions**: Users can only perform actions their role allows

**Example RLS policy:**
```sql
CREATE POLICY "tenant_isolation"
ON stories FOR SELECT
USING (
  tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);
```

---

## Project Structure

```
empathy-ledger-v2/
├── src/
│   ├── app/              # Next.js 15 app router (pages)
│   ├── components/       # React components
│   ├── lib/
│   │   ├── services/     # Business logic
│   │   ├── supabase/     # Database clients
│   │   └── utils/        # Utilities
│   └── types/
│       └── database/     # TypeScript types (auto-generated)
├── supabase/
│   └── migrations/       # Database migrations
├── docs/                 # Documentation
└── scripts/              # Automation scripts
```

**See:** [../architecture/](../architecture/) for detailed architecture docs

---

## Common Questions

### "Where do I find...?"

| Looking for... | Location |
|---------------|----------|
| API routes | `src/app/api/` |
| React components | `src/components/` |
| Database types | `src/types/database/` |
| Business logic | `src/lib/services/` |
| Database schema | `supabase/migrations/` |
| Tests | `src/__tests__/`, `tests/` |

### "How do I...?"

| Task | Guide |
|------|-------|
| Install the project | [installation.md](installation.md) |
| Set up authentication | [authentication.md](authentication.md) |
| Create a story | [common-tasks.md](common-tasks.md#story-management) |
| Run database migrations | [common-tasks.md](common-tasks.md#database-operations) |
| Deploy to production | [common-tasks.md](common-tasks.md#deployment) |
| Run tests | [common-tasks.md](common-tasks.md#testing) |

### "Something's broken!"

See [common-tasks.md](common-tasks.md#troubleshooting) for:
- Build failures
- TypeScript errors
- Database connection issues
- RLS policy violations
- Port conflicts
- Supabase CLI problems

---

## Next Steps After Getting Started

Once you're comfortable with the basics:

### Understand the Architecture
- [Architecture Overview](../architecture/) - System design
- [Database Schema](../database/) - Table relationships
- [API Documentation](../api/) - Endpoint reference

### Build Features
- [Feature Development](../features/) - How to add features
- [Component Patterns](../components/) - UI component guide
- [Cultural Sensitivity](../../CONTRIBUTING.md) - OCAP principles

### Deploy to Production
- [Deployment Guide](../deployment/) - Production deployment
- [Mobile PWA](../deployment/mobile-pwa.md) - Deploy to phone
- [Field Workflow](../deployment/field-workflow.md) - Offline storytelling

---

## Getting Help

### Documentation
- **Quick Start**: [Root README](../../README.md)
- **Full Docs**: [docs/INDEX.md](../INDEX.md)
- **Contributing**: [CONTRIBUTING.md](../../CONTRIBUTING.md)

### Community
- **GitHub Issues**: [Report bugs](https://github.com/your-org/empathy-ledger-v2/issues)
- **GitHub Discussions**: [Ask questions](https://github.com/your-org/empathy-ledger-v2/discussions)
- **Pull Requests**: [Contribute code](https://github.com/your-org/empathy-ledger-v2/pulls)

### Development Team
- Check [current-priorities.md](current-priorities.md) for active work
- See [CONTRIBUTING.md](../../CONTRIBUTING.md) for workflow

---

## Success Checklist

After completing this guide, you should be able to:

- [ ] Run the development server locally
- [ ] Sign in/sign out successfully
- [ ] Understand multi-tenant isolation
- [ ] Know the role hierarchy
- [ ] Find files in the codebase
- [ ] Run database migrations
- [ ] Create and query database records
- [ ] Run tests
- [ ] Deploy changes

**If you checked all boxes**: You're ready to build! 🎉

**If you're stuck**: Check [common-tasks.md](common-tasks.md#troubleshooting) or [open an issue](https://github.com/your-org/empathy-ledger-v2/issues)

---

**Total Time to Productivity**: ~30 minutes
**Last Updated**: 2025-12-26

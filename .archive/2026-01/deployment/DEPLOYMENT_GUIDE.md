# Empathy Ledger v2 - Production Deployment Guide

**Last Updated:** January 6, 2026
**Platform Version:** 1.0.0
**Completion Status:** 87.5% (Sprint 8 in progress)

---

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Create production `.env.production` from `.env.production.example`
- [ ] Set all required environment variables
- [ ] Generate secure secrets (NEXTAUTH_SECRET, etc.)
- [ ] Configure Supabase production project
- [ ] Set up OpenAI API key (for AI features)

### 2. Database
- [ ] Run all Supabase migrations
- [ ] Verify database schema integrity
- [ ] Set up Row Level Security (RLS) policies
- [ ] Create database indexes for performance
- [ ] Configure database backups

### 3. Security
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS headers
- [ ] Set up rate limiting
- [ ] Enable security headers (CSP, etc.)
- [ ] Configure authentication providers
- [ ] Set up API key rotation

### 4. Performance
- [ ] Enable Next.js production optimizations
- [ ] Configure CDN for static assets
- [ ] Set up Redis for caching (optional)
- [ ] Enable image optimization
- [ ] Configure compression (gzip/brotli)

### 5. Monitoring
- [ ] Set up error tracking (Sentry recommended)
- [ ] Configure application monitoring
- [ ] Set up uptime monitoring
- [ ] Enable performance monitoring
- [ ] Configure log aggregation

---

## 🚀 Deployment Steps

### Option A: Vercel Deployment (Recommended)

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Login to Vercel
```bash
vercel login
```

#### 3. Link Project
```bash
vercel link
```

#### 4. Set Environment Variables
```bash
# Set each variable
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add OPENAI_API_KEY production
# ... etc
```

#### 5. Deploy
```bash
# Deploy to production
vercel --prod

# Or let CI/CD handle it (recommended)
git push origin main
```

#### 6. Post-Deployment
```bash
# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]

# Rollback if needed
vercel rollback [deployment-url]
```

---

### Option B: Docker Deployment

#### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### 2. Build Docker Image
```bash
docker build -t empathy-ledger:latest .
```

#### 3. Run Container
```bash
docker run -p 3000:3000 \
  --env-file .env.production \
  empathy-ledger:latest
```

#### 4. Docker Compose (with Redis)
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

---

## 🗄️ Database Setup

### 1. Supabase Production Configuration

#### Run Migrations
```bash
# Install Supabase CLI
npm install -g supabase

# Link to production project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Verify migrations
supabase db diff
```

#### Enable Extensions
```sql
-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector"; -- For semantic search
```

#### Create Indexes
```sql
-- Stories
CREATE INDEX idx_stories_organization_id ON stories(organization_id);
CREATE INDEX idx_stories_project_id ON stories(project_id);
CREATE INDEX idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX idx_stories_storyteller_id ON stories(storyteller_id);

-- Storytellers
CREATE INDEX idx_storytellers_organization_id ON storytellers(organization_id);
CREATE INDEX idx_storytellers_profile_id ON storytellers(profile_id);

-- Transcripts
CREATE INDEX idx_transcripts_storyteller_id ON transcripts(storyteller_id);
CREATE INDEX idx_transcripts_organization_id ON transcripts(organization_id);

-- Media
CREATE INDEX idx_media_organization_id ON media(organization_id);
CREATE INDEX idx_media_story_id ON media(story_id);

-- Search optimization
CREATE INDEX idx_stories_title_search ON stories USING gin(to_tsvector('english', title));
CREATE INDEX idx_stories_story_arc_search ON stories USING gin(to_tsvector('english', story_arc));
```

### 2. Row Level Security (RLS)

#### Enable RLS
```sql
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE storytellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
-- ... enable for all tables
```

#### Example Policies
```sql
-- Stories: Users can only see stories from their organization
CREATE POLICY "Users can view own organization stories"
ON stories FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id
    FROM user_organizations
    WHERE user_id = auth.uid()
  )
);

-- Stories: Super admins can see all
CREATE POLICY "Super admins can view all stories"
ON stories FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_super_admin = true
  )
);
```

---

## ⚡ Performance Optimization

### 1. Next.js Configuration

```javascript
// next.config.js
module.exports = {
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },

  // Compression
  compress: true,

  // SWC minification
  swcMinify: true,

  // Output standalone for Docker
  output: 'standalone',
}
```

### 2. Caching Strategy

```typescript
// app/api/[...]/route.ts
export const revalidate = 60 // Revalidate every 60 seconds

// Or dynamic revalidation
export async function GET(request: Request) {
  const data = await fetchData()

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
    }
  })
}
```

### 3. Redis Caching (Optional)

```typescript
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export async function getCachedData(key: string, fetchFn: () => Promise<any>) {
  // Try cache first
  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached)

  // Fetch and cache
  const data = await fetchFn()
  await redis.setex(key, 300, JSON.stringify(data)) // 5 min TTL

  return data
}
```

---

## 🔒 Security Configuration

### 1. Security Headers

```javascript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // CSP
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  )

  return response
}
```

### 2. Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier)
  return success
}
```

---

## 📊 Monitoring & Logging

### 1. Sentry Setup

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
})
```

### 2. Application Logs

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({ level: 'info', message, ...meta, timestamp: new Date().toISOString() }))
  },
  error: (message: string, error?: Error, meta?: any) => {
    console.error(JSON.stringify({ level: 'error', message, error: error?.message, stack: error?.stack, ...meta, timestamp: new Date().toISOString() }))
  },
  warn: (message: string, meta?: any) => {
    console.warn(JSON.stringify({ level: 'warn', message, ...meta, timestamp: new Date().toISOString() }))
  },
}
```

---

## 🧪 Testing Before Production

### 1. Run Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

### 2. Build Verification
```bash
# Build for production
npm run build

# Test production build locally
npm start
```

### 3. Performance Audit
```bash
# Lighthouse CI
npm install -g @lhci/cli

lhci autorun --config=lighthouserc.json
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🆘 Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules
npm install

# Check TypeScript errors
npm run type-check
```

**Database Connection Issues:**
```bash
# Test Supabase connection
curl https://your-project.supabase.co/rest/v1/

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
```

**Performance Issues:**
```bash
# Analyze bundle size
npm run analyze

# Check for memory leaks
node --inspect npm start
```

---

## 📈 Post-Deployment

### 1. Verify Deployment
- [ ] Check homepage loads correctly
- [ ] Test user authentication
- [ ] Verify database connections
- [ ] Test file uploads
- [ ] Check search functionality
- [ ] Verify AI features work

### 2. Monitor
- [ ] Watch error rates in Sentry
- [ ] Monitor response times
- [ ] Check database performance
- [ ] Review server logs
- [ ] Monitor CDN cache hit rates

### 3. Optimize
- [ ] Review slow queries
- [ ] Optimize images
- [ ] Add missing indexes
- [ ] Fine-tune caching
- [ ] Review bundle sizes

---

## 📞 Support

For deployment issues, contact:
- Technical Lead: [your-email@domain.com]
- DevOps: [devops@domain.com]
- Documentation: See [docs/deployment/](docs/deployment/)

---

**Generated:** January 6, 2026
**Version:** 1.0.0
**Platform Status:** 87.5% Complete (Sprint 8 in progress)

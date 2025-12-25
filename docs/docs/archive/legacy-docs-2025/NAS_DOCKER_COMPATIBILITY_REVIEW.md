# NAS Docker Setup Compatibility Review

**Date:** December 24, 2025
**Review:** Synology NAS Docker hosting vs Cloud-First Supabase strategy

---

## ✅ COMPATIBLE - No Conflicts Found

The Synology NAS Docker setup is **fully compatible** with the cloud-first Supabase workflow. Here's why:

---

## Architecture Separation

### Cloud-First Supabase (Primary Database)
```
Empathy Ledger v2 App
       ↓
Supabase Cloud (yvnuayzslukamizrlhwb)
   ├─ Production Database
   ├─ Preview Databases (per PR)
   ├─ Authentication
   ├─ Storage
   └─ Edge Functions
```

**Purpose:**
- Primary application database
- User data, stories, profiles
- Multi-tenant isolation
- GDPR-compliant storage
- Preview branches for testing

### Synology NAS Docker (Supporting Services)
```
Mac Development
       ↓
NAS Infrastructure
   ├─ Redis Cache (6379)
   ├─ ChromaDB Vector Search (8000)
   ├─ Local PostgreSQL (for other projects)
   ├─ Background Jobs Queue
   └─ Development Tools
```

**Purpose:**
- Caching layer
- AI/ML vector search
- Local dev databases for OTHER projects (JusticeHub, The Harvest, etc.)
- Supporting infrastructure
- Dev tools (Portainer, monitoring)

---

## What Goes Where

### ✅ USE CLOUD SUPABASE FOR:

| Data Type | Why Cloud | Example |
|-----------|-----------|---------|
| User profiles | GDPR compliance, multi-tenant | `profiles` table |
| Stories | Cultural safety, consent tracking | `stories` table |
| Media assets | Supabase Storage integration | Images, videos |
| Organizations | RLS policies, tenant isolation | `organisations` table |
| Transcripts | Data permanence, backup | `transcripts` table |
| All production data | Reliability, uptime SLA | Everything in `public` schema |

**Never use local PostgreSQL for Empathy Ledger production data.**

### ✅ USE NAS DOCKER FOR:

| Service | Why NAS | Example |
|---------|---------|---------|
| Redis cache | Session caching, API rate limiting | `redis-cache` container |
| ChromaDB | AI semantic search, embeddings | `chromadb` container |
| Background jobs | Inngest, scheduled tasks | Queue workers |
| Local dev databases | Other ACT projects (NOT Empathy Ledger) | JusticeHub, The Harvest |
| Development tools | Portainer, monitoring | Container management |

**Never replicate Supabase data to local PostgreSQL.**

---

## Recommended NAS Docker Configuration

### Containers to Run on NAS

#### 1. Redis Cache (Recommended)
```yaml
redis:
  image: redis:latest
  container_name: redis-cache
  restart: always
  ports:
    - "6379:6379"
  volumes:
    - /volume1/docker/redis/data:/data
  command: redis-server --appendonly yes
```

**Usage in Empathy Ledger:**
```typescript
// src/lib/cache/redis.ts
import { Redis } from 'ioredis'

export const redis = new Redis({
  host: process.env.REDIS_HOST || 'nas.local',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
})

// Cache story views, API responses
await redis.setex(`story:${id}:views`, 3600, viewCount)
```

**Benefits:**
- Faster API responses (cache expensive queries)
- Reduce Supabase API calls
- Session storage
- Rate limiting

#### 2. ChromaDB Vector Search (Recommended for AI Features)
```yaml
chromadb:
  image: chromadb/chroma:latest
  container_name: chromadb
  restart: always
  ports:
    - "8000:8000"
  environment:
    IS_PERSISTENT: "TRUE"
  volumes:
    - /volume1/docker/chromadb/data:/chroma/chroma
```

**Usage in Empathy Ledger:**
```typescript
// src/lib/ai/semantic-search.ts
import { ChromaClient } from 'chromadb'

const chroma = new ChromaClient({
  path: process.env.CHROMADB_URL || 'http://nas.local:8000'
})

// Store story embeddings for semantic search
await collection.add({
  ids: [storyId],
  embeddings: [embedding],
  metadatas: [{ title, themes }]
})
```

**Benefits:**
- AI-powered story search
- Theme similarity detection
- Storyteller recommendations
- Quote semantic search

#### 3. Portainer (Recommended for Management)
```yaml
portainer:
  image: portainer/portainer-ce:latest
  container_name: portainer
  restart: always
  ports:
    - "9000:9000"
  volumes:
    - /volume1/docker/portainer/data:/data
    - /var/run/docker.sock:/var/run/docker.sock
```

**Access:** http://nas.local:9000

**Benefits:**
- Visual container management
- Log viewing
- Resource monitoring
- Easier than Container Manager GUI

#### 4. Background Job Queue (Optional - If Using Inngest Locally)
```yaml
inngest:
  image: inngest/inngest:latest
  container_name: inngest-dev
  restart: always
  ports:
    - "8288:8288"
  environment:
    INNGEST_DEV: "true"
```

**Usage:**
- Story processing jobs
- AI analysis pipeline
- Transcript generation
- Email notifications

---

## Updated .env.local Configuration

### Empathy Ledger v2

```bash
# ============================================================================
# CLOUD SERVICES (Primary)
# ============================================================================

# Supabase Cloud (ALWAYS use cloud, never local)
NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ⚠️ DO NOT add DATABASE_URL for local PostgreSQL
# Supabase client handles all database connections

# ============================================================================
# NAS INFRASTRUCTURE (Supporting Services)
# ============================================================================

# Redis Cache on NAS
REDIS_HOST=nas.local  # or 192.168.1.XXX
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# ChromaDB Vector Search on NAS
CHROMADB_URL=http://nas.local:8000

# Inngest Background Jobs (if running locally)
INNGEST_BASE_URL=http://nas.local:8288

# ============================================================================
# AI & ANALYSIS
# ============================================================================

# Ollama (can run on NAS or Mac)
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://nas.local:11434  # or http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# Or OpenAI
# LLM_PROVIDER=openai
# OPENAI_API_KEY=sk-proj-...

# ============================================================================
# APP CONFIGURATION
# ============================================================================

NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cultural Safety
ENABLE_CULTURAL_SAFETY=true
ENABLE_ELDER_REVIEW=true
ENABLE_CONSENT_TRACKING=true
```

**Key Points:**
- ✅ Supabase URL points to cloud (never localhost)
- ✅ No `DATABASE_URL` for local PostgreSQL
- ✅ Redis/ChromaDB point to NAS
- ✅ AI services can be local or NAS
- ✅ App runs on Mac localhost:3000

---

## What NOT to Do

### ❌ DON'T Run Local Supabase

**Bad Idea:**
```yaml
# DON'T DO THIS
supabase-db:
  image: supabase/postgres:15
  ...
```

**Why Not:**
- Conflicts with cloud-first strategy
- Schema drift from production
- No preview branch support
- Manual migration management
- Team sync issues
- User explicitly rejected this approach

### ❌ DON'T Replicate Supabase Data Locally

**Bad Idea:**
```bash
# DON'T DO THIS
pg_dump supabase_cloud | psql local_postgres
```

**Why Not:**
- Data duplication
- GDPR compliance risk
- Sync complexity
- Stale data
- Unnecessary

### ❌ DON'T Use NAS PostgreSQL for Empathy Ledger

**Bad Idea:**
```bash
# DON'T DO THIS in Empathy Ledger .env.local
DATABASE_URL=postgresql://postgres@nas.local:5432/empathy_ledger
```

**Why Not:**
- Bypasses Supabase features (RLS, auth, storage)
- Loses preview branch workflow
- No auto-migrations on deploy
- Breaks cloud-first philosophy

---

## What TO Do

### ✅ Use Supabase Client (Always)

**Good:**
```typescript
// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,  // Cloud URL
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// All queries go through Supabase client
const { data } = await supabase.from('stories').select('*')
```

**Benefits:**
- RLS enforcement
- Authentication integration
- Storage integration
- Real-time subscriptions
- Edge functions
- Preview branches work

### ✅ Use NAS Services as Supporting Infrastructure

**Good:**
```typescript
// src/lib/cache/story-cache.ts
import { redis } from '@/lib/cache/redis'  // NAS Redis

export async function getCachedStory(id: string) {
  // Try cache first (NAS Redis)
  const cached = await redis.get(`story:${id}`)
  if (cached) return JSON.parse(cached)

  // Fetch from Supabase Cloud
  const { data } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .single()

  // Cache for next time (NAS Redis)
  await redis.setex(`story:${id}`, 3600, JSON.stringify(data))

  return data
}
```

**Architecture:**
1. Check NAS Redis cache
2. If miss, fetch from Supabase Cloud
3. Cache result in NAS Redis
4. Return to client

**Benefits:**
- Fast repeated queries
- Reduced Supabase API calls
- Lower costs
- Better performance

---

## Deployment Strategy

### Development (Mac + NAS)
```
Mac localhost:3000
    ↓
Supabase Cloud (data)
    +
NAS Docker (cache, AI)
```

### Preview Branches (Cloud Only)
```
Vercel Preview
    ↓
Supabase Preview DB
    +
Supabase Redis (optional)
```

**No NAS involvement in preview/production deployments.**

### Production (Cloud Only)
```
Vercel Production
    ↓
Supabase Production DB
    +
Upstash Redis (cloud)
    +
Pinecone/Qdrant (cloud vector DB)
```

**No NAS involvement in production.**

---

## Migration Path from Local to Cloud Services

If you later want to move NAS services to cloud:

### Redis: Local NAS → Upstash
```bash
# .env.local (development)
REDIS_URL=redis://nas.local:6379

# .env.production (Vercel)
REDIS_URL=redis://your-project.upstash.io:6379
```

### ChromaDB: Local NAS → Pinecone/Qdrant
```bash
# .env.local
VECTOR_DB_PROVIDER=chromadb
CHROMADB_URL=http://nas.local:8000

# .env.production
VECTOR_DB_PROVIDER=pinecone
PINECONE_API_KEY=...
```

**No code changes needed** - just environment variables.

---

## Recommended NAS Docker Compose for ACT Projects

### Complete Stack (All Projects)

```yaml
version: '3.8'

services:
  # Redis Cache (for all ACT projects)
  redis:
    image: redis:latest
    container_name: act-redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - /volume1/docker/redis/data:/data
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}

  # ChromaDB Vector Search (for AI features)
  chromadb:
    image: chromadb/chroma:latest
    container_name: act-chromadb
    restart: always
    ports:
      - "8000:8000"
    environment:
      IS_PERSISTENT: "TRUE"
      ANONYMIZED_TELEMETRY: "FALSE"
    volumes:
      - /volume1/docker/chromadb/data:/chroma/chroma

  # Portainer (container management)
  portainer:
    image: portainer/portainer-ce:latest
    container_name: portainer
    restart: always
    ports:
      - "9000:9000"
    volumes:
      - /volume1/docker/portainer/data:/data
      - /var/run/docker.sock:/var/run/docker.sock

  # Ollama (AI models - optional, can run on Mac)
  ollama:
    image: ollama/ollama:latest
    container_name: act-ollama
    restart: always
    ports:
      - "11434:11434"
    volumes:
      - /volume1/docker/ollama/models:/root/.ollama

  # PostgreSQL for OTHER projects (NOT Empathy Ledger)
  justicehub-db:
    image: postgres:15
    container_name: justicehub-db
    restart: always
    ports:
      - "5433:5432"
    environment:
      POSTGRES_DB: justicehub
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${JUSTICEHUB_DB_PASSWORD}
    volumes:
      - /volume1/docker/postgres/justicehub/data:/var/lib/postgresql/data

  harvest-db:
    image: postgres:15
    container_name: harvest-db
    restart: always
    ports:
      - "5434:5432"
    environment:
      POSTGRES_DB: the_harvest
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${HARVEST_DB_PASSWORD}
    volumes:
      - /volume1/docker/postgres/harvest/data:/var/lib/postgresql/data
```

**Note:** No PostgreSQL for Empathy Ledger - it uses Supabase Cloud exclusively.

---

## Testing the Setup

### 1. Verify NAS Services Running

```bash
# From Mac terminal

# Test Redis
redis-cli -h nas.local -p 6379 -a your_password ping
# Expected: PONG

# Test ChromaDB
curl http://nas.local:8000/api/v1/heartbeat
# Expected: JSON with heartbeat

# Test Ollama (if running on NAS)
curl http://nas.local:11434/api/version
# Expected: {"version": "..."}
```

### 2. Test from Empathy Ledger App

```typescript
// Create test script: scripts/test-nas-services.mjs
import { Redis } from 'ioredis'
import { ChromaClient } from 'chromadb'

const redis = new Redis({
  host: 'nas.local',
  port: 6379,
  password: process.env.REDIS_PASSWORD
})

const chroma = new ChromaClient({
  path: 'http://nas.local:8000'
})

// Test Redis
await redis.set('test', 'hello')
const value = await redis.get('test')
console.log('Redis test:', value === 'hello' ? '✅' : '❌')

// Test ChromaDB
const collections = await chroma.listCollections()
console.log('ChromaDB test:', collections ? '✅' : '❌')

process.exit(0)
```

```bash
node scripts/test-nas-services.mjs
```

### 3. Test Supabase Cloud Connection

```bash
# Should NOT change - still pointing to cloud
node scripts/verify-cloud-setup.mjs

# Should still show:
# ✅ Database connection successful (to cloud)
```

---

## Performance Considerations

### Local Network Speed
- **Gigabit Ethernet:** ~100-125 MB/s, ~1-2ms latency
- **Wi-Fi 6:** ~50-80 MB/s, ~5-10ms latency
- **Recommendation:** Use wired connection for Mac if possible

### Redis Cache Hit Rates
- **Target:** >80% cache hit rate for repeated queries
- **Monitor:** Portainer dashboard → Redis stats
- **Optimize:** Increase TTL for stable data, decrease for frequently changing

### ChromaDB Query Speed
- **Embedding generation:** ~50-200ms (depends on model)
- **Vector search:** ~10-50ms (depends on collection size)
- **Total semantic search:** ~100-300ms (acceptable for non-real-time)

### Supabase Cloud vs Local Cache
- **Supabase API:** ~50-200ms (network + query)
- **Redis cache:** ~1-5ms (local network)
- **Speedup:** 10-50x for cached queries

---

## Cost Analysis

### NAS Infrastructure (One-time + Electricity)
- **NAS Hardware:** $300-800 (Synology DS920+, DS1522+)
- **Power Consumption:** 15-25W idle, 30-40W active
- **Monthly Electricity:** ~$2-4 (at $0.12/kWh)
- **Lifetime:** 5-7 years

### Cloud Alternative Costs (Monthly)
- **Upstash Redis:** $10-50/month (depending on size)
- **Pinecone Vector DB:** $70-200/month (for semantic search)
- **Cloud PostgreSQL:** $25-100/month (for other projects)
- **Total Cloud:** $105-350/month

### NAS ROI
- **Payback period:** 3-8 months
- **5-year savings:** $6,000-20,000
- **Benefits:** Also serves as backup, media server, file storage

---

## Security Considerations

### Network Access
```bash
# NAS Firewall Rules (DSM)
# Allow from Mac IP only:
Allow: 192.168.1.XXX → 6379 (Redis)
Allow: 192.168.1.XXX → 8000 (ChromaDB)
Allow: 192.168.1.XXX → 5433,5434 (PostgreSQL)
Deny: All other sources
```

### Container Security
- Use strong passwords for all services
- Don't expose containers to internet (local network only)
- Regular updates via Container Manager
- Enable Synology auto-update

### Data Privacy
- Redis: Set `maxmemory-policy allkeys-lru` (evict old data)
- ChromaDB: Use collection namespaces per project
- PostgreSQL: Use strong passwords, no default accounts

---

## Monitoring and Alerts

### Portainer Alerts
- Container stopped unexpectedly
- High CPU/memory usage
- Disk space low

### Synology DSM Notifications
- RAID degraded
- Disk S.M.A.R.T. warnings
- Volume usage >80%

### Application Monitoring
```typescript
// src/lib/monitoring/nas-health.ts
export async function checkNASHealth() {
  const checks = {
    redis: await checkRedis(),
    chromadb: await checkChromaDB(),
    network: await checkLatency()
  }

  if (Object.values(checks).some(c => !c.healthy)) {
    // Send alert (email, Slack, etc.)
    await sendAlert('NAS service unhealthy', checks)
  }

  return checks
}
```

---

## Summary: Safe to Use NAS Docker

### ✅ Compatible Because:

1. **Separate Concerns:**
   - Supabase = primary database (cloud)
   - NAS = supporting services (local)
   - No overlap or conflict

2. **Cloud-First Maintained:**
   - All Empathy Ledger data stays in Supabase Cloud
   - Preview branches still work (cloud-only)
   - Auto-deployments still work
   - No schema drift

3. **Performance Benefits:**
   - Redis cache speeds up repeated queries
   - ChromaDB enables AI features locally
   - Reduced Supabase API calls
   - Lower costs

4. **Development Experience:**
   - Mac runs Next.js dev server (fast hot reload)
   - NAS provides always-on infrastructure
   - Low Mac battery usage
   - Clean separation

### ❌ Just Don't:

1. Run local Supabase on NAS (conflicts with cloud-first)
2. Use NAS PostgreSQL for Empathy Ledger data (bypasses Supabase)
3. Replicate Supabase data to NAS (unnecessary, risky)
4. Point `DATABASE_URL` to NAS (breaks Supabase features)

### ✅ Recommended NAS Setup:

```yaml
# Use for Empathy Ledger:
- Redis cache
- ChromaDB vector search
- Ollama AI models (optional)
- Portainer management
- Monitoring tools

# Use for OTHER projects:
- PostgreSQL for JusticeHub
- PostgreSQL for The Harvest
- Any other local dev databases
```

---

## Final Recommendation

**✅ GO AHEAD** with the Synology NAS Docker setup as described in your guide.

**Just follow these rules:**

1. **Never** add `DATABASE_URL` to Empathy Ledger `.env.local`
2. **Always** use Supabase client for database queries
3. **Only** use NAS for supporting services (Redis, ChromaDB, etc.)
4. **Keep** Supabase as single source of truth for data
5. **Use** NAS PostgreSQL for OTHER projects, not Empathy Ledger

**This approach gives you:**
- ✅ Cloud-first Supabase strategy maintained
- ✅ NAS infrastructure for performance/cost benefits
- ✅ Best of both worlds
- ✅ No conflicts, no chaos

---

**Ready to proceed?** Deploy the NAS containers following your guide, then update Empathy Ledger `.env.local` to use NAS Redis/ChromaDB.


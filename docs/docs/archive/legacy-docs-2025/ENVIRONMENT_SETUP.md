# Environment Setup Guide

**Last Updated:** December 22, 2025

This guide covers setting up environment variables securely for Empathy Ledger.

---

## Quick Start

```bash
# 1. Copy the example file
cp .env.example .env.local

# 2. Edit with your values
code .env.local

# 3. Validate your setup
npx ts-node scripts/validate-env.ts

# 4. Start the app
npm run dev
```

---

## File Structure

| File | Purpose | Git Status |
|------|---------|------------|
| `.env.example` | Full template with all variables | ✅ Committed |
| `.env.local.example` | Minimal template for quick start | ✅ Committed |
| `.env.local` | Your actual secrets | ❌ **Never commit** |
| `.env` | Shared non-secret defaults | ❌ Ignored |

---

## Required Variables

These **must** be set for the app to run:

### Supabase

```bash
# Project URL (safe to expose)
NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co

# Anon key (safe to expose - RLS protects data)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Service role key (NEVER expose!)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Where to find:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Settings → API
4. Copy the values

### App URL

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### AI Provider

Choose one:

**Option A: Ollama (Free, Local)**
```bash
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
```

**Option B: OpenAI (Paid, Cloud)**
```bash
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-proj-...
```

---

## Security Best Practices

### 1. Never Commit Secrets

The `.gitignore` already protects you:
```gitignore
.env
.env.local
.env.*.local
```

### 2. Variable Naming Convention

| Prefix | Meaning | Can Expose? |
|--------|---------|-------------|
| `NEXT_PUBLIC_*` | Bundled into client JS | ✅ Yes (but be careful) |
| No prefix | Server-side only | ❌ No |

### 3. Key Rotation Schedule

| Key Type | Rotation Frequency | How to Rotate |
|----------|-------------------|---------------|
| Supabase Service Role | Every 90 days | Dashboard → Settings → API → Regenerate |
| OpenAI API Key | Every 90 days | platform.openai.com → API keys → Create new |
| Anthropic Key | Every 90 days | console.anthropic.com → API keys |
| Inngest Keys | Every 90 days | app.inngest.com → Manage keys |

### 4. Environment-Specific Keys

**Use different keys for each environment:**

```
Production:  OPENAI_API_KEY=sk-prod-...
Staging:     OPENAI_API_KEY=sk-staging-...
Development: OPENAI_API_KEY=sk-dev-...
```

This limits blast radius if one key is compromised.

---

## Validation

Run the validation script to check your setup:

```bash
npx ts-node scripts/validate-env.ts
```

Output:
```
🔐 Environment Variable Validator

NEXT_PUBLIC_SUPABASE_URL
  Supabase project URL
  Status: ✓ Set
  Value: https://yvnuayzslukamizrlhwb.supabase.co

SUPABASE_SERVICE_ROLE_KEY
  Supabase service role key (server-side only!)
  Status: ✓ Set
  Value: eyJh...T0k

─────────────────────────────────
Summary:
  All variables configured correctly!
```

---

## CI/CD Setup

### GitHub Actions

Store secrets in GitHub:
1. Repository → Settings → Secrets and variables → Actions
2. Add each secret

```yaml
# .github/workflows/deploy.yml
env:
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

### Vercel

1. Project Settings → Environment Variables
2. Add each variable
3. Select environments (Production, Preview, Development)

**Important:** Set `SUPABASE_SERVICE_ROLE_KEY` for Production only.

---

## Troubleshooting

### "Missing environment variable" error

```bash
# Check which variables are set
npx ts-node scripts/validate-env.ts

# Make sure .env.local exists
ls -la .env*
```

### "Invalid format" warning

Check the format matches expected pattern:
- Supabase keys start with `eyJ`
- OpenAI keys start with `sk-`
- Anthropic keys start with `sk-ant-`

### Variables not loading

1. Restart the dev server after changing `.env.local`
2. Check for typos in variable names
3. Make sure no extra spaces around `=`

---

## Variable Reference

### Supabase
| Variable | Required | Sensitive | Description |
|----------|----------|-----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | No | Project API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | No | Client-side key (RLS protected) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | **Yes** | Bypasses RLS - server only! |
| `DATABASE_URL` | No | **Yes** | Direct Postgres connection |
| `SUPABASE_ACCESS_TOKEN` | No | **Yes** | For MCP/CLI automation |

### AI Providers
| Variable | Required | Sensitive | Description |
|----------|----------|-----------|-------------|
| `LLM_PROVIDER` | ✅ | No | "ollama" or "openai" |
| `OLLAMA_BASE_URL` | No | No | Local Ollama server |
| `OLLAMA_MODEL` | No | No | Model name |
| `OPENAI_API_KEY` | No | **Yes** | OpenAI key |
| `ANTHROPIC_API_KEY` | No | **Yes** | Claude key |

### Application
| Variable | Required | Sensitive | Description |
|----------|----------|-----------|-------------|
| `NEXT_PUBLIC_APP_URL` | ✅ | No | Base URL for app |
| `NEXT_PUBLIC_DEV_SUPER_ADMIN_EMAIL` | No | No | Dev-only admin bypass |

### Background Jobs (Inngest)
| Variable | Required | Sensitive | Description |
|----------|----------|-----------|-------------|
| `INNGEST_EVENT_KEY` | No | **Yes** | Event publishing key |
| `INNGEST_SIGNING_KEY` | No | **Yes** | Webhook verification |
| `INNGEST_BASE_URL` | No | No | Server URL |

### Research Tools
| Variable | Required | Sensitive | Description |
|----------|----------|-----------|-------------|
| `TAVILY_API_KEY` | No | **Yes** | Web search API |

---

## Getting Help

If you're stuck:

1. Run `npx ts-node scripts/validate-env.ts` for diagnostics
2. Check the console for specific error messages
3. Review `.env.example` for expected formats
4. See [SUPABASE_ACCESS_GUIDE.md](./SUPABASE_ACCESS_GUIDE.md) for Supabase specifics

---

*This guide follows security best practices from OWASP and Next.js recommendations.*

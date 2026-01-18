# Bitwarden Secrets Management

This document describes how to securely manage environment variables and API keys using Bitwarden for the Empathy Ledger v2 project.

## Overview

All sensitive credentials should be stored in Bitwarden, NOT in local `.env` files or code. This ensures:
- Centralized secret management
- Audit trail for access
- Easy secret rotation
- Team-wide access control

## Required Secrets

### Critical (P0)

| Secret | Bitwarden Item Name | Description |
|--------|---------------------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | EL-Supabase-Service | Supabase admin key (bypasses RLS) |
| `NEXTAUTH_SECRET` | EL-Auth-Secret | Session encryption key |
| `SUPER_ADMIN_SETUP_KEY` | EL-SuperAdmin-Setup | One-time admin provisioning |
| `OPENAI_API_KEY` | EL-OpenAI | AI feature API key |

### High (P1)

| Secret | Bitwarden Item Name | Description |
|--------|---------------------|-------------|
| `SMTP_PASS` | EL-Email-SMTP | Email sending credentials |
| `SENTRY_AUTH_TOKEN` | EL-Sentry | Error tracking auth |
| `AWS_SECRET_ACCESS_KEY` | EL-AWS | S3 storage access |
| `REDIS_URL` | EL-Redis | Cache connection string |

### Medium (P2)

| Secret | Bitwarden Item Name | Description |
|--------|---------------------|-------------|
| `NEXT_PUBLIC_ANALYTICS_ID` | EL-Analytics | Analytics tracking ID |
| `CDN_URL` | EL-CDN | CDN endpoint |

## Setup Instructions

### 1. Install Bitwarden CLI

```bash
# macOS
brew install bitwarden-cli

# Verify installation
bw --version
```

### 2. Login and Unlock

```bash
# Login to Bitwarden
bw login

# Unlock your vault (save the session key)
export BW_SESSION=$(bw unlock --raw)
```

### 3. Create a Bitwarden Collection

Create a collection named `Empathy-Ledger-Secrets` in your Bitwarden organization to store all project secrets.

### 4. Add Secrets to Bitwarden

For each secret, create a Secure Note item:

```bash
# Example: Create SUPABASE_SERVICE_ROLE_KEY
bw create item '{
  "type": 2,
  "secureNote": { "type": 0 },
  "name": "EL-Supabase-Service",
  "notes": "YOUR_SECRET_VALUE_HERE",
  "collectionIds": ["YOUR_COLLECTION_ID"]
}'
```

### 5. Fetch Secrets for Local Development

Create a script at `scripts/fetch-secrets.sh`:

```bash
#!/bin/bash
# Fetch secrets from Bitwarden and create .env.local

# Ensure logged in
if [ -z "$BW_SESSION" ]; then
  echo "Please run: export BW_SESSION=\$(bw unlock --raw)"
  exit 1
fi

# Sync vault
bw sync

# Fetch secrets and create .env.local
cat > .env.local << EOF
# Auto-generated from Bitwarden - DO NOT COMMIT
# Generated: $(date)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=$(bw get notes "EL-Supabase-URL")
NEXT_PUBLIC_SUPABASE_ANON_KEY=$(bw get notes "EL-Supabase-Anon")
SUPABASE_SERVICE_ROLE_KEY=$(bw get notes "EL-Supabase-Service")

# Auth
NEXTAUTH_SECRET=$(bw get notes "EL-Auth-Secret")
SUPER_ADMIN_SETUP_KEY=$(bw get notes "EL-SuperAdmin-Setup")

# OpenAI
OPENAI_API_KEY=$(bw get notes "EL-OpenAI")

# Email (if configured)
SMTP_PASS=$(bw get notes "EL-Email-SMTP" 2>/dev/null || echo "")

EOF

echo "✅ .env.local created from Bitwarden secrets"
```

Make it executable:
```bash
chmod +x scripts/fetch-secrets.sh
```

## Vercel Integration

### Option 1: Vercel CLI with Bitwarden

```bash
# Fetch secret from Bitwarden and set in Vercel
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< $(bw get notes "EL-Supabase-Service")
```

### Option 2: Manual Vercel Dashboard

1. Go to Vercel Project → Settings → Environment Variables
2. Copy values from Bitwarden items
3. Set appropriate scope (Production/Preview/Development)

## Secret Rotation

### Rotation Schedule

| Secret | Rotation Frequency | Last Rotated |
|--------|-------------------|--------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Annually or on breach | - |
| `NEXTAUTH_SECRET` | Annually | - |
| `SUPER_ADMIN_SETUP_KEY` | After each use | - |
| `OPENAI_API_KEY` | Quarterly | - |
| `SMTP_PASS` | Annually | - |

### Rotation Process

1. Generate new secret value:
   ```bash
   openssl rand -base64 32
   ```

2. Update in Bitwarden:
   ```bash
   bw edit item <ITEM_ID> --notes "NEW_SECRET_VALUE"
   ```

3. Update in Vercel:
   ```bash
   vercel env rm SECRETNAME production
   vercel env add SECRETNAME production <<< "NEW_VALUE"
   ```

4. Redeploy application:
   ```bash
   vercel --prod
   ```

5. Update rotation log in this document

## Security Best Practices

1. **Never commit secrets** - `.env*` files are gitignored
2. **Use environment-specific keys** - Different keys for dev/staging/prod
3. **Principle of least privilege** - Only grant access to those who need it
4. **Audit access** - Review Bitwarden access logs monthly
5. **Rotate on compromise** - Immediately rotate if any suspicion of leak

## Emergency Procedures

### If a Secret is Compromised

1. **Immediately rotate** the compromised secret
2. **Check audit logs** for unauthorized access
3. **Review Bitwarden access** - who had access to the secret
4. **Update all environments** (dev, staging, prod)
5. **Document the incident** in security logs

### Bitwarden Account Lockout

If locked out of Bitwarden:
1. Contact the organization admin
2. Use emergency access if configured
3. Worst case: regenerate all secrets from service providers

## Team Access

| Role | Bitwarden Access |
|------|------------------|
| Super Admin | Full read/write |
| Developer | Read-only (dev secrets) |
| DevOps | Read/write (production) |
| Contractor | Read-only (specific items) |

## Compliance Notes

- **GDPR**: Secrets management supports data processing audit requirements
- **OCAP**: Indigenous data sovereignty - secrets stored in AU-hosted Bitwarden
- **SOC 2**: Bitwarden is SOC 2 Type II compliant

---

*Last updated: 2026-01-18*
*Document owner: Security Team*

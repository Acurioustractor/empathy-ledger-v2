# ACT Ecosystem Port Configuration Fix

**Date:** January 4, 2026
**Issue:** Empathy Ledger ecosystem config had wrong port (3001 vs 3030)
**Status:** ✅ FIXED

---

## Problem

The ACT ecosystem PM2 configuration had Empathy Ledger set to port **3001**, but the actual `package.json` dev script uses port **3030**:

```json
// package.json
"dev": "next dev -p 3030"
```

This caused:
- ❌ PM2 crashes (18 restart attempts before giving up)
- ❌ "Address already in use" errors
- ❌ Confusion about which port to use
- ❌ http://localhost:3001 not working

---

## Solution

Updated 3 files to use consistent **port 3030**:

### 1. ACT Ecosystem Config ✅

**File:** `/Users/benknight/act-global-infrastructure/deployment/ecosystem.config.cjs`

**Change:**
```javascript
{
  name: 'empathy-ledger',
  // ...
  env: {
    PORT: 3030,  // Changed from 3001
    NODE_ENV: 'development',
    PATH: process.env.PATH,
  },
}
```

### 2. Deployment Script Documentation ✅

**File:** `/Users/benknight/act-global-infrastructure/deployment/scripts/deploy-act-ecosystem.sh`

**Change:**
```bash
print_info "Individual site URLs:"
echo "  📖 Empathy Ledger:           http://localhost:3030"  # Changed from 3001
```

### 3. Local Dev Server Skill ✅

**File:** `.claude/skills/local/local-dev-server/SKILL.md`

**Change:**
```markdown
**Ports:**
- Empathy Ledger: 3030  # Changed from 3001
```

---

## Current Status

✅ **All ACT Projects Running via PM2:**

```bash
pm2 list
```

| Project | Port | Status |
|---------|------|--------|
| ACT Studio | 3002 | ✅ online |
| **Empathy Ledger** | **3030** | ✅ online |
| JusticeHub | 3003 | ✅ online |
| Harvest | 3004 | ✅ online |
| ACT Farm | 3005 | ✅ online |
| Placemat | 3999 | ✅ online |

---

## URLs

Access all sites:

- 🌐 ACT Regenerative Studio: http://localhost:3002
- 📖 **Empathy Ledger**: **http://localhost:3030**
- ⚖️ JusticeHub: http://localhost:3003
- 🌾 The Harvest Website: http://localhost:3004
- 🚜 ACT Farm: http://localhost:3005
- 🗂️ ACT Placemat: http://localhost:3999

---

## Quick Commands

**Start all projects:**
```bash
/Users/benknight/act-global-infrastructure/deployment/scripts/deploy-act-ecosystem.sh start
```

**Restart all projects:**
```bash
/Users/benknight/act-global-infrastructure/deployment/scripts/deploy-act-ecosystem.sh restart
```

**Stop all projects:**
```bash
/Users/benknight/act-global-infrastructure/deployment/scripts/deploy-act-ecosystem.sh stop
```

**View logs:**
```bash
pm2 logs empathy-ledger
```

---

## Testing

JusticeHub syndication API tested and working on **http://localhost:3030**:

```bash
bash test-syndication.sh
# ✅ SUCCESS! Content access working!
```

---

## Impact

### Before Fix
- ❌ Empathy Ledger constantly crashing
- ❌ Port mismatch confusion (3001 vs 3030)
- ❌ Manual port management required

### After Fix
- ✅ Empathy Ledger stable via PM2
- ✅ Consistent port across all configs
- ✅ Works with ecosystem deployment script
- ✅ No more "address already in use" errors

---

**Fixed By:** Claude Code AI Assistant
**Date:** January 4, 2026
**Files Modified:** 3 files in act-global-infrastructure + 1 skill doc

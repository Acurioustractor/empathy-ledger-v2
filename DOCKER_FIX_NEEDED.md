# Docker Socket Issue - Quick Fix

**Error**: `request returned 500 Internal Server Error for API route and version http://%2FUsers%2Fbenknight%2F.docker%2Frun%2Fdocker.sock/v1.51/containers/`

**Cause**: Docker API version mismatch between Supabase CLI and Docker Desktop

---

## 🔧 Fix #1: Restart Docker Desktop (Usually Works)

```bash
# Quit Docker Desktop completely
killall Docker

# Wait 5 seconds
sleep 5

# Restart Docker Desktop
open -a Docker

# Wait for Docker to fully start (~30 seconds)
sleep 30

# Test Docker
docker ps

# Try Supabase again
npx supabase start
```

---

## 🔧 Fix #2: Update Docker Desktop (If Fix #1 Doesn't Work)

1. **Check current version:**
   ```bash
   docker --version
   ```

2. **Update Docker Desktop:**
   - Open Docker Desktop app
   - Click Docker icon in menu bar
   - Select "Check for updates"
   - Install update if available
   - Restart Docker Desktop

3. **Try again:**
   ```bash
   npx supabase start
   ```

---

## 🔧 Fix #3: Use Docker CLI Instead of Socket

If socket issues persist, configure Supabase to use Docker CLI:

```bash
# Set environment variable
export DOCKER_HOST=

# Try starting Supabase
npx supabase start
```

---

## 🔧 Fix #4: Clean Docker and Start Fresh

```bash
# Stop all containers
docker stop $(docker ps -aq) 2>/dev/null || true

# Remove Supabase containers
docker rm $(docker ps -aq --filter "label=com.supabase.cli.project") 2>/dev/null || true

# Start Supabase fresh
npx supabase start
```

---

## ✅ Verify Docker is Working

```bash
# Should show Docker info without errors
docker info

# Should list containers (even if empty)
docker ps

# Should show version
docker --version
```

---

## 🆘 If All Else Fails

**Option A: Use Production Supabase for Now**

You can develop directly against production while we fix Docker:

```bash
# Update .env.local to use production
NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your production anon key>
```

**Pros**: Works immediately
**Cons**: No local testing, uses production compute

**Option B: Reinstall Docker Desktop**

Last resort if Docker is completely broken:
1. Uninstall Docker Desktop
2. Download latest from docker.com
3. Install and restart
4. Try `npx supabase start`

---

## 📝 Next Steps Once Docker Works

```bash
# Start Supabase
npx supabase start

# Reset database (apply all migrations)
npx supabase db reset

# Update .env.local with keys from output

# Start your app
npm run dev
```

Then follow [SUPABASE_QUICK_START.md](SUPABASE_QUICK_START.md)

---

**Try Fix #1 first** - Simple restart usually resolves this!

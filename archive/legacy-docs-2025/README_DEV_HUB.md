# 🚀 Empathy Ledger Development Hub

Beautiful, visual development server with dashboard UI.

## Quick Start

```bash
npm run dev:hub
```

**That's it!** Two URLs will open:

1. **📊 Dashboard:** http://localhost:3999
2. **💜 App:** http://localhost:3003

## What This Gives You

### Visual Dashboard (Port 3999)

A beautiful web dashboard showing:
- ✅ **Live Server Status** - See if Next.js is running
- ✅ **Quick Links** - One-click access to all pages
- ✅ **Auto-Refresh** - Updates every 5 seconds
- ✅ **Process Info** - PID, uptime, restart count
- ✅ **Environment Check** - Warns if Supabase not configured

### Quick Access Links in Dashboard

Click to open instantly:
- 🏠 Home page
- 🔐 Sign in (test OAuth & magic links)
- 👤 Profile dashboard
- 📖 Stories catalog
- 👥 Storytellers
- ⚙️ Admin panel (database explorer, etc.)

### Auto-Recovery

If the server crashes, it automatically restarts in 3 seconds.

## Commands

```bash
# Development with dashboard (recommended)
npm run dev:hub

# Standard development
npm run dev

# Clean start (removes cache)
npm run dev:clean

# Custom port
npm run dev:custom
```

## Testing Google OAuth

Now that you have the dev hub running:

1. **Open Dashboard:** http://localhost:3999
2. **Click "Sign In"** in Quick Links
3. **Click "Continue with Google"**
4. **Authorize with your Google account**
5. **You'll be redirected back, logged in!**

The dashboard makes testing authentication super easy.

## How It Works

The dev hub (`dev-server.mjs`) is a Node.js orchestrator that:

1. **Starts Dashboard Server** (port 3999)
   - Beautiful HTML interface
   - Auto-refreshing status
   - Quick links to all pages

2. **Starts Next.js Dev Server** (port 3003)
   - Full hot reload
   - All Next.js features
   - Environment variables loaded

3. **Monitors Health**
   - Tracks if server is running
   - Auto-restarts on crashes
   - Shows uptime and stats

4. **Filters Output**
   - Color-coded logs
   - Hides verbose webpack messages
   - Shows only important info

## Features

### 1. Visual Status
See at a glance if everything is working.

### 2. Quick Navigation
Jump to any page without typing URLs.

### 3. Auto-Restart
Server crashes? It recovers automatically.

### 4. Environment Validation
Warns if `.env.local` is missing.

### 5. Beautiful UI
Gradient background, clean typography, responsive design.

## Integration with ACT Development Hub

This is compatible with the main ACT hub that runs all projects:

```javascript
// Already configured in ACT hub:
{
  name: 'Empathy Ledger',
  dir: '/Users/benknight/Code/empathy-ledger-v2',
  port: 3003,
  color: '\x1b[35m', // Magenta
  enabled: true,
}
```

You can:
- Run this standalone: `npm run dev:hub`
- Or run with all ACT projects: `cd /Users/benknight/Code/ACT\ Farm\ and\ Regenerative\ Innovation\ Studio && npm start`

## Ports

| Service | Port | URL |
|---------|------|-----|
| Dashboard | 3999 | http://localhost:3999 |
| Next.js Dev | 3003 | http://localhost:3003 |

## Troubleshooting

### Port Already in Use

The system will show an error if ports are taken. Kill the process:

```bash
# Kill dashboard port
lsof -ti:3999 | xargs kill -9

# Kill app port
lsof -ti:3003 | xargs kill -9
```

### Server Won't Start

1. Check terminal output for errors
2. Verify `.env.local` exists
3. Run `npm install`
4. Check Node.js version (needs v18+)

### Dashboard Not Loading

1. Check port 3999 is free
2. Wait 5 seconds for full startup
3. Refresh browser

## Files Created

```
empathy-ledger-v2/
├── dev-server.mjs          # Main orchestrator
├── DEV_SERVER_GUIDE.md     # Detailed guide
└── README_DEV_HUB.md       # This file
```

## Customization

Edit `dev-server.mjs` to:
- Change ports
- Modify dashboard HTML/CSS
- Add custom health checks
- Add more quick links

## Benefits vs Standard `npm run dev`

| Feature | Standard | Dev Hub |
|---------|----------|---------|
| Visual Dashboard | ❌ | ✅ |
| Quick Links | ❌ | ✅ |
| Auto-Restart | ❌ | ✅ |
| Status Monitoring | ❌ | ✅ |
| Uptime Tracking | ❌ | ✅ |
| Environment Check | ❌ | ✅ |
| Filtered Logs | ❌ | ✅ |

## What's Next?

1. ✅ **Start the hub:** `npm run dev:hub`
2. ✅ **Open dashboard:** http://localhost:3999
3. ✅ **Test Google OAuth:** Click "Sign In" → "Continue with Google"
4. ✅ **Use quick links** to navigate while developing
5. ✅ **Keep dashboard open** to monitor status

---

**Made with 💜 for Empathy Ledger**

*Part of the ACT Development Ecosystem*

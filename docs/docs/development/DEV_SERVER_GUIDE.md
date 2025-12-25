# Development Server Guide

Beautiful dashboard-based development server for Empathy Ledger.

## Quick Start

```bash
npm run dev:hub
```

That's it! This will:
- ✅ Start Next.js on port 3003
- ✅ Launch visual dashboard on port 3999
- ✅ Auto-restart on crashes
- ✅ Show live status and quick links
- ✅ Load environment variables automatically

## What You Get

### Dashboard (http://localhost:3999)

Beautiful visual interface showing:
- **Server Status** - Running/stopped with process info
- **Quick Links** - Direct access to key pages:
  - Home page
  - Sign in (test OAuth)
  - Profile
  - Stories
  - Storytellers
  - Admin panel
- **Live Stats** - Uptime, restarts, PID
- **Auto-refresh** - Updates every 5 seconds

### Development Server (http://localhost:3003)

Your app running with:
- Live reload
- Hot module replacement
- Full Next.js development features
- Supabase integration
- All authentication methods

## Features

### Auto-Recovery
If the server crashes, it automatically restarts after 3 seconds. The dashboard tracks restart count.

### Environment Check
Dashboard warns if `.env.local` is missing or doesn't have Supabase configuration.

### Clean Output
Console output is color-coded and filtered to show only important messages.

### Graceful Shutdown
Press `Ctrl+C` to cleanly stop both servers.

## Commands

```bash
# Start with dashboard
npm run dev:hub

# Standard dev (no dashboard)
npm run dev

# Custom port
npm run dev:custom

# Clean start (removes cache)
npm run dev:clean
```

## Ports

- **3003** - Next.js development server
- **3999** - Dashboard UI

## Dashboard Features

### Quick Access
Click any link in the dashboard to open directly in your browser:
- Test authentication
- View stories
- Access admin panel
- Check your profile

### Status Monitoring
See at a glance:
- Is server running?
- Process ID
- Uptime
- Restart count
- Environment status

### Visual Feedback
- Green border = Running
- Red border = Stopped
- Color-coded status badges
- Beautiful gradient background

## Troubleshooting

### Port Already In Use
The system automatically finds available ports. If 3003 is taken, it will try 3004, 3005, etc.

### Server Won't Start
1. Check terminal for errors
2. Verify `.env.local` exists
3. Make sure dependencies are installed: `npm install`
4. Check port isn't blocked by firewall

### Dashboard Not Loading
1. Verify port 3999 is available
2. Check if dashboard server started (look for "📊 Dashboard" in terminal)
3. Refresh browser after server fully starts

## Integration with Other ACT Projects

This is based on the ACT Development Hub orchestrator. You can integrate it with the main hub by:

1. Adding this project to `/Users/benknight/Code/ACT Farm and Regenerative Innovation Studio/dev-servers.mjs`
2. Running the hub to start all ACT projects simultaneously
3. Accessing all projects from one unified dashboard

Already configured:
- Port 3003 (Empathy Ledger)
- Color: Magenta
- Shared services support ready

## Advanced Usage

### Run Standalone
```bash
./dev-server.mjs
```

### Customize
Edit `dev-server.mjs` to:
- Change ports
- Modify dashboard HTML
- Add custom health checks
- Integrate additional services

### Production
This is for development only. For production:
```bash
npm run build
npm start
```

## Benefits Over Standard `npm run dev`

| Feature | Standard | Dev Hub |
|---------|----------|---------|
| Visual Dashboard | ❌ | ✅ |
| Auto-restart | ❌ | ✅ |
| Quick Links | ❌ | ✅ |
| Status Monitoring | ❌ | ✅ |
| Uptime Tracking | ❌ | ✅ |
| Environment Check | ❌ | ✅ |
| Color Output | Partial | ✅ |
| Filtered Logs | ❌ | ✅ |

## Next Steps

1. Start the server: `npm run dev:hub`
2. Open dashboard: http://localhost:3999
3. Click "Sign In" to test Google OAuth
4. Explore all the quick links
5. Keep dashboard open while developing

---

**Made with 💜 for Empathy Ledger**

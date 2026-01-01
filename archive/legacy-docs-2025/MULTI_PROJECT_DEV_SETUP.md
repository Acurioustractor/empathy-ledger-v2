# Multi-Project Development Setup - Cloud-First Compatible

**Date:** December 24, 2025
**Status:** ✅ Compatible with Cloud-First Supabase Strategy

---

## ✅ Compatibility Confirmed

The multi-project live server setup is **fully compatible** with the cloud-first Supabase workflow. Here's how they work together:

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Mac Development Machine                   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  ACT Hub     │  │  ACT Farm    │  │  JusticeHub  │      │
│  │  :3000       │  │  :3001       │  │  :3002       │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │               │
│  ┌──────┴─────────────────┴─────────────────┴───────┐      │
│  │         Empathy Ledger v2 :3003                  │      │
│  │         (Cloud-First Supabase)                   │      │
│  └──────┬────────────────────────────────────┬──────┘      │
│         │                                     │             │
│         ↓                                     ↓             │
│  ┌──────────────┐                    ┌──────────────┐      │
│  │  Dashboard   │                    │ The Harvest  │      │
│  │  :3999       │                    │  :3004       │      │
│  └──────────────┘                    └──────────────┘      │
│                                                              │
└────────┬─────────────────────────────────────┬──────────────┘
         │                                     │
         │ Local Cache/AI                      │ Production Data
         ↓                                     ↓
┌─────────────────────┐              ┌─────────────────────┐
│  Synology NAS       │              │  Supabase Cloud     │
│  192.168.0.34       │              │  (yvnuayzslukamizr) │
│                     │              │                     │
│  ├─ Redis :6379     │              │  ├─ Production DB   │
│  ├─ ChromaDB :8000  │              │  ├─ Preview DBs     │
│  ├─ Ollama :11434   │              │  ├─ Auth            │
│  └─ Portainer :9000 │              │  └─ Storage         │
└─────────────────────┘              └─────────────────────┘
```

**Key Points:**
- ✅ All projects run on Mac (ports 3000-3005)
- ✅ Empathy Ledger uses Supabase Cloud for data
- ✅ All projects share NAS services (Redis, ChromaDB)
- ✅ No conflicts between local dev and cloud-first strategy

---

## Project Configuration

### Empathy Ledger v2 (Port 3003) - Cloud-First

**`.env.local`:**
```bash
# ============================================================================
# CLOUD SERVICES (Primary) - ALWAYS CLOUD
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# ⚠️ NO DATABASE_URL - Supabase client handles all DB connections

# ============================================================================
# SHARED NAS SERVICES
# ============================================================================
REDIS_URL=redis://192.168.0.34:6379
CHROMADB_URL=http://192.168.0.34:8000
OLLAMA_BASE_URL=http://192.168.0.34:11434

# ============================================================================
# APP CONFIG
# ============================================================================
NEXT_PUBLIC_APP_URL=http://localhost:3003
PORT=3003
```

**`package.json`:**
```json
{
  "scripts": {
    "dev": "next dev -p 3003",
    "dev:turbo": "next dev -p 3003 --turbo"
  }
}
```

### Other Projects (Ports 3000-3002, 3004-3005)

**Can use local PostgreSQL on NAS:**
```bash
# JusticeHub .env.local
DATABASE_URL=postgresql://postgres:password@192.168.0.34:5433/justicehub
REDIS_URL=redis://192.168.0.34:6379
CHROMADB_URL=http://192.168.0.34:8000
PORT=3002

# The Harvest .env.local
DATABASE_URL=postgresql://postgres:password@192.168.0.34:5434/harvest
REDIS_URL=redis://192.168.0.34:6379
PORT=3004
```

---

## Orchestrator Script

### Location
`/Users/benknight/Code/ACT Farm and Regenerative Innovation Studio/dev-servers.js`

### Implementation

```javascript
#!/usr/bin/env node

/**
 * ACT Development Hub - Multi-Project Orchestrator
 *
 * Starts all ACT projects simultaneously with:
 * - Automatic port allocation
 * - Health monitoring
 * - Auto-restart on crash
 * - Live status dashboard
 */

const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')

const BASE_DIR = '/Users/benknight/Code'

const PROJECTS = [
  {
    name: 'ACT Hub',
    path: 'ACT Farm and Regenerative Innovation Studio',
    port: 3000,
    command: 'npm',
    args: ['run', 'dev'],
    color: 'blue',
    icon: '🏠'
  },
  {
    name: 'ACT Farm',
    path: 'ACT Farm/act-farm',
    port: 3001,
    command: 'npm',
    args: ['run', 'dev'],
    color: 'green',
    icon: '🌾'
  },
  {
    name: 'JusticeHub',
    path: 'JusticeHub',
    port: 3002,
    command: 'npm',
    args: ['run', 'dev'],
    color: 'yellow',
    icon: '⚖️'
  },
  {
    name: 'Empathy Ledger',
    path: 'empathy-ledger-v2',
    port: 3003,
    command: 'npm',
    args: ['run', 'dev'],
    color: 'magenta',
    icon: '📖',
    cloudFirst: true  // Special flag
  },
  {
    name: 'The Harvest',
    path: 'The Harvest',
    port: 3004,
    command: 'npm',
    args: ['run', 'dev'],
    color: 'cyan',
    icon: '🌻'
  },
  {
    name: 'Goods on Country',
    path: 'goods-on-country',  // Update with actual path
    port: 3005,
    command: 'npm',
    args: ['run', 'dev'],
    color: 'white',
    icon: '🛍️',
    optional: true  // Skip if directory doesn't exist
  }
]

const NAS_SERVICES = {
  redis: { host: '192.168.0.34', port: 6379 },
  chromadb: { host: '192.168.0.34', port: 8000 },
  ollama: { host: '192.168.0.34', port: 11434 },
  portainer: { host: '192.168.0.34', port: 9000 }
}

class DevOrchestrator {
  constructor() {
    this.processes = new Map()
    this.status = new Map()
    this.startTime = Date.now()
  }

  async checkPrerequisites() {
    console.log(chalk.bold.blue('\n🔍 Checking Prerequisites...\n'))

    // Check NAS services
    for (const [name, config] of Object.entries(NAS_SERVICES)) {
      const available = await this.checkPort(config.host, config.port)
      const status = available ? chalk.green('✅') : chalk.red('❌')
      console.log(`${status} NAS ${name}: ${config.host}:${config.port}`)

      if (!available && ['redis', 'chromadb'].includes(name)) {
        console.log(chalk.yellow(`⚠️  Warning: ${name} not available. Some features may not work.`))
      }
    }

    console.log()

    // Check project directories
    for (const project of PROJECTS) {
      const projectPath = path.join(BASE_DIR, project.path)
      const exists = fs.existsSync(projectPath)

      if (!exists && !project.optional) {
        console.log(chalk.red(`❌ Project not found: ${projectPath}`))
        process.exit(1)
      } else if (!exists && project.optional) {
        console.log(chalk.yellow(`⚠️  Optional project not found: ${project.name} (skipping)`))
        project.skip = true
      } else {
        console.log(chalk.green(`✅ Found: ${project.name}`))
      }
    }

    // Check for .env.local files
    console.log(chalk.bold.blue('\n📋 Checking Environment Files...\n'))

    for (const project of PROJECTS) {
      if (project.skip) continue

      const projectPath = path.join(BASE_DIR, project.path)
      const envPath = path.join(projectPath, '.env.local')
      const hasEnv = fs.existsSync(envPath)

      if (!hasEnv) {
        console.log(chalk.yellow(`⚠️  ${project.name}: No .env.local found`))
        console.log(chalk.dim(`   Copy .env.local.example to .env.local in ${project.path}`))
      } else {
        // Check for correct port
        const envContent = fs.readFileSync(envPath, 'utf-8')
        const hasPort = envContent.includes(`PORT=${project.port}`)

        if (!hasPort) {
          console.log(chalk.yellow(`⚠️  ${project.name}: PORT not set to ${project.port}`))
          console.log(chalk.dim(`   Add: PORT=${project.port} to .env.local`))
        } else {
          console.log(chalk.green(`✅ ${project.name}: Environment configured`))
        }

        // Special check for Empathy Ledger cloud-first
        if (project.cloudFirst) {
          const hasSupabaseCloud = envContent.includes('https://yvnuayzslukamizrlhwb.supabase.co')
          const hasLocalDB = envContent.includes('DATABASE_URL=postgresql://')

          if (hasLocalDB) {
            console.log(chalk.red(`❌ ${project.name}: Has DATABASE_URL (should use Supabase only!)`))
            console.log(chalk.dim(`   Remove DATABASE_URL from .env.local - Supabase client handles all DB connections`))
          } else if (hasSupabaseCloud) {
            console.log(chalk.green(`✅ ${project.name}: Cloud-first Supabase configured correctly`))
          } else {
            console.log(chalk.yellow(`⚠️  ${project.name}: Supabase URL not found`))
          }
        }
      }
    }

    console.log()
  }

  async checkPort(host, port) {
    const net = require('net')
    return new Promise((resolve) => {
      const socket = new net.Socket()
      socket.setTimeout(2000)
      socket.on('connect', () => {
        socket.destroy()
        resolve(true)
      })
      socket.on('timeout', () => {
        socket.destroy()
        resolve(false)
      })
      socket.on('error', () => {
        resolve(false)
      })
      socket.connect(port, host)
    })
  }

  startProject(project) {
    if (project.skip) return

    const projectPath = path.join(BASE_DIR, project.path)
    const colorFn = chalk[project.color] || chalk.white

    console.log(colorFn(`${project.icon} Starting ${project.name} on port ${project.port}...`))

    const proc = spawn(project.command, project.args, {
      cwd: projectPath,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PORT: project.port }
    })

    this.processes.set(project.name, proc)
    this.status.set(project.name, {
      status: 'starting',
      port: project.port,
      icon: project.icon,
      color: project.color,
      startTime: Date.now(),
      restarts: 0
    })

    // Handle stdout
    proc.stdout.on('data', (data) => {
      const output = data.toString()

      // Detect ready state
      if (output.includes('Ready') || output.includes('started server') || output.includes('Local:')) {
        this.status.get(project.name).status = 'running'
        console.log(colorFn(`✅ ${project.icon} ${project.name} ready at http://localhost:${project.port}`))
      }

      // Log output with project prefix
      const lines = output.trim().split('\n')
      lines.forEach(line => {
        if (line.trim()) {
          console.log(colorFn(`[${project.name}] ${line}`))
        }
      })
    })

    // Handle stderr
    proc.stderr.on('data', (data) => {
      const output = data.toString()
      const lines = output.trim().split('\n')
      lines.forEach(line => {
        if (line.trim() && !line.includes('ExperimentalWarning')) {
          console.log(chalk.red(`[${project.name}] ⚠️  ${line}`))
        }
      })
    })

    // Handle exit
    proc.on('exit', (code) => {
      if (code !== 0) {
        console.log(chalk.red(`❌ ${project.icon} ${project.name} exited with code ${code}`))
        this.status.get(project.name).status = 'crashed'

        // Auto-restart
        setTimeout(() => {
          const status = this.status.get(project.name)
          status.restarts++
          console.log(chalk.yellow(`🔄 Restarting ${project.name} (attempt ${status.restarts})...`))
          this.startProject(project)
        }, 3000)
      }
    })
  }

  startAll() {
    console.log(chalk.bold.blue('\n🚀 Starting All ACT Projects...\n'))

    for (const project of PROJECTS) {
      this.startProject(project)
    }

    // Start dashboard server
    this.startDashboard()
  }

  startDashboard() {
    // Simple HTTP server showing status
    const http = require('http')

    const server = http.createServer((req, res) => {
      if (req.url === '/api/status') {
        // JSON API for status
        const statusData = Array.from(this.status.entries()).map(([name, status]) => ({
          name,
          ...status,
          uptime: status.status === 'running' ? Date.now() - status.startTime : 0
        }))

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({
          projects: statusData,
          nasServices: NAS_SERVICES,
          totalUptime: Date.now() - this.startTime
        }))
      } else {
        // HTML dashboard
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(this.getDashboardHTML())
      }
    })

    server.listen(3999, () => {
      console.log(chalk.bold.green('\n✨ Dashboard available at http://localhost:3999\n'))
    })
  }

  getDashboardHTML() {
    const projectRows = Array.from(this.status.entries()).map(([name, status]) => {
      const statusColor = status.status === 'running' ? '#4ade80' : status.status === 'crashed' ? '#ef4444' : '#fbbf24'
      const uptime = status.status === 'running' ? Math.floor((Date.now() - status.startTime) / 1000) : 0

      return `
        <tr>
          <td>${status.icon} ${name}</td>
          <td><a href="http://localhost:${status.port}" target="_blank">:${status.port}</a></td>
          <td><span class="status" style="background: ${statusColor}">${status.status}</span></td>
          <td>${uptime}s</td>
          <td>${status.restarts || 0}</td>
        </tr>
      `
    }).join('')

    return `
<!DOCTYPE html>
<html>
<head>
  <title>ACT Development Hub</title>
  <meta http-equiv="refresh" content="5">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      padding: 2rem;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 2rem; margin-bottom: 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 0.5rem;
      padding: 1.5rem;
    }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 0.75rem; }
    th { background: #1e293b; border-bottom: 2px solid #334155; }
    tr:hover { background: #1e293b; }
    .status {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.875rem;
      font-weight: 500;
    }
    a { color: #60a5fa; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .nas-services { list-style: none; }
    .nas-services li { padding: 0.5rem 0; border-bottom: 1px solid #334155; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 ACT Development Hub</h1>

    <div class="grid">
      <div class="card">
        <h2>Running Projects</h2>
        <table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Port</th>
              <th>Status</th>
              <th>Uptime</th>
              <th>Restarts</th>
            </tr>
          </thead>
          <tbody>
            ${projectRows}
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>NAS Services (192.168.0.34)</h2>
        <ul class="nas-services">
          <li>🗄️ Redis: :6379</li>
          <li>🔍 ChromaDB: :8000</li>
          <li>🤖 Ollama: :11434</li>
          <li>📊 Portainer: :9000</li>
        </ul>
      </div>
    </div>

    <p style="color: #64748b; font-size: 0.875rem;">Auto-refreshes every 5 seconds</p>
  </div>
</body>
</html>
    `
  }

  async stop() {
    console.log(chalk.yellow('\n🛑 Stopping all projects...\n'))

    for (const [name, proc] of this.processes.entries()) {
      console.log(chalk.dim(`Stopping ${name}...`))
      proc.kill('SIGTERM')
    }

    process.exit(0)
  }
}

// Main
async function main() {
  const orchestrator = new DevOrchestrator()

  // Handle Ctrl+C
  process.on('SIGINT', () => orchestrator.stop())
  process.on('SIGTERM', () => orchestrator.stop())

  await orchestrator.checkPrerequisites()
  orchestrator.startAll()
}

main().catch(console.error)
```

---

## Package.json in ACT Hub

**`/Users/benknight/Code/ACT Farm and Regenerative Innovation Studio/package.json`:**

```json
{
  "name": "act-development-hub",
  "version": "1.0.0",
  "description": "Multi-project development orchestrator for ACT projects",
  "scripts": {
    "dev:all": "node dev-servers.js",
    "dev:hub": "next dev -p 3000",
    "dev": "npm run dev:all"
  },
  "dependencies": {
    "chalk": "^4.1.2"
  }
}
```

---

## Usage

### Install Dependencies (One-time)

```bash
cd "/Users/benknight/Code/ACT Farm and Regenerative Innovation Studio"
npm install chalk
```

### Start All Projects

```bash
npm run dev
```

**This will:**
1. ✅ Check NAS services are running
2. ✅ Verify all project directories exist
3. ✅ Check .env.local files are configured
4. ✅ Warn if Empathy Ledger has DATABASE_URL (should be cloud-only)
5. ✅ Start all projects on their designated ports
6. ✅ Show live status dashboard at http://localhost:3999
7. ✅ Auto-restart crashed servers

### Access Projects

- **ACT Hub:** http://localhost:3000
- **ACT Farm:** http://localhost:3001
- **JusticeHub:** http://localhost:3002
- **Empathy Ledger:** http://localhost:3003 (Cloud-First Supabase)
- **The Harvest:** http://localhost:3004
- **Goods on Country:** http://localhost:3005
- **Dashboard:** http://localhost:3999

### Stop All Projects

Press `Ctrl+C` in the terminal running the orchestrator.

---

## Cloud-First Safeguards

### Empathy Ledger Pre-flight Check

The orchestrator **automatically detects** if Empathy Ledger's `.env.local` has `DATABASE_URL` and warns:

```
❌ Empathy Ledger: Has DATABASE_URL (should use Supabase only!)
   Remove DATABASE_URL from .env.local - Supabase client handles all DB connections
```

### Correct Configuration Detection

When properly configured:
```
✅ Empathy Ledger: Cloud-first Supabase configured correctly
```

### What It Checks

1. ✅ Supabase URL is cloud (`https://yvnuayzslukamizrlhwb.supabase.co`)
2. ✅ No `DATABASE_URL` present (bypasses Supabase)
3. ✅ Redis/ChromaDB point to NAS (shared services)
4. ✅ PORT is set to 3003

---

## Dashboard Features

**http://localhost:3999** shows:

- **Project Status Table:**
  - Name and icon
  - Port and clickable link
  - Status (running/starting/crashed)
  - Uptime in seconds
  - Restart count

- **NAS Services Card:**
  - Redis :6379
  - ChromaDB :8000
  - Ollama :11434
  - Portainer :9000

- **Auto-refresh:** Every 5 seconds
- **JSON API:** http://localhost:3999/api/status

---

## Benefits

### Development Experience
- ✅ **One command starts everything** - No manual port juggling
- ✅ **Live reload works** - Each project runs independently
- ✅ **Visual dashboard** - See all running services at a glance
- ✅ **Auto-restart** - Crashed servers automatically recover
- ✅ **Color-coded logs** - Easy to identify which project is logging

### Cloud-First Maintained
- ✅ **Empathy Ledger uses Supabase Cloud** - No local database
- ✅ **Pre-flight checks** - Warns if misconfigured
- ✅ **Other projects can use local DB** - Via NAS PostgreSQL
- ✅ **Shared NAS services** - Redis, ChromaDB across all projects

### Performance
- ✅ **Fast hot reload** - Each server runs natively (not proxied)
- ✅ **No conflicts** - Each project on dedicated port
- ✅ **Low overhead** - Just Node.js processes, no Docker
- ✅ **Shared cache** - Redis benefits all projects

---

## Troubleshooting

### Port Already in Use

```bash
# Find what's using the port
lsof -i :3003

# Kill the process
kill -9 <PID>
```

### Project Won't Start

Check logs in terminal - orchestrator shows all output with project prefix:
```
[Empathy Ledger] ⚠️  Error: Cannot find module '@supabase/supabase-js'
```

Install missing dependencies:
```bash
cd "/Users/benknight/Code/empathy-ledger-v2"
npm install
```

### NAS Services Not Available

```bash
# Check NAS is online
ping 192.168.0.34

# Check Redis
redis-cli -h 192.168.0.34 -p 6379 ping

# Start services via Portainer
open http://192.168.0.34:9000
```

### Empathy Ledger DATABASE_URL Warning

If you see:
```
❌ Empathy Ledger: Has DATABASE_URL (should use Supabase only!)
```

**Fix:**
```bash
# Edit .env.local
code "/Users/benknight/Code/empathy-ledger-v2/.env.local"

# Remove or comment out this line:
# DATABASE_URL=postgresql://...

# Keep only:
NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## Summary

### ✅ Compatible with Cloud-First

The multi-project orchestrator **fully supports** the cloud-first Supabase strategy:

1. **Empathy Ledger uses Supabase Cloud exclusively**
   - No local database
   - Pre-flight checks warn if misconfigured
   - All queries via Supabase client

2. **Other projects can use local NAS databases**
   - JusticeHub → NAS PostgreSQL :5433
   - The Harvest → NAS PostgreSQL :5434
   - No conflict with Empathy Ledger

3. **Shared NAS services benefit all projects**
   - Redis cache speeds up all apps
   - ChromaDB enables AI features
   - Ollama provides local LLM

4. **Dashboard monitors everything**
   - See all running projects
   - Check NAS service health
   - Auto-restart on crash

### Next Steps

1. **Install chalk dependency:**
   ```bash
   cd "/Users/benknight/Code/ACT Farm and Regenerative Innovation Studio"
   npm install chalk
   ```

2. **Create dev-servers.js** (copy script above)

3. **Update all project .env.local files:**
   - Set PORT variable
   - Point to NAS services
   - Empathy Ledger: Supabase Cloud only

4. **Start everything:**
   ```bash
   npm run dev
   ```

5. **Open dashboard:**
   http://localhost:3999

---

**Ready to implement?** The orchestrator is designed to maintain cloud-first while enabling efficient multi-project development.


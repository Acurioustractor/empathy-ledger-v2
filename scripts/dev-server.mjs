#!/usr/bin/env node
/**
 * Empathy Ledger Development Server
 *
 * Runs Next.js dev server with Supabase integration
 * - Automatically starts on port 3003
 * - Live reload enabled
 * - Environment variables loaded
 * - Dashboard UI at http://localhost:3999
 *
 * Usage: npm run dev:hub
 */

import { spawn } from 'child_process';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Color codes for terminal
const COLORS = {
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',
  GREEN: '\x1b[92m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  YELLOW: '\x1b[33m',
  RED: '\x1b[31m',
};

const PORT = 3003;
const DASHBOARD_PORT = 3999;

// Server state
let devServer = null;
let dashboardServer = null;
const startTime = Date.now();
let restartCount = 0;

// Read environment variables
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const hasSupabase = envContent.includes('NEXT_PUBLIC_SUPABASE_URL');
    return { hasSupabase, envPath };
  }
  return { hasSupabase: false, envPath: null };
}

// Create dashboard HTML
function createDashboardHTML(isRunning, pid) {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const env = loadEnv();

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Empathy Ledger Dev Server</title>
  <meta http-equiv="refresh" content="5">
  <style>
    body {
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      padding: 40px;
      margin: 0;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      font-size: 48px;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    .subtitle {
      color: rgba(255,255,255,0.8);
      margin-bottom: 40px;
      font-size: 18px;
    }
    .card {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 20px;
      backdrop-filter: blur(10px);
    }
    .card.running {
      border-left: 4px solid #4ade80;
    }
    .card.stopped {
      border-left: 4px solid #ef4444;
    }
    .status {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .status.running {
      background: #166534;
      color: #4ade80;
    }
    .status.stopped {
      background: #7f1d1d;
      color: #ef4444;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .info-item {
      background: rgba(0,0,0,0.2);
      padding: 15px;
      border-radius: 8px;
    }
    .info-label {
      color: rgba(255,255,255,0.6);
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .info-value {
      font-size: 20px;
      font-weight: bold;
    }
    .link {
      color: #60a5fa;
      text-decoration: none;
      font-weight: bold;
      font-size: 24px;
    }
    .link:hover {
      text-decoration: underline;
    }
    .uptime {
      position: fixed;
      top: 20px;
      right: 40px;
      background: rgba(0,0,0,0.3);
      padding: 10px 20px;
      border-radius: 8px;
      backdrop-filter: blur(10px);
    }
    .services {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .service-card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 20px;
    }
    .service-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .service-url {
      color: #60a5fa;
      text-decoration: none;
    }
    .service-url:hover {
      text-decoration: underline;
    }
    .warning {
      background: rgba(234, 179, 8, 0.2);
      border-left: 4px solid #eab308;
      padding: 15px;
      border-radius: 8px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>💜 Empathy Ledger</h1>
    <div class="subtitle">Development Server Dashboard</div>
    <div class="uptime">Uptime: ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s</div>

    <div class="card ${isRunning ? 'running' : 'stopped'}">
      <div style="font-size: 24px; font-weight: bold; margin-bottom: 15px;">Next.js Development Server</div>
      <div class="status ${isRunning ? 'running' : 'stopped'}">
        ${isRunning ? '● RUNNING' : '○ STOPPED'}
      </div>

      ${isRunning ? `
        <div style="margin: 20px 0;">
          <a href="http://localhost:${PORT}" class="link" target="_blank">→ Open Application (localhost:${PORT})</a>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Port</div>
            <div class="info-value">${PORT}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Process ID</div>
            <div class="info-value">${pid || 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Restarts</div>
            <div class="info-value">${restartCount}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Environment</div>
            <div class="info-value">Development</div>
          </div>
        </div>
      ` : `
        <div style="color: rgba(255,255,255,0.6); margin-top: 20px;">
          Server is starting or stopped. Check terminal for errors.
        </div>
      `}
    </div>

    <h2 style="margin-top: 40px; margin-bottom: 20px;">Quick Links</h2>
    <div class="services">
      <div class="service-card">
        <div class="service-title">🏠 Main App</div>
        <a href="http://localhost:${PORT}" class="service-url" target="_blank">localhost:${PORT}</a>
        <div style="color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 5px;">Home page</div>
      </div>

      <div class="service-card">
        <div class="service-title">🔐 Sign In</div>
        <a href="http://localhost:${PORT}/auth/signin" class="service-url" target="_blank">localhost:${PORT}/auth/signin</a>
        <div style="color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 5px;">Test OAuth & magic links</div>
      </div>

      <div class="service-card">
        <div class="service-title">👤 Profile</div>
        <a href="http://localhost:${PORT}/profile" class="service-url" target="_blank">localhost:${PORT}/profile</a>
        <div style="color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 5px;">User dashboard</div>
      </div>

      <div class="service-card">
        <div class="service-title">📖 Stories</div>
        <a href="http://localhost:${PORT}/stories" class="service-url" target="_blank">localhost:${PORT}/stories</a>
        <div style="color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 5px;">Story catalog</div>
      </div>

      <div class="service-card">
        <div class="service-title">👥 Storytellers</div>
        <a href="http://localhost:${PORT}/storytellers" class="service-url" target="_blank">localhost:${PORT}/storytellers</a>
        <div style="color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 5px;">Community members</div>
      </div>

      <div class="service-card">
        <div class="service-title">⚙️ Admin Panel</div>
        <a href="http://localhost:${PORT}/admin" class="service-url" target="_blank">localhost:${PORT}/admin</a>
        <div style="color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 5px;">Database & settings</div>
      </div>
    </div>

    ${!env.hasSupabase ? `
      <div class="warning">
        <strong>⚠️ Warning:</strong> .env.local file not found or missing Supabase configuration.
        <br>Authentication features may not work. See docs/guides/AUTHENTICATION_SETUP.md
      </div>
    ` : ''}

    <div style="margin-top: 40px; color: rgba(255,255,255,0.6); font-size: 12px;">
      Auto-refreshes every 5 seconds | Press Ctrl+C in terminal to stop server
    </div>
  </div>
</body>
</html>
  `;
}

// Start dashboard server
function startDashboard() {
  dashboardServer = createServer((req, res) => {
    const isRunning = devServer && !devServer.killed;
    const pid = devServer?.pid;
    const html = createDashboardHTML(isRunning, pid);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  });

  dashboardServer.listen(DASHBOARD_PORT, () => {
    console.log(`${COLORS.CYAN}${COLORS.BOLD}📊 Dashboard:${COLORS.RESET} http://localhost:${DASHBOARD_PORT}`);
    console.log('');
  });
}

// Start Next.js dev server
function startDevServer() {
  console.log(`${COLORS.MAGENTA}${COLORS.BOLD}[Empathy Ledger]${COLORS.RESET} Starting on port ${PORT}...`);

  const env = {
    ...process.env,
    PORT: PORT.toString(),
  };

  devServer = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    env,
    stdio: 'pipe',
    shell: true,
  });

  // Handle stdout
  devServer.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(l => l.trim());
    lines.forEach(line => {
      if (line.includes('Local:') || line.includes('localhost')) {
        console.log(`${COLORS.MAGENTA}${COLORS.BOLD}[Empathy Ledger]${COLORS.RESET} ${line}`);
      } else if (line.includes('Ready') || line.includes('compiled')) {
        console.log(`${COLORS.MAGENTA}[Empathy Ledger]${COLORS.RESET} ${COLORS.DIM}${line}${COLORS.RESET}`);
      } else if (!line.includes('Compiling') && !line.includes('webpack')) {
        console.log(`${COLORS.MAGENTA}[Empathy Ledger]${COLORS.RESET} ${COLORS.DIM}${line}${COLORS.RESET}`);
      }
    });
  });

  // Handle stderr
  devServer.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(l => l.trim());
    lines.forEach(line => {
      if (!line.includes('ExperimentalWarning')) {
        console.log(`${COLORS.MAGENTA}[Empathy Ledger]${COLORS.RESET} ${line}`);
      }
    });
  });

  // Handle exit
  devServer.on('exit', (code) => {
    if (code !== 0) {
      restartCount++;
      console.log(`${COLORS.RED}${COLORS.BOLD}[Empathy Ledger]${COLORS.RESET} Crashed (code ${code}). Restarting in 3s...`);

      setTimeout(() => {
        startDevServer();
      }, 3000);
    } else {
      console.log(`${COLORS.MAGENTA}[Empathy Ledger]${COLORS.RESET} Stopped`);
    }
  });
}

// Graceful shutdown
function shutdown() {
  console.log(`\n${COLORS.BOLD}Shutting down...${COLORS.RESET}`);

  if (devServer) {
    console.log('Stopping Next.js server...');
    devServer.kill();
  }

  if (dashboardServer) {
    dashboardServer.close();
  }

  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Main startup
console.log(`${COLORS.BOLD}
╔════════════════════════════════════════╗
║   Empathy Ledger Dev Server            ║
╚════════════════════════════════════════╝
${COLORS.RESET}`);

const env = loadEnv();
if (env.hasSupabase) {
  console.log(`${COLORS.GREEN}✓ Supabase configuration loaded${COLORS.RESET}`);
} else {
  console.log(`${COLORS.YELLOW}⚠ No .env.local found - authentication may not work${COLORS.RESET}`);
}

console.log('');

// Start dashboard first
startDashboard();

// Wait a moment, then start dev server
setTimeout(() => {
  startDevServer();

  setTimeout(() => {
    console.log(`\n${COLORS.BOLD}${COLORS.GREEN}✓ Development server started!${COLORS.RESET}`);
    console.log(`${COLORS.DIM}Dashboard: http://localhost:${DASHBOARD_PORT}${COLORS.RESET}`);
    console.log(`${COLORS.DIM}App:       http://localhost:${PORT}${COLORS.RESET}\n`);
  }, 3000);
}, 1000);

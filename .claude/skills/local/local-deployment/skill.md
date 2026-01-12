# Local Deployment Skill

## Purpose
Manage the ACT Ecosystem local development environment - start, stop, restart, and monitor all 6 sites for sprint reviews and development work.

## When to Use
- **Sprint completion** - Review all local sites before marking sprint complete
- **Major task completion** - Verify changes across the ecosystem
- **Start of day** - Launch all development servers
- **End of day** - Clean shutdown of all servers
- **Debugging** - Check logs and status across all sites

## Quick Commands

### From Anywhere in Terminal
```bash
act-start      # Start all 6 sites + open Chrome
act-stop       # Stop all sites
act-restart    # Restart all sites
act-status     # Show which sites are running
act-logs       # View live logs from all sites
act-monitor    # Open PM2 dashboard
```

### Direct Script (if aliases not loaded)
```bash
/Users/benknight/act-global-infrastructure/deployment/scripts/deploy-act-ecosystem.sh start
/Users/benknight/act-global-infrastructure/deployment/scripts/deploy-act-ecosystem.sh status
```

## Sites & Ports

| Site | Port | URL |
|------|------|-----|
| ACT Regenerative Studio | 3002 | http://localhost:3002 |
| **Empathy Ledger** | 3030 | http://localhost:3030 |
| JusticeHub | 3003 | http://localhost:3003 |
| The Harvest Website | 3004 | http://localhost:3004 |
| ACT Farm | 3005 | http://localhost:3005 |
| ACT Placemat | 3999 | http://localhost:3999 |

## Sprint Review Workflow

### After Completing a Sprint/Major Task:
1. Run `act-restart` to ensure fresh builds
2. Wait for all 6 sites to start (8 seconds)
3. Chrome opens automatically with 6 tabs
4. Test Empathy Ledger at http://localhost:3030
5. Verify related integrations if needed

### Checklist for Sprint Reviews
- [ ] All sites running? (`act-status`)
- [ ] No errors in logs? (`act-logs`)
- [ ] Empathy Ledger features working?
- [ ] Any cross-site integrations verified?

## Troubleshooting

### Sites won't start
```bash
act-logs  # Check for errors
```

### Port already in use
```bash
act-stop && act-start
```

### One site keeps crashing
```bash
pm2 logs empathy-ledger  # Check specific logs
pm2 restart empathy-ledger  # Restart just that site
```

### Aliases not working
```bash
source ~/.zshrc  # Reload shell config
# Or use direct script path
```

## PM2 Advanced Commands

```bash
pm2 list                    # Show all processes with status
pm2 restart empathy-ledger  # Restart just Empathy Ledger
pm2 logs empathy-ledger     # Logs for just Empathy Ledger
pm2 monit                   # Interactive dashboard
pm2 delete all              # Nuclear option - stop everything
```

## Architecture

- **Process Manager**: PM2 (production-grade, auto-restart)
- **Config**: `/Users/benknight/act-global-infrastructure/deployment/ecosystem.config.cjs`
- **Scripts**: `/Users/benknight/act-global-infrastructure/deployment/scripts/`
- **Logs**: `/Users/benknight/act-global-infrastructure/deployment/logs/`
- **Docs**: `/Users/benknight/act-global-infrastructure/deployment/docs/`

## Key Benefits

1. **One command** starts all 6 sites
2. **Auto-restart** if a site crashes (max 10 times)
3. **Centralized logs** for debugging
4. **Browser automation** opens Chrome with all tabs
5. **Persistent** - survives terminal close
6. **Selective restart** - restart individual sites without affecting others

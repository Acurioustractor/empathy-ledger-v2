# Archive Directory 🗄️

This directory contains **completed session reports, historical documentation, and deprecated files** that are no longer actively used but preserved for reference.

---

## 📁 Structure

```
.archive/
├── 2026-01/                    # January 2026
│   ├── session-reports/        # Completion reports from work sessions
│   ├── deployment/             # Deployment guides and procedures
│   ├── testing/                # Testing documentation
│   ├── system-architecture/    # System architecture docs
│   └── troubleshooting/        # Problem-solving guides
└── README.md                   # This file
```

---

## 🔍 How to Search Archives

### Find by keyword
```bash
grep -r "email notification" .archive/
```

### Find by date
```bash
ls -lt .archive/2026-01/session-reports/
```

### Find by topic
```bash
find .archive/ -name "*deployment*"
```

---

## 📋 Index by Topic

### Session Reports (January 2026)
Completed implementation reports documenting features built during development sessions.

**Located in:** `.archive/2026-01/session-reports/`

### Deployment Documentation
Historical deployment guides, procedures, and troubleshooting.

**Located in:** `.archive/2026-01/deployment/`

### Testing Documentation
Manual testing plans, UAT guides, and test results.

**Located in:** `.archive/2026-01/testing/`

### System Architecture
High-level system architecture documents and design decisions.

**Located in:** `.archive/2026-01/system-architecture/`

### Troubleshooting
Solutions to specific problems encountered during development.

**Located in:** `.archive/2026-01/troubleshooting/`

---

## ✅ What Goes in Archives

**Archive these file types:**
- ✅ Completion reports (`*_COMPLETE.md`)
- ✅ Phase summaries (`PHASE_*`)
- ✅ Sprint reports (`SPRINT_*`)
- ✅ Historical status docs (`*_STATUS.md`)
- ✅ One-time migration docs
- ✅ Deprecated approaches

**Keep in root/docs these file types:**
- ❌ Active reference material (README, CLAUDE.md, etc.)
- ❌ Current documentation (docs/)
- ❌ Development workflows
- ❌ Architecture decisions (still relevant)

---

## 🗓️ Archive Schedule

**Monthly (First Monday):**
- Move last month's `*_COMPLETE.md` files
- Move outdated `*_STATUS.md` files
- Create new month folder if needed

**After Major Milestones:**
- Archive sprint/phase completion reports
- Archive deployment guides (keep latest in docs/)
- Archive troubleshooting (move solutions to docs/15-troubleshooting/)

---

## 🚀 Quick Links

**Most Recent Archives:**
- [January 2026 Session Reports](.archive/2026-01/session-reports/)
- [Deployment Documentation](.archive/2026-01/deployment/)

**Active Documentation:**
- [Main Docs](../docs/)
- [Getting Started](../GETTING_STARTED.md)
- [Claude Context](../CLAUDE.md)

---

**Last Updated:** January 11, 2026

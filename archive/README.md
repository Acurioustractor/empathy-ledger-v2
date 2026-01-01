# Archive Directory

This directory contains historical documentation, session summaries, and legacy content that is no longer part of the active codebase but preserved for reference.

## Organization

```
archive/
├── legacy-docs-2025/      # Documentation archived in 2025 reorganization
├── legacy-reports/        # Historical reports and analyses
├── sessions-2024/         # Development session summaries from 2024
└── sessions-2025/         # Development session summaries from 2025
```

## What's Archived Here

### legacy-docs-2025/ (150+ files)
Documentation that was superseded, redundant, or no longer reflects current architecture:
- Early design documents
- Obsolete implementation plans
- Superseded technical specifications
- Redundant guides consolidated elsewhere

**Why archived**: These docs were part of the iterative development process but are now outdated. They're preserved for historical context and to understand past decisions.

### legacy-reports/
System analysis reports and one-time audits:
- Database schema analyses
- Security audit reports
- Performance reviews
- Migration planning documents

**Why archived**: Point-in-time reports that served their purpose. Current state is documented in active docs.

### sessions-2024/ & sessions-2025/
Development session summaries and completion reports:
- Skills optimization work
- Feature implementation sessions
- Refactoring summaries
- Architecture decision records

**Why archived**: Historical record of development progress. Useful for understanding "why we made this decision" questions.

## When to Archive Content

Move documentation here when:
1. **Superseded**: New docs replace old ones
2. **Redundant**: Information duplicated elsewhere
3. **Obsolete**: No longer reflects current system
4. **Historical**: Point-in-time snapshot with no ongoing relevance
5. **Completed**: Session summaries and completion reports

## Accessing Archived Content

**Search archived docs**:
```bash
grep -r "search term" archive/
```

**List all archived files**:
```bash
find archive/ -name "*.md" | sort
```

**View specific archive**:
```bash
ls archive/legacy-docs-2025/ | head -20
```

## Active Documentation

For current, maintained documentation, see:
- [docs/INDEX.md](../docs/INDEX.md) - Master documentation directory
- [QUICK_START.md](../QUICK_START.md) - Getting started guide
- [docs/getting-started/](../docs/getting-started/) - Essential onboarding

---

**Last Updated**: 2025-12-26
**Total Archived Files**: 200+
**Archive Policy**: Keep for 2 years, then evaluate for permanent deletion

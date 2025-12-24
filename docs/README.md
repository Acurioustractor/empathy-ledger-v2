# Empathy Ledger Documentation

Welcome to the Empathy Ledger documentation. This guide will help you navigate the documentation structure.

## Documentation Structure

### Getting Started

| Document | Description |
|----------|-------------|
| [Current Status](CURRENT_STATUS.md) | ⭐ Current state, what's done, what's next |
| [Quick Start Cloud Workflow](QUICK_START_CLOUD_WORKFLOW.md) | ⭐ Daily development workflow (15 min setup) |
| [Environment Setup](ENVIRONMENT_SETUP.md) | Configuration and environment variables |
| [Setup Guide](getting-started/SETUP.md) | Local development setup |
| [First Contribution](getting-started/FIRST_CONTRIBUTION.md) | New contributor guide |

### Architecture

| Document | Description |
|----------|-------------|
| [Architecture Reference](ARCHITECTURE_REFERENCE.md) | High-level system architecture |
| [Codebase Deep Dive](CODEBASE_DEEP_DIVE.md) | Detailed codebase structure |
| [Database Alignment Audit](DATABASE_ALIGNMENT_AUDIT.md) | Database schema audit |
| [SaaS Distribution Foundation](SAAS_DISTRIBUTION_FOUNDATION.md) | Multi-tenant distribution model |
| [Platform Architecture](architecture/) | System design overview |
| [Multi-tenant Design](architecture/) | Tenant isolation patterns |
| [AI System](architecture/) | AI integration architecture |

### Guides

| Document | Description |
|----------|-------------|
| [Cloud-First Database Workflow](CLOUD_FIRST_DATABASE_WORKFLOW.md) | ⭐ Comprehensive database workflow |
| [Migration Research Summary](MIGRATION_RESEARCH_SUMMARY.md) | Research on migration methods |
| [Supabase Access Guide](SUPABASE_ACCESS_GUIDE.md) | Accessing Supabase via CLI/Dashboard |
| [SaaS Git Workflow](SAAS_GIT_WORKFLOW.md) | Git workflow and branching strategy |
| [SaaS Organization Integration](SAAS_ORG_INTEGRATION_GUIDE.md) | Organization integration guide |
| [Seed Interview Guide](guides/SEED_INTERVIEW_USER_GUIDE.md) | Creating seed interviews |
| [Transcript Upload](guides/TRANSCRIPT_UPLOAD_GUIDE.md) | Uploading transcripts |
| [Bulk Upload](guides/BULK_UPLOAD_GUIDE.md) | Bulk data operations |
| [Platform Development](guides/PLATFORM_DEVELOPMENT_GUIDE.md) | Development workflows |

### Cultural Safety & Features

| Document | Description |
|----------|-------------|
| [Phase 2 Integration Complete](PHASE_2_INTEGRATION_COMPLETE.md) | Permission tiers & trust badges implementation |
| [OCAP Principles](cultural/) | OCAP implementation |
| [Cultural Protocols](cultural/) | Cultural safety guidelines |
| [Elder Review](cultural/) | Elder review workflows |

### Design System

| Document | Description |
|----------|-------------|
| [Design System](DESIGN_SYSTEM.md) | Colours, typography, components |
| [Component Library](design/) | UI component documentation |
| [Accessibility](design/) | WCAG compliance guide |

### Project Documentation

Project-specific documentation for individual implementations:

- [GOODS Project](projects/goods/)
- [Oonchiumpa Project](projects/oonchiumpa/)
- [Deadly Hearts Project](projects/deadly-hearts/)

### Research & Proposals

- [Research Documents](research/)
- [PRF Fellowship 2026](rfp/prf-2026/)

### Archive

Historical session notes and completed implementation documentation:

- [Session Archive](archive/)

---

## Quick Links

- [Main README](../README.md) - Project overview
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute
- [Design System](DESIGN_SYSTEM.md) - Visual design reference
- [Reorganization Plan](CODEBASE_REORGANIZATION_PLAN.md) - Repository structure

---

## Updating Documentation

When adding new documentation:

1. Choose the appropriate folder based on document type
2. Use kebab-case for filenames (e.g., `my-new-guide.md`)
3. Add entry to this index file
4. Link from relevant existing documents
5. Use Australian English spelling

## Documentation Standards

- Use Markdown with GitHub-flavoured extensions
- Include code examples where applicable
- Add table of contents for long documents
- Keep documents focused and concise
- Update related documents when making changes

# Database Navigator Skill

**Name**: `database-navigator`
**Type**: Project Skill
**Purpose**: Navigate and understand the Empathy Ledger database schema, migrations, functions, and systems

## What This Skill Does

This skill helps you understand and navigate the complex database architecture by:

1. **Mapping all database objects** - Tables, functions, views, indexes, policies
2. **Analyzing migration history** - Understanding how the schema evolved
3. **Finding database functions** - Locating stored procedures and triggers
4. **Identifying relationships** - Understanding table connections and dependencies
5. **Reviewing policies** - Security and RLS configuration
6. **Documenting systems** - Creating clear documentation for database subsystems

## When to Use This Skill

Use this skill when you need to:

- "Show me all database tables"
- "What functions exist in the database?"
- "How does the storyteller system work in the database?"
- "What migrations affect the profiles table?"
- "Document the media system database structure"
- "Find all RLS policies for organizations"
- "What tables are related to transcripts?"
- "Show me the cultural sensitivity database architecture"

## How It Works

The skill will:

1. **Scan migration files** in `supabase/migrations/`
2. **Parse SQL DDL** to extract tables, functions, views, indexes, policies
3. **Build a dependency graph** showing relationships
4. **Generate documentation** with clear diagrams and explanations
5. **Create navigation guides** for specific subsystems

## Capabilities

### 1. Database Object Discovery

Find and list:
- All tables with columns and types
- All functions with parameters and return types
- All views and materialized views
- All indexes and performance optimizations
- All RLS policies and security rules

### 2. Migration Analysis

Understand:
- When each table was created
- How schemas evolved over time
- Which migrations are related
- Migration dependencies and order

### 3. Subsystem Documentation

Document major systems:
- **Storyteller System** - profiles, stories, transcripts
- **Media System** - media_assets, galleries, usage tracking
- **Organization System** - multi-tenant architecture
- **Cultural Sensitivity** - moderation, protocols, consent
- **Analytics System** - metrics, insights, dashboards
- **Project Management** - projects, contexts, analysis

### 4. Relationship Mapping

Visualize:
- Foreign key relationships
- Join patterns
- Data flow between tables
- Tenant isolation boundaries

## Example Usage

### "Show me all storyteller-related tables"

The skill will find and document:
- `profiles` (storyteller profiles)
- `stories` (storyteller content)
- `transcripts` (interview data)
- `storyteller_impact_metrics` (analytics)
- `storyteller_network_connections` (relationships)
- Related columns, indexes, and functions

### "Document the media system"

The skill will create a comprehensive guide:
- Tables: `media_assets`, `galleries`, `media_usage_tracking`
- Functions: Upload handlers, CDN integration
- Policies: Access control and permissions
- Relationships: How media connects to stories/storytellers
- Workflows: Upload → Process → Display → Track

### "What migrations modified the profiles table?"

The skill will trace:
- Initial creation migration
- All ALTER TABLE statements
- Added columns and features
- Index additions
- Policy updates

## Output Format

The skill generates:

1. **Markdown documentation** - Human-readable guides
2. **Mermaid diagrams** - Entity relationship diagrams
3. **SQL reference** - Quick lookup for tables/functions
4. **Migration timeline** - Chronological schema evolution
5. **API integration notes** - How database connects to application

## Advanced Features

### Search by Pattern

- "Find all tables with `tenant_id` column"
- "Show all functions that use JSONB"
- "List policies with storyteller in the name"

### Dependency Analysis

- "What would break if I drop the stories table?"
- "Which functions depend on the profiles table?"
- "Show the call graph for get_storyteller_analytics()"

### Performance Review

- "Which tables lack indexes?"
- "Show all sequential scans in migrations"
- "Find tables without primary keys"

## Integration with Other Skills

Works with:
- **`supabase`** skill - Database query patterns
- **`data-analysis`** skill - Understanding analytics tables
- **`codebase-explorer`** skill - Finding how code uses database

## Files Analyzed

- `supabase/migrations/*.sql` - All migration files
- `supabase/functions/**/*` - Edge functions
- `src/types/database*.ts` - TypeScript types
- `src/lib/supabase/**/*` - Database client code

## Maintained Documentation

The skill keeps these docs updated:

- `docs/DATABASE_SCHEMA.md` - Complete schema reference
- `docs/DATABASE_MIGRATIONS.md` - Migration guide
- `docs/DATABASE_FUNCTIONS.md` - Stored procedures reference
- `docs/DATABASE_SUBSYSTEMS.md` - Major system documentation

## Skill Prompt

When you invoke this skill, I will:

1. Ask what aspect of the database you want to explore
2. Scan relevant migration files and code
3. Parse and analyze database objects
4. Generate comprehensive documentation
5. Create visual diagrams where helpful
6. Provide navigation tips and best practices

Ready to explore your database architecture!

#!/bin/bash

# Supabase Schema Sync Script
# Keeps local migrations in sync with remote database

set -e

echo "🔄 Supabase Schema Sync"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install with:"
    echo "   brew install supabase/tap/supabase"
    exit 1
fi

# Check if linked to project
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found. Run 'supabase link' first"
    exit 1
fi

# Function to show menu
show_menu() {
    echo "Select an operation:"
    echo "1) Pull remote schema → local migration"
    echo "2) Push local migrations → remote"
    echo "3) Create new migration file"
    echo "4) Reset local database (dev only)"
    echo "5) Generate TypeScript types"
    echo "6) Audit RLS policies"
    echo "7) List all migrations"
    echo "8) Diff local vs remote"
    echo "9) Full sync (pull + types + commit)"
    echo "0) Exit"
    echo ""
    read -p "Choice: " choice
    echo ""
}

# Pull schema from remote
pull_schema() {
    echo "📥 Pulling schema from remote..."
    supabase db pull
    echo "✅ Schema pulled successfully"
    echo "   Check supabase/migrations/ for new file"
}

# Push migrations to remote
push_migrations() {
    echo "📤 Pushing migrations to remote..."
    read -p "Are you sure? This will modify remote database (y/N): " confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        supabase db push
        echo "✅ Migrations pushed successfully"
    else
        echo "❌ Cancelled"
    fi
}

# Create new migration
create_migration() {
    read -p "Migration name (snake_case): " migration_name
    if [ -z "$migration_name" ]; then
        echo "❌ Migration name required"
        return
    fi

    supabase migration new "$migration_name"
    echo "✅ Created migration: supabase/migrations/*_${migration_name}.sql"
    echo "   Edit this file to add your SQL"
}

# Reset local database
reset_local() {
    echo "⚠️  WARNING: This will wipe local database and reapply all migrations"
    read -p "Continue? (y/N): " confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        supabase db reset
        echo "✅ Local database reset complete"
    else
        echo "❌ Cancelled"
    fi
}

# Generate TypeScript types
generate_types() {
    echo "📝 Generating TypeScript types..."
    supabase gen types typescript --local > src/types/database.ts
    echo "✅ Types generated: src/types/database.ts"
}

# Audit RLS policies
audit_policies() {
    echo "🔍 Auditing RLS policies..."

    supabase db execute "
    SELECT
      schemaname,
      tablename,
      policyname,
      cmd as operation,
      roles,
      CASE
        WHEN LENGTH(qual::text) > 50 THEN LEFT(qual::text, 47) || '...'
        ELSE qual::text
      END as using_clause
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname;
    " | tee docs/rls_policies_current.txt

    echo ""
    echo "✅ Policy audit saved to: docs/rls_policies_current.txt"

    # Count policies
    policy_count=$(supabase db execute "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';" | grep -oE '[0-9]+' | head -1)
    echo "📊 Total RLS policies: $policy_count"
}

# List migrations
list_migrations() {
    echo "📋 Migration history:"
    supabase migration list
}

# Diff local vs remote
diff_schemas() {
    echo "🔍 Checking for differences..."
    supabase db diff
}

# Full sync workflow
full_sync() {
    echo "🔄 Running full sync workflow..."
    echo ""

    echo "1️⃣  Pulling schema..."
    pull_schema
    echo ""

    echo "2️⃣  Generating types..."
    generate_types
    echo ""

    echo "3️⃣  Git status:"
    git status --short supabase/migrations/ src/types/database.ts
    echo ""

    read -p "Commit changes? (y/N): " commit
    if [ "$commit" = "y" ] || [ "$commit" = "Y" ]; then
        read -p "Commit message: " message
        git add supabase/migrations/ src/types/database.ts
        git commit -m "${message:-chore: sync database schema}"
        echo "✅ Changes committed"
    fi
}

# Main loop
while true; do
    show_menu

    case $choice in
        1) pull_schema ;;
        2) push_migrations ;;
        3) create_migration ;;
        4) reset_local ;;
        5) generate_types ;;
        6) audit_policies ;;
        7) list_migrations ;;
        8) diff_schemas ;;
        9) full_sync ;;
        0) echo "👋 Goodbye!"; exit 0 ;;
        *) echo "❌ Invalid choice" ;;
    esac

    echo ""
    echo "Press Enter to continue..."
    read
    clear
done

#!/bin/bash
# Deploy Sprint 2 Migrations

# Get password from .env.local
SUPABASE_DB_PASSWORD=$(grep "^SUPABASE_DB_PASSWORD=" .env.local | cut -d'=' -f2)

# Execute migrations
psql "postgresql://postgres.yvnuayzslukamizrlhwb:${SUPABASE_DB_PASSWORD}@aws-0-us-west-1.pooler.supabase.com:6543/postgres" -f deploy_sprint2_migrations.sql

# Deployment Scripts

This directory contains scripts for deploying various aspects of the platform infrastructure.

## Files

- **deploy-complete-schema.js** - Complete database schema deployment
- **deploy-gallery-schema.js** - Gallery schema deployment
- **deploy-rls-direct.js** - Row Level Security direct deployment
- **deploy-rls-urgent.js** - Urgent RLS deployment script
- **deploy-rls-psql.sh** - Shell script for RLS deployment via psql

## Usage

These scripts should be run with appropriate environment variables set for database access.

**Warning**: These scripts modify database structure. Always backup before running in production.
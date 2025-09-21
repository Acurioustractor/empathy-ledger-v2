#!/bin/bash

# 🚀 EMPATHY LEDGER - RELIABLE DEV SERVER STARTUP
# Ensures clean port 3030 access every time

echo "🧹 Cleaning up any existing Next.js processes..."

# Kill any existing Next.js processes
pkill -f "next dev" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true

# Force kill anything on port 3030
lsof -ti:3030 | xargs kill -9 2>/dev/null || true

# Wait a moment for processes to fully terminate
sleep 2

echo "🔍 Verifying port 3030 is free..."
if lsof -Pi :3030 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ Port 3030 is still occupied. Force clearing..."
    lsof -ti:3030 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Clear Next.js cache to prevent any build issues
echo "🗑️  Clearing Next.js cache..."
rm -rf .next

echo "🚀 Starting dev server on locked port 3030..."
echo "📍 Your app will be available at: http://localhost:3030"
echo "🔧 Admin panel: http://localhost:3030/admin"
echo ""

# Start the dev server with fixed port
npm run dev
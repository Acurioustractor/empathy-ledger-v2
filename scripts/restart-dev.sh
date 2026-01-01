#!/bin/bash

# Kill any process using port 3030
echo "🔍 Checking for processes on port 3030..."
lsof -ti:3030 | xargs kill -9 2>/dev/null

if [ $? -eq 0 ]; then
  echo "✅ Killed existing process on port 3030"
else
  echo "ℹ️  No process found on port 3030"
fi

# Wait a moment for port to be released
sleep 1

# Start dev server
echo "🚀 Starting dev server on port 3030..."
npm run dev

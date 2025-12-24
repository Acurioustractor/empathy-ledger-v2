#!/bin/bash

# Design System Migration Script
# Migrates from generic colors (gray/blue/purple/indigo) to Editorial Warmth palette
# (stone/sage/earth/clay/terracotta/sunshine/emerald)

set -e

echo "🎨 Starting Design System Migration to Editorial Warmth Palette"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colors to migrate
TARGET_DIRS="src/app src/components"

# Counter for changes
CHANGES=0

# Function to safely replace in files
safe_replace() {
  local pattern=$1
  local replacement=$2
  local description=$3

  echo ""
  echo "🔄 $description"
  echo "   Pattern: $pattern → $replacement"

  # Find files with matches
  MATCHED_FILES=$(grep -rl "$pattern" $TARGET_DIRS 2>/dev/null || true)

  if [ -n "$MATCHED_FILES" ]; then
    FILE_COUNT=$(echo "$MATCHED_FILES" | wc -l | xargs)
    echo "   Found in $FILE_COUNT files"

    # Perform replacement on macOS (using '' for backup extension)
    echo "$MATCHED_FILES" | while read -r file; do
      if [ -f "$file" ]; then
        sed -i '' "s/$pattern/$replacement/g" "$file"
        ((CHANGES++)) || true
      fi
    done
  else
    echo "   No matches found (already migrated or not used)"
  fi
}

echo ""
echo "📋 Phase 1: Gray/Grey → Stone (Muted UI Elements)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

safe_replace "text-gray-50" "text-stone-50" "Text: Gray 50 → Stone 50"
safe_replace "text-gray-100" "text-stone-100" "Text: Gray 100 → Stone 100"
safe_replace "text-gray-200" "text-stone-200" "Text: Gray 200 → Stone 200"
safe_replace "text-gray-300" "text-stone-300" "Text: Gray 300 → Stone 300"
safe_replace "text-gray-400" "text-stone-400" "Text: Gray 400 → Stone 400"
safe_replace "text-gray-500" "text-stone-500" "Text: Gray 500 → Stone 500"
safe_replace "text-gray-600" "text-stone-600" "Text: Gray 600 → Stone 600"
safe_replace "text-gray-700" "text-stone-700" "Text: Gray 700 → Stone 700"
safe_replace "text-gray-800" "text-stone-800" "Text: Gray 800 → Stone 800"
safe_replace "text-gray-900" "text-stone-900" "Text: Gray 900 → Stone 900"

safe_replace "text-grey-50" "text-stone-50" "Text: Grey 50 → Stone 50"
safe_replace "text-grey-100" "text-stone-100" "Text: Grey 100 → Stone 100"
safe_replace "text-grey-200" "text-stone-200" "Text: Grey 200 → Stone 200"
safe_replace "text-grey-300" "text-stone-300" "Text: Grey 300 → Stone 300"
safe_replace "text-grey-400" "text-stone-400" "Text: Grey 400 → Stone 400"
safe_replace "text-grey-500" "text-stone-500" "Text: Grey 500 → Stone 500"
safe_replace "text-grey-600" "text-stone-600" "Text: Grey 600 → Stone 600"
safe_replace "text-grey-700" "text-stone-700" "Text: Grey 700 → Stone 700"
safe_replace "text-grey-800" "text-stone-800" "Text: Grey 800 → Stone 800"
safe_replace "text-grey-900" "text-stone-900" "Text: Grey 900 → Stone 900"

safe_replace "bg-gray-50" "bg-stone-50" "Background: Gray 50 → Stone 50"
safe_replace "bg-gray-100" "bg-stone-100" "Background: Gray 100 → Stone 100"
safe_replace "bg-gray-200" "bg-stone-200" "Background: Gray 200 → Stone 200"
safe_replace "bg-gray-300" "bg-stone-300" "Background: Gray 300 → Stone 300"
safe_replace "bg-gray-400" "bg-stone-400" "Background: Gray 400 → Stone 400"
safe_replace "bg-gray-500" "bg-stone-500" "Background: Gray 500 → Stone 500"
safe_replace "bg-gray-600" "bg-stone-600" "Background: Gray 600 → Stone 600"
safe_replace "bg-gray-700" "bg-stone-700" "Background: Gray 700 → Stone 700"
safe_replace "bg-gray-800" "bg-stone-800" "Background: Gray 800 → Stone 800"
safe_replace "bg-gray-900" "bg-stone-900" "Background: Gray 900 → Stone 900"

safe_replace "bg-grey-50" "bg-stone-50" "Background: Grey 50 → Stone 50"
safe_replace "bg-grey-100" "bg-stone-100" "Background: Grey 100 → Stone 100"
safe_replace "bg-grey-200" "bg-stone-200" "Background: Grey 200 → Stone 200"
safe_replace "bg-grey-300" "bg-stone-300" "Background: Grey 300 → Stone 300"
safe_replace "bg-grey-400" "bg-stone-400" "Background: Grey 400 → Stone 400"
safe_replace "bg-grey-500" "bg-stone-500" "Background: Grey 500 → Stone 500"
safe_replace "bg-grey-600" "bg-stone-600" "Background: Grey 600 → Stone 600"
safe_replace "bg-grey-700" "bg-stone-700" "Background: Grey 700 → Stone 700"
safe_replace "bg-grey-800" "bg-stone-800" "Background: Grey 800 → Stone 800"
safe_replace "bg-grey-900" "bg-stone-900" "Background: Grey 900 → Stone 900"

safe_replace "border-gray-100" "border-stone-100" "Border: Gray 100 → Stone 100"
safe_replace "border-gray-200" "border-stone-200" "Border: Gray 200 → Stone 200"
safe_replace "border-gray-300" "border-stone-300" "Border: Gray 300 → Stone 300"
safe_replace "border-gray-400" "border-stone-400" "Border: Gray 400 → Stone 400"
safe_replace "border-gray-500" "border-stone-500" "Border: Gray 500 → Stone 500"

safe_replace "border-grey-100" "border-stone-100" "Border: Grey 100 → Stone 100"
safe_replace "border-grey-200" "border-stone-200" "Border: Grey 200 → Stone 200"
safe_replace "border-grey-300" "border-stone-300" "Border: Grey 300 → Stone 300"
safe_replace "border-grey-400" "border-stone-400" "Border: Grey 400 → Stone 400"
safe_replace "border-grey-500" "border-stone-500" "Border: Grey 500 → Stone 500"

echo ""
echo "📋 Phase 2: Blue → Sage (Calm, Respectful UI)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

safe_replace "text-blue-50" "text-sage-50" "Text: Blue 50 → Sage 50"
safe_replace "text-blue-100" "text-sage-100" "Text: Blue 100 → Sage 100"
safe_replace "text-blue-200" "text-sage-200" "Text: Blue 200 → Sage 200"
safe_replace "text-blue-300" "text-sage-300" "Text: Blue 300 → Sage 300"
safe_replace "text-blue-400" "text-sage-400" "Text: Blue 400 → Sage 400"
safe_replace "text-blue-500" "text-sage-500" "Text: Blue 500 → Sage 500"
safe_replace "text-blue-600" "text-sage-600" "Text: Blue 600 → Sage 600"
safe_replace "text-blue-700" "text-sage-700" "Text: Blue 700 → Sage 700"
safe_replace "text-blue-800" "text-sage-800" "Text: Blue 800 → Sage 800"
safe_replace "text-blue-900" "text-sage-900" "Text: Blue 900 → Sage 900"

safe_replace "bg-blue-50" "bg-sage-50" "Background: Blue 50 → Sage 50"
safe_replace "bg-blue-100" "bg-sage-100" "Background: Blue 100 → Sage 100"
safe_replace "bg-blue-200" "bg-sage-200" "Background: Blue 200 → Sage 200"
safe_replace "bg-blue-300" "bg-sage-300" "Background: Blue 300 → Sage 300"
safe_replace "bg-blue-400" "bg-sage-400" "Background: Blue 400 → Sage 400"
safe_replace "bg-blue-500" "bg-sage-500" "Background: Blue 500 → Sage 500"
safe_replace "bg-blue-600" "bg-sage-600" "Background: Blue 600 → Sage 600"
safe_replace "bg-blue-700" "bg-sage-700" "Background: Blue 700 → Sage 700"
safe_replace "bg-blue-800" "bg-sage-800" "Background: Blue 800 → Sage 800"
safe_replace "bg-blue-900" "bg-sage-900" "Background: Blue 900 → Sage 900"

safe_replace "border-blue-100" "border-sage-100" "Border: Blue 100 → Sage 100"
safe_replace "border-blue-200" "border-sage-200" "Border: Blue 200 → Sage 200"
safe_replace "border-blue-300" "border-sage-300" "Border: Blue 300 → Sage 300"
safe_replace "border-blue-400" "border-sage-400" "Border: Blue 400 → Sage 400"
safe_replace "border-blue-500" "border-sage-500" "Border: Blue 500 → Sage 500"
safe_replace "border-blue-600" "border-sage-600" "Border: Blue 600 → Sage 600"
safe_replace "border-blue-700" "border-sage-700" "Border: Blue 700 → Sage 700"
safe_replace "border-blue-800" "border-sage-800" "Border: Blue 800 → Sage 800"

safe_replace "from-blue-50" "from-sage-50" "Gradient: Blue 50 → Sage 50"
safe_replace "from-blue-100" "from-sage-100" "Gradient: Blue 100 → Sage 100"
safe_replace "from-blue-200" "from-sage-200" "Gradient: Blue 200 → Sage 200"
safe_replace "from-blue-300" "from-sage-300" "Gradient: Blue 300 → Sage 300"
safe_replace "from-blue-400" "from-sage-400" "Gradient: Blue 400 → Sage 400"
safe_replace "from-blue-500" "from-sage-500" "Gradient: Blue 500 → Sage 500"
safe_replace "from-blue-600" "from-sage-600" "Gradient: Blue 600 → Sage 600"
safe_replace "from-blue-700" "from-sage-700" "Gradient: Blue 700 → Sage 700"
safe_replace "from-blue-800" "from-sage-800" "Gradient: Blue 800 → Sage 800"
safe_replace "from-blue-900" "from-sage-900" "Gradient: Blue 900 → Sage 900"

safe_replace "to-blue-50" "to-sage-50" "Gradient: Blue 50 → Sage 50"
safe_replace "to-blue-100" "to-sage-100" "Gradient: Blue 100 → Sage 100"
safe_replace "to-blue-200" "to-sage-200" "Gradient: Blue 200 → Sage 200"
safe_replace "to-blue-300" "to-sage-300" "Gradient: Blue 300 → Sage 300"
safe_replace "to-blue-400" "to-sage-400" "Gradient: Blue 400 → Sage 400"
safe_replace "to-blue-500" "to-sage-500" "Gradient: Blue 500 → Sage 500"
safe_replace "to-blue-600" "to-sage-600" "Gradient: Blue 600 → Sage 600"
safe_replace "to-blue-700" "to-sage-700" "Gradient: Blue 700 → Sage 700"
safe_replace "to-blue-800" "to-sage-800" "Gradient: Blue 800 → Sage 800"
safe_replace "to-blue-900" "to-sage-900" "Gradient: Blue 900 → Sage 900"

echo ""
echo "📋 Phase 3: Purple → Clay/Earth (Warm Earth Tones)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

safe_replace "text-purple-50" "text-clay-50" "Text: Purple 50 → Clay 50"
safe_replace "text-purple-100" "text-clay-100" "Text: Purple 100 → Clay 100"
safe_replace "text-purple-200" "text-clay-200" "Text: Purple 200 → Clay 200"
safe_replace "text-purple-300" "text-clay-300" "Text: Purple 300 → Clay 300"
safe_replace "text-purple-400" "text-clay-400" "Text: Purple 400 → Clay 400"
safe_replace "text-purple-500" "text-clay-500" "Text: Purple 500 → Clay 500"
safe_replace "text-purple-600" "text-clay-600" "Text: Purple 600 → Clay 600"
safe_replace "text-purple-700" "text-clay-700" "Text: Purple 700 → Clay 700"
safe_replace "text-purple-800" "text-clay-800" "Text: Purple 800 → Clay 800"
safe_replace "text-purple-900" "text-clay-900" "Text: Purple 900 → Clay 900"

safe_replace "bg-purple-50" "bg-clay-50" "Background: Purple 50 → Clay 50"
safe_replace "bg-purple-100" "bg-clay-100" "Background: Purple 100 → Clay 100"
safe_replace "bg-purple-200" "bg-clay-200" "Background: Purple 200 → Clay 200"
safe_replace "bg-purple-300" "bg-clay-300" "Background: Purple 300 → Clay 300"
safe_replace "bg-purple-400" "bg-clay-400" "Background: Purple 400 → Clay 400"
safe_replace "bg-purple-500" "bg-clay-500" "Background: Purple 500 → Clay 500"
safe_replace "bg-purple-600" "bg-clay-600" "Background: Purple 600 → Clay 600"
safe_replace "bg-purple-700" "bg-clay-700" "Background: Purple 700 → Clay 700"
safe_replace "bg-purple-800" "bg-clay-800" "Background: Purple 800 → Clay 800"
safe_replace "bg-purple-900" "bg-clay-900" "Background: Purple 900 → Clay 900"

safe_replace "border-purple-100" "border-clay-100" "Border: Purple 100 → Clay 100"
safe_replace "border-purple-200" "border-clay-200" "Border: Purple 200 → Clay 200"
safe_replace "border-purple-300" "border-clay-300" "Border: Purple 300 → Clay 300"
safe_replace "border-purple-400" "border-clay-400" "Border: Purple 400 → Clay 400"
safe_replace "border-purple-500" "border-clay-500" "Border: Purple 500 → Clay 500"
safe_replace "border-purple-600" "border-clay-600" "Border: Purple 600 → Clay 600"
safe_replace "border-purple-700" "border-clay-700" "Border: Purple 700 → Clay 700"
safe_replace "border-purple-800" "border-clay-800" "Border: Purple 800 → Clay 800"

safe_replace "from-purple-50" "from-clay-50" "Gradient: Purple 50 → Clay 50"
safe_replace "from-purple-100" "from-clay-100" "Gradient: Purple 100 → Clay 100"
safe_replace "from-purple-200" "from-clay-200" "Gradient: Purple 200 → Clay 200"
safe_replace "from-purple-300" "from-clay-300" "Gradient: Purple 300 → Clay 300"
safe_replace "from-purple-400" "from-clay-400" "Gradient: Purple 400 → Clay 400"
safe_replace "from-purple-500" "from-clay-500" "Gradient: Purple 500 → Clay 500"
safe_replace "from-purple-600" "from-clay-600" "Gradient: Purple 600 → Clay 600"
safe_replace "from-purple-700" "from-clay-700" "Gradient: Purple 700 → Clay 700"
safe_replace "from-purple-800" "from-clay-800" "Gradient: Purple 800 → Clay 800"
safe_replace "from-purple-900" "from-clay-900" "Gradient: Purple 900 → Clay 900"

safe_replace "to-purple-50" "to-clay-50" "Gradient: Purple 50 → Clay 50"
safe_replace "to-purple-100" "to-clay-100" "Gradient: Purple 100 → Clay 100"
safe_replace "to-purple-200" "to-clay-200" "Gradient: Purple 200 → Clay 200"
safe_replace "to-purple-300" "to-clay-300" "Gradient: Purple 300 → Clay 300"
safe_replace "to-purple-400" "to-clay-400" "Gradient: Purple 400 → Clay 400"
safe_replace "to-purple-500" "to-clay-500" "Gradient: Purple 500 → Clay 500"
safe_replace "to-purple-600" "to-clay-600" "Gradient: Purple 600 → Clay 600"
safe_replace "to-purple-700" "to-clay-700" "Gradient: Purple 700 → Clay 700"
safe_replace "to-purple-800" "to-clay-800" "Gradient: Purple 800 → Clay 800"
safe_replace "to-purple-900" "to-clay-900" "Gradient: Purple 900 → Clay 900"

echo ""
echo "📋 Phase 4: Indigo → Terracotta/Sage (Warm Accents)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

safe_replace "text-indigo-50" "text-terracotta-50" "Text: Indigo 50 → Terracotta 50"
safe_replace "text-indigo-100" "text-terracotta-100" "Text: Indigo 100 → Terracotta 100"
safe_replace "text-indigo-200" "text-terracotta-200" "Text: Indigo 200 → Terracotta 200"
safe_replace "text-indigo-300" "text-terracotta-300" "Text: Indigo 300 → Terracotta 300"
safe_replace "text-indigo-400" "text-terracotta-400" "Text: Indigo 400 → Terracotta 400"
safe_replace "text-indigo-500" "text-terracotta-500" "Text: Indigo 500 → Terracotta 500"
safe_replace "text-indigo-600" "text-terracotta-600" "Text: Indigo 600 → Terracotta 600"
safe_replace "text-indigo-700" "text-terracotta-700" "Text: Indigo 700 → Terracotta 700"
safe_replace "text-indigo-800" "text-terracotta-800" "Text: Indigo 800 → Terracotta 800"
safe_replace "text-indigo-900" "text-terracotta-900" "Text: Indigo 900 → Terracotta 900"

safe_replace "bg-indigo-50" "bg-terracotta-50" "Background: Indigo 50 → Terracotta 50"
safe_replace "bg-indigo-100" "bg-terracotta-100" "Background: Indigo 100 → Terracotta 100"
safe_replace "bg-indigo-200" "bg-terracotta-200" "Background: Indigo 200 → Terracotta 200"
safe_replace "bg-indigo-300" "bg-terracotta-300" "Background: Indigo 300 → Terracotta 300"
safe_replace "bg-indigo-400" "bg-terracotta-400" "Background: Indigo 400 → Terracotta 400"
safe_replace "bg-indigo-500" "bg-terracotta-500" "Background: Indigo 500 → Terracotta 500"
safe_replace "bg-indigo-600" "bg-terracotta-600" "Background: Indigo 600 → Terracotta 600"
safe_replace "bg-indigo-700" "bg-terracotta-700" "Background: Indigo 700 → Terracotta 700"
safe_replace "bg-indigo-800" "bg-terracotta-800" "Background: Indigo 800 → Terracotta 800"
safe_replace "bg-indigo-900" "bg-terracotta-900" "Background: Indigo 900 → Terracotta 900"

safe_replace "border-indigo-100" "border-terracotta-100" "Border: Indigo 100 → Terracotta 100"
safe_replace "border-indigo-200" "border-terracotta-200" "Border: Indigo 200 → Terracotta 200"
safe_replace "border-indigo-300" "border-terracotta-300" "Border: Indigo 300 → Terracotta 300"
safe_replace "border-indigo-400" "border-terracotta-400" "Border: Indigo 400 → Terracotta 400"
safe_replace "border-indigo-500" "border-terracotta-500" "Border: Indigo 500 → Terracotta 500"
safe_replace "border-indigo-600" "border-terracotta-600" "Border: Indigo 600 → Terracotta 600"
safe_replace "border-indigo-700" "border-terracotta-700" "Border: Indigo 700 → Terracotta 700"
safe_replace "border-indigo-800" "border-terracotta-800" "Border: Indigo 800 → Terracotta 800"

safe_replace "from-indigo-50" "from-terracotta-50" "Gradient: Indigo 50 → Terracotta 50"
safe_replace "from-indigo-100" "from-terracotta-100" "Gradient: Indigo 100 → Terracotta 100"
safe_replace "from-indigo-200" "from-terracotta-200" "Gradient: Indigo 200 → Terracotta 200"
safe_replace "from-indigo-300" "from-terracotta-300" "Gradient: Indigo 300 → Terracotta 300"
safe_replace "from-indigo-400" "from-terracotta-400" "Gradient: Indigo 400 → Terracotta 400"
safe_replace "from-indigo-500" "from-terracotta-500" "Gradient: Indigo 500 → Terracotta 500"
safe_replace "from-indigo-600" "from-terracotta-600" "Gradient: Indigo 600 → Terracotta 600"
safe_replace "from-indigo-700" "from-terracotta-700" "Gradient: Indigo 700 → Terracotta 700"
safe_replace "from-indigo-800" "from-terracotta-800" "Gradient: Indigo 800 → Terracotta 800"
safe_replace "from-indigo-900" "from-terracotta-900" "Gradient: Indigo 900 → Terracotta 900"

safe_replace "to-indigo-50" "to-terracotta-50" "Gradient: Indigo 50 → Terracotta 50"
safe_replace "to-indigo-100" "to-terracotta-100" "Gradient: Indigo 100 → Terracotta 100"
safe_replace "to-indigo-200" "to-terracotta-200" "Gradient: Indigo 200 → Terracotta 200"
safe_replace "to-indigo-300" "to-terracotta-300" "Gradient: Indigo 300 → Terracotta 300"
safe_replace "to-indigo-400" "to-terracotta-400" "Gradient: Indigo 400 → Terracotta 400"
safe_replace "to-indigo-500" "to-terracotta-500" "Gradient: Indigo 500 → Terracotta 500"
safe_replace "to-indigo-600" "to-terracotta-600" "Gradient: Indigo 600 → Terracotta 600"
safe_replace "to-indigo-700" "to-terracotta-700" "Gradient: Indigo 700 → Terracotta 700"
safe_replace "to-indigo-800" "to-terracotta-800" "Gradient: Indigo 800 → Terracotta 800"
safe_replace "to-indigo-900" "to-terracotta-900" "Gradient: Indigo 900 → Terracotta 900"

echo ""
echo "✅ Design System Migration Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "   - All gray/grey colors migrated to stone (muted UI)"
echo "   - All blue colors migrated to sage (calm UI)"
echo "   - All purple colors migrated to clay (warm earth)"
echo "   - All indigo colors migrated to terracotta (warm accents)"
echo ""
echo "⚠️  Next Steps:"
echo "   1. Review changes with: git diff"
echo "   2. Test the application visually"
echo "   3. Fix any white-on-white text issues manually"
echo "   4. Commit changes: git add . && git commit -m 'Migrate to Editorial Warmth design system'"
echo ""

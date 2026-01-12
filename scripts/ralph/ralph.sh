#!/bin/bash
#
# Ralph Wiggum - Long-running AI Agent Runner
# https://x.com/mattpocockuk - Credit to Matt Pocock
#
# Run autonomous coding agents that ship code while you sleep.
# Uses a PRD-based approach with user stories to scope work.
#
# Usage:
#   ./scripts/ralph/ralph.sh [PRD_FILE] [MAX_ITERATIONS]
#
# Examples:
#   ./scripts/ralph/ralph.sh                          # Uses default prd.json, 10 iterations
#   ./scripts/ralph/ralph.sh scripts/ralph/prd.json   # Custom PRD file
#   ./scripts/ralph/ralph.sh scripts/ralph/prd.json 5 # Custom PRD, 5 iterations
#

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PRD_FILE="${1:-$SCRIPT_DIR/prd.json}"
MAX_ITERATIONS="${2:-10}"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"
COMPLETE_MARKER="<promise>COMPLETE</promise>"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[Ralph]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[Ralph]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[Ralph]${NC} $1"
}

log_error() {
    echo -e "${RED}[Ralph]${NC} $1"
}

# Validate PRD file exists
if [ ! -f "$PRD_FILE" ]; then
    log_error "PRD file not found: $PRD_FILE"
    log_info "Create one with: cp $SCRIPT_DIR/prd.template.json $PRD_FILE"
    exit 1
fi

# Initialize progress file if it doesn't exist
if [ ! -f "$PROGRESS_FILE" ]; then
    echo "# Ralph Progress Log" > "$PROGRESS_FILE"
    echo "# Started: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "$PROGRESS_FILE"
    echo "" >> "$PROGRESS_FILE"
fi

cd "$PROJECT_ROOT"

log_info "Starting Ralph Wiggum Agent Runner"
log_info "PRD File: $PRD_FILE"
log_info "Max Iterations: $MAX_ITERATIONS"
log_info "Progress File: $PROGRESS_FILE"
echo ""

# Build the prompt
build_prompt() {
    local prd_content
    prd_content=$(cat "$PRD_FILE")

    local progress_content=""
    if [ -f "$PROGRESS_FILE" ]; then
        progress_content=$(cat "$PROGRESS_FILE")
    fi

    cat <<EOF
You are an autonomous coding agent working on the Empathy Ledger project.

## Your Task
1. Read the PRD below and find the HIGHEST PRIORITY user story where "passes": false
2. Implement ONLY that single user story - do not attempt multiple stories
3. After implementing, run type checks and tests to ensure CI stays green
4. Commit your work with a clear commit message
5. Update the PRD file to set "passes": true for the completed story
6. Append your progress to the progress file (use append, don't overwrite previous entries)

## Critical Rules
- ONLY work on ONE user story per run
- Each commit MUST pass: npm run build && npm run lint
- If tests fail, fix them before committing
- Keep changes focused and minimal
- Do not refactor unrelated code

## Stop Condition
When ALL user stories in the PRD have "passes": true, respond with:
$COMPLETE_MARKER

## PRD (Product Requirements Document)
\`\`\`json
$prd_content
\`\`\`

## Previous Progress
\`\`\`
$progress_content
\`\`\`

## Progress File Location
Append your progress to: $PROGRESS_FILE

Format each entry as:
---
## Iteration N - [Date/Time]
**Story:** [Story ID and title]
**Status:** [Completed/Failed/Partial]
**Changes:**
- [List of changes made]
**Commits:** [Commit hashes]
**Notes:** [Any relevant notes]
---

Begin working on the highest priority incomplete user story now.
EOF
}

# Main loop
for ((i=1; i<=MAX_ITERATIONS; i++)); do
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "Iteration $i of $MAX_ITERATIONS"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Build the prompt
    PROMPT=$(build_prompt)

    # Create a temp file for the prompt
    PROMPT_FILE=$(mktemp)
    echo "$PROMPT" > "$PROMPT_FILE"

    # Run Claude Code with the prompt
    # Using --print to capture output for checking completion
    OUTPUT_FILE=$(mktemp)

    log_info "Starting Claude Code agent..."

    # Run claude with the prompt
    # Note: Adjust this command based on your Claude Code setup
    if command -v claude &> /dev/null; then
        claude --print "$(cat "$PROMPT_FILE")" 2>&1 | tee "$OUTPUT_FILE"
    else
        log_error "Claude Code CLI not found. Please install it first."
        rm -f "$PROMPT_FILE" "$OUTPUT_FILE"
        exit 1
    fi

    # Check for completion marker
    if grep -q "$COMPLETE_MARKER" "$OUTPUT_FILE"; then
        log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log_success "ALL USER STORIES COMPLETE!"
        log_success "Ralph finished after $i iterations"
        log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        # Append completion to progress
        echo "" >> "$PROGRESS_FILE"
        echo "---" >> "$PROGRESS_FILE"
        echo "## RALPH COMPLETE - $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "$PROGRESS_FILE"
        echo "All user stories completed after $i iterations." >> "$PROGRESS_FILE"
        echo "---" >> "$PROGRESS_FILE"

        rm -f "$PROMPT_FILE" "$OUTPUT_FILE"
        exit 0
    fi

    # Clean up temp files
    rm -f "$PROMPT_FILE" "$OUTPUT_FILE"

    log_info "Iteration $i complete. Continuing..."
    echo ""

    # Small delay between iterations
    sleep 2
done

log_warning "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_warning "Max iterations ($MAX_ITERATIONS) reached"
log_warning "PRD may not be fully complete. Check progress.txt"
log_warning "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit 1

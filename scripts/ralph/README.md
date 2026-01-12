# Ralph Wiggum - Autonomous Agent Runner

Long-running AI coding agent that ships code while you sleep.

Credit: [Matt Pocock](https://x.com/mattpocockuk/status/1875828562652602730)

## Quick Start

```bash
# Run with default PRD (prd.json)
./scripts/ralph/ralph.sh

# Run with custom PRD
./scripts/ralph/ralph.sh scripts/ralph/my-feature.json

# Run with custom iterations (default: 10)
./scripts/ralph/ralph.sh scripts/ralph/prd.json 5
```

## How It Works

1. **Bash Loop**: Runs Claude Code agent up to N iterations
2. **PRD-Based**: Agent picks highest priority story where `passes: false`
3. **Scoped Work**: One user story per iteration prevents context rot
4. **CI Green**: Every commit must pass build + lint
5. **Progress Tracking**: Appends to progress.txt for continuity

## Files

| File | Purpose |
|------|---------|
| `ralph.sh` | Main runner script |
| `prd.json` | Current PRD with user stories |
| `prd.template.json` | Template for creating new PRDs |
| `progress.txt` | Progress log across iterations |

## Creating a PRD

1. Copy the template:
   ```bash
   cp scripts/ralph/prd.template.json scripts/ralph/my-feature.json
   ```

2. Define user stories with:
   - Clear acceptance criteria
   - Files to modify
   - Required tests
   - Priority order

3. Run Ralph:
   ```bash
   ./scripts/ralph/ralph.sh scripts/ralph/my-feature.json
   ```

## Stop Condition

Ralph stops when:
- All stories have `"passes": true`
- Agent emits `<promise>COMPLETE</promise>`
- Max iterations reached

## Best Practices

### Writing Good User Stories

```json
{
  "id": "FEAT-001",
  "title": "Short, specific title",
  "description": "As a [user], I want [action] so that [benefit]",
  "priority": 1,
  "passes": false,
  "acceptance_criteria": [
    "Specific, testable criterion",
    "Another measurable outcome"
  ],
  "files_to_modify": [
    "src/path/to/file.tsx"
  ],
  "tests_required": [
    "npm run build passes"
  ]
}
```

### Keep Stories Small

- Each story should be completable in 1 agent iteration
- If a story is too big, split it into multiple stories
- 3-5 acceptance criteria per story is ideal

### Maintain CI Health

The agent is prompted to run:
```bash
npm run build && npm run lint
```

If these fail, the agent should fix before committing.

## Monitoring

Watch progress in real-time:
```bash
tail -f scripts/ralph/progress.txt
```

Check PRD status:
```bash
cat scripts/ralph/prd.json | jq '.stories[] | {id, title, passes}'
```

## Troubleshooting

### Agent picks wrong story
- Check priority order in PRD
- Ensure completed stories have `"passes": true`

### Context rot / agent confused
- Stories may be too large - split them
- Check progress.txt for patterns
- Reduce acceptance criteria

### CI keeps failing
- Run build locally to debug
- Check for type errors
- May need to add more specific guidance in story notes

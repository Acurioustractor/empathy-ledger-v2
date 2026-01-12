# ⚡ Quick Start: Claude V2 Test

## Option 1: Frontend (Easiest - 2 Clicks!)

```
1. Open: http://localhost:3030/projects/6bd47c8a-e676-456f-aa25-ddcbb5a31047
2. Click: "AI Analysis" button
3. Watch: Server logs for Claude V2 quality filtering
```

See: [FRONTEND_CLAUDE_V2_TEST.md](FRONTEND_CLAUDE_V2_TEST.md)

## Option 2: Command Line (2 Commands)

```bash
# 1. Start dev server (already running at http://localhost:3030)
npm run dev

# 2. Run test
./scripts/test-goods-claude-v2.sh
```

## Watch Server Logs For:

✅ `🔬 Using Claude V2 with project-aligned quality filtering`
✅ `⚠️  Rejected X low-quality quotes:`
✅ `✅ Extracted X high-quality quotes`
✅ `📊 Quality: XX/100`

## Success = No Fabrication + High Quality

- No "Quote not found in transcript" errors
- Quality scores 60+
- Average quality 70+
- Quotes align to GOODS project (beds, sleep, hygiene)

## That's It!

See [RUN_CLAUDE_V2_TEST.md](RUN_CLAUDE_V2_TEST.md) for detailed instructions.

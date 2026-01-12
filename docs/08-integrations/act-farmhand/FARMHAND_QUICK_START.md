# Farmhand Integration - Quick Start Guide

**5-Minute Deploy** | **TypeScript Client Ready** | **10 Agents + 12 Endpoints**

---

## ⚡ Deploy in 3 Commands

```bash
cd /Users/benknight/act-global-infrastructure/act-personal-ai
flyctl launch --name farmhand-api --region syd
flyctl secrets set ANTHROPIC_API_KEY=sk-... FARMHAND_API_KEY=$(openssl rand -hex 32)
flyctl deploy
```

## ✅ Verify

```bash
curl https://farmhand-api.fly.dev/health
```

## 🔗 Connect Empathy Ledger

```bash
cd /Users/benknight/Code/empathy-ledger-v2
cat >> .env.local << EOF
FARMHAND_API_URL=https://farmhand-api.fly.dev
FARMHAND_API_KEY=your_key_from_flyctl_secrets
EOF
```

## 🎯 Use in Code

```typescript
import { farmhand } from '@/lib/farmhand/client'

// Analyze narrative
const arc = await farmhand.analyzeNarrativeArc({
  transcript_text: 'Story here...'
})

// Check tone
const tone = await farmhand.checkToneAlignment('Draft text...')

// Calculate SROI
const sroi = await farmhand.calculateSROI({
  project: 'empathy-ledger',
  investment: 50000,
  outcomes: { stories_preserved: 100 }
})

// Refine story
const suggestions = await farmhand.refineStoryDraft({
  draft_text: 'Story draft...'
})
```

## 📚 Full Docs

- **Integration Plan**: [docs/design/ACT_FARMHAND_INTEGRATION.md](design/ACT_FARMHAND_INTEGRATION.md)
- **Summary**: [docs/ACT_FARMHAND_INTEGRATION_SUMMARY.md](ACT_FARMHAND_INTEGRATION_SUMMARY.md)
- **Deployment**: `/Users/benknight/act-global-infrastructure/act-personal-ai/DEPLOYMENT.md`
- **Farmhand README**: `/Users/benknight/act-global-infrastructure/act-personal-ai/README.md`

## 🆘 Troubleshooting

**401 Unauthorized?**
```bash
# Check API key matches
flyctl secrets list -a farmhand-api
cat .env.local | grep FARMHAND_API_KEY
```

**Module not found?**
```bash
# Reinstall dependencies in Farmhand
cd /Users/benknight/act-global-infrastructure/act-personal-ai
pip install -r requirements.txt
```

**Connection refused?**
```bash
# Check if API is running
flyctl status -a farmhand-api
flyctl logs -a farmhand-api
```

---

**Ready!** 🚀 Start building with `farmhand.analyzeNarrativeArc(...)`.

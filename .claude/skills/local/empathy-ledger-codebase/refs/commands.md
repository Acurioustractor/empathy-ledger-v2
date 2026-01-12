# Quick Reference Commands

## Development
```bash
npm run dev              # Dev server (localhost:3000)
npm run build            # Production build
npm run start            # Production server
```

## Database
```bash
npm run db:sync          # Interactive menu
npm run db:pull          # Pull remote schema
npm run db:push          # Push migrations
npm run db:reset         # Reset local
npm run db:types         # Generate types
```

## Supabase
```bash
supabase start           # Start local
supabase stop            # Stop local
supabase migration new   # New migration
```

## Git
```bash
git status && git add . && git commit -m "msg"
gh pr create --title "Title" --body "Body"
```

## PM2 (Local Dev)
```bash
pm2 start ecosystem.config.cjs --only empathy-ledger
pm2 logs empathy-ledger --lines 50
pm2 restart empathy-ledger
```

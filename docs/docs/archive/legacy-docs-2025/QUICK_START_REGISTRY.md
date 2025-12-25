# Registry Sharing - Quick Start

Get stories into the ACT Farm registry in 3 steps.

## Step 1: Share a story (super admin only)

1. Open https://empathy-ledger-v2.vercel.app/admin/stories
2. Log in with a super admin account
3. Click **View** on a story
4. In the right column, find **Registry Sharing**
5. Toggle **Share to ACT Farm** on

If you don't see the card, you're not logged in as super admin.

## Step 2: Confirm the story is in the Empathy Ledger registry

Use the ACT Farm token:

```bash
curl -H "Authorization: Bearer d35d4195fdbde06c018ee41289f47543d02aaf738f51b1b80efc46c06380ab14" \
  https://empathy-ledger-v2.vercel.app/api/registry?limit=5
```

You should see the shared story in `items`.

## Step 3: Test ACT Farm aggregator locally

The ACT Farm aggregator combines multiple registries:

```bash
cd "/Users/benknight/Code/ACT Farm and Regenerative Innovation Studio"
npm install
npm run dev
curl "http://localhost:3000/api/registry?fresh=true"
```

That should return combined feeds (Empathy Ledger + JusticeHub + Harvest + Goods).

## API Token

**ACT Farm Registry Token**: `d35d4195fdbde06c018ee41289f47543d02aaf738f51b1b80efc46c06380ab14`

Add this to ACT Farm's `.env.local`:

```env
EMPATHY_LEDGER_TOKEN=d35d4195fdbde06c018ee41289f47543d02aaf738f51b1b80efc46c06380ab14
```

## Expected Response Format

```json
{
  "items": [
    {
      "id": "uuid",
      "type": "story",
      "title": "Story Title",
      "summary": "Brief summary (max 260 chars)...",
      "image_url": "https://...",
      "canonical_url": null,
      "tags": ["theme1", "theme2"],
      "status": "published",
      "published_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Troubleshooting

### No stories in registry?

Check if any stories are shared:

```bash
# Using the Supabase SQL Editor
SELECT
  s.title,
  ssc.consent_granted,
  ea.app_name
FROM stories s
JOIN story_syndication_consent ssc ON s.id = ssc.story_id
JOIN external_applications ea ON ssc.app_id = ea.id
WHERE ea.app_name = 'act_farm';
```

If no results, share stories from the admin panel.

### Can't see Registry Sharing card?

Ensure your account has the `super_admin` role:

```sql
UPDATE profiles SET role = 'super_admin' WHERE email = 'your-email@example.com';
```

### 401 Invalid token?

Regenerate the token:

```bash
# Delete existing app
psql $DATABASE_URL -c "DELETE FROM external_applications WHERE app_name = 'act_farm';"

# Run setup script
node scripts/data-management/setup-act-farm-registry.js
```

## Next Steps

See [REGISTRY_SHARING_GUIDE.md](./REGISTRY_SHARING_GUIDE.md) for:
- Full API documentation
- Adding more registries (JusticeHub, Harvest)
- Security & consent management
- Database schema details

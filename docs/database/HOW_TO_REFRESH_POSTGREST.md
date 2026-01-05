# How to Refresh PostgREST Schema Cache in Supabase Dashboard

## Can't Find the Refresh Button? Try These Methods

---

## Method 1: API Settings (EASIEST)

**Step 1:** Go to your Supabase project:
https://app.supabase.com/project/yvnuayzslukamizrlhwb/settings/api

**Step 2:** Look for **"Configuration"** section

**Step 3:** Find **"API URL"** or **"PostgREST"** settings

**Step 4:** Click **"Restart"** or **"Reload Schema"** button if available

---

## Method 2: Database Settings

**Step 1:** Go to:
https://app.supabase.com/project/yvnuayzslukamizrlhwb/settings/database

**Step 2:** Scroll down to **"Connection pooling"** or **"PostgREST"** section

**Step 3:** Look for a **"Restart services"** or **"Reload"** button

---

## Method 3: Just Wait (SIMPLEST)

PostgREST automatically refreshes its schema cache every **10 minutes**.

**Just wait 10 minutes and try your API again!**

```bash
# In 10 minutes, test this:
curl -X POST http://localhost:3030/api/organisations/550e8400-e29b-41d4-a716-446655440010/storytellers/create \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test After Wait",
    "email": "test.wait@example.com",
    "displayName": "Wait Test"
  }'

# Should work!
```

---

## Method 4: Trigger via SQL (WORKS NOW)

Since you have database access, you can force PostgREST to reload via PostgreSQL:

```bash
psql $DATABASE_URL << 'EOF'
-- Send notification to PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
EOF
```

Let me run this for you:

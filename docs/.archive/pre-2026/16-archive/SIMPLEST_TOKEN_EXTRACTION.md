# Simplest Token Extraction (Copy & Paste Method)

You're logged in as: **benjamin@act.place**

## Method 1: Browser Console (30 seconds)

1. **Stay on http://localhost:3030** (keep this tab open)

2. **Open Console** (Cmd + Option + J on Mac, or F12 → Console tab)

3. **Copy and paste this ONE LINE:**

```javascript
copy(JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => k.includes('supabase')))).access_token)
```

4. **Press Enter**

5. **Your token is now in your clipboard!** ✅

---

## Method 2: Manual (if Method 1 doesn't work)

1. While on http://localhost:3030, open Console (F12 → Console)

2. Paste this:
```javascript
console.log(JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => k.includes('supabase')))).access_token)
```

3. Copy the token that appears (it starts with `eyJ`)

---

## What to do next:

Once you have your token copied:

```bash
# Open the test script
nano test-consent-manual.sh

# Replace line 4:
AUTH_TOKEN="paste_your_token_here"

# Save: Ctrl+X, then Y, then Enter

# Make executable:
chmod +x test-consent-manual.sh

# Run it:
./test-consent-manual.sh
```

---

## Expected Output:

```json
{
  "success": true,
  "consent": {
    "id": "some-uuid",
    "status": "approved",
    ...
  },
  "embedToken": {
    "token": "embed_...",
    "status": "active"
  },
  "message": "Consent granted and embed token created"
}
```

If you see that ✅ - your Syndication Consent System is working!

---

## Troubleshooting:

**"Cannot read property 'access_token'"** → You need to log in first at localhost:3030

**"eyJ..." doesn't work in test** → Token might be expired, try logging out and back in

**Need help?** → Paste the error message you see

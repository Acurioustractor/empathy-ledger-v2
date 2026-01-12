# How to Get Your Auth Token

## Quick Steps:

1. **Open http://localhost:3030 in your browser**
2. **Make sure you're logged in**
3. **Open DevTools:**
   - Mac: `Cmd + Option + I`
   - Windows/Linux: `F12` or `Ctrl + Shift + I`

4. **Navigate to Cookies:**

   ### Chrome/Edge:
   ```
   DevTools → Application tab → Storage → Cookies → http://localhost:3030
   ```

   ### Firefox:
   ```
   DevTools → Storage tab → Cookies → http://localhost:3030
   ```

   ### Safari:
   ```
   Web Inspector → Storage → Cookies → localhost
   ```

5. **Find the cookie:**
   - Look for: `sb-localhost-auth-token` or `sb-access-token`
   - The Name column will show the cookie name
   - The Value column will show a LONG string (that's your token!)

6. **Copy the token:**
   - Double-click the Value
   - Copy it (Cmd+C / Ctrl+C)

## Example of what the token looks like:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzM2MTIzNDU2LCJpYXQiOjE3MzYxMTk4NTYsImlzcyI6Imh0dHBzOi8veXZudWF5enNsdWthbWl6cmxod2Iuc3VwYWJhc2UuY28vYXV0aC92MSIsInN1YiI6IjEyMzQ1Njc4LTEyMzQtMTIzNC0xMjM0LTEyMzQ1Njc4OTAxMiIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnt9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzM2MTE5ODU2fV0sInNlc3Npb25faWQiOiIxMjM0NTY3OC0xMjM0LTEyMzQtMTIzNC0xMjM0NTY3ODkwMTIifQ.aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890aBcDeFgHiJkLmNoPqRsTuVwXyZ
```

It's a JWT token that starts with `eyJ` and is very long (500+ characters).

## Using the Token

Once you have it, use it in curl commands like this:

```bash
curl http://localhost:3030/api/syndication/consent \
  -H "Cookie: sb-access-token=YOUR_TOKEN_HERE"
```

## Troubleshooting

**If you don't see the cookie:**
1. Make sure you're logged in to http://localhost:3030
2. Refresh the page
3. Check DevTools → Application → Cookies again
4. Try logging out and back in

**If the cookie expired:**
- The token expires after some time
- Just log in again to get a fresh token

**Alternative cookie names to look for:**
- `sb-localhost-auth-token` (most common)
- `sb-access-token`
- `sb-auth-token`
- `supabase-auth-token`

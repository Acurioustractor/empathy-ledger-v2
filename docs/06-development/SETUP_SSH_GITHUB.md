# Setting Up SSH for GitHub

Follow these steps to set up SSH and push your large commit successfully.

## Step 1: Generate SSH Key

Open a new terminal and run:

```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
```

When prompted:
- Press Enter to accept the default location (`/Users/benknight/.ssh/id_ed25519`)
- Enter a passphrase (optional but recommended) or press Enter for no passphrase

## Step 2: Start SSH Agent

```bash
eval "$(ssh-agent -s)"
```

## Step 3: Add SSH Key to SSH Agent

```bash
ssh-add ~/.ssh/id_ed25519
```

## Step 4: Copy Your SSH Public Key

```bash
cat ~/.ssh/id_ed25519.pub
```

This will display your public key. Copy the entire output (starts with `ssh-ed25519`).

## Step 5: Add SSH Key to GitHub

1. Go to https://github.com/settings/keys
2. Click "New SSH key"
3. Give it a title (e.g., "MacBook Pro")
4. Paste your public key
5. Click "Add SSH key"

## Step 6: Test SSH Connection

```bash
ssh -T git@github.com
```

You should see: "Hi [username]! You've successfully authenticated..."

## Step 7: Change Repository Remote to SSH

In your project directory:

```bash
cd /Users/benknight/Code/empathy-ledger-v2
git remote set-url origin git@github.com:Acurioustractor/empathy-ledger-v2.git
```

## Step 8: Verify Remote URL

```bash
git remote -v
```

Should show:
```
origin  git@github.com:Acurioustractor/empathy-ledger-v2.git (fetch)
origin  git@github.com:Acurioustractor/empathy-ledger-v2.git (push)
```

## Step 9: Push Your Changes

Now you can push your develop branch:

```bash
git push -u origin develop
```

## Troubleshooting

### If push still fails due to size:

1. **Increase pack size limits:**
```bash
git config pack.windowMemory "100m"
git config pack.packSizeLimit "100m"
git config pack.threads "1"
```

2. **Try pushing with verbose output:**
```bash
GIT_TRACE=1 GIT_CURL_VERBOSE=1 git push -u origin develop
```

3. **Alternative: Push in chunks**
If the commit is still too large, we can:
- Reset to before the big commit
- Break changes into smaller commits
- Push incrementally

### If you get "Permission denied (publickey)":

1. Make sure your SSH key is added to ssh-agent:
```bash
ssh-add -l
```

2. If not listed, add it again:
```bash
ssh-add ~/.ssh/id_ed25519
```

## Why SSH Works Better for Large Pushes

- **No HTTP timeout limits** - SSH doesn't have the same 408 timeout issues
- **Better handling of large files** - SSH protocol is more efficient
- **More stable connection** - Less likely to disconnect during long transfers
- **Authentication caching** - Once set up, no need to enter credentials

## Next Steps

After successful push:

1. Go to: https://github.com/Acurioustractor/empathy-ledger-v2
2. You should see your `develop` branch
3. You can create a Pull Request to merge into `main` when ready

---

**Note**: Keep your private key (`~/.ssh/id_ed25519`) secure and never share it!
# Quick Add: User Guide

## Access the Form

Navigate to: **http://localhost:3030/admin/quick-add**

Or from the admin dashboard → "Quick Add" button

---

## Your Descript Workflow (2 minutes per story)

### Step 1: Storyteller
**Choose ONE:**
- **Select Existing** → Pick from dropdown (if storyteller already exists)
- **Add New** → Enter name (required), email & bio (optional)

### Step 2: Transcript
- **Paste full transcript** → Big text area, just paste everything
- **Title (optional)** → Auto-generated if you leave empty

### Step 3: Video
- **Paste Descript link** → `https://share.descript.com/view/...`
- ✓ Green checkmark = valid Descript link

### Step 4: Project
- **Select project** → Dropdown with active projects

### Step 5: Optional (click "+ Show")
- Photo (drag & drop)
- Location (Sydney, NSW)
- Cultural background
- Tags (comma-separated)

### Step 6: Save
- **Save & Done** → Finish and go back
- **Save & Add Another** → Keep project selected, clear form, add next story

---

## What Gets Created

When you save:
1. ✅ Storyteller profile (if new)
2. ✅ Transcript record (with Descript link)
3. ✅ Story record
4. ✅ Links to project
5. ✅ Links to organization (auto-detected)

---

## Time Savings

**Before (manual):** ~10-15 minutes per story
- Create storyteller
- Fill in details
- Create transcript
- Copy-paste
- Upload video
- Link everything

**Now (Quick Add):** ~2 minutes per story
- Paste transcript
- Paste video link
- Select/create storyteller
- Done!

**10 stories:**
- Manual: 2+ hours
- Quick Add: 20 minutes
- **Save 90% of time!**

---

## Tips

1. **Batch workflow:**
   - Have all Descript links ready
   - Use "Save & Add Another" to rapid-fire through multiple stories

2. **Existing storytellers:**
   - If person already in system, use "Select Existing" to avoid duplicates

3. **Auto-save:**
   - Form auto-saves as you type (coming soon)
   - Won't lose work if browser closes

4. **Descript links:**
   - Both view and embed links work
   - Copy from Descript share menu

---

## Descript Link Examples

```
✅ https://share.descript.com/view/ABC123XYZ
✅ https://share.descript.com/embed/ABC123XYZ
✅ https://share.descript.com/view/ABC123?t=120
```

---

## Next: Adding Organizations

Before using Quick Add, you may need to:

1. **Add new organization:**
   - Go to `/admin/organizations`
   - Click "Create Organization"
   - Fill in details

2. **Select organization:**
   - Use organization dropdown at top
   - Quick Add will use selected org

3. **Create project:**
   - Go to `/admin/projects`
   - Create project for the organization

Then you're ready to use Quick Add!

---

## Troubleshooting

**"No projects found"**
- Create a project first at `/admin/projects`
- Make sure project status is "active"

**"Descript link not working"**
- Check link is from share.descript.com
- Try copying link again from Descript

**"Duplicate storyteller"**
- Search existing storytellers first
- Use "Select Existing" if person already in system

---

## Future Enhancements

Coming soon:
- 📸 Auto-extract thumbnails from Descript
- 💾 Auto-save drafts
- 📋 CSV bulk import
- 🤖 AI-powered transcription (video → text)
- 🏷️ Smart tag suggestions

---

Ready to add your first story? Go to:
**http://localhost:3030/admin/quick-add**

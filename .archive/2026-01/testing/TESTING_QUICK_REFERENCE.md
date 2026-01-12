# Testing Quick Reference

**Fast checklist for manual testing - one page per test**

---

## 🚀 Setup

```bash
npm run dev
# Visit http://localhost:3000
```

---

## ✅ Testing Checklist (37 Pages)

### PUBLIC PAGES (3)

- [ ] 1. [Homepage](http://localhost:3000) - Hero, navigation, story preview
- [ ] 2. [Stories List](http://localhost:3000/stories) - Cards, filters, search
- [ ] 3. [Story Detail](http://localhost:3000/stories/[id]) - Content, media, storyteller info

### AUTH (2)

- [ ] 4. [Sign Up](http://localhost:3000/auth/signup) - Form validation, account creation
- [ ] 5. [Sign In](http://localhost:3000/auth/signin) - Authentication, errors

### STORYTELLER PROFILE - Sprint 1 (5)

- [ ] 6. [Dashboard](http://localhost:3000/storytellers/[id]/dashboard) - Stats, recent stories
- [ ] 7. [Profile Display](http://localhost:3000/storytellers/[id]/profile) - Avatar, bio, badges
- [ ] 8. [Profile Edit](http://localhost:3000/storytellers/[id]/edit) - Update info, save
- [ ] 9. [Privacy Settings](http://localhost:3000/storytellers/[id]/settings/privacy) - 6 components
- [ ] 10. [ALMA Settings](http://localhost:3000/storytellers/[id]/settings/alma) - 5 components

### STORY CREATION - Sprint 2 (3)

- [ ] 11. [Quick Create](http://localhost:3000/stories/new) - 3-step wizard
- [ ] 12. [Story Editor](http://localhost:3000/stories/[id]/edit) - Rich text, auto-save
- [ ] 13. [Drafts List](http://localhost:3000/storytellers/[id]/drafts) - Continue editing

### MEDIA - Sprint 3 (2)

- [ ] 14. [Media Upload](http://localhost:3000/media/upload) - Drag-drop, AI captions
- [ ] 15. [Smart Gallery](http://localhost:3000/storytellers/[id]/gallery) - Lightbox, filters

### CONSENT - Sprint 4 (3)

- [ ] 16. [Consent Workflow](http://localhost:3000/stories/[id]/consent) - Signature, permissions
- [ ] 17. [Protocols Manager](http://localhost:3000/storytellers/[id]/protocols) - Add, edit, apply
- [ ] 18. [Elder Review](http://localhost:3000/organizations/[id]/elder-review) - Approve, request changes

### ORGANIZATION - Sprint 5 (3)

- [ ] 19. [Org Dashboard](http://localhost:3000/organizations/[id]/dashboard) - Overview, stats
- [ ] 20. [Members](http://localhost:3000/organizations/[id]/members) - Invite, roles
- [ ] 21. [Org Settings](http://localhost:3000/organizations/[id]/settings) - Info, protocols

### ANALYTICS - Sprint 6 (4)

- [ ] 22. [Analytics Dashboard](http://localhost:3000/organizations/[id]/analytics) - Charts, KPIs
- [ ] 23. [Interpretation Sessions](http://localhost:3000/organizations/[id]/interpretation) - 7-step wizard
- [ ] 24. [Harvested Outcomes](http://localhost:3000/organizations/[id]/outcomes) - Track impacts
- [ ] 25. [Funder Reports](http://localhost:3000/organizations/[id]/reports) - Generate, export

### SEARCH - Sprint 7 (5)

- [ ] 26. [Global Search](http://localhost:3000/search) - Keyword, semantic, tabs
- [ ] 27. [Advanced Filters](http://localhost:3000/search?filters=open) - 9 filter categories
- [ ] 28. [Discovery Feed](http://localhost:3000/discover) - Personalized, trending
- [ ] 29. [Saved Searches](http://localhost:3000/search/saved) - Alerts, notifications
- [ ] 30. [Search Analytics](http://localhost:3000/search/analytics) - Trends, top queries

### POLISH - Sprint 8 (7)

- [ ] 31. [404 Page](http://localhost:3000/404) - Error message, navigation
- [ ] 32. Error Boundaries - Trigger errors, check fallbacks
- [ ] 33. Accessibility - Keyboard nav, screen reader
- [ ] 34. Responsive - Mobile (375px), Tablet (768px), Desktop
- [ ] 35. Performance - Page load < 2s, Lighthouse score
- [ ] 36. Security - Auth, RLS policies, input validation
- [ ] 37. Cross-Browser - Chrome, Firefox, Safari

---

## 🎯 Test Each Page

For every page:

1. **Load** - Does it load without errors?
2. **Data** - Does data display correctly?
3. **Interact** - Do buttons/forms work?
4. **Save** - Does data persist?
5. **Navigate** - Can you navigate away and back?

---

## 🔍 Quick Tests

### Critical Path (15 min)
1. Sign up → Create story → Upload media → Publish
2. View public story → Sign in → Edit profile
3. Create organization → Invite member → Generate report

### Data Flow (10 min)
1. Create draft story → Save → Refresh → Still there?
2. Upload photo → Add caption → Delete → Gone?
3. Change privacy setting → Save → Verify applied?

### Responsive (5 min)
1. Open DevTools → Toggle device toolbar
2. Test 375px (mobile) and 1280px (desktop)
3. Check navigation menu and key layouts

---

## ⚠️ Common Issues

**Console Errors:**
- Open DevTools → Console tab
- Look for red errors
- Screenshot any issues

**Data Not Saving:**
- Check Network tab for failed requests
- Verify environment variables set
- Check Supabase RLS policies

**UI Broken:**
- Clear cache (Cmd+Shift+R)
- Check responsive mode
- Try different browser

---

## 📊 Progress Tracker

**Quick Status:**
```
Tested: __ / 37 pages
Issues: __ critical, __ high, __ medium, __ low
Ready: [ ] Yes  [ ] No
```

---

## 🚀 Launch Criteria

- [ ] No critical issues
- [ ] All core features work (auth, stories, media)
- [ ] No console errors on main pages
- [ ] Mobile responsive on key pages
- [ ] Data persists correctly

---

**See [MANUAL_TESTING_PLAN.md](MANUAL_TESTING_PLAN.md) for detailed testing instructions.**

# Pull Request

## Description
<!-- Briefly describe the changes in this PR -->

## Type of Change
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🎨 Style/UI change
- [ ] ♻️ Code refactoring
- [ ] 🗄️ Database schema change

## Testing
<!-- Describe the tests you ran to verify your changes -->
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] All tests passing

## Required Checklists

### All PRs
- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] Documentation updated (if applicable)
- [ ] No console errors or warnings

### Design/UI Changes
- [ ] Design system compliance verified (Editorial Warmth colors)
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Accessibility standards met (WCAG 2.1 AA)
- [ ] Dark mode support (if applicable)
- [ ] Loading and error states implemented

### Database Changes
- [ ] Migration files created (idempotent patterns)
- [ ] Migration tested locally (`supabase db reset`)
- [ ] RLS policies updated/tested
- [ ] TypeScript types regenerated (`supabase gen types`)
- [ ] Foreign key cascades verified
- [ ] Multi-tenant isolation maintained

### Storyteller-Facing Features (CRITICAL)
- [ ] **Cultural Review Completed** (invoke `.claude/skills/local/cultural-review/`)
  - [ ] OCAP principles verified (Ownership, Control, Access, Possession)
  - [ ] Privacy levels respected (public/community/private/restricted)
  - [ ] Elder review workflow considered
  - [ ] Sacred content protection verified
  - [ ] No cultural appropriation or misrepresentation
- [ ] Privacy controls tested
- [ ] Consent mechanisms verified
- [ ] Data sovereignty maintained

### Data Handling Features
- [ ] GDPR compliance reviewed (invoke `.claude/skills/local/gdpr-compliance/`)
  - [ ] Right to access implemented
  - [ ] Right to erasure respected
  - [ ] Data portability supported
  - [ ] Consent tracked and revocable
- [ ] Personal data encrypted (if applicable)
- [ ] Audit logging implemented

## Screenshots/Videos
<!-- Add screenshots or videos demonstrating the changes (especially for UI changes) -->

## Deployment Checklist
- [ ] Environment variables documented (if new ones added)
- [ ] Vercel preview deployment successful
- [ ] No build errors or warnings
- [ ] Breaking changes documented in CHANGELOG

## Related Issues
<!-- Link related issues using #issue_number -->
Closes #

## Additional Notes
<!-- Any additional information that reviewers should know -->

---

## For Reviewers

### Cultural Sensitivity Check (Required for storyteller-facing features)
- [ ] Reviewed using cultural-review skill
- [ ] OCAP principles maintained
- [ ] Elder review workflow appropriate
- [ ] No red flags identified

### Code Quality
- [ ] Code is readable and maintainable
- [ ] Logic is sound and efficient
- [ ] No security vulnerabilities introduced
- [ ] Error handling appropriate

### Testing
- [ ] Changes tested in preview environment
- [ ] Edge cases considered
- [ ] Performance impact acceptable

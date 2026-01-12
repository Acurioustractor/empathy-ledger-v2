# Brand Compliance Audit Report

**Generated:** 2026-01-06T21:51:45.880Z
**Files Analyzed:** 846
**Total Issues:** 5475

## Summary

| Type | Count |
|------|-------|
| Color | 4189 |
| Typography | 1286 |
| Spacing | 0 |
| Pattern | 0 |

| Severity | Count |
|----------|-------|
| Error | 0 |
| Warning | 4189 |
| Info | 1286 |

## Top Files with Issues

- **src/components/admin/MediaGalleryManagement.tsx**: 87 issues
- **src/app/storytellers/[id]/opportunities/page.tsx**: 81 issues
- **src/app/admin/galleries/page.tsx**: 79 issues
- **src/components/development/PersonalDevelopmentPlan.tsx**: 76 issues
- **src/components/admin/ProjectManagement.tsx**: 75 issues
- **src/components/analytics/AnalyticsDashboard.tsx**: 67 issues
- **src/app/storytellers/[id]/skills/page.tsx**: 63 issues
- **src/components/admin/StorytellerManagement.tsx**: 58 issues
- **src/app/organisations/[id]/galleries/page.tsx**: 55 issues
- **src/app/organisations/[id]/transcripts/page.tsx**: 52 issues

## Brand Color Reference

| Color | Hex | Usage |
|-------|-----|-------|
| Ochre | #96643a | Earth, ancestry, land |
| Terracotta | #b84a32 | Primary actions, storytelling |
| Sage | #5c6d51 | Growth, success, healing |
| Charcoal | #42291a | Text, depth, grounding |
| Cream | #faf6f1 | Backgrounds, space |

## Detailed Issues


### src/lib/storyteller-utils.tsx:30
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: bg-blue-100
- **Code:** `if (!years) return { label: 'New Storyteller', colour: 'bg-blue-100 text-blue-800' }`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/lib/storyteller-utils.tsx:30
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: text-blue-800
- **Code:** `if (!years) return { label: 'New Storyteller', colour: 'bg-blue-100 text-blue-800' }`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/lib/storyteller-utils.tsx:31
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: bg-blue-100
- **Code:** `if (years < 2) return { label: 'New Storyteller', colour: 'bg-blue-100 text-blue-800' }`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/lib/storyteller-utils.tsx:31
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: text-blue-800
- **Code:** `if (years < 2) return { label: 'New Storyteller', colour: 'bg-blue-100 text-blue-800' }`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/lib/storyteller-utils.tsx:32
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: bg-green-100
- **Code:** `if (years < 5) return { label: 'Emerging Voice', colour: 'bg-green-100 text-green-800' }`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/lib/storyteller-utils.tsx:32
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: text-green-800
- **Code:** `if (years < 5) return { label: 'Emerging Voice', colour: 'bg-green-100 text-green-800' }`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/lib/storyteller-utils.tsx:33
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: bg-purple-100
- **Code:** `if (years < 10) return { label: 'Experienced Storyteller', colour: 'bg-purple-100 text-purple-800' }`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/lib/storyteller-utils.tsx:33
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: text-purple-800
- **Code:** `if (years < 10) return { label: 'Experienced Storyteller', colour: 'bg-purple-100 text-purple-800' }`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/components/transcripts/TranscriptCreationDialog.tsx:159
- **Type:** typography
- **Severity:** info
- **Message:** Very small text (text-xs) may have accessibility concerns
- **Code:** `<AvatarFallback className="text-xs">`
- **Suggestion:** Ensure text-xs is only used for captions/labels, not body text


### src/components/transcripts/TranscriptCreationDialog.tsx:200
- **Type:** typography
- **Severity:** info
- **Message:** Very small text (text-xs) may have accessibility concerns
- **Code:** `<p className="text-xs text-grey-600">`
- **Suggestion:** Ensure text-xs is only used for captions/labels, not body text


### src/components/transcripts/TranscriptCreationDialog.tsx:219
- **Type:** typography
- **Severity:** info
- **Message:** Very small text (text-xs) may have accessibility concerns
- **Code:** `<div className="flex justify-between text-xs text-grey-600">`
- **Suggestion:** Ensure text-xs is only used for captions/labels, not body text


### src/components/transcripts/TranscriptCreationDialog.tsx:227
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: bg-red-50
- **Code:** `<div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/components/transcripts/TranscriptCreationDialog.tsx:227
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: text-red-700
- **Code:** `<div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/components/transcripts/TranscriptCreationDialog.tsx:227
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: border-red-200
- **Code:** `<div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/components/transcripts/TranscriptCreationDialog.tsx:233
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: bg-blue-50
- **Code:** `<div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/components/transcripts/TranscriptCreationDialog.tsx:233
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: text-blue-700
- **Code:** `<div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/components/transcripts/TranscriptCreationDialog.tsx:233
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: border-blue-200
- **Code:** `<div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/components/transcripts/TranscriptCreationDialog.tsx:235
- **Type:** typography
- **Severity:** info
- **Message:** Very small text (text-xs) may have accessibility concerns
- **Code:** `<ul className="list-disc list-inside space-y-1 text-xs">`
- **Suggestion:** Ensure text-xs is only used for captions/labels, not body text


### src/components/themes/ThemeTimeline.tsx:127
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand hex color: #D97757
- **Code:** `stroke="#D97757"`
- **Suggestion:** Replace with brand color or add to design tokens


### src/components/themes/ThemeTimeline.tsx:130
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand hex color: #D97757
- **Code:** `dot={{ fill: '#D97757' }}`
- **Suggestion:** Replace with brand color or add to design tokens


### src/components/themes/ThemeTimeline.tsx:136
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand hex color: #4A90A4
- **Code:** `stroke="#4A90A4"`
- **Suggestion:** Replace with brand color or add to design tokens


### src/components/themes/ThemeTimeline.tsx:139
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand hex color: #4A90A4
- **Code:** `dot={{ fill: '#4A90A4' }}`
- **Suggestion:** Replace with brand color or add to design tokens


### src/components/themes/ThemeStatus.tsx:26
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: text-green-600
- **Code:** `color: 'text-green-600',`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/components/themes/ThemeStatus.tsx:27
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: bg-green-50
- **Code:** `bgColor: 'bg-green-50 border-green-200',`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/components/themes/ThemeStatus.tsx:27
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: border-green-200
- **Code:** `bgColor: 'bg-green-50 border-green-200',`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/components/themes/ThemeStatus.tsx:33
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: text-blue-600
- **Code:** `color: 'text-blue-600',`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/components/themes/ThemeStatus.tsx:34
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: bg-blue-50
- **Code:** `bgColor: 'bg-blue-50 border-blue-200',`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/components/themes/ThemeStatus.tsx:34
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: border-blue-200
- **Code:** `bgColor: 'bg-blue-50 border-blue-200',`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/components/themes/ThemeStatus.tsx:82
- **Type:** typography
- **Severity:** info
- **Message:** Very small text (text-xs) may have accessibility concerns
- **Code:** `<Badge variant="outline" className="text-xs">`
- **Suggestion:** Ensure text-xs is only used for captions/labels, not body text


### src/components/themes/ThemeStatus.tsx:99
- **Type:** typography
- **Severity:** info
- **Message:** Very small text (text-xs) may have accessibility concerns
- **Code:** `<p className="text-xs text-gray-500 mt-1">{theme.usage_count} total mentions</p>`
- **Suggestion:** Ensure text-xs is only used for captions/labels, not body text


### src/components/themes/ThemeStatus.tsx:108
- **Type:** typography
- **Severity:** info
- **Message:** Very small text (text-xs) may have accessibility concerns
- **Code:** `<p className="text-xs text-gray-500 mt-1">unique contributors</p>`
- **Suggestion:** Ensure text-xs is only used for captions/labels, not body text


### src/components/themes/ThemeRelationshipsGraph.tsx:48
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: bg-green-100
- **Code:** `if (strength > 0.6) return 'bg-green-100 text-green-800 border-green-200'`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/components/themes/ThemeRelationshipsGraph.tsx:48
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: text-green-800
- **Code:** `if (strength > 0.6) return 'bg-green-100 text-green-800 border-green-200'`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/components/themes/ThemeRelationshipsGraph.tsx:48
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: border-green-200
- **Code:** `if (strength > 0.6) return 'bg-green-100 text-green-800 border-green-200'`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/components/themes/ThemeRelationshipsGraph.tsx:49
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: bg-blue-100
- **Code:** `if (strength > 0.4) return 'bg-blue-100 text-blue-800 border-blue-200'`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/components/themes/ThemeRelationshipsGraph.tsx:49
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: text-blue-800
- **Code:** `if (strength > 0.4) return 'bg-blue-100 text-blue-800 border-blue-200'`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/components/themes/ThemeRelationshipsGraph.tsx:49
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: border-blue-200
- **Code:** `if (strength > 0.4) return 'bg-blue-100 text-blue-800 border-blue-200'`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/components/themes/ThemeRelationshipsGraph.tsx:66
- **Type:** typography
- **Severity:** info
- **Message:** Very small text (text-xs) may have accessibility concerns
- **Code:** `<span className="text-xs text-gray-500">`
- **Suggestion:** Ensure text-xs is only used for captions/labels, not body text


### src/components/themes/ThemeRelationshipsGraph.tsx:71
- **Type:** typography
- **Severity:** info
- **Message:** Very small text (text-xs) may have accessibility concerns
- **Code:** `<Badge className={`ml-3 ${getStrengthColor()} text-xs`}>`
- **Suggestion:** Ensure text-xs is only used for captions/labels, not body text


### src/components/themes/ThemeEvolutionDashboard.tsx:133
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: bg-green-100
- **Code:** `case 'emerging': return 'bg-green-100 text-green-800 border-green-200'`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/components/themes/ThemeEvolutionDashboard.tsx:133
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: text-green-800
- **Code:** `case 'emerging': return 'bg-green-100 text-green-800 border-green-200'`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/components/themes/ThemeEvolutionDashboard.tsx:133
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: border-green-200
- **Code:** `case 'emerging': return 'bg-green-100 text-green-800 border-green-200'`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/components/themes/ThemeEvolutionDashboard.tsx:134
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: bg-blue-100
- **Code:** `case 'growing': return 'bg-blue-100 text-blue-800 border-blue-200'`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/components/themes/ThemeEvolutionDashboard.tsx:134
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: text-blue-800
- **Code:** `case 'growing': return 'bg-blue-100 text-blue-800 border-blue-200'`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/components/themes/ThemeEvolutionDashboard.tsx:134
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: border-blue-200
- **Code:** `case 'growing': return 'bg-blue-100 text-blue-800 border-blue-200'`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/components/themes/ThemeEvolutionDashboard.tsx:267
- **Type:** typography
- **Severity:** info
- **Message:** Very small text (text-xs) may have accessibility concerns
- **Code:** `<Badge className={`${getStatusColor(theme.status)} text-xs flex items-center gap-1`}>`
- **Suggestion:** Ensure text-xs is only used for captions/labels, not body text


### src/components/themes/ThemeEvolutionDashboard.tsx:272
- **Type:** typography
- **Severity:** info
- **Message:** Very small text (text-xs) may have accessibility concerns
- **Code:** `<div className="flex items-center justify-between text-xs text-gray-600">`
- **Suggestion:** Ensure text-xs is only used for captions/labels, not body text


### src/components/themes/ThemeEvolutionDashboard.tsx:277
- **Type:** typography
- **Severity:** info
- **Message:** Very small text (text-xs) may have accessibility concerns
- **Code:** `<div className="mt-1 flex items-center gap-1 text-xs">`
- **Suggestion:** Ensure text-xs is only used for captions/labels, not body text


### src/components/themes/ThemeEvolutionDashboard.tsx:279
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: text-green-600
- **Code:** `<TrendingUp className="w-3 h-3 text-green-600" />`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*


### src/components/themes/ThemeEvolutionDashboard.tsx:283
- **Type:** color
- **Severity:** warning
- **Message:** Non-brand Tailwind color: text-green-600
- **Code:** `<span className={theme.growth_rate > 0 ? 'text-green-600' : 'text-orange-600'}>`
- **Suggestion:** Use brand colors: ochre, terracotta, sage, charcoal, cream, or neutral-*



*...and 5425 more issues. See brand-audit-report.json for full list.*

## Recommendations

1. **Replace Tailwind default colors** with brand palette (ochre, terracotta, sage, charcoal, cream)
2. **Use font-serif** for headings and display text
3. **Use font-sans** for body text and UI elements
4. **Ensure 8pt spacing grid** (p-2, p-4, p-6, p-8, etc.)
5. **Add brand colors to tailwind.config.ts** if not already present

## Next Steps

1. Run Ralph with the generated PRD to fix issues automatically
2. Review visual audit screenshots for visual inconsistencies
3. Update component library to enforce brand compliance

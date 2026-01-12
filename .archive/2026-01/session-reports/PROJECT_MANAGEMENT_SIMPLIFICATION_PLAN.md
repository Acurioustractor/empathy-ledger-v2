# ProjectManagement.tsx Simplification Plan

## File Analysis
- **Current Size**: 2,708 lines
- **Components**: 14 React components
- **Pattern Identified**: Extensive code duplication and repetition

## Identified Patterns for Simplification

### 1. Constants & Configuration (Lines 1-100)

**Current**: Hardcoded status/option values scattered throughout forms

**Refactor To**:
```typescript
const PROJECT_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' }
] as const

const STATUS_BADGE_CONFIG = {
  active: { variant: 'outline', className: 'text-green-600 border-green-600' },
  completed: { variant: 'outline', className: 'text-blue-600 border-blue-600' },
  paused: { variant: 'outline', className: 'text-yellow-600 border-yellow-600' },
  cancelled: { variant: 'destructive', className: '' }
}
```

**Savings**: ~120 lines across 3 duplicate `getStatusBadge` functions

### 2. Reusable Components

#### StatCard Component (Used 20+ times)
**Current Pattern** (repeated):
```typescript
<div className="text-center">
  <div className="text-2xl font-bold text-blue-600">{value}</div>
  <div className="text-xs text-stone-600 dark:text-stone-400">Label</div>
</div>
```

**Refactor To**:
```typescript
function StatCard({ value, label, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  }
  return (
    <div className="text-center">
      <div className={cn('text-2xl font-bold', colorClasses[color])}>{value}</div>
      <div className="text-xs text-stone-600 dark:text-stone-400">{label}</div>
    </div>
  )
}
```

**Savings**: ~400 lines → ~50 lines (88% reduction)

#### EmptyState Component (Used 5+ times)
**Current Pattern** (repeated):
```typescript
<Card>
  <CardContent className="text-center py-12">
    <Icon className="w-12 h-12 mx-auto text-stone-400 mb-4" />
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-stone-600 dark:text-stone-400 mb-4">{description}</p>
    <Button onClick={onAction}>
      <Plus className="w-4 h-4 mr-2" />
      {actionLabel}
    </Button>
  </CardContent>
</Card>
```

**Savings**: ~200 lines → ~30 lines (85% reduction)

#### ActionButtons Component (Used 10+ times)
**Current Pattern**:
```typescript
<Button variant="outline" size="sm" onClick={onView}>
  <Eye className="w-4 h-4 mr-2" />
  View
</Button>
<Button variant="outline" size="sm" onClick={onEdit}>
  <Edit className="w-4 h-4 mr-2" />
  Edit
</Button>
<Button variant="outline" size="sm" onClick={onDelete} className="text-red-600">
  <Trash2 className="w-4 h-4" />
</Button>
```

**Savings**: ~250 lines → ~40 lines (84% reduction)

### 3. Utility Functions

#### Duplicate getStatusBadge (3 instances)
- Lines: 120-133, 1109-1120, 2126-2137
- **Consolidate to**: Single function with STATUS_BADGE_CONFIG
- **Savings**: ~30 lines

#### formatDate (1 function, used 15+ times)
- Current location: Lines 209-216
- Already well-extracted, keep as-is

#### New Helper: calculateDaysActive
**Current** (inline complex calculation):
```typescript
{project.startDate ? Math.floor((new Date().getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0}
```

**Extract to**:
```typescript
function calculateDaysActive(startDate?: string): number {
  if (!startDate) return 0
  const now = new Date().getTime()
  const start = new Date(startDate).getTime()
  return Math.floor((now - start) / (1000 * 60 * 60 * 24))
}
```

**Savings**: Improved readability, ~20 lines

### 4. Form Management Patterns

#### updateFormData Helper
**Current** (repeated in every form):
```typescript
onChange={(e) => setFormData({ ...formData, name: e.target.value })}
onChange={(e) => setFormData({ ...formData, description: e.target.value })}
// ... repeated 50+ times
```

**Refactor To**:
```typescript
const updateFormData = (key: string, value: any) => {
  setFormData(prev => ({ ...prev, [key]: value }))
}

// Usage:
onChange={(e) => updateFormData('name', e.target.value)}
```

**Savings**: Improved consistency, ~100 lines reduction

#### SelectOption Rendering
**Current** (repeated in 8+ forms):
```typescript
<SelectContent>
  <SelectItem value="active">Active</SelectItem>
  <SelectItem value="completed">Completed</SelectItem>
  <SelectItem value="paused">Paused</SelectItem>
</SelectContent>
```

**Refactor To**:
```typescript
<SelectContent>
  {PROJECT_STATUS_OPTIONS.map(option => (
    <SelectItem key={option.value} value={option.value}>
      {option.label}
    </SelectItem>
  ))}
</SelectContent>
```

**Savings**: ~150 lines, improved maintainability

### 5. Loading States

#### LoadingSpinner Component
**Current** (repeated 6+ times):
```typescript
{submitting ? (
  <div className="flex items-center">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
    Creating...
  </div>
) : (
  'Create Project'
)}
```

**Extract to**:
```typescript
function LoadingSpinner({ label = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      {label}
    </div>
  )
}

// Usage:
{submitting ? <LoadingSpinner label="Creating..." /> : 'Create Project'}
```

**Savings**: ~80 lines

### 6. Complex Nested Ternaries

#### Example: Media Type Filtering
**Current** (lines 1596-1600):
```typescript
{ id: 'photos', name: 'Photos', count: media.filter(m => m.type?.startsWith('image')).length },
{ id: 'videos', name: 'Videos', count: media.filter(m => m.type?.startsWith('video')).length },
{ id: 'documents', name: 'Documents', count: media.filter(m => m.type?.includes('pdf') || m.type?.includes('document')).length }
```

**Extract to**:
```typescript
function categorizeMedia(media: any[]) {
  return {
    photos: media.filter(m => m.type?.startsWith('image')),
    videos: media.filter(m => m.type?.startsWith('video')),
    documents: media.filter(m => m.type?.includes('pdf') || m.type?.includes('document')),
    all: media
  }
}
```

**Savings**: Improved readability, reusability

## Component Breakdown

### Main Components (14 total):
1. **ProjectManagement** (main) - Lines 64-438
2. **CreateProjectForm** - Lines 441-617
3. **EditProjectForm** - Lines 620-705
4. **ProjectDetailsView** - Lines 708-790
5. **ProjectStorytellersTab** - Lines 793-932
6. **AddStorytellerForm** - Lines 935-1014
7. **ProjectStoriesTab** - Lines 1017-1301
8. **CreateStoryForm** - Lines 1304-1468
9. **EditStoryForm** - Lines 1471-1561
10. **ProjectMediaTab** - Lines 1564-1876
11. **MediaUploadForm** - Lines 1879-2031
12. **ProjectTranscriptsTab** - Lines 2034-2364
13. **CreateTranscriptForm** - Lines 2367-2577
14. **EditTranscriptForm** - Lines 2580-2708

## Estimated Savings Summary

| Refactoring | Current Lines | Refactored Lines | Reduction |
|-------------|---------------|------------------|-----------|
| Constants & Config | 0 | 120 | +120 (new) |
| StatCard Component | 400 | 50 | -350 (88%) |
| EmptyState Component | 200 | 30 | -170 (85%) |
| ActionButtons Component | 250 | 40 | -210 (84%) |
| Status Badge Functions | 90 | 30 | -60 (67%) |
| Form Update Patterns | 200 | 100 | -100 (50%) |
| Loading States | 120 | 40 | -80 (67%) |
| Select Options | 150 | 50 | -100 (67%) |
| **Total** | **2,708** | **~1,800** | **-908 (33%)** |

## Refactoring Strategy

### Phase 1: Foundation (Lines 1-200)
1. Add constants and configuration objects at top
2. Create utility functions section
3. Create reusable component primitives

### Phase 2: Main Component (Lines 200-650)
1. Refactor ProjectManagement to use new components
2. Simplify CreateProjectForm with helpers
3. Simplify EditProjectForm with helpers

### Phase 3: Tab Components (Lines 650-1,300)
1. Refactor ProjectStorytellersTab
2. Refactor ProjectStoriesTab
3. Apply StatCard and EmptyState components

### Phase 4: Remaining Tabs (Lines 1,300-2,708)
1. Refactor ProjectMediaTab
2. Refactor ProjectTranscriptsTab
3. Consolidate all form components

### Phase 5: Testing & Validation
1. Verify all functionality preserved
2. Check TypeScript types
3. Test all interactions
4. Ensure proper error handling

## Key Principles Applied

1. **DRY (Don't Repeat Yourself)**: Extracted all repeated patterns
2. **Single Responsibility**: Each component has one clear purpose
3. **Composition**: Small reusable components build larger features
4. **Configuration over Code**: Data-driven badge rendering, select options
5. **Helper Functions**: Complex calculations extracted to named functions
6. **Consistent Patterns**: All forms use same update pattern
7. **Type Safety**: Maintained explicit TypeScript types throughout

## Implementation Notes

- **100% Functionality Preservation**: All features work exactly as before
- **No Breaking Changes**: External API remains identical
- **Improved Maintainability**: Changes to status badges now happen in one place
- **Better Readability**: Complex inline expressions replaced with named functions
- **Easier Testing**: Isolated components are unit-testable
- **Future Extensibility**: New status types/options easy to add

## Next Steps

1. **Review this plan** with team
2. **Create feature branch** for refactoring
3. **Implement phase by phase** with testing after each
4. **Run full regression tests** before merge
5. **Update documentation** if needed

---

**Estimated Time**: 4-6 hours for complete refactoring
**Risk Level**: Low (purely structural, no logic changes)
**Benefit**: 33% code reduction, significantly improved maintainability

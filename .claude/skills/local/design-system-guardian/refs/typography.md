# Typography Standards

## Scale
| Token | Size | Use |
|-------|------|-----|
| `display-2xl` | 72px | Hero headlines |
| `display-xl` | 60px | Page titles |
| `display-lg` | 48px | Section headers |
| `heading-lg` | 30px | Card titles |
| `heading-md` | 24px | Subheadings |
| `body-lg` | 18px | Featured text |
| `body-md` | 16px | Body copy |
| `body-sm` | 14px | Captions |

## Font Families
- **Display/Headings**: Serif (elegant, editorial)
- **Body**: Sans-serif (readable, modern)
- **Mono**: Code/technical content

## Correct Usage
```tsx
<Typography variant="font-display" size="display-2xl">Headline</Typography>
<Typography variant="body-lg">Body text</Typography>
```

## Incorrect Usage
```tsx
// ❌ Missing design tokens
<h1 className="text-5xl font-bold">Headline</h1>
// ❌ Inline styles
<p style={{fontSize: '18px'}}>Body text</p>
```

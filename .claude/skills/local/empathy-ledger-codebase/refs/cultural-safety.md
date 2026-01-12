# Cultural Safety Guidelines

## Core Principles
1. **Consent-First**: Always require explicit consent
2. **Respectful Language**: "storyteller" not "user", "elder" with reverence
3. **Cultural Context**: Display territories, backgrounds
4. **Privacy Controls**: Granular sharing preferences
5. **Sacred Knowledge**: Mark and protect sensitive content

## Pre-Deploy Checklist
- [ ] Consent workflow tested
- [ ] Cultural background displayed respectfully
- [ ] Traditional territory acknowledged
- [ ] Elder status prominent
- [ ] Sensitive content marked
- [ ] Privacy controls granular
- [ ] No cultural appropriation
- [ ] Language respectful

## Database Schema
```sql
-- Cultural fields on stories
cultural_background TEXT,
traditional_territory TEXT,
languages_spoken TEXT[],
consent_given BOOLEAN DEFAULT false,
contains_sacred_knowledge BOOLEAN DEFAULT false,
cultural_sensitivity_level TEXT CHECK (
  level IN ('public', 'community', 'restricted', 'sacred')
)
```

## UI Pattern: Storyteller Card
```tsx
{storyteller.is_elder && <Badge variant="elder"><Crown /> Elder</Badge>}
<h3>{storyteller.display_name}</h3>
<div>
  <MapPin /> {storyteller.cultural_background}
  {storyteller.traditional_territory && ` (${territory})`}
</div>
{storyteller.knowledge_keeper && <Badge variant="sacred">Knowledge Keeper</Badge>}
```

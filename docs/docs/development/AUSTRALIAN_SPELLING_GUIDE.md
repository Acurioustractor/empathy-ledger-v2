# Australian Spelling Guide - Empathy Ledger v2

## Overview
This document establishes Australian English spelling conventions for the Empathy Ledger platform. All new code, documentation, and content should follow these standards.

## Key Spelling Conventions

### -ise endings (not -ize)
- ✅ `organise`, `organised`, `organising`, `organisation`
- ✅ `recognise`, `recognised`, `recognising`
- ✅ `realise`, `realised`, `realising`, `realisation`
- ✅ `analyse`, `analysed`, `analysing` (but `analysis` stays the same)
- ✅ `specialise`, `specialised`, `specialising`, `specialisation`
- ✅ `categorise`, `categorised`, `categorising`, `categorisation`

### -our endings (not -or)
- ✅ `colour`, `colours`, `coloured`, `colouring`
- ✅ `favour`, `favours`, `favoured`, `favouring`, `favourite`
- ✅ `honour`, `honours`, `honoured`, `honouring`
- ✅ `behaviour`, `behaviours`
- ✅ `labour`, `labours`
- ✅ `neighbour`, `neighbours`

### -re endings (not -er)
- ✅ `centre`, `centres`, `centred`, `centring`
- ✅ `theatre`, `theatres`
- ✅ `fibre`, `fibres`
- ✅ `metre`, `metres`
- ✅ `litre`, `litres`

### -ence endings (not -ense)
- ✅ `defence`, `defences`
- ✅ `licence` (noun), `license` (verb)
- ✅ `offence`, `offences`

### Other Common Differences
- ✅ `grey` (not `gray`)
- ✅ `cancelled`, `cancelling`
- ✅ `travelled`, `travelling`, `traveller`
- ✅ `modelled`, `modelling`
- ✅ `levelled`, `levelling`
- ✅ `counsellor`, `counsellors`
- ✅ `programme` (events/activities), `program` (computer code)
- ✅ `cheque` (bank payment), `check` (verify)
- ✅ `kerb` (street edge), `curb` (restrain)
- ✅ `tyre` (vehicle wheel), `tire` (become weary)

## Implementation Status

### ✅ Completed (December 2024)
- **Source Code**: 7,385 corrections applied across 429 files
- **Database Schema**: Updated table references (organisations, etc.)
- **API Endpoints**: All routes now use Australian spelling
- **Component Library**: UI components updated
- **Documentation**: This guide created

### Database Content
User-generated content in the database (bios, stories, etc.) has been left unchanged to preserve authentic voice and avoid unintended modifications.

## Development Guidelines

### For Developers
1. **New Code**: Always use Australian spelling in:
   - Variable names
   - Function names
   - Comments
   - Documentation
   - Error messages
   - UI text

2. **API Design**: Database table names and API endpoints use Australian spelling:
   - `/api/organisations` (not `/api/organizations`)
   - `organisations` table (not `organizations`)

3. **Content Creation**: When generating AI content or default text, use Australian spelling conventions.

### For Content
1. **Marketing Materials**: Use Australian spelling throughout
2. **User Interface**: All static text uses Australian conventions
3. **Error Messages**: System messages follow Australian standards
4. **Help Documentation**: User-facing docs use Australian spelling

## Code Examples

### ✅ Correct
```typescript
// API routes
app.get('/api/organisations', getOrganisations)

// Component names
const OrganisationSettings = () => { /* ... */ }

// Functions
function analyseContent(text: string) { /* ... */ }

// Database queries
.from('organisations')
.select('colour_scheme')

// Comments
// Analyse user behaviour patterns
// Centre the modal dialogue
```

### ❌ Incorrect
```typescript
// Don't use American spelling
app.get('/api/organizations', getOrganizations)
const OrganizationSettings = () => { /* ... */ }
function analyzeContent(text: string) { /* ... */ }
.from('organizations')
.select('color_scheme')
```

## Validation

### Automated Checking
- Use the `australian-spelling-audit.js` script to scan for inconsistencies
- Run `node australian-spelling-audit.js` periodically to identify new American spellings

### Manual Review
- Code reviews should check for Australian spelling compliance
- New API endpoints must follow naming conventions
- Documentation should be reviewed for consistency

## Exceptions

### Technical Terms
Some technical terms may retain American spelling when:
1. **Library Names**: Third-party library names (e.g., `react-router`, `color-picker`)
2. **Industry Standards**: Established technical terms (e.g., `synchronized` in tech contexts)
3. **External APIs**: When interfacing with American services that require specific spelling

### Example Exceptions
```typescript
// OK: Library/package names
import { ColorPicker } from 'react-color-picker'

// OK: CSS properties
style={{ backgroundColor: '#fff' }}

// OK: External API requirements
const response = await fetch('/api/third-party/organizations')
```

## Maintenance

This spelling guide should be:
1. **Updated** when new conventions are established
2. **Referenced** during code reviews
3. **Applied** to all new development
4. **Validated** using the audit script monthly

## Resources

- [Australian Government Style Manual](https://www.stylemanual.gov.au/)
- [Cambridge Dictionary (Australian English)](https://dictionary.cambridge.org/)
- [Macquarie Dictionary](https://www.macquariedictionary.com.au/)

---

*Last updated: December 2024*
*Next review: March 2025*
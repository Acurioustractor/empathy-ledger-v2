# Cultural Sensitivity Review

Perform a cultural sensitivity review of code or features for Empathy Ledger.

## Review Scope

Analyze the specified code/feature for:

1. **OCAP Compliance**
   - Ownership: Does the storyteller maintain ownership?
   - Control: Can they control access?
   - Access: Are permissions properly enforced?
   - Possession: Can data be exported/deleted?

2. **Sensitivity Handling**
   - Are sensitivity levels respected?
   - Is elder approval workflow correct?
   - Are sacred/restricted stories protected?

3. **Consent Management**
   - Is consent captured properly?
   - Can consent be withdrawn?
   - Does withdrawal cascade correctly?

4. **UI/UX Considerations**
   - Are cultural indicators respectful?
   - Is language inclusive?
   - Are trauma-informed design principles followed?

## Review Output

Provide:
1. **Compliance Summary**: Overall OCAP compliance status
2. **Issues Found**: List any violations or concerns
3. **Recommendations**: Specific fixes or improvements
4. **Code Changes**: If applicable, provide corrected code

## Reference

- See `.claude/agents/cultural-reviewer.md` for detailed guidance
- Check `src/lib/cultural-safety.ts` for protocol patterns
- Review `src/types/database/cultural-protocols.ts` for types

---

**Code/feature to review:** $ARGUMENTS

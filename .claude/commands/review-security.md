# Security Audit Review

Perform a security audit of code or API endpoints for Empathy Ledger.

## Audit Scope

Analyze the specified code for:

1. **Authentication**
   - Is auth check present?
   - Proper session handling?
   - Token refresh handled?

2. **Authorization**
   - Story ownership verified?
   - Tenant isolation enforced?
   - Role permissions checked?

3. **Input Validation**
   - All inputs validated?
   - SQL injection prevented?
   - XSS prevention in place?

4. **GDPR Compliance**
   - Data access rights implemented?
   - Deletion workflow available?
   - Audit logging complete?

5. **Consent & Revocation**
   - Consent verified before distribution?
   - Revocation cascades properly?
   - Webhooks notify external systems?

## Audit Output

Provide:
1. **Security Score**: Overall security assessment
2. **Vulnerabilities**: Any security issues found (critical/high/medium/low)
3. **GDPR Status**: Compliance assessment
4. **Recommendations**: Specific fixes required
5. **Corrected Code**: If applicable

## Reference

- See `.claude/agents/security-auditor.md` for patterns
- Check `src/lib/services/gdpr.service.ts` for GDPR operations
- Review `src/lib/services/audit.service.ts` for logging

---

**Code/endpoint to audit:** $ARGUMENTS

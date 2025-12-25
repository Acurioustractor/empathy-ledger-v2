# Empathy Ledger - System of Agents Practical Next Steps
**Purpose:** turn the “system of agents” approach into shippable capabilities, revenue levers, and guardrails for Empathy Ledger’s consent-first storytelling platform.

**Scope of this doc**
- Canonical agent recipes aligned to top customer jobs (revenue and trust outcomes)
- Evaluation sets and CI gates for empathy quality and safety
- Cost/latency telemetry plus per-tenant policy controls
- Pricing packaging with usage meters and two marketplace templates

---

## 1) Canonical Agent Recipes (deploy 5-7)
Each recipe is a reusable chain: planner → specialist agent(s) → governance checks → human-in-the-loop where required. The Ledger (story + transcript store with consent metadata) is the shared memory; Supabase RLS enforces tenant isolation.

1. **Consent & Intake Orchestrator**
   - Job: ingest transcripts, notes, and media; verify consent and cultural protocols; normalize into ledger records with lineage.
   - Inputs/outputs: raw files or text → normalized transcript segments, consent flags, PII tokens stored in vault, provenance record.
   - Tools/deps: Supabase storage, `ai_safety_logs`, consent metadata schema, PII tokenizer.
   - KPIs: intake SLA, percent with valid consent metadata, PII redaction accuracy, lineage coverage.
   - Guardrails: block writes without consent or jurisdiction match; require human approval for sensitive content classes.

2. **Churn / Relationship Interview Analyzer**
   - Job: extract themes, intents, and risk drivers from interviews; produce empathy scores and actionable root causes per tenant.
   - Inputs/outputs: transcript IDs → structured findings (top themes, emotion trajectory, risk triggers), empathy score, links back to quotes.
   - Tools/deps: embeddings store, `storyteller_analytics` tables, sentiment/emotion model, Org/Project context tables.
   - KPIs: time-to-insight, agreement with human labels, coverage of required themes, hallucination rate.
   - Guardrails: cite quotes with offsets; refuse speculative claims; respect tenant-level forbidden topics list.

3. **Escalation De-escalator**
   - Job: draft de-escalation responses and action plans for high-heat tickets or community concerns; keep tone culturally safe.
   - Inputs/outputs: ticket thread + profile context → draft response + bullet proof-of-empathy + checklist of follow-up actions.
   - Tools/deps: tone templates, jurisdiction policy map, notification channel connectors, refusal policies.
   - KPIs: human edit distance, CSAT/NPS delta post-response, turnaround time, policy violation rate.
   - Guardrails: mandatory human approval; block if consent missing; toxicity/PII filters before send.

4. **Empathy Insight Synthesizer**
   - Job: cluster themes across transcripts/stories, trend empathy scores over time, surface emerging needs.
   - Inputs/outputs: batch of transcript IDs → themes with support counts, exemplar quotes, empathy score deltas, visualization-ready data.
   - Tools/deps: analytics tables (`platform_analytics`, `storyteller_analytics`), clustering pipeline, caching layer.
   - KPIs: freshness (lag), cluster purity (manual audit), coverage across tenants, dashboard load time.
   - Guardrails: suppress clusters with low consent confidence; redact restricted quotes.

5. **Intervention Playbook Composer**
   - Job: generate tailored playbooks (messages, offers, actions) for segments such as churn risk, donor retention, or partner updates.
   - Inputs/outputs: segment definition + goals → playbook steps, message drafts, required approvals, cost envelope.
   - Tools/deps: template library, cost estimator, experiment runner, role-based approvals.
   - KPIs: activation rate, conversion or retention uplift, time-to-draft, budget adherence.
   - Guardrails: enforce “human-in-the-loop first” before scheduling sends; deny offers outside policy.

6. **Governance and Safety Sentinel**
   - Job: enforce PII handling, cultural protocol adherence, jurisdictional rules, and refusal logic across all agents.
   - Inputs/outputs: agent request/response → allow/deny with reason; audit entry in `ai_safety_logs`.
   - Tools/deps: policy engine, PII detector, jurisdiction map, audit log tables.
   - KPIs: false negative rate on PII, policy coverage, median decision latency.
   - Guardrails: fail-closed on uncertainty; escalate to human reviewer for ambiguous cases.

7. **Cost and SLO Steward**
   - Job: route to cheapest safe model, enforce budget per tenant/project, and track latency SLOs.
   - Inputs/outputs: agent request metadata → selected model/tier, cost estimate, circuit-break decisions, usage record.
   - Tools/deps: `ai_usage_events` table (proposed), model catalog with pricing, circuit breaker config.
   - KPIs: cost per successful run, percent within latency SLO, budget breach rate.
   - Guardrails: hard caps by tenant; auto-downgrade to lighter models when budgets are near limits.

---

## 2) Evaluation Sets and CI Gates (empathy + safety)
**Goal:** prevent regressions and prove quality to customers and compliance reviewers.

- **Datasets**
  - Gold empathy set: 200–400 exemplars of “good vs poor empathy” responses tied to real transcript snippets; label empathy score (0–5), safety flags, and required citations.
  - Safety set: PII, sensitive cultural content, jurisdictional constraints, and refusal-required prompts.
  - Canaries: fresh, unlabeled live samples per release to catch drift; rotate weekly.
  - Storage: versioned JSONL in `tests/evals/empathy/` with lineage to transcript IDs (no raw PII in repo), mirrored in a Supabase table with RLS.

- **Labeling protocol**
  - Dual annotation with adjudication; rubric for empathy (presence, specificity, tone, agency), safety (PII leakage, hallucination, consent mismatch).
  - Require quote references (story_id, segment index) in “good” answers; mark hallucinations explicitly.

- **Scoring and gates**
  - Metrics: empathy score mean, refusal accuracy, hallucination rate, citation coverage, latency p95.
  - CI: `npm run test:eval` runs offline model stub or recorded traces; block on empathy < target or hallucination rate > threshold; export junit for CI visibility.
  - Regression harness: snapshot key prompts per agent recipe; run on every prompt change or model swap; record cost and latency deltas.

---

## 3) Cost, Latency, and Policy Controls
**Goal:** make revenue predictable and compliant while protecting margins.**

- **Instrumentation (per request)**
  - Add middleware to agent/router layer to emit `ai_usage_events` rows: `id`, `tenant_id`, `agent_name`, `model`, `input_tokens`, `output_tokens`, `duration_ms`, `cost_usd_est`, `safety_status`, `consent_scope`, `created_at`.
  - Enforce RLS by tenant; expose views for billing (aggregated by period) and for ops (per request with redacted text).

- **Dashboards**
  - Admin view: cost and latency by agent, by tenant, and per recipe; SLO compliance; policy violation trends (join with `ai_safety_logs`).
  - Tenant view: usage vs budget, per-agent run counts, success vs blocked events, opt-in/opt-out toggles for models/features.
  - Alerting: budget thresholds (70/90/100%), latency SLO breach alerts, safety spike alerts.

- **Policy configuration**
  - Per-tenant config table: allowed models/endpoints, jurisdictions, PII classes to block, consent requirements, max cost per run, and whether auto-downgrade is allowed.
  - Planner uses config to route agents and to short-circuit if policy disallows a requested action.

---

## 4) Pricing, Meters, and Marketplace Templates
**Goal:** revenue-backed packaging that aligns with the agent system.**

- **Meters**
  - Per minute of analyzed audio/transcript.
  - Per agent run (successfully completed, excluding blocked attempts).
  - Storage/embedding footprint per tenant (rounded to GB).
  - Optional: per guided outreach sent (for Intervention Playbook).

- **Packages**
  - Core: fixed seats + monthly included minutes and agent runs; standard support; basic compliance.
  - Growth: higher limits, Empathy Insight Synthesizer, Intervention Playbook Composer, and cost dashboards.
  - Enterprise: private model endpoints, custom jurisdictions, premium compliance pack (audits, DPA), SLAs, and dedicated eval sets.
  - Add-ons: Compliance Pack (HIPAA/GDPR/OCAP reporting), Enterprise Guard (private VPC or on-prem vector store), Velocity (priority inference and lower latency SLOs).

- **Marketplace-ready templates to test willingness to pay**
  1. **Churn Interview Analyzer**: intake → empathy/risk analysis → themed insights + de-escalation draft; priced per interview minute + per finalized report.
  2. **Escalation De-escalator**: ingest ticket thread → empathy-safe response draft + action checklist; priced per drafted response with monthly minimum.

- **Billing plumbing**
  - Use `ai_usage_events` aggregated nightly into `partner_analytics_daily`-style tables for invoicing and dashboards.
  - Expose `/admin/analytics/ai-usage` API for backoffice and `/api/tenant/usage` for tenant dashboards.

---

## 5) Implementation Status

The following infrastructure has been built:

- ✅ `ai_usage_events` schema with RLS (see `supabase/migrations/20251212_ai_usage_events.sql`)
- ✅ `tenant_ai_policies` for per-tenant budget/model controls
- ✅ `ai_agent_registry` with 7 agent configurations
- ✅ Agent orchestrator with cultural safety integration (see `src/lib/ai/agents/`)
- ✅ Eval thresholds for empathy and safety gates (see `src/lib/ai/evals/thresholds.ts`)
- ✅ Architecture documentation (see `docs/architecture/agent-orchestration.md`)

**Next steps:**
- Build gold empathy and safety eval datasets (≥50 examples each)
- Add `npm run test:eval` to CI pipeline
- Surface cost/latency metrics in admin dashboard
- Wire marketplace templates to the orchestrator


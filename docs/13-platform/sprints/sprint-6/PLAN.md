# Sprint 6: Analytics & SROI - Implementation Plan

**Status**: Ready to Build
**Date**: January 5, 2026
**Estimated Time**: 6-8 hours
**Priority**: P1 (Critical for funders)

---

## 🎯 Sprint Mission

Enable organizations to measure impact, demonstrate Social Return on Investment (SROI), and generate funder-ready reports with cultural integrity.

---

## 📋 COMPONENTS TO BUILD (18 total)

### Phase 1: Organization Analytics Dashboard (5 components)

1. **OrganizationAnalyticsDashboard.tsx** (~400 lines)
   - Main dashboard container
   - Time period selector (month/quarter/year/all-time)
   - Organization selector (for multi-org users)
   - Key metrics overview (stories, storytellers, engagement, reach)
   - Quick insights cards

2. **MetricsOverview.tsx** (~250 lines)
   - Total stories published
   - Total storytellers active
   - Total engagement (views, shares, comments)
   - Total reach (unique visitors)
   - Trend indicators (up/down from previous period)

3. **EngagementMetrics.tsx** (~300 lines)
   - Views over time (line chart)
   - Shares by platform (bar chart)
   - Comments and interactions
   - Top performing stories
   - Engagement rate calculation

4. **StorytellerMetrics.tsx** (~250 lines)
   - Active storytellers count
   - New storytellers this period
   - Stories per storyteller
   - Storyteller retention rate
   - Top contributors

5. **DemographicsBreakdown.tsx** (~300 lines)
   - Age distribution
   - Gender distribution
   - Cultural groups represented
   - Geographic distribution
   - Language diversity

---

### Phase 2: SROI Calculator (4 components)

6. **SROICalculator.tsx** (~500 lines)
   - Investment input (funding, time, resources)
   - Outcomes selection (stories collected, storytellers engaged, community reach)
   - Value assignment (cultural preservation, identity strengthening, intergenerational connection)
   - SROI ratio calculation
   - Narrative summary generation

7. **InvestmentInput.tsx** (~250 lines)
   - Monetary investment fields
   - In-kind contributions
   - Volunteer hours
   - Partner contributions
   - Total investment calculation

8. **OutcomesSelector.tsx** (~350 lines)
   - Direct outcomes (stories, storytellers, events)
   - Indirect outcomes (community connections, skills developed)
   - Cultural outcomes (protocols honored, languages preserved)
   - Deadweight adjustment (what would have happened anyway)
   - Attribution (% due to this project)

9. **ValueAssignment.tsx** (~400 lines)
   - Financial proxies for outcomes
   - Cultural value indicators
   - Social value calculations
   - Environmental value (if applicable)
   - Total social value calculation
   - SROI ratio display (value/investment)

---

### Phase 3: Custom Report Builder (4 components)

10. **ReportBuilder.tsx** (~450 lines)
    - Report template selector (funder, annual, impact, cultural)
    - Section customizer (drag-and-drop)
    - Data selector (which metrics to include)
    - Time period selector
    - Preview mode
    - Export to PDF/CSV

11. **ReportTemplates.tsx** (~300 lines)
    - Funder report template
    - Annual impact report template
    - Cultural preservation report template
    - Storyteller appreciation report template
    - Community outcomes report template

12. **DataVisualizer.tsx** (~400 lines)
    - Chart type selector (bar, line, pie, donut, area)
    - Data series selector
    - Color scheme selector (cultural palette)
    - Chart preview
    - Export chart as image

13. **ReportExporter.tsx** (~300 lines)
    - PDF generation with branding
    - CSV data export
    - Excel export (multi-sheet)
    - Email report dialog
    - Schedule recurring reports

---

### Phase 4: Impact Visualization (3 components)

14. **ImpactTimeline.tsx** (~350 lines)
    - Visual timeline of project milestones
    - Story publication events
    - Storyteller recruitment events
    - Community events
    - Elder review approvals
    - Zoom controls (month/quarter/year)

15. **ThemeNetwork.tsx** (~400 lines)
    - Network graph of story themes
    - Node size = number of stories
    - Connections = shared themes
    - Interactive exploration
    - Filter by cultural group

16. **GeographicMap.tsx** (~450 lines)
    - Interactive map of story locations
    - Territory boundaries
    - Storyteller locations
    - Story count heatmap
    - Cultural group overlays
    - Zoom and pan controls

---

### Phase 5: Funder Reporting (2 components)

17. **FunderDashboard.tsx** (~350 lines)
    - Funder-specific view (read-only)
    - Key metrics aligned to grant objectives
    - Progress against milestones
    - Success stories highlights
    - Next reporting period countdown

18. **MilestoneTracker.tsx** (~300 lines)
    - Grant milestones list
    - Progress indicators
    - Completion percentage
    - Evidence documentation upload
    - Funder comments/feedback

---

## 🔧 API ENDPOINTS NEEDED (12 total)

### Organization Analytics (4 endpoints)

1. **GET /api/analytics/organization/[orgId]/overview**
   - Returns: metrics overview (stories, storytellers, engagement, reach)
   - Query params: period (month/quarter/year/all-time)

2. **GET /api/analytics/organization/[orgId]/engagement**
   - Returns: views, shares, comments over time
   - Query params: period, granularity (day/week/month)

3. **GET /api/analytics/organization/[orgId]/storytellers**
   - Returns: active count, new count, retention, top contributors
   - Query params: period

4. **GET /api/analytics/organization/[orgId]/demographics**
   - Returns: age, gender, cultural groups, locations, languages
   - Query params: period

---

### SROI Calculator (3 endpoints)

5. **POST /api/sroi/calculate**
   - Body: investment data, outcomes data, value assignments
   - Returns: SROI ratio, total social value, narrative summary

6. **GET /api/sroi/templates**
   - Returns: SROI calculation templates (cultural preservation, identity, connection)

7. **POST /api/sroi/save**
   - Body: SROI calculation data
   - Returns: saved calculation ID
   - Saves to database for future reference

---

### Report Builder (3 endpoints)

8. **GET /api/reports/templates**
   - Returns: available report templates (funder, annual, impact, cultural)

9. **POST /api/reports/generate**
   - Body: template ID, data selections, customizations
   - Returns: report data structure

10. **POST /api/reports/export**
    - Body: report data, format (pdf/csv/excel)
    - Returns: file URL or stream

---

### Impact Visualization (2 endpoints)

11. **GET /api/analytics/organization/[orgId]/timeline**
    - Returns: timeline events (milestones, publications, recruitments)
    - Query params: start_date, end_date

12. **GET /api/analytics/organization/[orgId]/theme-network**
    - Returns: theme nodes and connections
    - Query params: period, min_stories (threshold)

---

## 🗄️ DATABASE SCHEMA ADDITIONS

### New Tables (3)

```sql
-- SROI Calculations
CREATE TABLE sroi_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  organization_id UUID REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Investment
  monetary_investment NUMERIC(12,2) DEFAULT 0,
  in_kind_value NUMERIC(12,2) DEFAULT 0,
  volunteer_hours_value NUMERIC(12,2) DEFAULT 0,
  total_investment NUMERIC(12,2) GENERATED ALWAYS AS (
    monetary_investment + in_kind_value + volunteer_hours_value
  ) STORED,

  -- Outcomes
  outcomes JSONB DEFAULT '{}', -- structured outcome data

  -- Values
  total_social_value NUMERIC(12,2) DEFAULT 0,
  sroi_ratio NUMERIC(8,2) GENERATED ALWAYS AS (
    CASE WHEN total_investment > 0
      THEN total_social_value / total_investment
      ELSE 0
    END
  ) STORED,

  -- Metadata
  methodology TEXT, -- SROI, CBA, CEA
  narrative_summary TEXT,
  created_by UUID REFERENCES profiles(id)
);

-- Saved Reports
CREATE TABLE saved_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  organization_id UUID REFERENCES organizations(id),
  report_type TEXT NOT NULL, -- funder, annual, impact, cultural
  title TEXT NOT NULL,
  period_start DATE,
  period_end DATE,

  -- Report data
  report_data JSONB DEFAULT '{}',

  -- Export history
  last_exported_at TIMESTAMPTZ,
  export_count INTEGER DEFAULT 0,

  -- Scheduling
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT, -- monthly, quarterly, annually
  next_scheduled_date DATE,

  created_by UUID REFERENCES profiles(id)
);

-- Funder Milestones
CREATE TABLE funder_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  organization_id UUID REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),

  -- Milestone details
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  completion_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),

  -- Progress
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),

  -- Evidence
  evidence_urls TEXT[],
  notes TEXT,

  -- Funder info
  funder_name TEXT,
  grant_reference TEXT,

  created_by UUID REFERENCES profiles(id)
);
```

---

## 🎨 DESIGN SYSTEM

### Cultural Analytics Palette
- **Impact Green** (#6B8E72) - Positive metrics, growth
- **Trust Blue** (#4A90A4) - Data, information, charts
- **Warmth Amber** (#D4A373) - Highlights, important metrics
- **Cultural Clay** (#D97757) - Cultural outcomes
- **Wisdom Purple** (#8B7FB8) - SROI, value indicators

### Chart Types
- **Line charts**: Trends over time (engagement, growth)
- **Bar charts**: Comparisons (themes, demographics)
- **Pie charts**: Distribution (cultural groups, languages)
- **Network graphs**: Relationships (theme networks)
- **Maps**: Geographic distribution
- **Timeline**: Events and milestones

---

## 📊 SROI METHODOLOGY

### Standard SROI Framework

**Formula**: SROI Ratio = Total Social Value / Total Investment

**Steps**:
1. **Identify stakeholders**: Storytellers, community, funders
2. **Map outcomes**: What changed? (stories, connections, cultural preservation)
3. **Evidence outcomes**: Quantify what changed
4. **Value outcomes**: Assign financial proxies or cultural values
5. **Establish impact**: Deadweight, attribution, drop-off
6. **Calculate SROI**: Total value / Total investment
7. **Report**: Narrative summary with ratio

### Cultural Values Framework

**Indigenous-specific outcomes**:
- **Cultural Preservation**: Languages recorded, protocols documented
- **Identity Strengthening**: Stories shared, connections made
- **Intergenerational Connection**: Elders engaged, youth participation
- **Community Cohesion**: Events held, networks built
- **Healing**: Trauma addressed, resilience supported

**Value Proxies** (conservative estimates):
- Story preserved: $500 (archival value)
- Language documented: $2,000 (preservation value)
- Elder engagement: $150/hour (knowledge transfer value)
- Intergenerational connection: $300 (social capital value)
- Community event: $1,000 (cohesion value)

---

## 🧪 TESTING PLAN

### Sprint 6 Test Page
- `/test/sprint-6/analytics` - Organization analytics
- `/test/sprint-6/sroi` - SROI calculator
- `/test/sprint-6/reports` - Report builder
- `/test/sprint-6/visualization` - Impact visualizations

### Test Scenarios
1. **Organization Analytics**:
   - [ ] Load metrics for organization
   - [ ] Filter by time period
   - [ ] View engagement trends
   - [ ] Check storyteller metrics
   - [ ] Review demographics

2. **SROI Calculator**:
   - [ ] Input investment data
   - [ ] Select outcomes
   - [ ] Assign values
   - [ ] Calculate SROI ratio
   - [ ] Generate narrative summary

3. **Report Builder**:
   - [ ] Select template
   - [ ] Customize sections
   - [ ] Preview report
   - [ ] Export to PDF
   - [ ] Schedule recurring report

4. **Impact Visualization**:
   - [ ] View timeline
   - [ ] Explore theme network
   - [ ] Navigate geographic map
   - [ ] Filter by cultural group

---

## ✅ SUCCESS CRITERIA

### Functionality
- [ ] Organization can view comprehensive analytics
- [ ] SROI calculator produces accurate ratios
- [ ] Custom reports can be built and exported
- [ ] Impact visualizations are interactive
- [ ] Funder dashboard displays grant progress

### Cultural Integrity
- [ ] SROI values cultural outcomes appropriately
- [ ] Reports honor storyteller privacy
- [ ] Analytics respect cultural protocols
- [ ] Visualizations don't exploit stories for metrics

### User Experience
- [ ] Dashboards load in < 3 seconds
- [ ] Charts are interactive and clear
- [ ] PDF exports are professional quality
- [ ] SROI calculator is easy to use

---

## 📈 EXPECTED IMPACT

**For Organizations**:
- Demonstrate impact to funders
- Make data-driven decisions
- Celebrate storyteller contributions
- Track cultural preservation outcomes

**For Funders**:
- Clear ROI visualization
- Milestone tracking
- Professional reports
- Transparent impact measurement

**For Platform**:
- Differentiate from competitors
- Enable sustainability (funder reporting)
- Validate cultural approach (SROI for cultural outcomes)
- Build funder confidence

---

## 🚀 IMPLEMENTATION ORDER

### Phase 1: Organization Analytics (2-3 hours)
Build dashboard with metrics, engagement, storyteller, and demographic views.

### Phase 2: SROI Calculator (2 hours)
Create calculator with investment, outcomes, and value assignment.

### Phase 3: Report Builder (1.5 hours)
Enable custom report creation with templates and export.

### Phase 4: Impact Visualization (1.5 hours)
Add timeline, theme network, and geographic map.

### Phase 5: APIs & Database (1 hour)
Create all endpoints and database migrations.

**Total Estimated: 8 hours**

---

**Ready to begin Sprint 6: Analytics & SROI!** 🚀

*"We measure impact not to extract value, but to honor the gift of stories shared."*

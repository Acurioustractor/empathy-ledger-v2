-- Cleanup: Deactivate timeline entries, events, and infrastructure
-- Keep only actual ACT projects with Notion database entries

-- Deactivate timeline entries and events (NOT actual projects)
UPDATE act_projects SET is_active = FALSE WHERE slug IN (
  'naidoc-week-mount-isa',        -- Event
  'pakkinjalki-kari',              -- Product instance
  'diagrama-spain',                -- Trip/learning journey
  'bg-fit-mount-isa',              -- Local instance (keep generic bg-fit)
  'bupa-tfn-pitch',                -- Event
  'green-harvest-witta',           -- Location/instance
  'westpac-summit-2025',           -- Event
  'goods-tennant-creek',           -- Trip
  'weave-bed-tennant-creek',       -- Product
  'picc-elders-hull-river',        -- Trip
  'goods-on-country'               -- Deployment instance (keep generic goods)
);

-- Deactivate infrastructure/organizations (NOT projects)
UPDATE act_projects SET is_active = FALSE WHERE slug IN (
  'act-farm',                      -- Organization (has sub-projects like junes-patch)
  'place-based-policy-lab',        -- Internal R&D
  'local-seasonal-supply'          -- Service within ACT Farm
);

-- Summary: Projects remaining active (25 actual projects)
COMMENT ON TABLE act_projects IS 'Cleaned up to show only actual ACT projects. Deactivated: 11 timeline/event entries and 3 infrastructure items. 25 active projects remain.';

-- List of active projects after cleanup:
-- 1. Empathy Ledger
-- 2. JusticeHub
-- 3. Goods. (generic program)
-- 4. BG Fit (generic program)
-- 5. The Harvest
-- 6. CONTAINED
-- 7. TOMNET
-- 8. June's Patch
-- 9. Fishers Oysters
-- 10. Oonchiumpa
-- 11. Gold.Phone
-- 12. The Confessional
-- 13. Uncle Allan Palm Island Art
-- 14. PICC Centre Precinct
-- 15. PICC Photo Kiosk
-- 16. PICC Annual Report
-- 17. SMART Recovery GP Kits
-- 18. SMART HCP GP Uplift
-- 19. SMART Connect
-- 20. Mounty Yarns
-- 21. Caring for Those Who Care
-- 22. Regional Arts Fellowship
-- 23. Quandamooka Justice Strategy
-- 24. Dad.Lab.25
-- 25. Designing for Obsolescence
-- 26. Global Laundry Alliance

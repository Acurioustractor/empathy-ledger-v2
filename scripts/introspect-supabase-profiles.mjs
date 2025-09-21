#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load env from .env.local without printing secrets
const envPath = path.resolve('.env.local')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
} else {
  dotenv.config()
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !serviceKey) {
  console.error('[INTROSPECT] Missing Supabase env. Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(2)
}

const supabase = createClient(url, serviceKey)

const usedFields = [
  'id',
  'email',
  'full_name',
  'display_name',
  'bio',
  'avatar_url',
  'profile_image_url',
  'cultural_background',
  'pronouns',
  'community_roles',
  'tenant_roles',
  'tenant_id',
  'profile_visibility',
  'cultural_sensitivity_level',
  'is_storyteller',
  'is_elder',
  'is_admin',
  'is_super_admin',
]

function summarizePresence(row) {
  const present = []
  const missing = []
  const keys = row ? Object.keys(row) : []
  for (const f of usedFields) {
    if (keys.includes(f)) present.push(f)
    else missing.push(f)
  }
  return { present, missing, keys }
}

;(async () => {
  try {
    // Try to fetch a sample row
    const { data: sampleRows, error: sampleErr } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (sampleErr) {
      console.error('[INTROSPECT] Error selecting profiles:', sampleErr)
    }

    const sample = sampleRows?.[0] || null
    const presence = summarizePresence(sample)

    // Count total rows (head)
    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })

    // Quick checks for related tables we rely on
    const quickCheck = {}
    for (const table of ['stories', 'transcripts', 'organization_members', 'storytellers']) {
      try {
        const { error } = await supabase
          .from(table)
          .select('id', { head: true, count: 'exact' })
        quickCheck[table] = error ? { ok: false, error: error.message } : { ok: true }
      } catch (e) {
        quickCheck[table] = { ok: false, error: String(e) }
      }
    }

    // Transcripts sample
    const { data: tRows, error: tErr } = await supabase.from('transcripts').select('*').limit(1)
    const tSample = tRows?.[0] || null
    const tKeys = tSample ? Object.keys(tSample) : []
    const { count: tCount } = await supabase.from('transcripts').select('id', { count: 'exact', head: true })

    // Stories sample
    const { data: sRows, error: sErr } = await supabase.from('stories').select('*').limit(1)
    const sSample = sRows?.[0] || null
    const sKeys = sSample ? Object.keys(sSample) : []
    const { count: sCount } = await supabase.from('stories').select('id', { count: 'exact', head: true })

    const report = {
      endpoint: url,
      profiles: {
        total: count ?? null,
        samplePresentKeys: presence.keys,
        presentUsedFields: presence.present,
        missingUsedFields: presence.missing,
        samplePreview: sample ? Object.fromEntries(Object.entries(sample).slice(0, 10)) : null,
      },
      transcripts: {
        total: tCount ?? null,
        sampleKeys: tKeys,
        samplePreview: tSample ? Object.fromEntries(Object.entries(tSample).slice(0, 10)) : null,
      },
      stories: {
        total: sCount ?? null,
        sampleKeys: sKeys,
        samplePreview: sSample ? Object.fromEntries(Object.entries(sSample).slice(0, 10)) : null,
      },
      relatedTables: quickCheck,
      usedFields,
      usedByCodeExamples: {
        storytellersDashboard: ['full_name', 'display_name', 'bio', 'avatar_url'],
        orgStorytellers: ['tenant_id', 'is_storyteller'],
        adminUsers: ['profile_image_url', 'is_super_admin', 'is_admin'],
      },
      notes: [
        'If fields are missing, we should align code to actual schema or add columns/mappings.',
        'For avatar, code references avatar_url and profile_image_url; verify which one exists.',
        'tenant_id/tenant_roles are used in org routes; confirm presence for access checks.',
      ],
    }

    console.log(JSON.stringify(report, null, 2))
  } catch (e) {
    console.error('[INTROSPECT] Unexpected error:', e)
    process.exit(1)
  }
})()

/**
 * Sprint 1 Test Profile Seeder
 *
 * Creates 5 sample storyteller profiles for Sprint 1 integration testing
 * Each profile represents a different user persona with varying privacy/ALMA settings
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Test profiles based on Sprint 1 Integration Test Plan
const testProfiles = [
  {
    id: 'test-elder-grace',
    email: 'elder.grace.test@empathy-ledger.test',
    full_name: 'Elder Grace',
    display_name: 'Elder Grace',
    bio: 'Knowledge Keeper and Elder from Anishinaabe Nation. Protecting sacred knowledge for future generations.',
    age: 68,
    role: 'Elder & Knowledge Keeper',
    cultural_background: 'Anishinaabe',
    // Privacy Settings
    default_story_visibility: 'private',
    contact_permissions: ['verified_community_members'],
    data_sovereignty_preferences: {
      export_enabled: true,
      deletion_requests_allowed: true,
      third_party_sharing: false,
    },
    // ALMA Settings
    consent_preferences: {
      themeExtraction: false,
      networkDiscovery: false,
      impactAnalytics: false,
      voiceAnalysis: false,
    },
    cultural_permissions: {
      sacred_knowledge: {
        protectionEnabled: true,
        defaultProtection: 'strict',
        autoDetect: false,
      },
      elder_review: {
        autoRouteToElders: true,
        reviewTrigger: 'always',
        notificationFrequency: 'immediate',
      },
      cultural_safety: {
        enableContentWarnings: true,
        enableCulturalProtocols: true,
        protocolNotes: 'All stories contain sacred knowledge requiring Elder review. Gender-specific protocols apply: women\'s stories should only be reviewed by women Elders.',
        notifyOnSensitiveContent: true,
      },
    },
  },
  {
    id: 'test-marcus',
    email: 'marcus.test@empathy-ledger.test',
    full_name: 'Marcus Thompson',
    display_name: 'Marcus',
    bio: 'Community advocate passionate about data sovereignty and Indigenous rights.',
    age: 32,
    role: 'Community Advocate',
    cultural_background: 'Torres Strait Islander',
    // Privacy Settings
    default_story_visibility: 'community',
    contact_permissions: ['verified_users', 'community_members'],
    data_sovereignty_preferences: {
      export_enabled: true,
      deletion_requests_allowed: true,
      third_party_sharing: false,
      data_retention_period: '7_years',
    },
    // ALMA Settings
    consent_preferences: {
      themeExtraction: true,
      networkDiscovery: false,
      impactAnalytics: false,
      voiceAnalysis: false,
    },
    cultural_permissions: {
      sacred_knowledge: {
        protectionEnabled: true,
        defaultProtection: 'moderate',
        autoDetect: true,
      },
      elder_review: {
        autoRouteToElders: true,
        reviewTrigger: 'sacred-only',
        notificationFrequency: 'daily',
      },
      cultural_safety: {
        enableContentWarnings: true,
        enableCulturalProtocols: true,
        protocolNotes: 'Community stories should be accessible to all community members. Sensitive topics require content warnings.',
        notifyOnSensitiveContent: true,
      },
    },
  },
  {
    id: 'test-sarah',
    email: 'sarah.test@empathy-ledger.test',
    full_name: 'Sarah Williams',
    display_name: 'Sarah',
    bio: 'Youth storyteller sharing our culture with the world through modern media.',
    age: 24,
    role: 'Youth Storyteller',
    cultural_background: 'Māori',
    // Privacy Settings
    default_story_visibility: 'public',
    contact_permissions: ['anyone'],
    data_sovereignty_preferences: {
      export_enabled: true,
      deletion_requests_allowed: true,
      third_party_sharing: true,
    },
    // ALMA Settings - Tech-savvy, all features enabled
    consent_preferences: {
      themeExtraction: true,
      networkDiscovery: true,
      impactAnalytics: true,
      voiceAnalysis: true,
    },
    cultural_permissions: {
      sacred_knowledge: {
        protectionEnabled: true,
        defaultProtection: 'moderate',
        autoDetect: true,
      },
      elder_review: {
        autoRouteToElders: false,
        reviewTrigger: 'manual',
        notificationFrequency: 'weekly',
      },
      cultural_safety: {
        enableContentWarnings: true,
        enableCulturalProtocols: false,
        protocolNotes: '',
        notifyOnSensitiveContent: true,
      },
    },
  },
  {
    id: 'test-david',
    email: 'david.test@empathy-ledger.test',
    full_name: 'David Yunupingu',
    display_name: 'David',
    bio: 'Traditional storyteller keeping our language and customs alive.',
    age: 45,
    role: 'Traditional Storyteller',
    cultural_background: 'Yolŋu',
    // Privacy Settings - Default/minimal configuration
    default_story_visibility: 'community',
    contact_permissions: ['verified_community_members'],
    data_sovereignty_preferences: {
      export_enabled: true,
      deletion_requests_allowed: true,
      third_party_sharing: false,
    },
    // ALMA Settings - All disabled
    consent_preferences: {
      themeExtraction: false,
      networkDiscovery: false,
      impactAnalytics: false,
      voiceAnalysis: false,
    },
    cultural_permissions: {
      sacred_knowledge: {
        protectionEnabled: false,
        defaultProtection: 'none',
        autoDetect: false,
      },
      elder_review: {
        autoRouteToElders: false,
        reviewTrigger: 'manual',
        notificationFrequency: 'weekly',
      },
      cultural_safety: {
        enableContentWarnings: false,
        enableCulturalProtocols: false,
        protocolNotes: '',
        notifyOnSensitiveContent: false,
      },
    },
  },
  {
    id: 'test-kim',
    email: 'kim.test@empathy-ledger.test',
    full_name: 'Kim Daniels',
    display_name: 'Kim',
    bio: 'Cultural program manager working to preserve and share our stories with respect and protocol.',
    age: 38,
    role: 'Cultural Program Manager',
    cultural_background: 'Cree',
    // Privacy Settings
    default_story_visibility: 'community',
    contact_permissions: ['verified_users', 'community_members', 'organization_members'],
    data_sovereignty_preferences: {
      export_enabled: true,
      deletion_requests_allowed: true,
      third_party_sharing: false,
    },
    // ALMA Settings - Selective AI, strong cultural protocols
    consent_preferences: {
      themeExtraction: true,
      networkDiscovery: false,
      impactAnalytics: true,
      voiceAnalysis: false,
    },
    cultural_permissions: {
      sacred_knowledge: {
        protectionEnabled: true,
        defaultProtection: 'moderate',
        autoDetect: true,
      },
      elder_review: {
        autoRouteToElders: true,
        reviewTrigger: 'always',
        notificationFrequency: 'daily',
      },
      cultural_safety: {
        enableContentWarnings: true,
        enableCulturalProtocols: true,
        protocolNotes: 'Clan-specific protocols:\n- Bear Clan stories require Bear Clan Elder approval\n- Ceremonial stories are restricted to initiated members\n- Language revitalization stories should be shared publicly\n- Seasonal stories follow traditional calendar (only shared in appropriate seasons)',
        notifyOnSensitiveContent: true,
      },
    },
  },
]

async function seedTestProfiles() {
  console.log('🌱 Seeding Sprint 1 test profiles...\n')

  for (const profile of testProfiles) {
    console.log(`Creating profile: ${profile.display_name} (${profile.role})`)

    try {
      // Insert profile
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          display_name: profile.display_name,
          bio: profile.bio,
          cultural_background: profile.cultural_background,
          default_story_visibility: profile.default_story_visibility,
          contact_permissions: profile.contact_permissions,
          data_sovereignty_preferences: profile.data_sovereignty_preferences,
          consent_preferences: profile.consent_preferences,
          cultural_permissions: profile.cultural_permissions,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) {
        console.error(`  ❌ Error creating ${profile.display_name}:`, error.message)
      } else {
        console.log(`  ✅ ${profile.display_name} created successfully`)

        // Log configuration summary
        console.log(`     Privacy: ${profile.default_story_visibility}`)
        console.log(`     AI Consent: ${Object.values(profile.consent_preferences).filter(Boolean).length}/4 enabled`)
        console.log(`     Sacred Protection: ${profile.cultural_permissions.sacred_knowledge.defaultProtection}`)
        console.log(`     Elder Review: ${profile.cultural_permissions.elder_review.reviewTrigger}`)
      }
    } catch (err) {
      console.error(`  ❌ Exception creating ${profile.display_name}:`, err)
    }

    console.log('')
  }

  console.log('✅ Test profile seeding complete!\n')
  console.log('Test Profile IDs:')
  testProfiles.forEach(p => {
    console.log(`  - ${p.display_name}: ${p.id}`)
  })
}

seedTestProfiles()
  .then(() => {
    console.log('\n✅ Sprint 1 test profiles ready for UAT!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error seeding test profiles:', error)
    process.exit(1)
  })

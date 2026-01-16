/**
 * Setup ACT Projects
 *
 * Creates all ACT Farm projects and links them to the ACT organization.
 * Existing projects will be updated to point to ACT org.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ACT_ORG_ID = 'db0de7bd-eb10-446b-99e9-0f3b7c199b8a';
const ACT_TENANT_ID = '5f1314c1-ffe9-4d8f-944b-6cdf02d4b943';

// All ACT Farm projects with detailed descriptions from ACT knowledge base
const ACT_PROJECTS = [
  {
    name: 'BG Fit',
    description: 'Fitness and wellness program delivering culturally-grounded health support. Combines physical activity with community connection, targeting improved wellbeing outcomes for participants through holistic, relationship-based engagement.'
  },
  {
    name: 'Caring for Those Who Care',
    description: 'Support program for carers providing respite, connection, and recognition for those who care for family members and community. Addresses burnout and isolation through peer support and practical assistance.'
  },
  {
    name: 'CONTAINED',
    description: 'Three-container experiential justice installation exploring what detention actually looks and feels like—and what could be different. Art as methodology for shifting consciousness about youth justice alternatives.'
  },
  {
    name: 'Dad.Lab.25',
    description: 'Fatherhood support and engagement program creating safe spaces for dads to connect, learn, and grow. Focuses on strengthening father-child relationships through practical workshops and peer support networks.'
  },
  {
    name: 'Designing for Obsolescence',
    description: 'Every project asks: "How does this make ACT unnecessary?" Building sustainable, self-sufficient community systems with sunset clauses, capacity transfer, and handover plans from day one. Our success is measured by our obsolescence.'
  },
  {
    name: 'Empathy Ledger',
    description: 'Your story, your power, your profit. Ethical storytelling platform where communities retain control over narratives and share in value created. Multi-tenant architecture with consent-gated sharing, cultural protocol enforcement, and OCAP principles baked into architecture.'
  },
  {
    name: 'Fishers Oysters',
    description: 'Indigenous oyster farming enterprise combining traditional aquaculture knowledge with sustainable commercial practices. Community-owned operation building economic sovereignty through connection to sea country.'
  },
  {
    name: 'Global Laundry Alliance',
    description: 'International network connecting mobile laundry services worldwide. Sharing knowledge, resources, and best practices to scale dignified access to clean clothes and genuine human connection globally.'
  },
  {
    name: 'Gold.Phone',
    description: 'Hacked vintage payphone randomly connecting strangers globally. Thousands of authentic conversations become living archive proving intimacy is possible across difference. Art as methodology for exploring connection.'
  },
  {
    name: 'Goods on Country',
    description: 'Your waste, your wealth. Circular-economy venture co-designing essential products (beds, mattresses, washing machines) for remote communities while converting local waste into manufacturing inputs. 40% profit-sharing to source communities.'
  },
  {
    name: 'Goods.',
    description: 'Mobile laundry and essential services bringing dignity to people experiencing homelessness. Free showers, laundry, and genuine conversation. Built on the Orange Sky model with community-centered design.'
  },
  {
    name: 'Green Harvest Witta',
    description: 'Sustainable agriculture initiative at Witta cultivating regenerative food systems. Combines permaculture principles with community food security, creating pathways to local food sovereignty.'
  },
  {
    name: 'Junes Patch',
    description: 'Community garden honoring June\'s legacy of growing food and connection. Food security meets therapeutic horticulture, with seasonal programs bringing people together through shared cultivation and harvest.'
  },
  {
    name: 'JusticeHub',
    description: 'Justice by the community, for the community. Open-source justice network where grassroots programs can fork proven models, access AI-generated insights, and co-create culturally aligned governance. 58% recidivism reduction through community programs.'
  },
  {
    name: 'Mounty Yarns',
    description: 'Storytelling and oral history project capturing community voices and preserving local memory. Stories as evidence, narrative as methodology, memory as resistance to erasure.'
  },
  {
    name: 'Oonchiumpa',
    description: 'Intensive, culturally-grounded support for young people navigating crisis in the Northern Territory. 24/7 wraparound support addressing the whole person with cultural reconnection at the center. 72% return to education rate.'
  },
  {
    name: 'PICC Annual Report',
    description: 'Palm Island Community Company annual impact documentation capturing community voice, program outcomes, and organizational learning. Storytelling as accountability, evidence as community ownership.'
  },
  {
    name: 'PICC Centre Precinct',
    description: 'Palm Island community centre development creating gathering space for cultural activities, services, and community governance. Place-based infrastructure for self-determination.'
  },
  {
    name: 'PICC Elders Hull River Trip',
    description: 'Elder cultural journey program connecting Palm Island Elders to Hull River country. Intergenerational knowledge transfer, cultural healing, and reconnection to ancestral places.'
  },
  {
    name: 'PICC Photo Kiosk',
    description: 'Community photo sharing and storytelling installation on Palm Island. Community-controlled image archive, consent-first sharing, and visual narrative sovereignty.'
  },
  {
    name: 'Place-Based Policy Lab',
    description: 'Community-led policy development where those most affected by policy design it. Evidence from lived experience, community governance, and iterative learning cycles create policy that actually works.'
  },
  {
    name: 'Quandamooka Justice and Healing Strategy',
    description: 'Justice and healing framework developed by and for Quandamooka people. Community-controlled justice that centers cultural protocols, Elder authority, and healing rather than punishment.'
  },
  {
    name: 'Regional Arts Fellowship',
    description: 'Supporting regional arts practitioners through residencies, mentorship, and creative development. Art as first form of revolution, creativity as disruption, regional voices amplified.'
  },
  {
    name: 'SMART Connect',
    description: 'Technology access and digital inclusion program connecting communities to tools, training, and infrastructure. Digital sovereignty through community-controlled technology.'
  },
  {
    name: 'SMART HCP GP Uplift',
    description: 'Healthcare provider capacity building program equipping GPs with trauma-informed, culturally safe practice. Supporting primary care to better serve communities experiencing complexity.'
  },
  {
    name: 'SMART Recovery GP Kits',
    description: 'Recovery support resources and training for General Practitioners. Practical tools for supporting people on recovery journeys, integrated with community support networks.'
  },
  {
    name: 'The Confessional',
    description: 'Safe space installation for sharing stories in confidence. Art piece creating conditions for truth-telling, vulnerability, and witness. What can be spoken when safety is guaranteed?'
  },
  {
    name: 'The Harvest',
    description: 'Food security and community sustenance through shared agriculture. Not just a venue—it is belonging tested in markets, meals, and shared work. Seasonal programs with therapeutic components and community ownership.'
  },
  {
    name: 'TOMNET',
    description: 'The Older Men\'s Network connecting older men through meaningful activity, social connection, and purpose. Addressing isolation and mental health through practical engagement and genuine mateship.'
  },
  {
    name: 'Uncle Allan Palm Island Art',
    description: 'Uncle Allan\'s Palm Island art collection preserving and sharing cultural expression. Art as documentation, creativity as resistance, visual storytelling holding community memory.'
  },
];

async function setupACTProjects() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚜 SETTING UP ACT FARM PROJECTS');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Verify ACT organization exists
  const { data: actOrg, error: orgError } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('id', ACT_ORG_ID)
    .single();

  if (orgError || !actOrg) {
    console.error('❌ ACT organization not found!');
    return;
  }
  console.log(`✓ Found ACT Organization: ${actOrg.name}\n`);

  // Get existing projects
  const { data: existingProjects } = await supabase
    .from('projects')
    .select('id, name, organization_id');

  const existingByName = new Map(
    existingProjects?.map(p => [p.name.toLowerCase(), p]) || []
  );

  let created = 0;
  let updated = 0;
  const skipped = 0;

  for (const project of ACT_PROJECTS) {
    const existingProject = existingByName.get(project.name.toLowerCase());

    if (existingProject) {
      // Always update description and ensure linked to ACT
      const { error } = await supabase
        .from('projects')
        .update({
          organization_id: ACT_ORG_ID,
          description: project.description
        })
        .eq('id', existingProject.id);

      if (error) {
        console.log(`  ❌ ${project.name} - failed to update: ${error.message}`);
      } else {
        if (existingProject.organization_id === ACT_ORG_ID) {
          console.log(`  ✏️  ${project.name} - description updated`);
        } else {
          console.log(`  ↻ ${project.name} - moved to ACT + description updated`);
        }
        updated++;
      }
    } else {
      // Create new project
      const { error } = await supabase
        .from('projects')
        .insert({
          name: project.name,
          description: project.description,
          organization_id: ACT_ORG_ID,
          tenant_id: ACT_TENANT_ID,
          status: 'active',
          start_date: new Date().toISOString().split('T')[0]
        });

      if (error) {
        console.log(`  ❌ ${project.name} - failed to create: ${error.message}`);
      } else {
        console.log(`  + ${project.name} - created`);
        created++;
      }
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Created: ${created}`);
  console.log(`  Updated (descriptions enriched): ${updated}`);
  console.log(`  Total ACT Projects: ${created + updated}`);

  // Verify final count
  const { count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', ACT_ORG_ID);

  console.log(`\n✓ ACT now has ${count} projects total`);
}

setupACTProjects().catch(console.error);

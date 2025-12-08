import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const projectId = '96ded48f-db6e-4962-abab-33c88a123fa9'

async function findRHDData() {
  console.log('🔍 SEARCHING FOR RHD SEED INTERVIEW DATA\n')
  console.log('='*60 + '\n')

  // 1. Check project_contexts
  console.log('📋 Checking project_contexts table...')
  const { data: pc, error: pcErr } = await supabase
    .from('project_contexts')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle()

  if (pc) {
    console.log('✅ FOUND in project_contexts')
    console.log(`   Outcomes: ${pc.expected_outcomes ? pc.expected_outcomes.length : 0}`)
    console.log(`   Criteria: ${pc.success_criteria ? pc.success_criteria.length : 0}`)
    console.log(`   Updated: ${pc.updated_at}`)

    if (pc.expected_outcomes && pc.expected_outcomes.length > 0) {
      console.log('\n   OUTCOMES:')
      pc.expected_outcomes.forEach((o: any, i: number) => {
        const cat = typeof o === 'string' ? o : o.category
        console.log(`   ${i+1}. ${cat}`)
      })
    }
  } else {
    console.log('❌ NOT in project_contexts')
    if (pcErr) console.log(`   Error: ${pcErr.message}`)
  }

  // 2. Check if project_seed_interviews table exists
  console.log('\n📋 Checking project_seed_interviews table...')
  const { data: psi, error: psiErr } = await supabase
    .from('project_seed_interviews')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle()

  if (psi) {
    console.log('✅ FOUND in project_seed_interviews')
    console.log(`   Outcomes: ${psi.expected_outcomes ? psi.expected_outcomes.length : 0}`)
    console.log(`   Criteria: ${psi.success_criteria ? psi.success_criteria.length : 0}`)
    console.log(`   Updated: ${psi.updated_at}`)

    if (psi.expected_outcomes && psi.expected_outcomes.length > 0) {
      console.log('\n   OUTCOMES:')
      psi.expected_outcomes.forEach((o: any, i: number) => {
        const cat = typeof o === 'string' ? o : o.category
        console.log(`   ${i+1}. ${cat}`)
      })

      console.log('\n🔧 SOLUTION: Need to copy from project_seed_interviews to project_contexts!')
    }
  } else {
    if (psiErr && !psiErr.message.includes('does not exist')) {
      console.log('❌ NOT in project_seed_interviews')
      console.log(`   Error: ${psiErr.message}`)
    } else {
      console.log('⚠️  Table project_seed_interviews does not exist')
    }
  }

  // 3. Check organization_contexts (in case it's saved there)
  console.log('\n📋 Checking organization_contexts table...')
  const { data: project } = await supabase
    .from('projects')
    .select('organization_id')
    .eq('id', projectId)
    .single()

  if (project) {
    const { data: oc, error: ocErr } = await supabase
      .from('organization_contexts')
      .select('*')
      .eq('organization_id', project.organization_id)
      .maybeSingle()

    if (oc) {
      console.log('✅ Organization context exists')
      console.log(`   Has seed_interview_template: ${oc.seed_interview_template ? 'YES' : 'NO'}`)
    } else {
      console.log('❌ No organization context')
    }
  }

  console.log('\n' + '='*60)
}

findRHDData().then(() => process.exit(0))

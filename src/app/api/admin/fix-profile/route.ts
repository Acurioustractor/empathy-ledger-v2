import { NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('profiles')
    .update({
      tenant_id: '8891e1a9-92ae-423f-928b-cec602660011',
      tenant_roles: ['storyteller']
    })
    .eq('id', 'f8e99ed8-723a-48bc-a346-40f4f7a4032e')
    .select()

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}

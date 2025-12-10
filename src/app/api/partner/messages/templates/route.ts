export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

/**
 * GET /api/partner/messages/templates
 *
 * Get message templates for partners
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get templates
    const { data: templates, error } = await supabase
      .from('partner_message_templates')
      .select('id, name, subject, content, category')
      .eq('is_active', true)
      .order('category', { ascending: true })

    if (error) {
      console.error('Error fetching templates:', error)
      // Return default templates if table doesn't exist yet
      return NextResponse.json({
        templates: [
          {
            id: '1',
            name: 'Story Feature Request',
            subject: 'Request to feature your story: {{story_title}}',
            content: `Hi {{storyteller_name}},

We'd love to feature your story "{{story_title}}" in our {{project_name}} project.

This would help amplify your voice and reach a wider audience through our platform. You can approve or decline this request directly from your Empathy Ledger dashboard.

Thank you for sharing your story with the world.

Best regards,
{{partner_name}}`,
            category: 'request'
          },
          {
            id: '2',
            name: 'Impact Update',
            subject: 'Your story\'s impact: {{story_title}}',
            content: `Hi {{storyteller_name}},

We wanted to share some exciting news about your story "{{story_title}}"!

Your story has been making a real difference. Thank you for sharing it with our community.

Best regards,
{{partner_name}}`,
            category: 'impact'
          },
          {
            id: '3',
            name: 'Thank You',
            subject: 'Thank you for sharing your story',
            content: `Hi {{storyteller_name}},

We wanted to express our sincere gratitude for allowing us to feature your story "{{story_title}}" on our platform.

Stories like yours help create understanding and drive positive change. We're honored to help amplify your voice.

With gratitude,
{{partner_name}}`,
            category: 'thank_you'
          }
        ]
      })
    }

    return NextResponse.json({ templates: templates || [] })

  } catch (error) {
    console.error('Templates API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

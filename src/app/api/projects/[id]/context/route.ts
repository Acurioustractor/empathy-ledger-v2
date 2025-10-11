import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Retrieve project context
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params

    const { data: project, error } = await supabase
      .from('projects')
      .select('context_model, context_description, context_updated_at')
      .eq('id', projectId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If full model, also fetch profile
    if (project.context_model === 'full') {
      const { data: profile } = await supabase
        .from('project_profiles')
        .select('*')
        .eq('project_id', projectId)
        .single()

      return NextResponse.json({
        model: 'full',
        ...project,
        profile
      })
    }

    return NextResponse.json(project)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update project context (Quick Setup)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const body = await request.json()

    const { model, description } = body

    if (model === 'quick') {
      // Quick setup: just update description
      const { data, error } = await supabase
        .from('projects')
        .update({
          context_model: 'quick',
          context_description: description,
          context_updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Project context updated',
        data
      })
    }

    return NextResponse.json({ error: 'Invalid model type' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Remove project context
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params

    const { error } = await supabase
      .from('projects')
      .update({
        context_model: 'none',
        context_description: null,
        context_updated_at: null
      })
      .eq('id', projectId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Context removed' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

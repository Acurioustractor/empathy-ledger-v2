import { NextRequest, NextResponse } from 'next/server';
import { FeaturedContentResponse } from '@/types/shared/act-featured-content';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
): Promise<NextResponse<FeaturedContentResponse | { error: string }>> {
  try {
    const { slug } = await context.params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');

    const supabase = await createClient();

    // Get project
    const { data: project, error: projectError } = await supabase
      .from('act_projects')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    console.log('Project query:', { slug, project, error: projectError });

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found', debug: { slug, error: projectError?.message } },
        { status: 404 }
      );
    }

    // Get featured storytellers (if requested)
    let storytellers = [];
    if (type === 'all' || type === 'storytellers') {
      const { data } = await supabase
        .from('act_featured_storytellers')
        .select('*')
        .eq('project_slug', slug)
        .limit(limit);

      storytellers = data || [];
    }

    // Get featured stories (if requested)
    let stories = [];
    if (type === 'all' || type === 'stories') {
      // Query story_project_features with story details
      const { data } = await supabase
        .from('story_project_features')
        .select(`
          story_id,
          featured_quote,
          approved_at
        `)
        .eq('act_project_id', project.id)
        .eq('is_visible', true)
        .limit(limit);

      // For now, return basic story data
      // In production, you'd join with stories table to get full details
      stories = (data || []).map((item: any) => ({
        story_id: item.story_id,
        title: 'Story Title', // TODO: Join with stories table
        excerpt: null,
        featured_quote: item.featured_quote,
        storyteller_id: null,
        storyteller_name: 'Storyteller Name', // TODO: Join with storytellers
        published_at: new Date().toISOString(),
        approved_at: item.approved_at,
      }));
    }

    const response: FeaturedContentResponse = {
      project: {
        id: project.id,
        slug: project.slug,
        title: project.title,
        organization_name: project.organization_name,
        focus_areas: project.focus_areas,
        themes: project.themes,
        website_url: project.website_url,
        description: project.description,
        active: project.is_active,
        created_at: project.created_at,
        updated_at: project.updated_at,
      },
      featured: {
        storytellers,
        stories,
      },
      meta: {
        storyteller_count: storytellers.length,
        story_count: stories.length,
        fetched_at: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Featured content API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

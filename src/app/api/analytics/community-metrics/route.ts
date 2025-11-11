import { NextRequest, NextResponse } from 'next/server';

import { analyticsService } from '@/lib/services/analytics.service';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationFilter = searchParams.get('organisation');
    const timeRange = searchParams.get('timeRange') || 'all';

    // Get community metrics with optional filtering
    const metrics = await analyticsService.getCommunityMetrics();

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching community metrics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch community metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, params } = body;

    switch (action) {
      case 'refresh':
        // Trigger recalculation of community metrics
        const refreshedMetrics = await analyticsService.getCommunityMetrics();
        return NextResponse.json({
          success: true,
          data: refreshedMetrics,
          message: 'Community metrics refreshed successfully'
        });

      case 'export':
        // Generate export data for community metrics
        const metrics = await analyticsService.getCommunityMetrics();
        const exportData = {
          ...metrics,
          exportDate: new Date().toISOString(),
          dataSource: 'Empathy Ledger Analytics'
        };
        
        return NextResponse.json({
          success: true,
          data: exportData,
          format: params?.format || 'json'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error processing community metrics request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';

import { analyticsService } from '@/lib/services/analytics.service';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationFilter = searchParams.get('organisation');
    const roleFilter = searchParams.get('role');
    const includeConnections = searchParams.get('includeConnections') === 'true';

    // Get storyteller network data
    const network = await analyticsService.getStorytellerNetwork();

    // Apply filters if provided
    let filteredNetwork = network;
    
    if (organizationFilter && organizationFilter !== 'all') {
      filteredNetwork = filteredNetwork.filter(storyteller => 
        storyteller.organisation?.toLowerCase().includes(organizationFilter.toLowerCase())
      );
    }

    if (roleFilter && roleFilter !== 'all') {
      filteredNetwork = filteredNetwork.filter(storyteller => 
        storyteller.culturalRole.toLowerCase().includes(roleFilter.toLowerCase())
      );
    }

    // Calculate network statistics
    const networkStats = {
      totalStorytellers: filteredNetwork.length,
      totalConnections: filteredNetwork.reduce((sum, s) => sum + s.connections.length, 0),
      averageConnections: filteredNetwork.length ? 
        Math.round(filteredNetwork.reduce((sum, s) => sum + s.connections.length, 0) / filteredNetwork.length) : 0,
      highInfluenceCount: filteredNetwork.filter(s => s.influences > 70).length,
      culturalRoles: {
        elders: filteredNetwork.filter(s => s.culturalRole === 'Elder').length,
        communityKeepers: filteredNetwork.filter(s => s.culturalRole === 'Community Keeper').length,
        communityMembers: filteredNetwork.filter(s => s.culturalRole === 'Community Member').length
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        storytellers: filteredNetwork,
        statistics: networkStats,
        includeConnections
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching storyteller network:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch storyteller network',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, storytellerId, params } = body;

    switch (action) {
      case 'getConnections':
        // Get detailed connections for a specific storyteller
        const network = await analyticsService.getStorytellerNetwork();
        const storyteller = network.find(s => s.id === storytellerId);
        
        if (!storyteller) {
          return NextResponse.json(
            { success: false, error: 'Storyteller not found' },
            { status: 404 }
          );
        }

        const connections = network.filter(s => 
          storyteller.connections.includes(s.id)
        );

        return NextResponse.json({
          success: true,
          data: {
            storyteller,
            connections,
            connectionTypes: await analyzeConnectionTypes(storyteller, connections)
          }
        });

      case 'analyzeInfluence':
        // Analyze influence patterns in the network
        const fullNetwork = await analyticsService.getStorytellerNetwork();
        const influenceAnalysis = {
          topInfluencers: fullNetwork
            .sort((a, b) => b.influences - a.influences)
            .slice(0, 10),
          influenceDistribution: calculateInfluenceDistribution(fullNetwork),
          culturalImpact: analyzeCulturalImpact(fullNetwork)
        };

        return NextResponse.json({
          success: true,
          data: influenceAnalysis
        });

      case 'exportNetwork':
        // Export network data for external analysis
        const exportNetwork = await analyticsService.getStorytellerNetwork();
        const exportFormat = params?.format || 'json';
        
        let exportData;
        if (exportFormat === 'csv') {
          exportData = convertNetworkToCSV(exportNetwork);
        } else if (exportFormat === 'graphml') {
          exportData = convertNetworkToGraphML(exportNetwork);
        } else {
          exportData = {
            nodes: exportNetwork,
            edges: generateNetworkEdges(exportNetwork),
            metadata: {
              exportDate: new Date().toISOString(),
              totalNodes: exportNetwork.length,
              format: exportFormat
            }
          };
        }

        return NextResponse.json({
          success: true,
          data: exportData,
          format: exportFormat
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error processing storyteller network request:', error);
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

// Helper functions
async function analyzeConnectionTypes(storyteller: any, connections: any[]) {
  return {
    themeBasedConnections: connections.filter(c => 
      c.themes.some((theme: string) => storyteller.themes.includes(theme))
    ).length,
    organizationConnections: connections.filter(c => 
      c.organisation === storyteller.organisation
    ).length,
    culturalConnections: connections.filter(c => 
      c.culturalRole === storyteller.culturalRole
    ).length
  };
}

function calculateInfluenceDistribution(network: any[]) {
  const ranges = [
    { min: 0, max: 25, label: 'Low Influence' },
    { min: 26, max: 50, label: 'Medium Influence' },
    { min: 51, max: 75, label: 'High Influence' },
    { min: 76, max: 100, label: 'Very High Influence' }
  ];

  return ranges.map(range => ({
    ...range,
    count: network.filter(s => s.influences >= range.min && s.influences <= range.max).length
  }));
}

function analyzeCulturalImpact(network: any[]) {
  const elders = network.filter(s => s.culturalRole === 'Elder');
  const elderInfluence = elders.reduce((sum, e) => sum + e.influences, 0) / elders.length || 0;
  
  return {
    elderInfluenceAverage: Math.round(elderInfluence),
    intergenerationalConnections: network.filter(s => s.connections.length > 3).length,
    culturalThemeDiversity: calculateThemeDiversity(network)
  };
}

function calculateThemeDiversity(network: any[]) {
  const allThemes = new Set();
  network.forEach(s => s.themes.forEach((theme: string) => allThemes.add(theme)));
  return allThemes.size;
}

function convertNetworkToCSV(network: any[]) {
  const headers = ['id', 'name', 'organisation', 'culturalRole', 'storyCount', 'influences', 'connections', 'themes'];
  const rows = network.map(s => [
    s.id,
    s.name,
    s.organisation || '',
    s.culturalRole,
    s.storyCount,
    s.influences,
    s.connections.join(';'),
    s.themes.join(';')
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function convertNetworkToGraphML(network: any[]) {
  // GraphML format for network analysis tools like Gephi
  let graphml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  graphml += '<graphml xmlns="http://graphml.graphdrawing.org/xmlns">\n';
  graphml += '  <graph id="storyteller-network" edgedefault="undirected">\n';
  
  // Add nodes
  network.forEach(s => {
    graphml += `    <node id="${s.id}">\n`;
    graphml += `      <data key="name">${s.name}</data>\n`;
    graphml += `      <data key="role">${s.culturalRole}</data>\n`;
    graphml += `      <data key="influence">${s.influences}</data>\n`;
    graphml += `    </node>\n`;
  });
  
  // Add edges
  network.forEach(s => {
    s.connections.forEach((connId: string) => {
      graphml += `    <edge source="${s.id}" target="${connId}"/>\n`;
    });
  });
  
  graphml += '  </graph>\n';
  graphml += '</graphml>';
  
  return graphml;
}

function generateNetworkEdges(network: any[]) {
  const edges: any[] = [];
  network.forEach(s => {
    s.connections.forEach((connId: string) => {
      edges.push({
        source: s.id,
        target: connId,
        type: 'connection'
      });
    });
  });
  return edges;
}
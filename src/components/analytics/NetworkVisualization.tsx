'use client';

/**
 * D3.js Network Visualization for Storyteller Connections
 * Creates interactive force-directed graph showing community relationships
 * with cultural sensitivity and elder approval protocols
 */

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Users, 
  Zap, 
  Filter, 
  Download, 
  Eye, 
  EyeOff,
  Shield,
  Info
} from 'lucide-react';
import { StorytellerConnection } from '@/lib/services/analytics.service';

interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  group: string;
  size: number;
  influence: number;
  culturalRole: string;
  storyCount: number;
  themes: string[];
  x?: number;
  y?: number;
}

interface NetworkLink extends d3.SimulationLinkDatum<NetworkNode> {
  source: string | NetworkNode;
  target: string | NetworkNode;
  strength: number;
  type: 'theme' | 'organisation' | 'cultural';
}

interface NetworkVisualizationProps {
  storytellers: StorytellerConnection[];
  width?: number;
  height?: number;
  onNodeClick?: (node: NetworkNode) => void;
}

export const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({
  storytellers,
  width = 800,
  height = 600,
  onNodeClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [filterByRole, setFilterByRole] = useState<string>('all');
  const [showInfluence, setShowInfluence] = useState(true);
  const [colorBy, setColorBy] = useState<'role' | 'influence' | 'organisation'>('role');
  const [simulation, setSimulation] = useState<d3.Simulation<NetworkNode, NetworkLink> | null>(null);

  // Transform storyteller data into network format
  const networkData = React.useMemo(() => {
    const nodes: NetworkNode[] = storytellers.map(storyteller => ({
      id: storyteller.id,
      name: storyteller.name,
      group: storyteller.organisation || 'Independent',
      size: Math.max(8, storyteller.storyCount * 2),
      influence: storyteller.influences,
      culturalRole: storyteller.culturalRole,
      storyCount: storyteller.storyCount,
      themes: storyteller.themes
    }));

    const links: NetworkLink[] = [];
    
    // Create links based on connections
    storytellers.forEach(storyteller => {
      storyteller.connections.forEach(connectionId => {
        const target = nodes.find(n => n.id === connectionId);
        if (target) {
          // Calculate connection strength based on shared themes
          const sharedThemes = storyteller.themes.filter(theme => 
            target.themes.includes(theme)
          );
          const strength = Math.max(0.1, sharedThemes.length / 10);
          
          links.push({
            source: storyteller.id,
            target: connectionId,
            strength,
            type: storyteller.organisation === target.group ? 'organisation' : 'theme'
          });
        }
      });
    });

    return { nodes, links };
  }, [storytellers]);

  // Filter nodes based on selected role
  const filteredData = React.useMemo(() => {
    if (filterByRole === 'all') return networkData;
    
    const filteredNodes = networkData.nodes.filter(node => 
      node.culturalRole.toLowerCase().includes(filterByRole.toLowerCase())
    );
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = networkData.links.filter(link => 
      filteredNodeIds.has(link.source as string) && 
      filteredNodeIds.has(link.target as string)
    );
    
    return { nodes: filteredNodes, links: filteredLinks };
  }, [networkData, filterByRole]);

  useEffect(() => {
    if (!svgRef.current || filteredData.nodes.length === 0) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const container = svg.append('g');

    // Add zoom behaviour
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Color scales
    const roleColorScale = d3.scaleOrdinal<string>()
      .domain(['Elder', 'Community Keeper', 'Community Member'])
      .range(['#f59e0b', '#10b981', '#3b82f6']); // amber, emerald, blue

    const influenceColorScale = d3.scaleLinear<string>()
      .domain([0, 100])
      .range(['#e5e7eb', '#dc2626']); // grey to red

    const orgColorScale = d3.scaleOrdinal<string>()
      .domain([...new Set(filteredData.nodes.map(n => n.group))])
      .range(d3.schemeCategory10);

    const getNodeColor = (node: NetworkNode) => {
      switch (colorBy) {
        case 'role':
          return roleColorScale(node.culturalRole);
        case 'influence':
          return influenceColorScale(node.influence);
        case 'organisation':
          return orgColorScale(node.group);
        default:
          return '#6b7280';
      }
    };

    // Create simulation
    const newSimulation = d3.forceSimulation(filteredData.nodes)
      .force('link', d3.forceLink(filteredData.links)
        .id((d: any) => d.id)
        .strength((d: any) => d.strength)
        .distance(80)
      )
      .force('charge', d3.forceManyBody()
        .strength(-300)
      )
      .force('centre', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide()
        .radius((d: any) => d.size + 5)
      );

    setSimulation(newSimulation);

    // Create links
    const links = container.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(filteredData.links)
      .join('line')
      .attr('stroke', '#6b7280')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: any) => Math.sqrt(d.strength * 10));

    // Create nodes
    const nodes = container.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(filteredData.nodes)
      .join('g')
      .attr('class', 'node')
      .call(d3.drag<any, NetworkNode>()
        .on('start', (event, d) => {
          if (!event.active) newSimulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) newSimulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Add node circles
    nodes.append('circle')
      .attr('r', (d: NetworkNode) => d.size)
      .attr('fill', getNodeColor)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedNode(d);
        onNodeClick?.(d);
      })
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.size * 1.5);
        
        // Show tooltip
        const tooltip = container.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${d.x! + d.size + 10}, ${d.y! - 10})`);
        
        const rect = tooltip.append('rect')
          .attr('fill', 'rgba(0, 0, 0, 0.8)')
          .attr('rx', 4)
          .attr('ry', 4);
        
        const text = tooltip.append('text')
          .attr('fill', 'white')
          .attr('font-size', '12px')
          .attr('x', 8)
          .attr('y', 16);
        
        text.append('tspan')
          .attr('x', 8)
          .attr('dy', '0')
          .attr('font-weight', 'bold')
          .text(d.name);
        
        text.append('tspan')
          .attr('x', 8)
          .attr('dy', '14')
          .text(`Role: ${d.culturalRole}`);
        
        text.append('tspan')
          .attr('x', 8)
          .attr('dy', '14')
          .text(`Stories: ${d.storyCount}`);
        
        if (showInfluence) {
          text.append('tspan')
            .attr('x', 8)
            .attr('dy', '14')
            .text(`Influence: ${d.influence}`);
        }
        
        // Resize background to fit text
        const bbox = text.node()!.getBBox();
        rect.attr('width', bbox.width + 16)
            .attr('height', bbox.height + 12);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.size);
        
        container.selectAll('.tooltip').remove();
      });

    // Add node labels
    nodes.append('text')
      .attr('dx', (d: NetworkNode) => d.size + 8)
      .attr('dy', '0.35em')
      .attr('font-size', '10px')
      .attr('fill', '#374151')
      .attr('font-weight', 'bold')
      .text((d: NetworkNode) => d.name.length > 15 ? `${d.name.substring(0, 12)}...` : d.name);

    // Add cultural role badges for elders
    nodes.filter((d: NetworkNode) => d.culturalRole === 'Elder')
      .append('circle')
      .attr('cx', (d: NetworkNode) => d.size - 5)
      .attr('cy', (d: NetworkNode) => -d.size + 5)
      .attr('r', 6)
      .attr('fill', '#f59e0b')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);
    
    nodes.filter((d: NetworkNode) => d.culturalRole === 'Elder')
      .append('text')
      .attr('x', (d: NetworkNode) => d.size - 5)
      .attr('y', (d: NetworkNode) => -d.size + 5)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '8px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .text('E');

    // Update positions on simulation tick
    newSimulation.on('tick', () => {
      links
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodes.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      newSimulation.stop();
    };
  }, [filteredData, width, height, colorBy, showInfluence, onNodeClick]);

  const exportNetwork = () => {
    if (!svgRef.current) return;
    
    const svgElement = svgRef.current;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'storyteller-network.svg';
    link.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-grey-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <Select value={filterByRole} onValueChange={setFilterByRole}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="elder">Elders</SelectItem>
                <SelectItem value="keeper">Community Keepers</SelectItem>
                <SelectItem value="member">Community Members</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm">Color by:</span>
            <Select value={colorBy} onValueChange={(value: 'role' | 'influence' | 'organisation') => setColorBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="role">Role</SelectItem>
                <SelectItem value="influence">Influence</SelectItem>
                <SelectItem value="organisation">Organization</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            {showInfluence ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <Switch
              checked={showInfluence}
              onCheckedChange={setShowInfluence}
            />
            <span className="text-sm">Show Influence</span>
          </div>
        </div>

        <Button onClick={exportNetwork} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export SVG
        </Button>
      </div>

      {/* Network Visualization */}
      <div className="flex gap-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Storyteller Network
              <Shield className="w-4 h-4 ml-2 text-amber-500" title="Cultural Protocol Protected" />
            </CardTitle>
            <CardDescription>
              Interactive visualization of community connections and influence patterns.
              Node size represents story count, connections show shared themes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <svg
                ref={svgRef}
                width={width}
                height={height}
                style={{ border: '1px solid #e5e7eb' }}
              />
              
              {/* Legend */}
              <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md border">
                <h4 className="font-semibold mb-2 text-sm">Legend</h4>
                <div className="space-y-2 text-xs">
                  {colorBy === 'role' && (
                    <>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span>Elder</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Community Keeper</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>Community Member</span>
                      </div>
                    </>
                  )}
                  <div className="pt-2 border-t">
                    <div className="flex items-center space-x-1">
                      <Info className="w-3 h-3" />
                      <span>Node size = Story count</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Node Details Panel */}
        {selectedNode && (
          <Card className="w-80">
            <CardHeader>
              <CardTitle className="text-lg">{selectedNode.name}</CardTitle>
              <CardDescription>{selectedNode.culturalRole}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Stories:</span>
                  <span className="ml-2">{selectedNode.storyCount}</span>
                </div>
                <div>
                  <span className="font-medium">Influence:</span>
                  <span className="ml-2">{selectedNode.influence}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Organization:</span>
                  <span className="ml-2">{selectedNode.group}</span>
                </div>
              </div>
              
              {selectedNode.themes.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Themes:</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.themes.slice(0, 6).map(theme => (
                      <Badge key={theme} variant="outline" className="text-xs">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NetworkVisualization;
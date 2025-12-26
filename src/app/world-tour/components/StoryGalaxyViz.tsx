'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

interface StoryNode {
  id: string;
  theme: string;
  storytellerName: string;
  location: string;
  connections: number;
  impact: 'low' | 'medium' | 'high';
  latitude?: number;
  longitude?: number;
  x: number;
  y: number;
  z: number;
}

interface StoryGalaxyVizProps {
  stories?: any[];
  className?: string;
  showControls?: boolean;
  autoRotate?: boolean;
  onStorySelect?: (storyId: string) => void;
}

/**
 * StoryGalaxyViz - 3D-style visualization of World Tour stories
 *
 * Canvas-based visualization showing story connections across the globe.
 * Privacy-preserving: shows patterns and themes, not individual content.
 *
 * Features:
 * - Interactive 3D rotation
 * - Theme-based filtering
 * - Impact-based coloring
 * - Connection visualization
 * - Zoom controls
 */
export default function StoryGalaxyViz({
  stories = [],
  className = '',
  showControls = true,
  autoRotate = true,
  onStorySelect,
}: StoryGalaxyVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [storyNodes, setStoryNodes] = useState<StoryNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<StoryNode | null>(null);
  const [filterTheme, setFilterTheme] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Convert stories to story nodes for visualization
  useEffect(() => {
    const convertStoriesToNodes = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      // If we have actual stories, convert them
      if (stories && stories.length > 0) {
        const nodes: StoryNode[] = stories.map((story, i) => ({
          id: story.id,
          theme: story.theme || 'General',
          storytellerName: story.storyteller_name || 'Anonymous',
          location: story.location || 'Unknown',
          connections: Math.floor(Math.random() * 20) + 1, // TODO: See issue #10 in empathy-ledger-v2: Calculate actual connections
          impact: story.impact_level || (['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high'),
          latitude: story.latitude,
          longitude: story.longitude,
          // Convert geographic coordinates to 3D space
          x: story.longitude ? (story.longitude / 180) * 400 : (Math.random() - 0.5) * 800,
          y: story.latitude ? (story.latitude / 90) * 300 : (Math.random() - 0.5) * 600,
          z: (Math.random() - 0.5) * 400,
        }));
        setStoryNodes(nodes);
      } else {
        // Generate demo data if no stories provided
        setStoryNodes(generateDemoNodes());
      }

      setIsLoading(false);
    };

    convertStoriesToNodes();
  }, [stories]);

  // Auto-rotation effect
  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setRotation(prev => ({
        x: prev.x + 0.003,
        y: prev.y + 0.005,
      }));
    }, 50);

    return () => clearInterval(interval);
  }, [autoRotate]);

  // Canvas rendering effect
  useEffect(() => {
    if (!canvasRef.current || storyNodes.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with retina display support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const centerX = canvas.offsetWidth / 2;
    const centerY = canvas.offsetHeight / 2;

    // Clear canvas with dark background
    ctx.fillStyle = 'hsl(var(--background))';
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    // Filter nodes by theme
    const filteredNodes =
      filterTheme === 'all'
        ? storyNodes
        : storyNodes.filter(node => node.theme === filterTheme);

    // Sort nodes by z-depth for proper layering
    const sortedNodes = [...filteredNodes].sort((a, b) => {
      const zA = a.z * Math.cos(rotation.x) - a.y * Math.sin(rotation.x);
      const zB = b.z * Math.cos(rotation.x) - b.y * Math.sin(rotation.x);
      return zA - zB;
    });

    // Draw connections (privacy-preserving - sparse connections only)
    ctx.strokeStyle = 'hsl(var(--muted-foreground) / 0.1)';
    ctx.lineWidth = 1;

    for (let i = 0; i < sortedNodes.length; i += 8) {
      const node1 = sortedNodes[i];
      const node2 = sortedNodes[i + 4];
      if (!node1 || !node2) continue;

      const x1 = centerX + (node1.x * Math.cos(rotation.y) - node1.z * Math.sin(rotation.y)) * zoom;
      const y1 = centerY + (node1.y * Math.cos(rotation.x) - node1.z * Math.sin(rotation.x)) * zoom;
      const x2 = centerX + (node2.x * Math.cos(rotation.y) - node2.z * Math.sin(rotation.y)) * zoom;
      const y2 = centerY + (node2.y * Math.cos(rotation.x) - node2.z * Math.sin(rotation.x)) * zoom;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Draw story nodes
    sortedNodes.forEach(node => {
      const x = centerX + (node.x * Math.cos(rotation.y) - node.z * Math.sin(rotation.y)) * zoom;
      const y = centerY + (node.y * Math.cos(rotation.x) - node.z * Math.sin(rotation.x)) * zoom;

      // Calculate depth for size variation
      const depth = node.z * Math.cos(rotation.x) - node.y * Math.sin(rotation.x);
      const depthFactor = 1 + (depth / 500) * 0.5;

      // Node size based on connections and depth
      const baseSize = Math.max(3, Math.min(10, node.connections / 3));
      const size = baseSize * depthFactor;

      // Color based on impact level (using CSS variables)
      let color = 'hsl(var(--muted-foreground))'; // gray for low impact
      if (node.impact === 'medium') color = 'hsl(var(--accent))'; // accent
      if (node.impact === 'high') color = 'hsl(var(--destructive))'; // red

      // Draw node
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();

      // Add glow effect for high impact stories
      if (node.impact === 'high') {
        ctx.fillStyle = color.replace(')', ' / 0.3)');
        ctx.beginPath();
        ctx.arc(x, y, size * 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Draw selected node highlight
    if (selectedNode) {
      const x = centerX + (selectedNode.x * Math.cos(rotation.y) - selectedNode.z * Math.sin(rotation.y)) * zoom;
      const y = centerY + (selectedNode.y * Math.cos(rotation.x) - selectedNode.z * Math.sin(rotation.x)) * zoom;

      ctx.strokeStyle = 'hsl(var(--primary))';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }, [storyNodes, rotation, zoom, filterTheme, selectedNode]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = canvas.offsetWidth / 2;
    const centerY = canvas.offsetHeight / 2;

    // Find closest node to click
    let closestNode: StoryNode | null = null;
    let minDistance = Infinity;

    storyNodes.forEach(node => {
      const nodeX = centerX + (node.x * Math.cos(rotation.y) - node.z * Math.sin(rotation.y)) * zoom;
      const nodeY = centerY + (node.y * Math.cos(rotation.x) - node.z * Math.sin(rotation.x)) * zoom;

      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);

      if (distance < 25 && distance < minDistance) {
        minDistance = distance;
        closestNode = node;
      }
    });

    setSelectedNode(closestNode);
    if (closestNode && onStorySelect) {
      onStorySelect(closestNode.id);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.3));

  const themes = Array.from(new Set(storyNodes.map(node => node.theme)));

  if (isLoading) {
    return (
      <Card className={`relative bg-background overflow-hidden ${className}`}>
        <CardContent className="flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Loading Story Galaxy</h3>
            <p className="text-muted-foreground">Connecting stories across the globe...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`relative bg-background overflow-hidden ${className}`}>
      <CardContent className="p-0">
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-[600px] cursor-pointer"
          onClick={handleCanvasClick}
        />

        {/* Controls */}
        {showControls && (
          <div className="absolute top-6 left-6 space-y-4">
            {/* Theme Filter */}
            <Card className="bg-background/95 backdrop-blur-sm border-border">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 text-sm">Theme Filter</h4>
                <select
                  value={filterTheme}
                  onChange={e => setFilterTheme(e.target.value)}
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Themes</option>
                  {themes.map(theme => (
                    <option key={theme} value={theme}>
                      {theme}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* Zoom Controls */}
            <Card className="bg-background/95 backdrop-blur-sm border-border">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 text-sm">Zoom</h4>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleZoomOut}
                    className="flex-1"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleZoomIn}
                    className="flex-1"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
                <div className="mt-2 text-xs text-center text-muted-foreground">
                  {Math.round(zoom * 100)}%
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Story Details Panel */}
        {selectedNode && (
          <Card className="absolute top-6 right-6 max-w-sm bg-background border-border shadow-xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-foreground">Story Details</h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedNode(null)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Theme</span>
                  <p className="text-foreground font-medium">{selectedNode.theme}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-muted-foreground">Storyteller</span>
                  <p className="text-foreground">{selectedNode.storytellerName}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-muted-foreground">Location</span>
                  <p className="text-foreground">{selectedNode.location}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-muted-foreground">Connections</span>
                  <p className="text-foreground">
                    {selectedNode.connections} related {selectedNode.connections === 1 ? 'story' : 'stories'}
                  </p>
                </div>

                <div>
                  <span className="text-sm font-medium text-muted-foreground">Impact Level</span>
                  <div className="mt-1">
                    <Badge
                      variant={
                        selectedNode.impact === 'high'
                          ? 'destructive'
                          : selectedNode.impact === 'medium'
                            ? 'default'
                            : 'secondary'
                      }
                    >
                      {selectedNode.impact.charAt(0).toUpperCase() + selectedNode.impact.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <Badge variant="outline" className="mb-2">
                  🔒 Privacy Protected
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Only aggregated patterns are visible. Individual content remains private.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        <Card className="absolute bottom-6 left-6 bg-background/95 backdrop-blur-sm border-border">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3 text-sm">Impact Legend</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--muted-foreground))' }} />
                <span className="text-muted-foreground">Low Impact</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--accent))' }} />
                <span className="text-muted-foreground">Medium Impact</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--destructive))' }} />
                <span className="text-muted-foreground">High Impact</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="absolute bottom-6 right-6 bg-background/95 backdrop-blur-sm border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {storyNodes.length.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Stories Connected</div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}

// Demo data generator for when no real stories are provided
function generateDemoNodes(): StoryNode[] {
  const themes = [
    'Indigenous Rights',
    'Climate Action',
    'Community Healing',
    'Cultural Preservation',
    'Land Rights',
    'Education Access',
    'Healthcare Equity',
    'Economic Justice',
    'Youth Empowerment',
    'Elder Wisdom',
  ];

  const locations = [
    'Australia',
    'Canada',
    'New Zealand',
    'United States',
    'Brazil',
    'Mexico',
    'Norway',
    'Kenya',
  ];

  return Array.from({ length: 120 }, (_, i) => ({
    id: `demo-story-${i}`,
    theme: themes[Math.floor(Math.random() * themes.length)],
    storytellerName: `Storyteller ${i + 1}`,
    location: locations[Math.floor(Math.random() * locations.length)],
    connections: Math.floor(Math.random() * 30) + 1,
    impact: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
    x: (Math.random() - 0.5) * 800,
    y: (Math.random() - 0.5) * 600,
    z: (Math.random() - 0.5) * 400,
  }));
}

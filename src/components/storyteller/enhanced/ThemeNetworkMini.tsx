'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { Maximize2, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getThemeColor } from '@/lib/constants/themes'

export interface ThemeNode {
  id: string
  name: string
  category: string
  prominence_score: number
  usage_count?: number
}

export interface ThemeConnection {
  source: string
  target: string
  strength: number
  co_occurrence?: number
}

export interface ThemeNetworkMiniProps {
  themes: ThemeNode[]
  connections?: ThemeConnection[]
  maxNodes?: number
  width?: number
  height?: number
  onThemeClick?: (theme: ThemeNode) => void
  onExpandClick?: () => void
  className?: string
}

/**
 * ThemeNetworkMini - Compact D3 force-directed graph showing storyteller's theme relationships
 *
 * Features:
 * - D3 force simulation for automatic layout
 * - Cultural color coding by theme category
 * - Node size based on prominence
 * - Interactive hover states
 * - Click to view theme details
 * - Expand button for full view
 * - Smooth animations
 *
 * Usage:
 * <ThemeNetworkMini
 *   themes={storytellerThemes}
 *   connections={themeConnections}
 *   onThemeClick={handleThemeClick}
 * />
 */
export function ThemeNetworkMini({
  themes,
  connections = [],
  maxNodes = 8,
  width = 200,
  height = 200,
  onThemeClick,
  onExpandClick,
  className
}: ThemeNetworkMiniProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  useEffect(() => {
    if (!svgRef.current || !themes || themes.length === 0) return

    // Limit themes to top N by prominence
    const topThemes = themes
      .sort((a, b) => b.prominence_score - a.prominence_score)
      .slice(0, maxNodes)

    // Filter connections to only include top themes
    const themeIds = new Set(topThemes.map(t => t.id))
    const validConnections = connections.filter(
      c => themeIds.has(c.source) && themeIds.has(c.target)
    )

    // Clear existing SVG
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Create container group
    const g = svg.append('g')

    // Prepare data for D3
    const nodes = topThemes.map(t => ({
      ...t,
      x: width / 2,
      y: height / 2
    }))

    const links = validConnections.map(c => ({
      source: c.source,
      target: c.target,
      strength: c.strength
    }))

    // Force simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links)
        .id((d: any) => d.id)
        .distance(40)
        .strength(d => (d as any).strength * 0.5)
      )
      .force('charge', d3.forceManyBody().strength(-150))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => {
        const size = 8 + (d.prominence_score * 12)
        return size + 5
      }))

    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-opacity', 0.3)
      .attr('stroke-width', (d: any) => 1 + (d.strength * 2))

    // Draw nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', (d: any) => 8 + (d.prominence_score * 12))
      .attr('fill', (d: any) => getThemeColor(d.category) || '#667eea')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .style('transition', 'all 0.2s ease')
      .on('mouseover', function(event, d: any) {
        d3.select(this)
          .attr('stroke-width', 3)
          .attr('r', (8 + (d.prominence_score * 12)) * 1.2)
        setHoveredNode(d.id)
      })
      .on('mouseout', function(event, d: any) {
        d3.select(this)
          .attr('stroke-width', 2)
          .attr('r', 8 + (d.prominence_score * 12))
        setHoveredNode(null)
      })
      .on('click', (event, d: any) => {
        if (onThemeClick) {
          onThemeClick(d)
        }
      })
      .call(drag(simulation) as any)

    // Add labels (only show for larger nodes)
    const label = g.append('g')
      .selectAll('text')
      .data(nodes.filter((d: any) => d.prominence_score > 0.3))
      .join('text')
      .text((d: any) => d.name.split(' ')[0]) // First word only
      .attr('font-size', 10)
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle')
      .attr('dy', (d: any) => 8 + (d.prominence_score * 12) + 12)
      .attr('fill', 'currentColor')
      .attr('opacity', 0.7)
      .attr('pointer-events', 'none')
      .style('user-select', 'none')

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y)

      label
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y)
    })

    // Cleanup
    return () => {
      simulation.stop()
    }
  }, [themes, connections, maxNodes, width, height, onThemeClick])

  // Drag behavior
  function drag(simulation: d3.Simulation<any, any>) {
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    function dragged(event: any) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended)
  }

  if (!themes || themes.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center bg-muted/20 rounded-lg border border-dashed border-muted-foreground/20',
          className
        )}
        style={{ width, height }}
      >
        <Tag className="w-8 h-8 text-muted-foreground/40 mb-2" />
        <p className="text-xs text-muted-foreground">No themes yet</p>
      </div>
    )
  }

  // Find hovered theme for tooltip
  const hoveredTheme = hoveredNode ? themes.find(t => t.id === hoveredNode) : null

  return (
    <div className={cn('relative group', className)}>
      {/* Expand button */}
      {onExpandClick && (
        <button
          onClick={onExpandClick}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
          title="Expand theme network"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      )}

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="rounded-lg bg-gradient-to-br from-muted/5 to-muted/10"
      />

      {/* Hover tooltip */}
      {hoveredTheme && (
        <div className="absolute bottom-2 left-2 right-2 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg z-20 pointer-events-none">
          <p className="text-xs font-semibold text-foreground">{hoveredTheme.name}</p>
          <p className="text-xs text-muted-foreground">
            Prominence: {(hoveredTheme.prominence_score * 100).toFixed(0)}%
          </p>
          {hoveredTheme.usage_count && (
            <p className="text-xs text-muted-foreground">
              {hoveredTheme.usage_count} {hoveredTheme.usage_count === 1 ? 'story' : 'stories'}
            </p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-2 left-2 text-xs text-muted-foreground pointer-events-none">
        <p className="font-medium">{themes.length} themes</p>
        {connections.length > 0 && (
          <p className="opacity-70">{connections.length} connections</p>
        )}
      </div>
    </div>
  )
}

/**
 * ThemeNetworkMiniSkeleton - Loading state for ThemeNetworkMini
 */
export function ThemeNetworkMiniSkeleton({
  width = 200,
  height = 200,
  className
}: Pick<ThemeNetworkMiniProps, 'width' | 'height' | 'className'>) {
  return (
    <div
      className={cn('bg-muted/20 rounded-lg animate-pulse', className)}
      style={{ width, height }}
    >
      <div className="flex items-center justify-center h-full">
        <Tag className="w-12 h-12 text-muted-foreground/20" />
      </div>
    </div>
  )
}

'use client'

import React, { useEffect, useRef, useState } from 'react'

interface Node {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  type: 'storyteller' | 'story' | 'community'
  colour: string
  targetX: number
  targetY: number
  energy: number
}

interface Edge {
  source: string
  target: string
  strength: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
}

interface NetworkGraphProps {
  variant?: 'default' | 'hero'
  className?: string
}

export function NetworkGraph({ variant = 'default', className = '' }: NetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [isMobile, setIsMobile] = useState(false)

  // Check for mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Get container size
    const rect = canvas.parentElement?.getBoundingClientRect()
    const width = rect?.width || 500
    const height = rect?.height || 400

    // Set canvas size for retina displays
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'
    ctx.scale(dpr, dpr)

    // Physics constants for floating behaviour
    const DAMPING = 0.995
    const CONNECTION_DISTANCE = variant === 'hero' ? 100 : 80
    const REPULSION_DISTANCE = variant === 'hero' ? 70 : 60
    const FLOAT_SPEED = variant === 'hero' ? 0.25 : 0.3
    const CHANGE_DIRECTION_CHANCE = 0.002

    // Hero variant uses softer, on-brand colors for better text overlay
    const heroColors = {
      community: ['#D4A373', '#2D5F4F', '#D97757'], // ochre, sage, terracotta
      storyteller: ['#a8866e', '#67805c', '#c17d5f', '#8b7355', '#5a7a5c', '#b8927a', '#7a9372', '#d4a890'],
      story: ['#d3c4b8', '#b8c7b0', '#e8c4b8', '#c9bdb3', '#c5d1bf', '#f0d5c8']
    }

    const defaultColors = {
      community: ['#a8866e', '#67805c', '#0ea5e9'],
      storyteller: ['#75583f', '#526946', '#0284c7', '#5c442b', '#3e5131', '#075985', '#8f6d54', '#7e9774'],
      story: ['#c1a08f', '#9cad92', '#38bdf8', '#d3b9aa', '#b7c2ae', '#7dd3fc']
    }

    const colors = variant === 'hero' ? heroColors : defaultColors

    // Reduce nodes on mobile for performance
    const communityCount = isMobile ? 2 : 3
    const storytellerCount = isMobile ? 4 : 8
    const storyCount = isMobile ? 2 : 6

    // Create freely floating nodes with random initial positions and velocities
    const nodes: Node[] = [
      // Community nodes (larger, slower)
      ...Array.from({length: communityCount}, (_, i) => {
        return {
          id: `community_${i}`,
          x: 50 + Math.random() * (width - 100),
          y: 50 + Math.random() * (height - 100),
          vx: (Math.random() - 0.5) * FLOAT_SPEED * 0.7,
          vy: (Math.random() - 0.5) * FLOAT_SPEED * 0.7,
          radius: variant === 'hero' ? 14 + Math.random() * 6 : 12 + Math.random() * 4,
          type: 'community' as const,
          colour: colors.community[i % colors.community.length],
          targetX: 0, targetY: 0,
          energy: 0.8 + Math.random() * 0.4
        }
      }),

      // Storyteller nodes (medium size, medium speed)
      ...Array.from({length: storytellerCount}, (_, i) => {
        return {
          id: `storyteller_${i}`,
          x: 30 + Math.random() * (width - 60),
          y: 30 + Math.random() * (height - 60),
          vx: (Math.random() - 0.5) * FLOAT_SPEED,
          vy: (Math.random() - 0.5) * FLOAT_SPEED,
          radius: variant === 'hero' ? 10 + Math.random() * 4 : 8 + Math.random() * 3,
          type: 'storyteller' as const,
          colour: colors.storyteller[i % colors.storyteller.length],
          targetX: 0, targetY: 0,
          energy: 0.6 + Math.random() * 0.4
        }
      }),

      // Story nodes (smaller, faster)
      ...Array.from({length: storyCount}, (_, i) => {
        return {
          id: `story_${i}`,
          x: 20 + Math.random() * (width - 40),
          y: 20 + Math.random() * (height - 40),
          vx: (Math.random() - 0.5) * FLOAT_SPEED * 1.3,
          vy: (Math.random() - 0.5) * FLOAT_SPEED * 1.3,
          radius: variant === 'hero' ? 6 + Math.random() * 3 : 5 + Math.random() * 2,
          type: 'story' as const,
          colour: colors.story[i % colors.story.length],
          targetX: 0, targetY: 0,
          energy: 0.4 + Math.random() * 0.3
        }
      })
    ]

    // Dynamic edges - will be calculated each frame based on proximity
    let edges: Edge[] = []

    // Ambient particles
    const particles: Particle[] = []
    
    function createParticle() {
      const angle = Math.random() * Math.PI * 2
      const radius = 50 + Math.random() * 150
      const speed = 0.2 + Math.random() * 0.5
      
      particles.push({
        x: width/2 + Math.cos(angle) * radius,
        y: height/2 + Math.sin(angle) * radius,
        vx: Math.cos(angle + Math.PI/2) * speed,
        vy: Math.sin(angle + Math.PI/2) * speed,
        life: 1,
        maxLife: 100 + Math.random() * 200,
        size: 1 + Math.random() * 2
      })
    }

    let time = 0
    let particleTimer = 0

    // Calculate dynamic connections based on proximity
    function updateConnections() {
      edges = []
      
      nodes.forEach((node, i) => {
        nodes.slice(i + 1).forEach(other => {
          const dx = node.x - other.x
          const dy = node.y - other.y
          const distance = Math.sqrt(dx*dx + dy*dy)
          
          // Create connection if nodes are within connection distance
          if (distance < CONNECTION_DISTANCE) {
            const strength = Math.max(0.1, (CONNECTION_DISTANCE - distance) / CONNECTION_DISTANCE)
            edges.push({
              source: node.id,
              target: other.id,
              strength: strength * 0.6 // Make connections more subtle
            })
          }
        })
      })
    }

    // Physics simulation for free-floating behaviour
    function updatePhysics() {
      nodes.forEach(node => {
        // Randomly change direction occasionally for organic movement
        if (Math.random() < CHANGE_DIRECTION_CHANCE) {
          node.vx += (Math.random() - 0.5) * 0.4
          node.vy += (Math.random() - 0.5) * 0.4
        }

        // Add gentle random drift
        node.vx += (Math.random() - 0.5) * 0.02
        node.vy += (Math.random() - 0.5) * 0.02

        // Soft repulsion to prevent nodes from getting too close
        nodes.forEach(other => {
          if (other.id !== node.id) {
            const dx = node.x - other.x
            const dy = node.y - other.y
            const distance = Math.sqrt(dx*dx + dy*dy)
            
            if (distance < REPULSION_DISTANCE && distance > 0) {
              const force = (REPULSION_DISTANCE - distance) / distance * 0.008
              node.vx += dx * force
              node.vy += dy * force
            }
          }
        })

        // Apply damping to prevent excessive speed
        node.vx *= DAMPING
        node.vy *= DAMPING

        // Limit maximum velocity
        const maxVelocity = FLOAT_SPEED * 1.5
        const currentSpeed = Math.sqrt(node.vx*node.vx + node.vy*node.vy)
        if (currentSpeed > maxVelocity) {
          node.vx = (node.vx / currentSpeed) * maxVelocity
          node.vy = (node.vy / currentSpeed) * maxVelocity
        }

        // Update position
        node.x += node.vx
        node.y += node.vy

        // Boundary constraints with gentle bounce
        const margin = node.radius + 10
        if (node.x < margin) { 
          node.x = margin; 
          node.vx = Math.abs(node.vx) * 0.8 // Bounce back gently
        }
        if (node.x > width - margin) { 
          node.x = width - margin; 
          node.vx = -Math.abs(node.vx) * 0.8 
        }
        if (node.y < margin) { 
          node.y = margin; 
          node.vy = Math.abs(node.vy) * 0.8 
        }
        if (node.y > height - margin) { 
          node.y = height - margin; 
          node.vy = -Math.abs(node.vy) * 0.8 
        }
      })
    }

    function drawCurvedEdge(source: Node, target: Node, strength: number) {
      const dx = target.x - source.x
      const dy = target.y - source.y
      const distance = Math.sqrt(dx*dx + dy*dy)

      // Calculate control points for bezier curve
      const midX = (source.x + target.x) / 2
      const midY = (source.y + target.y) / 2
      const curvature = Math.sin(time * 0.01 + distance * 0.01) * 20 * strength
      const controlX = midX + dy / distance * curvature
      const controlY = midY - dx / distance * curvature

      // Dynamic opacity and width - softer for hero variant
      const baseOpacity = variant === 'hero' ? 0.08 : 0.05
      const opacityMultiplier = variant === 'hero' ? 0.12 : 0.15
      const opacity = (baseOpacity + strength * opacityMultiplier) * (1 + Math.sin(time * 0.02 + distance * 0.01) * 0.1)
      const lineWidth = variant === 'hero' ? 0.8 + strength * 1.2 : 0.5 + strength * 1

      // Hero uses warm brown tone, default uses gray
      const edgeColor = variant === 'hero' ? '139, 115, 85' : '75, 85, 99'
      ctx.strokeStyle = `rgba(${edgeColor}, ${opacity})`
      ctx.lineWidth = lineWidth
      ctx.beginPath()
      ctx.moveTo(source.x, source.y)
      ctx.quadraticCurveTo(controlX, controlY, target.x, target.y)
      ctx.stroke()
    }

    function drawNode(node: Node) {
      const pulse = 1 + Math.sin(time * 0.03 + node.energy * 4) * 0.08
      
      // Simple outer glow (single layer)
      const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius + 8)
      glowGradient.addColorStop(0, `${node.colour}66`)
      glowGradient.addColorStop(1, 'transparent')
      
      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.radius + 8, 0, Math.PI * 2)
      ctx.fill()
      
      // Main node body
      ctx.fillStyle = node.colour
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2)
      ctx.fill()
      
      // Simple highlight
      if (node.type === 'community') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.beginPath()
        ctx.arc(node.x - node.radius/4, node.y - node.radius/4, node.radius * 0.2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.beginPath()
        ctx.arc(node.x - node.radius/5, node.y - node.radius/5, node.radius * 0.15, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function animate() {
      time += 1
      particleTimer += 1
      
      // Clear canvas completely
      ctx.clearRect(0, 0, width, height)
      
      // Update physics and connections
      updatePhysics()
      updateConnections() // Calculate dynamic connections based on proximity
      
      // Draw connections (which now change dynamically)
      edges.forEach(edge => {
        const source = nodes.find(n => n.id === edge.source)
        const target = nodes.find(n => n.id === edge.target)
        if (source && target) {
          drawCurvedEdge(source, target, edge.strength)
        }
      })
      
      // Draw nodes
      nodes.forEach(drawNode)
      
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isMobile, variant])

  return (
    <canvas
      ref={canvasRef}
      className={`${variant === 'hero' ? '' : 'rounded-lg'} ${className}`}
      style={{
        background: 'transparent',
        display: 'block',
        width: '100%',
        height: '100%'
      }}
    />
  )
}
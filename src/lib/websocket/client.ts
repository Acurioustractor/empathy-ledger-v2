import { EventEmitter } from 'events'
import { toast } from 'sonner'

export type WebSocketEvent = 
  | 'story:created'
  | 'story:updated'
  | 'story:deleted'
  | 'comment:added'
  | 'like:added'
  | 'user:online'
  | 'user:offline'
  | 'notification:new'
  | 'typing:start'
  | 'typing:stop'

interface WebSocketMessage {
  type: WebSocketEvent
  payload: any
  timestamp: string
  userId?: string
}

class WebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatTimer: NodeJS.Timeout | null = null
  private isConnected = false
  private userId: string | null = null

  constructor() {
    super()
    this.setMaxListeners(100) // Increase max listeners for multiple components
  }

  connect(userId: string, token?: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected')
      return
    }

    this.userId = userId
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = process.env.NEXT_PUBLIC_WS_URL || `${protocol}//${window.location.host}`
    
    try {
      this.ws = new WebSocket(`${host}/ws?userId=${userId}${token ? `&token=${token}` : ''}`)
      
      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
      this.ws.onerror = this.handleError.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      this.scheduleReconnect()
    }
  }

  private handleOpen() {
    console.log('WebSocket connected')
    this.isConnected = true
    this.reconnectAttempts = 0
    this.emit('connected')
    
    // Start heartbeat
    this.startHeartbeat()
    
    // Send initial presence
    this.send('user:online', { userId: this.userId })
  }

  private handleMessage(event: MessageEvent) {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)
      
      // Handle ping/pong for heartbeat
      if (message.type === 'pong' as any) {
        return
      }
      
      // Emit event for listeners
      this.emit(message.type, message.payload)
      
      // Handle specific message types
      switch (message.type) {
        case 'notification:new':
          this.handleNotification(message.payload)
          break
        case 'story:created':
        case 'story:updated':
        case 'story:deleted':
          this.emit('stories:refresh', message.payload)
          break
        case 'comment:added':
        case 'like:added':
          this.emit('engagement:update', message.payload)
          break
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  private handleError(error: Event) {
    console.error('WebSocket error:', error)
    this.emit('error', error)
  }

  private handleClose(event: CloseEvent) {
    console.log('WebSocket disconnected:', event.code, event.reason)
    this.isConnected = false
    this.stopHeartbeat()
    this.emit('disconnected')
    
    // Send offline presence if clean close
    if (event.code === 1000) {
      this.send('user:offline', { userId: this.userId })
    }
    
    // Attempt reconnection if not a clean close
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000)
    this.reconnectAttempts++
    
    console.log(`Attempting reconnection in ${delay}ms (attempt ${this.reconnectAttempts})`)
    
    this.reconnectTimer = setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId)
      }
    }, delay)
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }))
      }
    }, 30000) // Send heartbeat every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private handleNotification(payload: any) {
    // Show toast notification for important events
    if (payload.showToast !== false) {
      toast(payload.title || 'New Notification', {
        description: payload.message,
        action: payload.actionUrl ? {
          label: 'View',
          onClick: () => window.location.href = payload.actionUrl
        } : undefined
      })
    }
  }

  send(type: WebSocketEvent, payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        payload,
        timestamp: new Date().toISOString(),
        userId: this.userId || undefined
      }
      
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket not connected, queuing message:', type)
      // Could implement message queue here
    }
  }

  subscribe(event: WebSocketEvent | 'connected' | 'disconnected' | 'error' | 'stories:refresh' | 'engagement:update', handler: (data?: any) => void) {
    this.on(event, handler)
    
    // Return unsubscribe function
    return () => {
      this.off(event, handler)
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    this.stopHeartbeat()
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
    
    this.isConnected = false
    this.removeAllListeners()
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: this.ws?.readyState,
      reconnectAttempts: this.reconnectAttempts
    }
  }
}

// Singleton instance
const wsClient = new WebSocketClient()

export default wsClient
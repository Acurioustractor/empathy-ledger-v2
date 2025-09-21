import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/context/auth.context'
import wsClient, { WebSocketEvent } from '@/lib/websocket/client'

interface UseWebSocketOptions {
  autoConnect?: boolean
  events?: {
    event: WebSocketEvent | 'connected' | 'disconnected' | 'error' | 'stories:refresh' | 'engagement:update'
    handler: (data?: any) => void
  }[]
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { autoConnect = true, events = [] } = options
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState(wsClient.getConnectionStatus())

  useEffect(() => {
    if (!user?.id || !autoConnect) return

    // Connect to WebSocket
    wsClient.connect(user.id, user.access_token)

    // Subscribe to connection events
    const unsubscribeConnected = wsClient.subscribe('connected', () => {
      setIsConnected(true)
      setConnectionStatus(wsClient.getConnectionStatus())
    })

    const unsubscribeDisconnected = wsClient.subscribe('disconnected', () => {
      setIsConnected(false)
      setConnectionStatus(wsClient.getConnectionStatus())
    })

    // Subscribe to custom events
    const unsubscribers = events.map(({ event, handler }) => 
      wsClient.subscribe(event, handler)
    )

    // Update connection status periodically
    const statusInterval = setInterval(() => {
      setConnectionStatus(wsClient.getConnectionStatus())
    }, 5000)

    return () => {
      unsubscribeConnected()
      unsubscribeDisconnected()
      unsubscribers.forEach(unsub => unsub())
      clearInterval(statusInterval)
      
      // Don't disconnect on unmount as other components might be using it
      // wsClient.disconnect()
    }
  }, [user?.id, autoConnect])

  const send = useCallback((type: WebSocketEvent, payload: any) => {
    wsClient.send(type, payload)
  }, [])

  const subscribe = useCallback((event: WebSocketEvent | 'connected' | 'disconnected' | 'error' | 'stories:refresh' | 'engagement:update', handler: (data?: any) => void) => {
    return wsClient.subscribe(event, handler)
  }, [])

  return {
    isConnected,
    connectionStatus,
    send,
    subscribe,
    wsClient
  }
}

// Hook for real-time typing indicators
export function useTypingIndicator(channelId: string) {
  const { user } = useAuth()
  const { send, subscribe } = useWebSocket()
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  
  useEffect(() => {
    const handleTypingStart = (data: { userId: string, channelId: string }) => {
      if (data.channelId === channelId && data.userId !== user?.id) {
        setTypingUsers(prev => new Set(prev).add(data.userId))
      }
    }
    
    const handleTypingStop = (data: { userId: string, channelId: string }) => {
      if (data.channelId === channelId) {
        setTypingUsers(prev => {
          const next = new Set(prev)
          next.delete(data.userId)
          return next
        })
      }
    }
    
    const unsubStart = subscribe('typing:start', handleTypingStart)
    const unsubStop = subscribe('typing:stop', handleTypingStop)
    
    return () => {
      unsubStart()
      unsubStop()
    }
  }, [channelId, user?.id, subscribe])
  
  const sendTyping = useCallback((isTyping: boolean) => {
    if (!user?.id) return
    
    send(isTyping ? 'typing:start' : 'typing:stop', {
      userId: user.id,
      channelId,
      userName: user.user_metadata?.display_name || 'Anonymous'
    })
  }, [channelId, user, send])
  
  return {
    typingUsers: Array.from(typingUsers),
    sendTyping
  }
}

// Hook for real-time story updates
export function useRealtimeStories() {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const { subscribe } = useWebSocket()
  
  useEffect(() => {
    const handleStoryUpdate = () => {
      setLastUpdate(new Date())
    }
    
    const unsubCreate = subscribe('story:created', handleStoryUpdate)
    const unsubUpdate = subscribe('story:updated', handleStoryUpdate)
    const unsubDelete = subscribe('story:deleted', handleStoryUpdate)
    const unsubRefresh = subscribe('stories:refresh', handleStoryUpdate)
    
    return () => {
      unsubCreate()
      unsubUpdate()
      unsubDelete()
      unsubRefresh()
    }
  }, [subscribe])
  
  return { lastUpdate }
}

// Hook for online presence
export function useOnlinePresence(userIds: string[]) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const { subscribe } = useWebSocket()
  
  useEffect(() => {
    const handleUserOnline = (data: { userId: string }) => {
      if (userIds.includes(data.userId)) {
        setOnlineUsers(prev => new Set(prev).add(data.userId))
      }
    }
    
    const handleUserOffline = (data: { userId: string }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev)
        next.delete(data.userId)
        return next
      })
    }
    
    const unsubOnline = subscribe('user:online', handleUserOnline)
    const unsubOffline = subscribe('user:offline', handleUserOffline)
    
    return () => {
      unsubOnline()
      unsubOffline()
    }
  }, [userIds, subscribe])
  
  return { onlineUsers: Array.from(onlineUsers) }
}
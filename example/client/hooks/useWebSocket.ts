import { useState, useEffect, useRef, useCallback } from 'react'

export interface TranscriptionMessage {
  user: string
  content: string
  call_id: string
  start: number
  end: number
  duration: number
  emitted_at: number
}

export interface UseWebSocketReturn {
  isConnected: boolean
  messages: TranscriptionMessage[]
  reconnect: () => void
}

export function useWebSocket(url: string): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<TranscriptionMessage[]>([])
  
  const ws = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  
  const maxReconnectAttempts = 10
  const baseDelay = 1000 // 1 second

  const getReconnectDelay = () => {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s, max 60s
    const delay = baseDelay * Math.pow(2, reconnectAttempts.current)
    return Math.min(delay, 60000)
  }

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      ws.current = new WebSocket(url)
      
      ws.current.onopen = () => {
        console.log('WebSocket connected to:', url)
        setIsConnected(true)
        reconnectAttempts.current = 0
      }
      
      ws.current.onmessage = (event) => {
        try {
          const message: TranscriptionMessage = JSON.parse(event.data)
          console.log('Received transcription:', message)
          setMessages(prev => [...prev, message])
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }
      
      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)
        
        // Only attempt reconnection if it wasn't a clean close and we haven't exceeded max attempts
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          const delay = getReconnectDelay()
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.log('Max reconnection attempts reached')
        }
      }
      
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsConnected(false)
      }
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      setIsConnected(false)
    }
  }, [url])

  const reconnect = useCallback(() => {
    reconnectAttempts.current = 0
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    connect()
  }, [connect])

  useEffect(() => {
    connect()
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      
      if (ws.current) {
        ws.current.close(1000, 'Component unmounting')
      }
    }
  }, [connect])

  return {
    isConnected,
    messages,
    reconnect
  }
}

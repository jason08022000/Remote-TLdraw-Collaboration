import React, { createContext, useContext, useState, ReactNode } from 'react'
import { TranscriptionMessage } from '../hooks/useWebSocket'

export interface BufferedDiagram {
	id: string
	message: TranscriptionMessage
	changes: any[] // TLAiChange[] - will be populated by AI generation
	generatedAt: number
	status: 'pending' | 'generated' | 'applied' | 'error'
	error?: string
}

interface WebSocketMessagesContextType {
	diagrams: BufferedDiagram[]
	addDiagram: (message: TranscriptionMessage) => string
	updateDiagram: (id: string, updates: Partial<BufferedDiagram>) => void
	removeDiagram: (id: string) => void
	clearDiagrams: () => void
}

const WebSocketMessagesContext = createContext<WebSocketMessagesContextType | undefined>(undefined)

export function WebSocketMessagesProvider({ children }: { children: ReactNode }) {
	const [diagrams, setDiagrams] = useState<BufferedDiagram[]>([])

	const addDiagram = (message: TranscriptionMessage): string => {
		const id = `${message.call_id}-${message.emitted_at}`
		
		setDiagrams(prev => {
			// Avoid duplicates
			const exists = prev.some(d => d.id === id)
			if (exists) return prev
			
			const newDiagram: BufferedDiagram = {
				id,
				message,
				changes: [],
				generatedAt: Date.now(),
				status: 'pending'
			}
			
			return [...prev, newDiagram]
		})
		
		return id
	}

	const updateDiagram = (id: string, updates: Partial<BufferedDiagram>) => {
		setDiagrams(prev => 
			prev.map(d => d.id === id ? { ...d, ...updates } : d)
		)
	}

	const removeDiagram = (id: string) => {
		setDiagrams(prev => prev.filter(d => d.id !== id))
	}

	const clearDiagrams = () => {
		setDiagrams([])
	}

	return (
		<WebSocketMessagesContext.Provider value={{ diagrams, addDiagram, updateDiagram, removeDiagram, clearDiagrams }}>
			{children}
		</WebSocketMessagesContext.Provider>
	)
}

export function useWebSocketMessages() {
	const context = useContext(WebSocketMessagesContext)
	if (context === undefined) {
		throw new Error('useWebSocketMessages must be used within a WebSocketMessagesProvider')
	}
	return context
}


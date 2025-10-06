import { FormEventHandler, useCallback, useRef, useState, useEffect } from 'react'
import { 
	Box, 
	Button, 
	Input, 
	Text,
	HStack
} from '@chakra-ui/react'
import { DefaultSpinner, Editor } from 'tldraw'
import { useTldrawAiExample } from '../../useTldrawAiExample'
import { SampleDiagramsMenu } from '../../components/SampleDiagramsMenu'
import { AiGeneratedDiagramsMenu } from '../../components/AiGeneratedDiagramsMenu'
import { TranscriptionMessage } from '../../hooks/useWebSocket'
import { useWebSocketMessages } from '../../contexts/WebSocketMessagesContext'

interface AiInputBarProps {
	editor: Editor
	webSocketMessages?: TranscriptionMessage[]
}

export function AiInputBar({ editor, webSocketMessages = [] }: AiInputBarProps) {
	const ai = useTldrawAiExample(editor)
	const { addDiagram, updateDiagram } = useWebSocketMessages()

	// The state of the prompt input, either idle or loading with a cancel callback
	const [isGenerating, setIsGenerating] = useState(false)

	// A stashed cancel function that we can call if the user clicks the button while loading
	const rCancelFn = useRef<(() => void) | null>(null)

	// Track processed WebSocket messages to avoid duplicates in context
	const processedMessageIds = useRef<Set<string>>(new Set())
	
	// Track ongoing AI generations
	const activeGenerations = useRef<Set<string>>(new Set())

	// Put the ai helpers onto the window for debugging
	useRef(() => {
		;(window as any).ai = ai
	})

	// Function to generate diagram and store in buffer without applying
	const generateToBuffer = useCallback(async (message: TranscriptionMessage) => {
		const diagramId = `${message.call_id}-${message.emitted_at}`
		
		// Prevent duplicate generations
		if (activeGenerations.current.has(diagramId)) {
			return
		}
		
		activeGenerations.current.add(diagramId)
		
		try {
			console.log(`🤖 Generating diagram for buffer: "${message.content}"`)
			
			const promptText = `Create a linear diagram from this transcription if it describes a process or sequence of steps: "${message.content}"`
			
			// Collect all changes without applying them
			const collectedChanges: any[] = []
			
			// Create a temporary AI module to prepare the prompt
			const { TldrawAiModule } = await import('@tldraw/ai')
			const tempAiModule = new TldrawAiModule({ editor })
			
			// Get the serialized prompt
			const { prompt } = await tempAiModule.generate(promptText)
			const serializedPrompt = {
				...prompt,
				promptBounds: prompt.promptBounds.toJson(),
				contextBounds: prompt.contextBounds.toJson(),
			}
			
			// Manually stream changes from the AI service
			const res = await fetch('/stream', {
				method: 'POST',
				body: JSON.stringify(serializedPrompt),
				headers: {
					'Content-Type': 'application/json',
				}
			})

			if (!res.body) {
				throw new Error('No body in response')
			}

			const reader = res.body.getReader()
			const decoder = new TextDecoder()
			let buffer = ''

			while (true) {
				const { value, done } = await reader.read()
				if (done) break

				buffer += decoder.decode(value, { stream: true })
				const events = buffer.split('\n\n')
				buffer = events.pop() || ''

				for (const event of events) {
					const match = event.match(/^data: (.+)$/m)
					if (match) {
						try {
							const change = JSON.parse(match[1])
							// Collect the change instead of applying it
							collectedChanges.push(change)
							console.log(`  📥 Collected change type: ${change.type}`, change)
						} catch (err) {
							console.error('JSON parsing error:', err)
						}
					}
				}
			}
			
			// Only add to buffer if AI actually generated changes
			if (collectedChanges.length > 0) {
				// Add to buffer with generated changes
				addDiagram(message)
				updateDiagram(diagramId, {
					changes: collectedChanges,
					status: 'generated'
				})
				
				console.log(`✅ Diagram generated and buffered (${collectedChanges.length} changes)`)
			} else {
				console.log(`⚠️ No diagram generated for: "${message.content}" - skipping buffer`)
			}
		} catch (error) {
			console.error('❌ Failed to generate diagram:', error)
			// Don't add failed generations to buffer either - they're not useful
		} finally {
			activeGenerations.current.delete(diagramId)
		}
	}, [editor, addDiagram, updateDiagram])

	// Process new WebSocket messages and generate diagrams in background
	useEffect(() => {
		const newMessages = webSocketMessages.filter(msg => {
			const messageId = `${msg.call_id}-${msg.emitted_at}`
			return !processedMessageIds.current.has(messageId)
		})

		if (newMessages.length > 0) {
			console.log(`📨 Found ${newMessages.length} new WebSocket messages`)
			
			// Mark messages as processed and generate diagrams
			newMessages.forEach(msg => {
				const messageId = `${msg.call_id}-${msg.emitted_at}`
				processedMessageIds.current.add(messageId)
				
				// Generate diagram in background
				generateToBuffer(msg)
			})
		}
	}, [webSocketMessages, generateToBuffer])

	const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
		async (e) => {
			e.preventDefault()

			// If we have a stashed cancel function, call it and stop here
			if (rCancelFn.current) {
				rCancelFn.current()
				rCancelFn.current = null
				setIsGenerating(false)
				return
			}

			try {
				const formData = new FormData(e.currentTarget)
				const value = formData.get('input') as string

				if (!value.trim()) return

				// We call the ai module with the value from the input field and get back a promise and a cancel function
				const { promise, cancel } = ai.prompt({ message: value, stream: true })

				// Stash the cancel function so we can call it if the user clicks the button again
				rCancelFn.current = cancel

				// Set the state to loading
				setIsGenerating(true)

				// ...wait for the promise to resolve
				await promise

				// ...then set the state back to idle
				setIsGenerating(false)
				rCancelFn.current = null

				// Clear the input
				const form = e.currentTarget
				const input = form.querySelector('input[name="input"]') as HTMLInputElement
				if (input) input.value = ''

			} catch (e: any) {
				console.error(e)
				setIsGenerating(false)
				rCancelFn.current = null
			}
		},
		[ai]
	)

	const bgColor = 'white'
	const borderColor = 'gray.200'

	return (
		<Box 
			bg={bgColor}
			borderTop="1px solid"
			borderColor={borderColor}
			p={3}
		>
			<form onSubmit={handleSubmit} style={{ width: "100%" }}>
				<HStack gap={3}>
					{/* Sample Diagrams Menu */}
					<SampleDiagramsMenu editor={editor} disabled={isGenerating} />
					
					{/* AI Generated Diagrams Menu */}
					<AiGeneratedDiagramsMenu editor={editor} disabled={isGenerating} />

					<Input 
						name="input" 
						placeholder="Enter AI prompt..." 
						autoComplete="off"
						size="sm"
						flex={1}
						borderRadius="md"
						border="1px solid"
						borderColor={borderColor}
						_focus={{
							borderColor: "blue.400"
						}}
						disabled={isGenerating}
					/>
					<Button 
						type="submit"
						colorScheme={isGenerating ? "red" : "blue"}
						size="sm"
						minW="70px"
						disabled={!editor}
						_disabled={{
							opacity: 0.6,
							cursor: "not-allowed"
						}}
					>
						{isGenerating ? (
							<HStack gap={1}>
								<DefaultSpinner />
								<Text fontSize="xs">Cancel</Text>
							</HStack>
						) : (
							'Generate'
						)}
					</Button>
				</HStack>
			</form>
		</Box>
	)
}

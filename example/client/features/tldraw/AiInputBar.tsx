import { FormEventHandler, useCallback, useRef, useState, useEffect } from 'react'
import { 
	Box, 
	Flex, 
	Button, 
	Input, 
	Text,
	HStack
} from '@chakra-ui/react'
import { DefaultSpinner, Editor } from 'tldraw'
import { useTldrawAiExample } from '../../useTldrawAiExample'
import { SampleDiagramsMenu } from '../../components/SampleDiagramsMenu'
import { TranscriptionMessage } from '../../hooks/useWebSocket'

interface AiInputBarProps {
	editor: Editor
	webSocketMessages?: TranscriptionMessage[]
}

export function AiInputBar({ editor, webSocketMessages = [] }: AiInputBarProps) {
	const ai = useTldrawAiExample(editor)

	// The state of the prompt input, either idle or loading with a cancel callback
	const [isGenerating, setIsGenerating] = useState(false)

	// A stashed cancel function that we can call if the user clicks the button while loading
	const rCancelFn = useRef<(() => void) | null>(null)

	// Track processed WebSocket messages to avoid reprocessing
	const processedMessageIds = useRef<Set<string>>(new Set())
	
	// Queue for WebSocket messages waiting to be processed
	const messageQueue = useRef<TranscriptionMessage[]>([])
	const isProcessingQueue = useRef<boolean>(false)

	// Put the ai helpers onto the window for debugging
	useRef(() => {
		;(window as any).ai = ai
	})

	// Function to process the message queue
	const processMessageQueue = useCallback(async () => {
		if (isProcessingQueue.current || messageQueue.current.length === 0) {
			return
		}

		isProcessingQueue.current = true

		while (messageQueue.current.length > 0) {
			const message = messageQueue.current.shift()!
			
			try {
				console.log(`🤖 Processing WebSocket message (${messageQueue.current.length + 1} in queue):`, message.content)
				setIsGenerating(true)

				const prompt = `Create a linear diagram from this transcription if it describes a process or sequence of steps: "${message.content}"`
				const { promise, cancel } = ai.prompt({ message: prompt, stream: true })
				
				rCancelFn.current = cancel
				await promise
				
				console.log('✅ WebSocket message processing completed')
			} catch (error) {
				console.error('❌ WebSocket message processing failed:', error)
			} finally {
				setIsGenerating(false)
				rCancelFn.current = null
			}
		}

		isProcessingQueue.current = false
	}, [ai])

	// Function to add a WebSocket message to the queue
	const queueWebSocketMessage = useCallback((message: TranscriptionMessage) => {
		console.log('📥 Queueing WebSocket message:', message.content)
		messageQueue.current.push(message)
		
		// Start processing if not already processing
		processMessageQueue()
	}, [processMessageQueue])

	// Check for new WebSocket messages and add them to queue
	useEffect(() => {
		const newMessages = webSocketMessages.filter(msg => {
			const messageId = `${msg.call_id}-${msg.emitted_at}`
			return !processedMessageIds.current.has(messageId)
		})

		if (newMessages.length > 0) {
			console.log(`📨 Found ${newMessages.length} new WebSocket messages`)
			
			// Mark all new messages as processed and add them to queue
			newMessages.forEach(msg => {
				const messageId = `${msg.call_id}-${msg.emitted_at}`
				processedMessageIds.current.add(messageId)
				
				// Add each message to the processing queue
				queueWebSocketMessage(msg)
			})
		}
	}, [webSocketMessages, queueWebSocketMessage])

	const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
		async (e) => {
			e.preventDefault()

			// If we have a stashed cancel function, call it and stop here
			if (rCancelFn.current) {
				rCancelFn.current()
				rCancelFn.current = null
				setIsGenerating(false)
				
				// Also pause queue processing for manual input
				isProcessingQueue.current = false
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

				// Resume queue processing after manual input
				setTimeout(() => processMessageQueue(), 100)

			} catch (e: any) {
				console.error(e)
				setIsGenerating(false)
				rCancelFn.current = null
				
				// Resume queue processing even if manual input failed
				setTimeout(() => processMessageQueue(), 100)
			}
		},
		[ai, processMessageQueue]
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

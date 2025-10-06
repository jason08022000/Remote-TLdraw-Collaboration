import { useCallback, useState, useRef, useEffect } from 'react'
import { 
	IconButton, 
	Box,
	Button,
	VStack,
	Text,
	Badge,
	HStack,
	Spinner
} from '@chakra-ui/react'
import { Editor } from 'tldraw'
import { TbSparkles } from 'react-icons/tb'
import { useWebSocketMessages, BufferedDiagram } from '../contexts/WebSocketMessagesContext'
import { TldrawAiModule } from '@tldraw/ai'

interface AiGeneratedDiagramsMenuProps {
	editor: Editor | null
	disabled?: boolean
}

export function AiGeneratedDiagramsMenu({ editor, disabled }: AiGeneratedDiagramsMenuProps) {
	const { diagrams, removeDiagram } = useWebSocketMessages()
	const [isOpen, setIsOpen] = useState(false)
	const [applyingId, setApplyingId] = useState<string | null>(null)
	const menuRef = useRef<HTMLDivElement>(null)

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside)
			return () => document.removeEventListener('mousedown', handleClickOutside)
		}

		return undefined
	}, [isOpen])

	const handleApply = useCallback(async (diagram: BufferedDiagram) => {
		if (!editor || applyingId || diagram.status !== 'generated') return

		setApplyingId(diagram.id)
		
		try {
			console.log(`📊 Applying buffered diagram: "${diagram.message.content}"`)
			
			const aiModule = new TldrawAiModule({ editor })
			
			// Apply all the buffered changes to the canvas
			for (const change of diagram.changes) {
				aiModule.applyChange(change)
			}
			
			console.log('✅ Diagram applied to canvas successfully')
			
			// Remove the diagram from the buffer after successful application
			removeDiagram(diagram.id)
			
			// Close the menu
			setIsOpen(false)
		} catch (error) {
			console.error('❌ Failed to apply diagram:', error)
		} finally {
			setApplyingId(null)
		}
	}, [editor, removeDiagram, applyingId])

	// Truncate long content for display
	const truncateContent = (content: string, maxLength: number = 50) => {
		if (content.length <= maxLength) return content
		return content.substring(0, maxLength) + '...'
	}

	// Get status badge color
	const getStatusColor = (status: BufferedDiagram['status']) => {
		switch (status) {
			case 'pending': return 'yellow'
			case 'generated': return 'green'
			case 'error': return 'red'
			default: return 'gray'
		}
	}

	// Get status icon
	const getStatusIcon = (status: BufferedDiagram['status']) => {
		switch (status) {
			case 'pending': return '⏳'
			case 'generated': return '✓'
			case 'error': return '✗'
			default: return '•'
		}
	}

	return (
		<Box position="relative" ref={menuRef}>
			<Box position="relative">
				<IconButton
					size="sm"
					variant="outline"
					colorScheme="purple"
					disabled={disabled || diagrams.length === 0}
					title="AI Generated Diagrams (Buffer)"
					aria-label="Open AI generated diagrams menu"
					onClick={() => setIsOpen(!isOpen)}
				>
					<TbSparkles />
				</IconButton>
				
				{diagrams.length > 0 && (
					<Badge
						position="absolute"
						top="-8px"
						right="-8px"
						colorScheme="red"
						borderRadius="full"
						fontSize="10px"
						minW="18px"
						h="18px"
						display="flex"
						alignItems="center"
						justifyContent="center"
					>
						{diagrams.length}
					</Badge>
				)}
			</Box>
			
			{isOpen && (
				<Box
					position="absolute"
					bottom="calc(100% + 8px)"
					left={0}
					zIndex={9999}
					bg="white"
					border="1px solid"
					borderColor="gray.200"
					borderRadius="md"
					boxShadow="xl"
					p={2}
					minW="320px"
					maxW="420px"
					maxH="400px"
					overflowY="auto"
				>
					{diagrams.length === 0 ? (
						<Text fontSize="sm" color="gray.500" p={2} textAlign="center">
							No buffered diagrams available
						</Text>
					) : (
						<VStack gap={1} align="stretch">
							<Text fontSize="xs" color="gray.600" fontWeight="bold" px={2} py={1}>
								Click to apply diagram to canvas:
							</Text>
							{diagrams.map((diagram) => {
								const isReady = diagram.status === 'generated'
								const isApplying = applyingId === diagram.id
								
								return (
									<Button
										key={diagram.id}
										size="sm"
										variant="ghost"
										colorScheme={isReady ? 'purple' : 'gray'}
										onClick={() => isReady && handleApply(diagram)}
										justifyContent="flex-start"
										_hover={isReady ? { bg: 'purple.50' } : {}}
										disabled={!isReady || isApplying}
										whiteSpace="normal"
										textAlign="left"
										h="auto"
										py={2}
										cursor={isReady ? 'pointer' : 'default'}
									>
										<VStack align="stretch" gap={1} w="100%">
											<HStack justify="space-between">
												<HStack gap={1}>
													<Text fontSize="xs" fontWeight="bold" color={isReady ? 'purple.600' : 'gray.600'}>
														{diagram.message.user}
													</Text>
													<Badge colorScheme={getStatusColor(diagram.status)} fontSize="9px">
														{getStatusIcon(diagram.status)} {diagram.status}
													</Badge>
												</HStack>
												<Text fontSize="xs" color="gray.500">
													{new Date(diagram.message.emitted_at).toLocaleTimeString()}
												</Text>
											</HStack>
											<Text fontSize="sm" color="gray.700">
												{truncateContent(diagram.message.content, 70)}
											</Text>
											{diagram.status === 'pending' && (
												<HStack gap={1} fontSize="xs" color="gray.500">
													<Spinner size="xs" />
													<Text>Generating...</Text>
												</HStack>
											)}
											{diagram.status === 'error' && diagram.error && (
												<Text fontSize="xs" color="red.500">
													Error: {diagram.error}
												</Text>
											)}
											{isApplying && (
												<HStack gap={1} fontSize="xs" color="purple.500">
													<Spinner size="xs" />
													<Text>Applying...</Text>
												</HStack>
											)}
										</VStack>
									</Button>
								)
							})}
						</VStack>
					)}
				</Box>
			)}
		</Box>
	)
}


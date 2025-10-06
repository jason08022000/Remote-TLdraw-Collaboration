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
			console.log(`📦 Diagram has ${diagram.changes.length} changes`)
			
			// Find the lowest point on the canvas to avoid overlaps
			const allShapes = editor.getCurrentPageShapes()
			let lowestY = 100 // Default starting Y position
			
			console.log(`🔍 Found ${allShapes.length} existing shapes on canvas`)
			
			if (allShapes.length > 0) {
				// Find the maximum Y coordinate (bottom-most point)
				allShapes.forEach(shape => {
					const bounds = editor.getShapePageBounds(shape.id)
					if (bounds) {
						const shapeBottom = bounds.y + bounds.h
						console.log(`  Shape ${shape.id}: bottom at Y=${shapeBottom.toFixed(2)}`)
						if (shapeBottom > lowestY) {
							lowestY = shapeBottom
						}
					}
				})
				
				// Add vertical gap below existing shapes
				console.log(`  Lowest point found: Y=${lowestY.toFixed(2)}`)
				lowestY += 200
				console.log(`  After adding 200px gap: Y=${lowestY.toFixed(2)}`)
			} else {
				console.log(`  Canvas is empty, using default Y=${lowestY}`)
			}
			
			const aiModule = new TldrawAiModule({ editor })
			
			// Calculate Y offset needed for the diagram
			// Find the original starting Y position of the diagram
			let originalMinY = Infinity
			let originalMaxY = -Infinity
			
			for (const change of diagram.changes) {
				if (change.type === 'createShape' && change.shape.y !== undefined) {
					console.log(`  Shape in diagram: Y=${change.shape.y}, ID=${change.shape.id}`)
					if (change.shape.y < originalMinY) {
						originalMinY = change.shape.y
					}
					if (change.shape.y > originalMaxY) {
						originalMaxY = change.shape.y
					}
				}
				
				// Handle createLinearDiagram type (from AI)
				if (change.type === 'createLinearDiagram' && change.startPosition) {
					console.log(`  Linear diagram starting at Y=${change.startPosition.y}`)
					if (change.startPosition.y < originalMinY) {
						originalMinY = change.startPosition.y
					}
					// Estimate max Y based on metadata if available
					if (change.metadata && change.metadata.boxHeight) {
						const estimatedMaxY = change.startPosition.y + change.metadata.boxHeight
						if (estimatedMaxY > originalMaxY) {
							originalMaxY = estimatedMaxY
						}
					}
				}
			}
			
			console.log(`📐 Original diagram bounds: minY=${originalMinY}, maxY=${originalMaxY}`)
			
			// Calculate offset to move diagram to new position
			const yOffset = originalMinY !== Infinity ? lowestY - originalMinY : 0
			
			console.log(`🎯 Calculated Y offset: ${yOffset.toFixed(2)} (target: ${lowestY.toFixed(2)}, original: ${originalMinY.toFixed(2)})`)
			
			// Apply all the buffered changes with position adjustment
			let shapesApplied = 0
			for (const change of diagram.changes) {
				// Clone the change to avoid modifying the original
				const adjustedChange = { ...change }
				
				// Handle shape creation with position adjustment and ID fixing
				if (adjustedChange.type === 'createShape' && adjustedChange.shape) {
					const shape = { ...adjustedChange.shape }
					
					// Ensure shape ID has proper prefix
					if (shape.id && typeof shape.id === 'string' && !shape.id.startsWith('shape:')) {
						shape.id = `shape:${shape.id}` as any
					}
					
					// Adjust Y position
					const originalY = shape.y || 0
					shape.y = originalY + yOffset
					
					console.log(`  ✏️ Creating shape ${shape.id}: Y ${originalY.toFixed(2)} → ${shape.y.toFixed(2)} (offset: ${yOffset.toFixed(2)})`)
					
					adjustedChange.shape = shape
					shapesApplied++
				}
				
				// Handle shape updates with position adjustment and ID fixing
				if (adjustedChange.type === 'updateShape' && adjustedChange.shape) {
					const shape = { ...adjustedChange.shape }
					
					// Ensure shape ID has proper prefix
					if (shape.id && typeof shape.id === 'string' && !shape.id.startsWith('shape:')) {
						shape.id = `shape:${shape.id}` as any
					}
					
					// Adjust Y position if it exists
					if (shape.y !== undefined) {
						shape.y = (shape.y || 0) + yOffset
					}
					
					adjustedChange.shape = shape
				}
				
				// Handle bindings - ensure IDs have proper prefixes
				if (adjustedChange.type === 'createBinding' && adjustedChange.binding) {
					const binding = { ...adjustedChange.binding }
					
					// Fix binding ID
					if (binding.id && typeof binding.id === 'string' && !binding.id.startsWith('binding:')) {
						binding.id = `binding:${binding.id}` as any
					}
					
					// Fix fromId and toId shape references
					if (binding.fromId && typeof binding.fromId === 'string' && !binding.fromId.startsWith('shape:')) {
						binding.fromId = `shape:${binding.fromId}` as any
					}
					if (binding.toId && typeof binding.toId === 'string' && !binding.toId.startsWith('shape:')) {
						binding.toId = `shape:${binding.toId}` as any
					}
					
					adjustedChange.binding = binding
				}
				
				// Handle createLinearDiagram with Y offset
				if (adjustedChange.type === 'createLinearDiagram' && adjustedChange.startPosition) {
					const originalY = adjustedChange.startPosition.y
					adjustedChange.startPosition = {
						...adjustedChange.startPosition,
						y: originalY + yOffset
					}
					console.log(`  ✏️ Linear diagram: Y ${originalY.toFixed(2)} → ${adjustedChange.startPosition.y.toFixed(2)} (offset: ${yOffset.toFixed(2)})`)
				}
				
				aiModule.applyChange(adjustedChange)
			}
			
			console.log(`✅ Diagram applied to canvas successfully (${shapesApplied} shapes created)`)
			
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

	// Test function to simulate a diagram without backend (using working pattern from SampleDiagramsMenu)
	const createTestDiagram = useCallback(() => {
		if (!editor) return
		
		console.log('🧪 Creating test diagram...')
		
		// Create a simple test diagram using the working createLinearDiagram pattern
		const testDiagram: BufferedDiagram = {
			id: `test-${Date.now()}`,
			message: {
				user: 'Test',
				content: 'Test diagram',
				call_id: 'test',
				start: 0,
				end: 0,
				duration: 0,
				emitted_at: Date.now()
			},
			changes: [
				{
					type: 'createLinearDiagram',
					description: 'Create a test diagram',
					steps: [
						{ id: `test${Date.now()}1`, title: 'Test 1', color: 'blue' },
						{ id: `test${Date.now()}2`, title: 'Test 2', color: 'green' },
						{ id: `test${Date.now()}3`, title: 'Test 3', color: 'orange' }
					],
					direction: 'horizontal',
					startPosition: { x: 100, y: 100 },
					metadata: { 
						step_count: 3, 
						spacing: 180,
						boxWidth: 140,
						boxHeight: 90
					}
				}
			],
			generatedAt: Date.now(),
			status: 'generated'
		}
		
		// Apply the test diagram
		handleApply(testDiagram)
	}, [editor, handleApply])

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
					disabled={disabled}
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
					<VStack gap={1} align="stretch">
						{/* Test button for debugging - always visible */}
						<Button
							size="xs"
							colorScheme="orange"
							variant="outline"
							onClick={createTestDiagram}
							mb={2}
						>
							🧪 Add Test Diagram (for debugging)
						</Button>
						
						{diagrams.length === 0 ? (
							<Text fontSize="sm" color="gray.500" p={2} textAlign="center">
								No buffered diagrams available
							</Text>
						) : (
							<>
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
							</>
						)}
					</VStack>
				</Box>
			)}
		</Box>
	)
}


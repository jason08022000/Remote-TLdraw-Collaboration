import React, { useState, useCallback, useRef } from 'react'
import { 
	Box, 
	Flex, 
	Button, 
	HStack,
	Text
} from '@chakra-ui/react'
import { CollaborationPanel } from './features/collaboration'
import { TldrawCanvas } from './features/tldraw'
import { Room } from './providers/Room'
import { NameInput } from './components/NameInput'
import { ConnectionStatus } from './components/ConnectionStatus'
import { useUser } from './contexts/UserContext'
import { useWebSocket } from './hooks/useWebSocket'

const WEBSOCKET_URL = 'ws://127.0.0.1:8799'

function App() {
	const { hasSetDetails, roomId, userName, resetUserDetails } = useUser()
	const [isCanvasCollapsed, setIsCanvasCollapsed] = useState(false)
	const [splitPercentage, setSplitPercentage] = useState(50) // 50% split by default
	const [isDragging, setIsDragging] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)
	
	// WebSocket connection for transcription
	const { isConnected, messages, reconnect } = useWebSocket(WEBSOCKET_URL)
	
	const toggleCanvas = () => {
		setIsCanvasCollapsed(!isCanvasCollapsed)
	}

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.preventDefault()
		setIsDragging(true)
	}, [])

	const handleMouseMove = useCallback((e: MouseEvent) => {
		if (!isDragging || !containerRef.current) return
		
		const rect = containerRef.current.getBoundingClientRect()
		const newPercentage = ((e.clientX - rect.left) / rect.width) * 100
		
		// Constrain between 20% and 80% for usability
		const constrainedPercentage = Math.max(20, Math.min(80, newPercentage))
		setSplitPercentage(constrainedPercentage)
	}, [isDragging])

	const handleMouseUp = useCallback(() => {
		setIsDragging(false)
	}, [])

	// Add global mouse event listeners when dragging
	React.useEffect(() => {
		if (isDragging) {
			document.addEventListener('mousemove', handleMouseMove)
			document.addEventListener('mouseup', handleMouseUp)
			document.body.style.cursor = 'col-resize'
			document.body.style.userSelect = 'none'
		} else {
			document.removeEventListener('mousemove', handleMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
			document.body.style.cursor = ''
			document.body.style.userSelect = ''
		}

		return () => {
			document.removeEventListener('mousemove', handleMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
			document.body.style.cursor = ''
			document.body.style.userSelect = ''
		}
	}, [isDragging, handleMouseMove, handleMouseUp])

	const bgColor = 'gray.50'
	const toggleBg = 'white'
	const borderColor = 'gray.200'

	// Show name input if user hasn't set their details yet
	if (!hasSetDetails) {
		return <NameInput />
	}

	return (
		<Flex h="100vh" w="100vw" position="fixed" inset={0} bg={bgColor} ref={containerRef}>
			{/* WebSocket Connection Status */}
			<ConnectionStatus isConnected={isConnected} onReconnect={reconnect} />
			
			{/* Left Panel - Collaboration */}
			<Box 
				w={isCanvasCollapsed ? "100%" : `${splitPercentage}%`}
				position="relative"
				overflow="hidden"
				transition={isDragging ? "none" : "width 0.3s ease"}
			>
				{/* Toggle Button */}
				<Button
					onClick={toggleCanvas}
					position="absolute"
					top={4}
					right={4}
					size="sm"
					colorScheme="blue"
					variant="outline"
					bg={toggleBg}
					shadow="md"
					zIndex={1000}
					minW="auto"
					w="40px"
					h="32px"
					borderRadius="lg"
					title={isCanvasCollapsed ? 'Show Canvas' : 'Hide Canvas'}
					_hover={{
						transform: "translateY(-1px)",
						shadow: "lg",
						borderColor: "blue.400"
					}}
					_active={{
						transform: "translateY(0)",
						shadow: "md"
					}}
				>
					<Text fontSize="sm" fontWeight="bold">
						{isCanvasCollapsed ? '→' : '←'}
					</Text>
				</Button>

				{/* Collaboration Panel */}
				<CollaborationPanel isExpanded={isCanvasCollapsed} />
			</Box>

			{/* Draggable Divider */}
			{!isCanvasCollapsed && (
				<Box
					w="1px"
					bg={borderColor}
					cursor="col-resize"
					onMouseDown={handleMouseDown}
					_hover={{
						w: "2px"
					}}
					transition="width 0.2s ease"
				/>
			)}

			{/* Right Panel - TLdraw Canvas */}
			<Room roomId={roomId}>
				<Box 
					w={isCanvasCollapsed ? "0" : `${100 - splitPercentage}%`}
					transition={isDragging ? "none" : "width 0.3s ease"}
					overflow="hidden"
					position="relative"
				>
					<TldrawCanvas 
						isVisible={!isCanvasCollapsed} 
						webSocketMessages={messages}
					/>
				</Box>
			</Room>

			{/* Status Bar */}
			<Box
				position="absolute"
				bottom={0}
				left={0}
				right={isCanvasCollapsed ? 0 : `${100 - splitPercentage}%`}
				h="24px"
				bg="gray.100"
				borderTop="1px solid"
				borderColor={borderColor}
				px={3}
				transition={isDragging ? "none" : "right 0.3s ease"}
			>
				<HStack h="100%" justify="space-between" fontSize="xs" color="gray.500">
					<HStack gap={3}>
						<Text>Ready</Text>
						<Text>•</Text>
						<Text>{userName} in {roomId}</Text>
					</HStack>
					<HStack gap={3}>
						<Button
							size="xs"
							variant="ghost"
							color="gray.600"
							fontSize="xs"
							h="16px"
							minW="auto"
							px={2}
							onClick={resetUserDetails}
							_hover={{
								bg: "gray.200",
								color: "gray.800"
							}}
						>
							Change Details
						</Button>
						<Text>•</Text>
						<Text>Collaboration</Text>
						{!isCanvasCollapsed && <Text>•</Text>}
						{!isCanvasCollapsed && <Text>Canvas</Text>}
					</HStack>
				</HStack>
			</Box>
		</Flex>
	)
}

export default App

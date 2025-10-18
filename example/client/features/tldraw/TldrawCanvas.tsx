import { useState, useEffect } from 'react'
import { Box, Text } from '@chakra-ui/react'
import { Editor, Tldraw } from 'tldraw'
import { useCollaborativeTldraw } from '../../hooks/useCollaborativeTldraw'
import { AiInputBar } from './AiInputBar'
import { TranscriptionMessage } from '../../hooks/useWebSocket'

interface TldrawCanvasProps {
	isVisible: boolean
	webSocketMessages?: TranscriptionMessage[]
}

// Toggle this to disable collaboration for testing
const USE_COLLABORATION = true;

function CollaborativeTldrawCanvas({ isVisible, webSocketMessages }: TldrawCanvasProps) {
	const [editor, setEditor] = useState<Editor | null>(null)
	const storeWithStatus = useCollaborativeTldraw()

	// Put the editor on the window for debugging
	useEffect(() => {
		if (!editor) return
		;(window as any).editor = editor
	}, [editor])

	// Wait for the store to be ready before rendering
	if (storeWithStatus.status === 'loading') {
		return (
			<Box 
				h="100%" 
				display="flex" 
				alignItems="center" 
				justifyContent="center"
				opacity={isVisible ? 1 : 0}
			>
				<Text>Loading collaborative editor...</Text>
			</Box>
		)
	}

	return (
		<Box 
			h="100%" 
			display="grid" 
			gridTemplateRows="1fr 60px"
			opacity={isVisible ? 1 : 0}
			transition="opacity 0.3s ease"
		>
			{/* TLdraw Canvas */}
			<Box position="relative" overflow="hidden">
				{USE_COLLABORATION ? (
					<Tldraw 
						store={storeWithStatus}
						onMount={setEditor}
					/>
				) : (
					<Tldraw 
						persistenceKey="tldraw-local-demo" 
						onMount={setEditor}
					/>
				)}
			</Box>
			
			{/* AI Input Bar */}
			{editor && <AiInputBar editor={editor} webSocketMessages={webSocketMessages} />}
		</Box>
	)
}

export function TldrawCanvas({ isVisible, webSocketMessages }: TldrawCanvasProps) {
	return <CollaborativeTldrawCanvas isVisible={isVisible} webSocketMessages={webSocketMessages} />
}

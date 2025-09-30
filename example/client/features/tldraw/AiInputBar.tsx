import { FormEventHandler, useCallback, useRef, useState } from 'react'
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

interface AiInputBarProps {
	editor: Editor
}

export function AiInputBar({ editor }: AiInputBarProps) {
	const ai = useTldrawAiExample(editor)

	// The state of the prompt input, either idle or loading with a cancel callback
	const [isGenerating, setIsGenerating] = useState(false)

	// A stashed cancel function that we can call if the user clicks the button while loading
	const rCancelFn = useRef<(() => void) | null>(null)

	// Put the ai helpers onto the window for debugging
	useRef(() => {
		;(window as any).ai = ai
	})

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

import { FormEventHandler, useCallback, useRef, useState } from 'react'
import { 
	Box, 
	Flex, 
	Button, 
	Input, 
	Text,
	HStack,
	IconButton
} from '@chakra-ui/react'
import { DefaultSpinner, Editor } from 'tldraw'
import { TldrawAiModule, TLAiCreateLinearDiagramChange } from '@tldraw/ai'
import { useTldrawAiExample } from '../../useTldrawAiExample'
import { TbTemplate } from 'react-icons/tb'

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

	// Sample diagram handlers
	const createSampleDiagram = useCallback((sampleType: string) => {
		if (!editor) return

		const aiModule = new TldrawAiModule({ editor })

		let change: TLAiCreateLinearDiagramChange

		switch (sampleType) {
			case 'onboarding':
				change = {
					type: 'createLinearDiagram',
					description: 'Create a user onboarding process diagram',
					steps: [
						{ id: 'step1', title: 'Sign Up', color: 'green' },
						{ id: 'step2', title: 'Verify Email', color: 'blue' },
						{ id: 'step3', title: 'Complete Profile', color: 'blue' },
						{ id: 'step4', title: 'Welcome!', color: 'red' }
					],
					direction: 'horizontal',
					startPosition: { x: 100, y: 200 },
					metadata: { step_count: 4, spacing: 180 }
				}
				break

			case 'development':
				change = {
					type: 'createLinearDiagram',
					description: 'Create a development workflow diagram',
					steps: [
						{ id: '2step1', title: 'Plan', color: 'orange' },
						{ id: '2step2', title: 'Code', color: 'blue' },
						{ id: '2step3', title: 'Test', color: 'yellow' },
						{ id: '2step4', title: 'Deploy', color: 'green' }
					],
					direction: 'horizontal',
					startPosition: { x: 100, y: 300 },
					metadata: { step_count: 4, spacing: 160 }
				}
				break

			case 'purchase':
				change = {
					type: 'createLinearDiagram',
					description: 'Create a purchase flow diagram',
					steps: [
						{ id: '3step1', title: 'Browse', color: 'blue' },
						{ id: '3step2', title: 'Add to Cart', color: 'blue' },
						{ id: '3step3', title: 'Checkout', color: 'orange' },
						{ id: '3step4', title: 'Payment', color: 'red' },
						{ id: '3step5', title: 'Confirmation', color: 'green' }
					],
					direction: 'horizontal',
					startPosition: { x: 50, y: 400 },
					metadata: { step_count: 5, spacing: 150 }
				}
				break

			default:
				return
		}

		aiModule.applyChange(change)
		console.log(`✅ Created ${sampleType} linear diagram`)
	}, [editor])

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
					{/* Sample Templates Buttons */}
					<HStack gap={1}>
						<IconButton
							size="sm"
							variant="outline"
							colorScheme="green"
							disabled={isGenerating}
							onClick={() => createSampleDiagram('onboarding')}
							title="User Onboarding Flow"
							aria-label="Create onboarding diagram"
						>
							<TbTemplate />
						</IconButton>
						<IconButton
							size="sm"
							variant="outline"
							colorScheme="blue"
							disabled={isGenerating}
							onClick={() => createSampleDiagram('development')}
							title="Development Workflow"
							aria-label="Create development diagram"
						>
							<TbTemplate />
						</IconButton>
						<IconButton
							size="sm"
							variant="outline"
							colorScheme="orange"
							disabled={isGenerating}
							onClick={() => createSampleDiagram('purchase')}
							title="Purchase Flow"
							aria-label="Create purchase diagram"
						>
							<TbTemplate />
						</IconButton>
					</HStack>

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

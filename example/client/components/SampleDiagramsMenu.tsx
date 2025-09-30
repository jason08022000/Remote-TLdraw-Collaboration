import { useCallback, useState, useRef, useEffect } from 'react'
import { 
	IconButton, 
	Box,
	Button,
	VStack
} from '@chakra-ui/react'
import { Editor } from 'tldraw'
import { TldrawAiModule, TLAiCreateLinearDiagramChange } from '@tldraw/ai'
import { TbTemplate } from 'react-icons/tb'

interface SampleDiagramsMenuProps {
	editor: Editor | null
	disabled?: boolean
}

export function SampleDiagramsMenu({ editor, disabled }: SampleDiagramsMenuProps) {
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
					metadata: { 
						step_count: 4, 
						spacing: 180,
						boxWidth: 140,
						boxHeight: 90
					}
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
					startPosition: { x: 100, y: 350 },
					metadata: { 
						step_count: 4, 
						spacing: 160,
						boxWidth: 100,
						boxHeight: 70
					}
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
					startPosition: { x: 50, y: 500 },
					metadata: { 
						step_count: 5, 
						spacing: 150,
						boxWidth: 130,
						boxHeight: 60
					}
				}
				break

			default:
				return
		}

		aiModule.applyChange(change)
		console.log(`✅ Created ${sampleType} linear diagram`)
	}, [editor])

	const [isOpen, setIsOpen] = useState(false)
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

	const handleSelect = useCallback((sampleType: string) => {
		createSampleDiagram(sampleType)
		setIsOpen(false)
	}, [createSampleDiagram])

	return (
		<Box position="relative" ref={menuRef}>
			<IconButton
				size="sm"
				variant="outline"
				colorScheme="teal"
				disabled={disabled}
				title="Sample Diagrams"
				aria-label="Open sample diagrams menu"
				onClick={() => setIsOpen(!isOpen)}
			>
				<TbTemplate />
			</IconButton>
			
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
					minW="200px"
				>
					<VStack gap={1} align="stretch">
						<Button
							size="sm"
							variant="ghost"
							colorScheme="green"
							onClick={() => handleSelect('onboarding')}
							justifyContent="flex-start"
							_hover={{ bg: 'green.50' }}
						>
							🟢 User Onboarding
						</Button>
						
						<Button
							size="sm"
							variant="ghost"
							colorScheme="blue"
							onClick={() => handleSelect('development')}
							justifyContent="flex-start"
							_hover={{ bg: 'blue.50' }}
						>
							🔵 Development Workflow
						</Button>
						
						<Button
							size="sm"
							variant="ghost"
							colorScheme="orange"
							onClick={() => handleSelect('purchase')}
							justifyContent="flex-start"
							_hover={{ bg: 'orange.50' }}
						>
							🟠 Purchase Flow
						</Button>
					</VStack>
				</Box>
			)}
		</Box>
	)
}

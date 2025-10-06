import { useCallback, useState, useRef, useEffect } from 'react'
import { 
	IconButton, 
	Box,
	Button,
	VStack
} from '@chakra-ui/react'
import { Editor } from 'tldraw'
import { TldrawAiModule, TLAiCreateTableChange } from '@tldraw/ai'
import { TbTemplate } from 'react-icons/tb'

interface SampleDiagramsMenuProps {
	editor: Editor | null
	disabled?: boolean
}

export function SampleDiagramsMenu({ editor, disabled }: SampleDiagramsMenuProps) {
	const createSampleDiagram = useCallback((sampleType: string) => {
		if (!editor) return

		const aiModule = new TldrawAiModule({ editor })

		let change: TLAiCreateTableChange

		switch (sampleType) {
			case 'hospital':
				change = {
					type: 'createTable',
					description: 'Hospital staff schedule table',
					rows: [
						{
							id: 'r1',
							cells: [
								{ id: 'c1', content: 'Doctor', color: 'light-blue' },
								{ id: 'c2', content: 'Shift', color: 'light-blue' },
								{ id: 'c3', content: 'Ward', color: 'light-blue' },
							],
						},
						{
							id: 'r2',
							cells: [
								{ id: 'c4', content: 'Dr. Smith' },
								{ id: 'c5', content: '08:00 - 16:00' },
								{ id: 'c6', content: 'Cardiology' },
							],
						},
						{
							id: 'r3',
							cells: [
								{ id: 'c7', content: 'Dr. Patel' },
								{ id: 'c8', content: '16:00 - 00:00' },
								{ id: 'c9', content: 'Neurology' },
							],
						},
					],
					layout: 'grid',
					startPosition: { x: 100, y: 200 },
					metadata: {
						rowHeight: 75,
						colWidth: 170,
						borderColor: 'black',
						borderWidth: 1,
						spacing: 4,
					},
				}
				break

			case 'students':
				change = {
					type: 'createTable',
					description: 'Student grades table',
					rows: [
						{
							id: 'r1',
							cells: [
								{ id: 'c1', content: 'Name', color: 'light-green' },
								{ id: 'c2', content: 'Course', color: 'light-green' },
								{ id: 'c3', content: 'Grade', color: 'light-green' },
							],
						},
						{
							id: 'r2',
							cells: [
								{ id: 'c4', content: 'Alice' },
								{ id: 'c5', content: 'Math' },
								{ id: 'c6', content: 'A' },
							],
						},
						{
							id: 'r3',
							cells: [
								{ id: 'c7', content: 'Bob' },
								{ id: 'c8', content: 'Science' },
								{ id: 'c9', content: 'B+' },
							],
						},
					],
					layout: 'grid',
					startPosition: { x: 150, y: 300 },
					metadata: {
						rowHeight: 45,
						colWidth: 140,
						borderColor: 'grey',
						borderWidth: 1,
						spacing: 3,
					},
				}
				break

			default:
				return
		}

		aiModule.applyChange(change)
		console.log(`✅ Created ${sampleType} Table`)
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
							onClick={() => handleSelect('hospital')}
							justifyContent="flex-start"
							_hover={{ bg: 'green.50' }}
						>
							🟢 Hospital
						</Button>
						
						<Button
							size="sm"
							variant="ghost"
							colorScheme="blue"
							onClick={() => handleSelect('students')}
							justifyContent="flex-start"
							_hover={{ bg: 'blue.50' }}
						>
							🔵 Student
						</Button>
						
						
					</VStack>
				</Box>
			)}
		</Box>
	)
}

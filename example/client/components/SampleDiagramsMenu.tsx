import { useCallback, useState, useRef, useEffect } from 'react'
import { 
	IconButton, 
	Box,
	Button,
	VStack
} from '@chakra-ui/react'
import { Editor } from 'tldraw'
import { TldrawAiModule, TLAiCreateLinearDiagramChange, TLAiCreateTableChange } from '@tldraw/ai'
import { TbTemplate } from 'react-icons/tb'

interface SampleDiagramsMenuProps {
	editor: Editor | null
	disabled?: boolean
}

export function SampleDiagramsMenu({ editor, disabled }: SampleDiagramsMenuProps) {
	const createSampleDiagram = useCallback((sampleType: string) => {
		if (!editor) return

		const aiModule = new TldrawAiModule({ editor })

		let change: TLAiCreateLinearDiagramChange | TLAiCreateTableChange

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
							id: 'stu_r1',
							cells: [
								{ id: 'stu_c1', content: 'Name', color: 'light-green' },
								{ id: 'stu_c2', content: 'Course', color: 'light-green' },
								{ id: 'stu_c3', content: 'Grade', color: 'light-green' },
							],
						},
						{
							id: 'stu_r2',
							cells: [
								{ id: 'stu_c4', content: 'Alice' },
								{ id: 'stu_c5', content: 'Mathematics 101 ajsiodfjaoisdjfioasjdiofjasiodfja iosdjfoiasjdfoiajsdiofjasdoifjasiodj faoisdjfioasdjfioasdjiofjsdaiofjasoidfjoi' },
								{ id: 'stu_c6', content: 'A' },
							],
						},
						{
							id: 'stu_r3',
							cells: [
								{ id: 'stu_c7', content: 'Bob' },
								{ id: 'stu_c8', content: 'Computer Science Fundamentals' },
								{ id: 'stu_c9', content: 'B+' },
							],
						},
						{
							id: 'stu_r4',
							cells: [
								{ id: 'stu_c10', content: 'Charlie' },
								{ id: 'stu_c11', content: 'Physics' },
								{ id: 'stu_c12', content: 'A-' },
							],
						},
					],
					layout: 'grid',
					startPosition: { x: 150, y: 300 },
					metadata: {
						rowHeight: 50,
						colWidth: 180,
						borderColor: 'grey',
						borderWidth: 1,
						spacing: 3,
					},
				}
				break

			case 'project':
				change = {
					type: 'createTable',
					description: 'Project tracking table',
					rows: [
						{
							id: 'proj_r1',
							cells: [
								{ id: 'proj_c1', content: 'Task', color: 'light-violet' },
								{ id: 'proj_c2', content: 'Owner', color: 'light-violet' },
								{ id: 'proj_c3', content: 'Status', color: 'light-violet' },
								{ id: 'proj_c4', content: 'Due Date', color: 'light-violet' },
							],
						},
						{
							id: 'proj_r2',
							cells: [
								{ id: 'proj_c5', content: 'Design mockups' },
								{ id: 'proj_c6', content: 'Sarah' },
								{ id: 'proj_c7', content: 'In Progress' },
								{ id: 'proj_c8', content: '2025-10-15' },
							],
						},
						{
							id: 'proj_r3',
							cells: [
								{ id: 'proj_c9', content: 'Backend API development' },
								{ id: 'proj_c10', content: 'Michael' },
								{ id: 'proj_c11', content: 'Done' },
								{ id: 'proj_c12', content: '2025-10-10' },
							],
						},
						{
							id: 'proj_r4',
							cells: [
								{ id: 'proj_c13', content: 'Testing' },
								{ id: 'proj_c14', content: 'QA Team' },
								{ id: 'proj_c15', content: 'Not Started' },
								{ id: 'proj_c16', content: '2025-10-20' },
							],
						},
					],
					layout: 'grid',
					startPosition: { x: 100, y: 100 },
					metadata: {
						rowHeight: 55,
						colWidth: 160,
						borderColor: 'black',
						borderWidth: 2,
						spacing: 4,
					},
				}
				break

			case 'menu':
				change = {
					type: 'createTable',
					description: 'Restaurant menu table',
					rows: [
						{
							id: 'menu_r1',
							cells: [
								{ id: 'menu_c1', content: 'Item', color: 'light-red' },
								{ id: 'menu_c2', content: 'Description', color: 'light-red' },
								{ id: 'menu_c3', content: 'Price', color: 'light-red' },
							],
						},
						{
							id: 'menu_r2',
							cells: [
								{ id: 'menu_c4', content: 'Caesar Salad' },
								{ id: 'menu_c5', content: 'Fresh romaine lettuce with house dressing' },
								{ id: 'menu_c6', content: '$12' },
							],
						},
						{
							id: 'menu_r3',
							cells: [
								{ id: 'menu_c7', content: 'Margherita Pizza' },
								{ id: 'menu_c8', content: 'Traditional Italian pizza with tomato, mozzarella, and fresh basil' },
								{ id: 'menu_c9', content: '$18' },
							],
						},
						{
							id: 'menu_r4',
							cells: [
								{ id: 'menu_c10', content: 'Tiramisu' },
								{ id: 'menu_c11', content: 'Classic Italian dessert' },
								{ id: 'menu_c12', content: '$8' },
							],
						},
					],
					layout: 'grid',
					startPosition: { x: 120, y: 250 },
					metadata: {
						rowHeight: 65,
						colWidth: 200,
						borderColor: 'black',
						borderWidth: 1,
						spacing: 3,
					},
				}
				break

			case 'inventory':
				change = {
					type: 'createTable',
					description: 'Inventory tracking table',
					rows: [
						{
							id: 'inv_r1',
							cells: [
								{ id: 'inv_c1', content: 'Product ID', color: 'light-blue' },
								{ id: 'inv_c2', content: 'Name', color: 'light-blue' },
								{ id: 'inv_c3', content: 'Qty', color: 'light-blue' },
								{ id: 'inv_c4', content: 'Location', color: 'light-blue' },
							],
						},
						{
							id: 'inv_r2',
							cells: [
								{ id: 'inv_c5', content: 'SKU-001' },
								{ id: 'inv_c6', content: 'Laptop Dell XPS 15' },
								{ id: 'inv_c7', content: '45' },
								{ id: 'inv_c8', content: 'Warehouse A' },
							],
						},
						{
							id: 'inv_r3',
							cells: [
								{ id: 'inv_c9', content: 'SKU-002' },
								{ id: 'inv_c10', content: 'Mouse' },
								{ id: 'inv_c11', content: '230' },
								{ id: 'inv_c12', content: 'Warehouse B' },
							],
						},
						{
							id: 'inv_r4',
							cells: [
								{ id: 'inv_c13', content: 'SKU-003' },
								{ id: 'inv_c14', content: 'USB-C Hub with Ethernet Port' },
								{ id: 'inv_c15', content: '12' },
								{ id: 'inv_c16', content: 'Warehouse A' },
							],
						},
						{
							id: 'inv_r5',
							cells: [
								{ id: 'inv_c17', content: 'SKU-004' },
								{ id: 'inv_c18', content: 'Monitor 27"' },
								{ id: 'inv_c19', content: '8' },
								{ id: 'inv_c20', content: 'Warehouse C' },
							],
						},
					],
					layout: 'grid',
					startPosition: { x: 80, y: 150 },
					metadata: {
						rowHeight: 50,
						colWidth: 150,
						borderColor: 'black',
						borderWidth: 1,
						spacing: 2,
					},
				}
				break

			case 'schedule':
				change = {
					type: 'createTable',
					description: 'Weekly schedule table',
					rows: [
						{
							id: 'sched_r1',
							cells: [
								{ id: 'sched_c1', content: 'Time', color: 'light-yellow' },
								{ id: 'sched_c2', content: 'Monday', color: 'light-yellow' },
								{ id: 'sched_c3', content: 'Wednesday', color: 'light-yellow' },
								{ id: 'sched_c4', content: 'Friday', color: 'light-yellow' },
							],
						},
						{
							id: 'sched_r2',
							cells: [
								{ id: 'sched_c5', content: '9:00 AM' },
								{ id: 'sched_c6', content: 'Team Standup Meeting' },
								{ id: 'sched_c7', content: 'Code Review' },
								{ id: 'sched_c8', content: 'Planning Session' },
							],
						},
						{
							id: 'sched_r3',
							cells: [
								{ id: 'sched_c9', content: '2:00 PM' },
								{ id: 'sched_c10', content: 'Client Call' },
								{ id: 'sched_c11', content: 'Development Sprint' },
								{ id: 'sched_c12', content: 'Demo' },
							],
						},
					],
					layout: 'grid',
					startPosition: { x: 100, y: 180 },
					metadata: {
						rowHeight: 60,
						colWidth: 170,
						borderColor: 'black',
						borderWidth: 1,
						spacing: 3,
					},
				}
				break

			default:
				return
		}

		aiModule.applyChange(change)
		console.log(`✅ Created ${sampleType} diagram`)
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

						<Button
							size="sm"
							variant="ghost"
							colorScheme="cyan"
							onClick={() => handleSelect('hospital')}
							justifyContent="flex-start"
							_hover={{ bg: 'cyan.50' }}
						>
							🏥 Hospital Table
						</Button>

						<Button
							size="sm"
							variant="ghost"
							colorScheme="purple"
							onClick={() => handleSelect('students')}
							justifyContent="flex-start"
							_hover={{ bg: 'purple.50' }}
						>
							🎓 Students Table
						</Button>

						<Button
							size="sm"
							variant="ghost"
							colorScheme="pink"
							onClick={() => handleSelect('project')}
							justifyContent="flex-start"
							_hover={{ bg: 'pink.50' }}
						>
							📋 Project Tracker
						</Button>

						<Button
							size="sm"
							variant="ghost"
							colorScheme="red"
							onClick={() => handleSelect('menu')}
							justifyContent="flex-start"
							_hover={{ bg: 'red.50' }}
						>
							🍕 Restaurant Menu
						</Button>

						<Button
							size="sm"
							variant="ghost"
							colorScheme="teal"
							onClick={() => handleSelect('inventory')}
							justifyContent="flex-start"
							_hover={{ bg: 'teal.50' }}
						>
							📦 Inventory
						</Button>

						<Button
							size="sm"
							variant="ghost"
							colorScheme="yellow"
							onClick={() => handleSelect('schedule')}
							justifyContent="flex-start"
							_hover={{ bg: 'yellow.50' }}
						>
							📅 Weekly Schedule
						</Button>
					</VStack>
				</Box>
			)}
		</Box>
	)
}

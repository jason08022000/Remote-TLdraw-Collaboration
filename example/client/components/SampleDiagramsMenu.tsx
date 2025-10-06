import { useCallback, useState, useRef, useEffect } from 'react'
import {
	IconButton,
	Box,
	Button,
	VStack
} from '@chakra-ui/react'
import { Editor } from 'tldraw'
import {
	TldrawAiModule,
	TLAiCreateLinearDiagramChange,
	TLAiCreateDecisionMatrixChange,   // ✅ 新增
} from '@tldraw/ai'
import { TbTemplate } from 'react-icons/tb'

// ✅ 导入两个 transform（路径按你项目实际情况调整）
import { SimpleIds } from '../transforms/SimpleIds'
import { SimpleCoordinates } from '../transforms/SimpleCoordinates'

interface SampleDiagramsMenuProps {
	editor: Editor | null
	disabled?: boolean
}

export function SampleDiagramsMenu({ editor, disabled }: SampleDiagramsMenuProps) {
	const createSampleDiagram = useCallback((sampleType: string) => {
		if (!editor) return

		// ✅ 把 transforms 传给 AI 模块（坐标/ID 转换才会生效）
		const aiModule = new TldrawAiModule({ editor, transforms: [SimpleIds, SimpleCoordinates] })

		// 这里支持两类 change：线性图 or 决策矩阵
		let change: TLAiCreateLinearDiagramChange | TLAiCreateDecisionMatrixChange

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

			// ✅ 新增：Decision Matrix 示例
			case 'decision-matrix':
				change = {
					type: 'createDecisionMatrix',
					description: 'Compare options A / B / C across Cost / Risk / Velocity',
					options: [
						{ id: 'A', title: 'A', color: 'blue' },
						{ id: 'B', title: 'B', color: 'green' },
						{ id: 'C', title: 'C', color: 'orange' },
					],
					criteria: [
						{ id: 'cost', title: 'Cost', weight: 2 },     // “Cost matters most.” => 提高权重
						{ id: 'risk', title: 'Risk' },
						{ id: 'velocity', title: 'Velocity' },
					],
					// 稀疏打分（从自然语言里来）：
					scoreCells: [
						{ optionTitle: 'B', criterionTitle: 'Cost', value: 4, max: 5 }, // “I rate option B a 4/5 for cost”
						{ optionTitle: 'C', criterionTitle: 'Risk', value: 3, max: 5 }, // 另外举例
					],
					// 也可以直接给稠密矩阵（可选）：
					// scores: [
					//   [3, 2, 4], // A on [Cost,Risk,Velocity]
					//   [4, 3, 3], // B
					//   [2, 4, 5], // C
					// ],
					advantages: {
						a: ['Simple to implement'],
						b: ['Lower cost'],
						c: ['Fast velocity'],
					},
					disadvantages: {
						b: ['Higher risk of integration'],
					},
					notes: ['Cost matters most.'],
					startPosition: { x: 180, y: 140 },
					metadata: {
						option_count: 3,
						criteria_count: 3,
						cellWidth: 160,
						cellHeight: 56,
						spacingX: 24,        // ↔ 水平间距
						spacingY: 16,        // ↕ 垂直间距
						headerHeight: 40,
						headerWidth: 120,
						maxScore: 5,
						indexConvention: 'rowsAreCriteria', // 你的 handler 以“行=criteria、列=options”为默认
						// 如果你的 handler 仍然使用 metadata.spacing（单数），请把它在 handler 里改成
						// const gapX = metadata?.spacingX ?? metadata?.spacing ?? 24
						// const gapY = metadata?.spacingY ?? metadata?.spacing ?? 16
					},
				}
				break

			default:
				return
		}

		aiModule.applyChange(change as any)
		console.log(`✅ Created ${sampleType}`)
	}, [editor])

	const [isOpen, setIsOpen] = useState(false)
	const menuRef = useRef<HTMLDivElement>(null)

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
					minW="220px"
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

						{/* ✅ 新增：Decision Matrix */}
						<Button
							size="sm"
							variant="ghost"
							colorScheme="purple"
							onClick={() => handleSelect('decision-matrix')}
							justifyContent="flex-start"
							_hover={{ bg: 'purple.50' }}
						>
							🟣 Decision Matrix
						</Button>
					</VStack>
				</Box>
			)}
		</Box>
	)
}

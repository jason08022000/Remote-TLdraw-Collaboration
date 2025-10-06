import type {
	Box,
	BoxModel,
	TLBinding,
	TLBindingCreate,
	TLBindingId,
	TLBindingUpdate,
	TLContent,
	TLShape,
	TLShapeId,
	TLShapePartial,
} from 'tldraw'
import { toRichText } from 'tldraw'

export interface TLAiTextMessage {
	type: 'text'
	text: string
}

export interface TLAiImageMessage {
	type: 'image'
	mimeType: string
	src: string
}

export type TLAiMessage = TLAiTextMessage | TLAiImageMessage

export type TLAiMessages = string | TLAiMessage | TLAiMessage[]

/**
 * A prompt with information from the editor.
 */
export interface TLAiPrompt {
	/** The user's written prompt or an array of messages */
	message: string | TLAiMessage[]
	/** A screenshot */
	image?: string
	/** The content pulled from the editor */
	canvasContent: TLAiContent
	/** The bounds of the context in the editor */
	contextBounds: Box
	/** The bounds of the prompt in the editor */
	promptBounds: Box
	/** Any additional information. Must be JSON serializable! */
	meta?: any
}

/**
 * A prompt with information from the editor, serialized to JSON.
 */
export interface TLAiSerializedPrompt extends Omit<TLAiPrompt, 'contextBounds' | 'promptBounds'> {
	/** The bounds of the context in the editor */
	contextBounds: BoxModel
	/** The bounds of the prompt in the editor */
	promptBounds: BoxModel
}

export interface TLAiCreateShapeChange<T extends TLShape = TLShape> {
	type: 'createShape'
	description: string
	shape: TLShapePartial<T>
}

export interface TLAiUpdateShapeChange<T extends TLShape = TLShape> {
	type: 'updateShape'
	description: string
	shape: Omit<TLShapePartial<T>, 'type'> & { type?: T['type'] } // type is optional
}

export interface TLAiDeleteShapeChange {
	type: 'deleteShape'
	description: string
	shapeId: TLShapeId
}

export interface TLAiCreateBindingChange<B extends TLBinding = TLBinding> {
	type: 'createBinding'
	description: string
	binding: TLBindingCreate<B>
}

export interface TLAiUpdateBindingChange<B extends TLBinding = TLBinding> {
	type: 'updateBinding'
	description: string
	binding: TLBindingUpdate<B>
}

export interface TLAiDeleteBindingChange {
	type: 'deleteBinding'
	description: string
	bindingId: TLBindingId
}

export interface TLAiCreateLinearDiagramChange {
	type: 'createLinearDiagram'
	description: string
	steps: Array<{
		id: string
		title: string
		description?: string
		color?: string
	}>
	direction: 'horizontal' | 'vertical'
	startPosition: { x: number; y: number }
	metadata?: {
		step_count: number
		spacing?: number
		boxWidth?: number
		boxHeight?: number
	}
}

export interface TLAiCreateDecisionMatrixChange {
	type: 'createDecisionMatrix'
	description: string

	// 列：选项（来自 “We can A/B/C”）
	options: Array<{
		id: string
		title: string
		description?: string
		color?: string
	}>

	// 行：标准/维度（来自 “It is important to consider cost/risk/velocity”）
	criteria: Array<{
		id: string
		title: string
		weight?: number   // 可选：例如 “Cost matters most.” 时可以提高权重
		color?: string
	}>

	/**
	 * 稀疏记分：最适合由 AI / 自然语言解析填写
	 * 例如 “I rate option B a 4/5 for cost”
	 * -> { optionTitle: 'B', criterionTitle: 'Cost', value: 4, max: 5 }
	 */
	scoreCells?: Array<{
		optionId?: string
		optionTitle?: string
		criterionId?: string
		criterionTitle?: string
		value: number
		max?: number      // 若出现 “4/5”，这里是 5；缺省则用 metadata.maxScore
	}>

	/**
	 * 稠密矩阵：用于前端渲染（可选）
	 * 约定：scores[rowIndex][colIndex] = criteria[rowIndex] 对 options[colIndex] 的得分
	 * 如果你更喜欢 “options 做行”，可把索引含义写成注释并让渲染与解析一致。
	 */
	scores?: number[][]

	// pros/cons（“advantages/disadvantages”）
	advantages?: Record<string, string[]>  // key = option id 或 title；解析端约定统一用 title 小写
	disadvantages?: Record<string, string[]>

	// 备注/优先级（“Cost matters most.”）
	notes?: string[]                        // e.g., ["Cost matters most."]

	startPosition: { x: number; y: number }

	metadata?: {
		title?: string
		option_count?: number
		criteria_count?: number

		// 单元格/表头与间距
		cellWidth?: number
		cellHeight?: number
		spacingX?: number
		spacingY?: number
		headerHeight?: number
		headerWidth?: number

		// 记分上限（默认 5）
		maxScore?: number

		// 约定二维矩阵的索引语义（不填则默认 rows=criteria, cols=options）
		indexConvention?: 'rowsAreCriteria' | 'rowsAreOptions'
	}
}

/**
 * A generated change that can be applied to the editor.
 */
export type TLAiChange =
	| TLAiCreateShapeChange
	| TLAiUpdateShapeChange
	| TLAiDeleteShapeChange
	| TLAiCreateBindingChange
	| TLAiUpdateBindingChange
	| TLAiDeleteBindingChange
	| TLAiCreateLinearDiagramChange
	| TLAiCreateDecisionMatrixChange

export type TLAiContent = Omit<TLContent, 'schema' | 'rootShapeIds'> & {
	bindings: TLBinding[]
}

/**
 * The response from the AI.
 */
export type TLAiResult = {
	changes: TLAiChange[]
}

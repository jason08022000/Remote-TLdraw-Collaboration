import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'

const SimpleColor = z.enum([
	'red',
	'light-red',
	'green',
	'light-green',
	'blue',
	'light-blue',
	'orange',
	'yellow',
	'black',
	'violet',
	'light-violet',
	'grey',
	'white',
])

export type ISimpleColor = z.infer<typeof SimpleColor>

const SimpleFill = z.enum(['none', 'tint', 'semi', 'solid', 'pattern'])

export type ISimpleFill = z.infer<typeof SimpleFill>

const SimpleLabel = z.string()

const SimpleRectangleShape = z.object({
	type: z.literal('rectangle'),
	shapeId: z.string(),
	note: z.string(),
	x: z.number(),
	y: z.number(),
	width: z.number(),
	height: z.number(),
	color: SimpleColor.optional(),
	fill: SimpleFill.optional(),
	text: SimpleLabel.optional(),
})

export type ISimpleRectangleShape = z.infer<typeof SimpleRectangleShape>

const SimpleEllipseShape = z.object({
	type: z.literal('ellipse'),
	shapeId: z.string(),
	note: z.string(),
	x: z.number(),
	y: z.number(),
	width: z.number(),
	height: z.number(),
	color: SimpleColor.optional(),
	fill: SimpleFill.optional(),
	text: SimpleLabel.optional(),
})

export type ISimpleEllipseShape = z.infer<typeof SimpleEllipseShape>

const SimpleCloudShape = z.object({
	type: z.literal('cloud'),
	shapeId: z.string(),
	note: z.string(),
	x: z.number(),
	y: z.number(),
	width: z.number(),
	height: z.number(),
	color: SimpleColor.optional(),
	fill: SimpleFill.optional(),
	text: SimpleLabel.optional(),
})

export type ISimpleCloudShape = z.infer<typeof SimpleCloudShape>

const SimpleLineShape = z.object({
	type: z.literal('line'),
	shapeId: z.string(),
	note: z.string(),
	x1: z.number(),
	y1: z.number(),
	x2: z.number(),
	y2: z.number(),
	color: SimpleColor.optional(),
})

export type ISimpleLineShape = z.infer<typeof SimpleLineShape>

const SimpleNoteShape = z.object({
	type: z.literal('note'),
	shapeId: z.string(),
	note: z.string(),
	x: z.number(),
	y: z.number(),
	color: SimpleColor.optional(),
	text: SimpleLabel.optional(),
})

export type ISimpleNoteShape = z.infer<typeof SimpleNoteShape>

const SimpleTextShape = z.object({
	type: z.literal('text'),
	shapeId: z.string(),
	note: z.string(),
	x: z.number(),
	y: z.number(),
	color: SimpleColor.optional(),
	text: z.string().optional(),
	textAlign: z.enum(['start', 'middle', 'end']).optional(),
})

export type ISimpleTextShape = z.infer<typeof SimpleTextShape>

const SimpleArrowShape = z.object({
	type: z.literal('arrow'),
	shapeId: z.string(),
	note: z.string(),
	fromId: z.string().nullable(),
	toId: z.string().nullable(),
	x1: z.number(),
	y1: z.number(),
	x2: z.number(),
	y2: z.number(),
	color: SimpleColor.optional(),
	text: SimpleLabel.optional(),
})

export type ISimpleArrowShape = z.infer<typeof SimpleArrowShape>

const SimpleUnknownShape = z.object({
	type: z.literal('unknown'),
	shapeId: z.string(),
	note: z.string(),
	x: z.number(),
	y: z.number(),
})

export type ISimpleUnknownShape = z.infer<typeof SimpleUnknownShape>

const SimpleShape = z.union([
	SimpleUnknownShape,
	SimpleRectangleShape,
	SimpleEllipseShape,
	SimpleCloudShape,
	SimpleLineShape,
	SimpleTextShape,
	SimpleArrowShape,
	SimpleNoteShape,
])

export type ISimpleShape = z.infer<typeof SimpleShape>

// Events

export const SimpleCreateEvent = z.object({
	type: z.enum(['create', 'update']),
	shape: SimpleShape,
	intent: z.string(),
})

export type ISimpleCreateEvent = z.infer<typeof SimpleCreateEvent>

export const SimpleMoveEvent = z.object({
	type: z.literal('move'),
	shapeId: z.string(),
	x: z.number(),
	y: z.number(),
	intent: z.string(),
})

export type ISimpleMoveEvent = z.infer<typeof SimpleMoveEvent>

const SimpleDeleteEvent = z.object({
	type: z.literal('delete'),
	shapeId: z.string(),
	intent: z.string(),
})
export type ISimpleDeleteEvent = z.infer<typeof SimpleDeleteEvent>

const SimpleThinkEvent = z.object({
	type: z.literal('think'),
	text: z.string(),
	intent: z.string(),
})
export type ISimpleThinkEvent = z.infer<typeof SimpleThinkEvent>

const SimpleLinearDiagramEvent = z.object({
	type: z.literal('create_linear_diagram'),
	description: z.string(),
	steps: z.array(z.object({
		id: z.string(),
		title: z.string(),
		description: z.string().optional(),
		color: SimpleColor.optional(),
	})),
	direction: z.enum(['horizontal', 'vertical']),
	startPosition: z.object({
		x: z.number(),
		y: z.number(),
	}),
	boxWidth: z.number().optional(),
	boxHeight: z.number().optional(),
	spacing: z.number().optional(),
	intent: z.string(),
})

const SimpleDecisionMatrixEvent = z.object({
	type: z.literal('create_decision_matrix'),
	description: z.string(),

	// 列：选项
	options: z.array(z.object({
		id: z.string(),
		title: z.string(),
		description: z.string().optional(),
		color: SimpleColor.optional(),
	})),

	// 行：标准/维度
	criteria: z.array(z.object({
		id: z.string(),
		title: z.string(),
		weight: z.number().optional(),
		color: SimpleColor.optional(),
	})),

	// 稀疏记分（推荐给 LLM 输出）
	scoreCells: z.array(z.object({
		optionId: z.string().optional(),
		optionTitle: z.string().optional(),
		criterionId: z.string().optional(),
		criterionTitle: z.string().optional(),
		value: z.number(),
		max: z.number().optional(),
	})).optional(),

	// 稠密矩阵（可选，行列语义见 indexConvention）
	scores: z.array(z.array(z.number())).optional(),

	// pros / cons / notes
	advantages: z.record(z.array(z.string())).optional(),
	disadvantages: z.record(z.array(z.string())).optional(),
	notes: z.array(z.string()).optional(),

	startPosition: z.object({ x: z.number(), y: z.number() }),

	// 布局与样式参数（与前端 metadata 对齐）
	cellWidth: z.number().optional(),
	cellHeight: z.number().optional(),
	spacingX: z.number().optional(),
	spacingY: z.number().optional(),
	headerHeight: z.number().optional(),
	headerWidth: z.number().optional(),
	maxScore: z.number().optional(),
	indexConvention: z.enum(['rowsAreCriteria', 'rowsAreOptions']).optional(),

	intent: z.string(),
})
export type ISimpleDecisionMatrixEvent = z.infer<typeof SimpleDecisionMatrixEvent>


export type ISimpleLinearDiagramEvent = z.infer<typeof SimpleLinearDiagramEvent>

export const SimpleEvent = z.union([
	SimpleThinkEvent,
	SimpleCreateEvent, // or update
	SimpleDeleteEvent,
	SimpleMoveEvent,
	SimpleLinearDiagramEvent,
	SimpleDecisionMatrixEvent,
])


export type ISimpleEvent = z.infer<typeof SimpleEvent>

// Model response schema

export const ModelResponse = z.object({
	long_description_of_strategy: z.string(),
	events: z.array(SimpleEvent),
})

export type IModelResponse = z.infer<typeof ModelResponse>

export const RESPONSE_FORMAT = zodResponseFormat(ModelResponse, 'event')

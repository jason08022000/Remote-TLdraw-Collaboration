import { TLAiContent } from '@tldraw/ai'
import {
	TLArrowBinding,
	TLArrowShape,
	TLGeoShape,
	TLLineShape,
	TLNoteShape,
	TLTextShape,
} from 'tldraw'
import { toRichText } from 'tldraw'
props: { richText: toRichText('...') }

import { shapeFillToSimpleFill } from './conversions'
import { ISimpleShape } from './schema'

// 将 richText 提取为纯字符串（尽量兼容多种结构，取不到就返回空串）
function richTextToPlain(rt: any): string {
	if (!rt) return ''
	try {
		// 常见结构：{ children: [...] } 或 { spans: [...] }
		const pick = (n: any): string => {
			if (!n) return ''
			if (Array.isArray(n)) return n.map(pick).join('')
			if (typeof n === 'string') return n
			// 一些节点可能是 { text: '...' }
			if (typeof n.text === 'string') return n.text
			// 递归 children / spans
			if (n.children) return pick(n.children)
			if (n.spans) return pick(n.spans)
			return ''
		}
		return pick(rt)
	} catch {
		return ''
	}
}

export function getSimpleContentFromCanvasContent(content: TLAiContent): {
	shapes: ISimpleShape[]
} {
	return {
		shapes: compact(
			content.shapes.map((shape) => {
				if (shape.type === 'text') {
					const s = shape as TLTextShape
					return {
						shapeId: s.id,
						type: 'text',
						// ⬇️ 由 richText 提取纯文本（原来这里是 s.props.text）
						text: richTextToPlain((s.props as any).richText),
						x: s.x,
						y: s.y,
						color: (s.props as any).color,
						textAlign: (s.props as any).textAlign,
						note: (s.meta?.description as string) ?? '',
					}
				}

				if (shape.type === 'geo') {
					const s = shape as TLGeoShape
					if (s.props.geo === 'rectangle' || s.props.geo === 'ellipse' || s.props.geo === 'cloud') {
						return {
							shapeId: s.id,
							type: s.props.geo,
							x: s.x,
							y: s.y,
							width: (s.props as any).w,
							height: (s.props as any).h,
							color: (s.props as any).color,
							fill: shapeFillToSimpleFill((s.props as any).fill),
							// ⬇️ geo 文字也来自 richText
							text: richTextToPlain((s.props as any).richText),
							note: (s.meta?.description as string) ?? '',
						}
					}
				}

				if (shape.type === 'line') {
					const s = shape as TLLineShape
					const points = Object.values(s.props.points).sort((a, b) =>
						a.index.localeCompare(b.index)
					)
					return {
						shapeId: s.id,
						type: 'line',
						x1: points[0].x + s.x,
						y1: points[0].y + s.y,
						x2: points[1].x + s.x,
						y2: points[1].y + s.y,
						color: (s.props as any).color,
						note: (s.meta?.description as string) ?? '',
					}
				}

				if (shape.type === 'arrow') {
					const s = shape as TLArrowShape
					const { bindings = [] } = content
					const arrowBindings = bindings.filter(
						(b) => b.type === 'arrow' && b.fromId === s.id
					) as TLArrowBinding[]
					const startBinding = arrowBindings.find((b) => b.props.terminal === 'start')
					const endBinding = arrowBindings.find((b) => b.props.terminal === 'end')

					return {
						shapeId: s.id,
						type: 'arrow',
						fromId: startBinding?.toId ?? null,
						toId: endBinding?.toId ?? null,
						x1: s.props.start.x,
						y1: s.props.start.y,
						x2: s.props.end.x,
						y2: s.props.end.y,
						color: (s.props as any).color,
						// ⬇️ 箭头的 label 仍然是 text（v4 里 arrow 不是 richText）
						text: (s.props as any).text ?? '',
						note: (s.meta?.description as string) ?? '',
					}
				}

				if (shape.type === 'note') {
					const s = shape as TLNoteShape
					return {
						shapeId: s.id,
						type: 'note',
						x: s.x,
						y: s.y,
						color: (s.props as any).color,
						// ⬇️ note 也改用 richText
						text: richTextToPlain((s.props as any).richText),
						note: (s.meta?.description as string) ?? '',
					}
				}

				// 其它类型做兜底
				return {
					shapeId: shape.id,
					type: 'unknown',
					note: (shape.meta?.description as string) ?? '',
					x: shape.x,
					y: shape.y,
				}
			})
		),
	}
}

function compact<T>(arr: T[]): Exclude<T, undefined>[] {
	return arr.filter(Boolean) as Exclude<T, undefined>[]
}

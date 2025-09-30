import type { Editor, TLShapeId } from 'tldraw'
import { toRichText } from 'tldraw'
import type { TLAiCreateLinearDiagramChange } from '../types'

/**
 * Handler for creating linear diagrams
 * Converts a linear diagram change into multiple TLdraw shapes (rectangles + arrows)
 */
export function createLinearDiagram(
	editor: Editor,
	change: TLAiCreateLinearDiagramChange
): void {
	const { steps, direction, startPosition, metadata } = change
	
	// Configuration
	const boxWidth = 120
	const boxHeight = 80
	const spacing = metadata?.spacing || 180
	
	// Track created shape IDs for connecting with arrows
	const shapeIds: TLShapeId[] = []
	
	// Create rectangles for each step
	steps.forEach((step, index) => {
		let x: number, y: number
		
		if (direction === 'horizontal') {
			x = startPosition.x + (index * spacing)
			y = startPosition.y
		} else {
			x = startPosition.x
			y = startPosition.y + (index * spacing)
		}
		
		const shapeId = `shape:linear-step-${step.id}` as TLShapeId
		
		editor.createShape({
			id: shapeId,
			type: 'geo',
			x,
			y,
			props: {
				geo: 'rectangle',
				w: boxWidth,
				h: boxHeight,
				color: step.color || 'blue',
				fill: 'solid',
				richText: toRichText(step.title),
			},
		})
		
		shapeIds.push(shapeId)
	})
	
	// Create arrows between consecutive steps
	for (let i = 0; i < shapeIds.length - 1; i++) {
		const fromShapeId = shapeIds[i]
		const toShapeId = shapeIds[i + 1]
		const fromStepId = steps[i].id
		const toStepId = steps[i + 1].id
		
		let startX: number, startY: number, endX: number, endY: number
		
		if (direction === 'horizontal') {
			// Horizontal: arrow goes from right edge to left edge
			startX = startPosition.x + (i * spacing) + boxWidth
			startY = startPosition.y + (boxHeight / 2)
			endX = startPosition.x + ((i + 1) * spacing)
			endY = startPosition.y + (boxHeight / 2)
		} else {
			// Vertical: arrow goes from bottom edge to top edge
			startX = startPosition.x + (boxWidth / 2)
			startY = startPosition.y + (i * spacing) + boxHeight
			endX = startPosition.x + (boxWidth / 2)
			endY = startPosition.y + ((i + 1) * spacing)
		}
		
		editor.createShape({
			id: `shape:linear-arrow-${fromStepId}-${toStepId}` as TLShapeId,
			type: 'arrow',
			x: 0,
			y: 0,
			props: {
				start: { x: startX, y: startY },
				end: { x: endX, y: endY },
				color: 'black',
			},
		})
	}
}

# Adding Compound Diagrams to TLdraw AI System

This guide explains how to add new compound diagram types (like linear diagrams, flowcharts, etc.) that create multiple connected shapes with a single AI command.

## Overview

A compound diagram is a single AI change that creates multiple TLdraw shapes (rectangles, arrows, text) arranged in a specific pattern. Examples include:
- Linear step-by-step diagrams (a → b → c → d)
- Flowcharts with decision nodes
- Organizational charts
- Network diagrams

## Step-by-Step Implementation

### 1. 📝 Frontend Type Definition

**File**: `package/src/types.ts`

Define the structure for your new compound diagram change:

```typescript
export interface TLAiCreate[YourDiagram]Change {
	type: 'create[YourDiagram]'  // e.g., 'createLinearDiagram'
	description: string
	// Your diagram-specific properties
	nodes: Array<{
		id: string
		title: string
		description?: string
		color?: string
	}>
	layout: 'horizontal' | 'vertical' | 'grid' // etc.
	startPosition: { x: number; y: number }
	metadata?: {
		// Optional sizing and spacing
		nodeWidth?: number
		nodeHeight?: number
		spacing?: number
		// Any other configuration
	}
}
```

Add it to the `TLAiChange` union type:

```typescript
export type TLAiChange =
	| TLAiCreateShapeChange
	| TLAiUpdateShapeChange
	| TLAiDeleteShapeChange
	| TLAiCreateBindingChange
	| TLAiUpdateBindingChange
	| TLAiDeleteBindingChange
	| TLAiCreate[YourDiagram]Change  // Add your new type here
```

### 2. 🔧 Handler Implementation

**File**: `package/src/handlers/create[YourDiagram].ts`

Create a handler that converts your compound change into TLdraw shapes:

```typescript
import { Editor } from 'tldraw'
import { TLAiCreate[YourDiagram]Change } from '../types'

export function create[YourDiagram](
	editor: Editor,
	change: TLAiCreate[YourDiagram]Change
): void {
	const { nodes, layout, startPosition, metadata } = change
	
	// Configuration with defaults
	const nodeWidth = metadata?.nodeWidth || 120
	const nodeHeight = metadata?.nodeHeight || 80
	const spacing = metadata?.spacing || 180
	
	// Clear existing shapes of this type (optional)
	const existingShapes = editor.getCurrentPageShapes().filter(shape =>
		shape.id.includes('[your-diagram-prefix]')
	)
	if (existingShapes.length > 0) {
		editor.deleteShapes(existingShapes.map(s => s.id))
	}
	
	// Calculate positions for each node
	const positionedNodes = nodes.map((node, index) => {
		let x = startPosition.x
		let y = startPosition.y
		
		// Your layout algorithm here
		if (layout === 'horizontal') {
			x += index * spacing
		} else if (layout === 'vertical') {
			y += index * spacing
		}
		// Add more layout types as needed
		
		return { ...node, x, y, width: nodeWidth, height: nodeHeight }
	})
	
	// Create shapes for each node
	positionedNodes.forEach(node => {
		editor.createShape({
			id: `shape:[your-diagram-prefix]-node-${node.id}` as any,
			type: 'geo',
			x: node.x!,
			y: node.y!,
			props: {
				geo: 'rectangle',
				w: node.width!,
				h: node.height!,
				color: node.color || 'blue',
				fill: 'solid',
				text: node.title + (node.description ? `\n${node.description}` : ''),
			},
		})
	})
	
	// Create connections between nodes (arrows, lines, etc.)
	for (let i = 0; i < positionedNodes.length - 1; i++) {
		const fromNode = positionedNodes[i]
		const toNode = positionedNodes[i + 1]
		
		// Calculate connection points
		const fromX = fromNode.x! + fromNode.width!
		const fromY = fromNode.y! + fromNode.height! / 2
		const toX = toNode.x!
		const toY = toNode.y! + toNode.height! / 2
		
		editor.createShape({
			id: `shape:[your-diagram-prefix]-arrow-${fromNode.id}-${toNode.id}` as any,
			type: 'arrow',
			x: 0,
			y: 0,
			props: {
				start: { x: fromX, y: fromY },
				end: { x: toX, y: toY },
				color: 'black',
			},
		})
	}
	
	console.log(`✅ ${change.type} created successfully!`)
}
```

### 3. 🔗 Update AI Module

**File**: `package/src/TldrawAiModule.ts`

Add your handler to the AI module:

```typescript
// Import your handler
import { create[YourDiagram] } from './handlers/create[YourDiagram]'

// In the applyChange method, add a new case:
applyChange(change: TLAiChange) {
	const { editor } = this.opts
	if (editor.isDisposed) return
	try {
		switch (change.type) {
			// ... existing cases
			case 'create[YourDiagram]': {
				create[YourDiagram](editor, change)
				break
			}
			default:
				exhaustiveSwitchError(change)
		}
	} catch (e) {
		console.error('Error handling change:', e)
	}
}
```

### 4. 🔄 Update Transforms

The transforms ensure AI-generated changes work properly with TLdraw's coordinate system and ID management.

**File**: `example/client/transforms/SimpleIds.ts`

Add your change type to the switch statement:

```typescript
override transformChange = (change: TLAiChange) => {
	switch (change.type) {
		// ... existing cases
		case 'create[YourDiagram]': {
			// Most compound diagrams don't need ID transformation
			// since they generate their own shape IDs
			return change
		}
		default:
			return exhaustiveSwitchError(change)
	}
}
```

**File**: `example/client/transforms/SimpleCoordinates.ts`

Handle coordinate transformation:

```typescript
override transformChange = (change: TLAiChange) => {
	switch (change.type) {
		// ... existing cases
		case 'create[YourDiagram]': {
			// Transform coordinates back to world space
			const transformedChange = {
				...change,
				startPosition: {
					x: change.startPosition.x + this.bounds.x,
					y: change.startPosition.y + this.bounds.y,
				}
			}
			return transformedChange
		}
		default:
			return change
	}
}
```

## 🤖 AI Backend Integration

### 5. 📋 Backend Schema Definition

**File**: `example/worker/do/openai/schema.ts`

Define the simplified schema for AI communication:

```typescript
const Simple[YourDiagram]Event = z.object({
	type: z.literal('create_[your_diagram]'),
	description: z.string(),
	nodes: z.array(z.object({
		id: z.string(),
		title: z.string(),
		description: z.string().optional(),
		color: SimpleColor.optional(),
	})),
	layout: z.enum(['horizontal', 'vertical', 'grid']),
	startPosition: z.object({
		x: z.number(),
		y: z.number(),
	}),
	nodeWidth: z.number().optional(),
	nodeHeight: z.number().optional(),
	spacing: z.number().optional(),
	intent: z.string(),
})

export type ISimple[YourDiagram]Event = z.infer<typeof Simple[YourDiagram]Event>

// Add to the SimpleEvent union
export const SimpleEvent = z.union([
	SimpleThinkEvent,
	SimpleCreateEvent,
	SimpleDeleteEvent,
	SimpleMoveEvent,
	Simple[YourDiagram]Event,  // Add your event here
])
```

### 6. 🔄 Event Handler

**File**: `example/worker/do/openai/getTldrawAiChangesFromSimpleEvents.ts`

Add imports and handler:

```typescript
import {
	// ... existing imports
	ISimple[YourDiagram]Event,
} from './schema'

import {
	// ... existing imports
	TLAiCreate[YourDiagram]Change,
} from '@tldraw/ai'

// Add case to main switch
export function getTldrawAiChangesFromSimpleEvents(
	prompt: TLAiSerializedPrompt,
	event: ISimpleEvent
) {
	switch (event.type) {
		// ... existing cases
		case 'create_[your_diagram]': {
			return getTldrawAiChangesFromSimple[YourDiagram]Event(prompt, event)
		}
		default: {
			throw exhaustiveSwitchError(event, 'type')
		}
	}
}

// Add the conversion function
function getTldrawAiChangesFromSimple[YourDiagram]Event(
	prompt: TLAiSerializedPrompt,
	event: ISimple[YourDiagram]Event
): TLAiChange[] {
	const { description, nodes, layout, startPosition, nodeWidth, nodeHeight, spacing, intent } = event

	const change: TLAiCreate[YourDiagram]Change = {
		type: 'create[YourDiagram]',
		description: description || intent,
		nodes: nodes.map(node => ({
			id: node.id,
			title: node.title,
			description: node.description,
			color: node.color,
		})),
		layout,
		startPosition,
		metadata: {
			node_count: nodes.length,
			nodeWidth,
			nodeHeight,
			spacing,
		},
	}

	return [change]
}
```

### 7. 📝 System Prompt Update

**File**: `example/worker/do/openai/system-prompt.ts`

Update the system prompt to teach the AI about your new diagram type:

```typescript
export const OPENAI_SYSTEM_PROMPT = `
// ... existing prompt content

### Event Schema

Events include:
- **Think (\`think\`)**: The AI describes its intent or reasoning.
- **Create (\`create\`)**: The AI creates a new shape.
- **Update (\`update\`)**: The AI updates an existing shape.
- **Move (\`move\`)**: The AI moves a shape to a new position.
- **Label (\`label\`)**: The AI changes a shape's text.
- **Delete (\`delete\`)**: The AI removes a shape.
- **Create [Your Diagram] (\`create_[your_diagram]\`)**: Creates a [description] with connected nodes.

### [Your Diagram] Guidelines

When creating [your diagram type] (\`create_[your_diagram]\`), use this event type for:
- [Use case 1]
- [Use case 2]
- [Use case 3]

[Your diagram] structure:
- \`nodes\`: Array of node objects with \`id\`, \`title\`, \`description\` (optional), and \`color\` (optional)
- \`layout\`: Layout type ("horizontal", "vertical", "grid", etc.)
- \`startPosition\`: Where to place the first node (x, y coordinates)
- \`nodeWidth\`, \`nodeHeight\`: Optional custom dimensions
- \`spacing\`: Optional distance between nodes

Choose appropriate dimensions based on content:
- Small nodes: 100x60 with spacing 150
- Standard nodes: 120x80 with spacing 180  
- Large nodes: 150x100 with spacing 200

Each event must include:
- A \`type\` (one of \`think\`, \`create\`, \`move\`, \`label\`, \`delete\`, \`create_[your_diagram]\`)
- An \`intent\` (descriptive reason for the action)

// ... rest of prompt
`
```

## 🎨 Frontend UI (Optional)

### 8. Sample Component

**File**: `example/client/components/Sample[YourDiagram]Menu.tsx`

Create sample diagrams for testing:

```typescript
const change: TLAiCreate[YourDiagram]Change = {
	type: 'create[YourDiagram]',
	description: 'Sample [your diagram] description',
	nodes: [
		{ id: 'node1', title: 'Step 1', color: 'blue' },
		{ id: 'node2', title: 'Step 2', color: 'green' },
		{ id: 'node3', title: 'Step 3', color: 'red' },
	],
	layout: 'horizontal',
	startPosition: { x: 100, y: 200 },
	metadata: {
		node_count: 3,
		nodeWidth: 120,
		nodeHeight: 80,
		spacing: 180,
	},
}

aiModule.applyChange(change)
```

## ✅ Testing Checklist

- [ ] Frontend handler creates shapes correctly
- [ ] Transforms handle the new change type without errors
- [ ] AI backend recognizes prompts and generates appropriate events
- [ ] Coordinates are positioned correctly relative to viewport
- [ ] Sample UI components work for manual testing
- [ ] AI-generated diagrams render without errors
- [ ] Multiple diagrams can be created without conflicts

## 🔍 Common Issues

1. **"Unknown switch case" errors**: Make sure all transforms handle your new change type
2. **Incorrect positioning**: Verify `SimpleCoordinates` transform handles your positioning properties
3. **Shape ID conflicts**: Use unique prefixes for your diagram type (e.g., `linear-diagram-`, `flowchart-`)
4. **AI not recognizing prompts**: Update system prompt with clear guidelines and examples
5. **Schema validation errors**: Ensure Zod schema matches your frontend types exactly

## 📚 Examples

See the linear diagram implementation as a reference:
- Types: `TLAiCreateLinearDiagramChange`
- Handler: `createLinearDiagram.ts`
- Schema: `SimpleLinearDiagramEvent`
- Prompts: "Create a user onboarding process", "Show me a development workflow"

This pattern can be extended for any compound diagram type that requires multiple connected shapes with specific layouts.

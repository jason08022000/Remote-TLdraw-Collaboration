# DecisionMatrix Boundary Object

A boundary object implementation for creating decision matrices in TLdraw AI system. This implementation follows the compound diagrams pattern and provides natural language parsing capabilities for decision matrix creation.

## Overview

The DecisionMatrix boundary object allows users to create decision matrices through natural language input. It automatically parses options, criteria, and scores from conversational text and generates a visual decision matrix with weighted scoring.

## Features

- **Natural Language Parsing**: Extracts options, criteria, and scores from conversational input
- **Weighted Scoring**: Supports criteria weights for more sophisticated decision making
- **Visual Matrix**: Creates a grid-based decision matrix with color-coded scores
- **Total Calculation**: Automatically calculates weighted totals for each option
- **Flexible Configuration**: Customizable cell sizes, spacing, and colors

## Usage

### Basic Usage

```typescript
import { useDecisionMatrix } from './hooks/useDecisionMatrix'

const decisionMatrix = useDecisionMatrix({
  editor,
  startPosition: { x: 200, y: 200 },
  metadata: {
    cellWidth: 100,
    cellHeight: 60,
    spacing: 20,
    headerHeight: 40,
    headerWidth: 120
  }
})

// Process natural language input
const change = decisionMatrix.processDecisionMatrixInput(input)
if (change) {
  // Apply the change through AI module
  aiModule.applyChange(change)
}
```

### Natural Language Input Patterns

The system recognizes the following patterns:

#### Options Extraction
- "We can A/B/C"
- "Options are A, B, C"
- "Choices are A, B, C"
- "Alternatives are A, B, C"

#### Criteria Extraction
- "It is important to consider cost/risk/velocity"
- "Criteria are cost, risk, velocity"
- "Factors to consider cost, risk, velocity"
- "We should evaluate cost, risk, velocity"

#### Score Extraction
- "I give B a 4/5 score"
- "I rate B a 4 for cost"
- "B gets 4 for cost"
- "B scores 4 on cost"

### Example Input

```
We can Option A, Option B, Option C.
It is important to consider cost, risk, velocity.
I give Option A a 4 for cost.
I give Option A a 3 for risk.
I give Option A a 5 for velocity.
I give Option B a 3 for cost.
I give Option B a 4 for risk.
I give Option B a 3 for velocity.
I give Option C a 2 for cost.
I give Option C a 2 for risk.
I give Option C a 4 for velocity.
Cost matters most. I rate Option B a 4 for cost.
```

## API Reference

### Types

```typescript
interface DecisionMatrixOption {
  id: string
  title: string
  description?: string
  color?: string
}

interface DecisionMatrixCriterion {
  id: string
  title: string
  weight?: number
  color?: string
}

interface DecisionMatrixData {
  options: DecisionMatrixOption[]
  criteria: DecisionMatrixCriterion[]
  scores: number[][] // scores[i][j] = score for option i, criterion j
}
```

### Hook Methods

#### `parseDecisionMatrixInput(input: string): DecisionMatrixData | null`
Parses natural language input and extracts decision matrix data.

#### `createDecisionMatrixChange(data: DecisionMatrixData): TLAiCreateDecisionMatrixChange`
Creates a TLdraw AI change from parsed data.

#### `processDecisionMatrixInput(input: string): TLAiCreateDecisionMatrixChange | null`
Combines parsing and change creation in one step.

#### `createSampleDecisionMatrix(): TLAiCreateDecisionMatrixChange`
Creates a sample decision matrix for testing.

## Implementation Details

### Frontend Components

1. **Types** (`package/src/types.ts`): Defines `TLAiCreateDecisionMatrixChange` interface
2. **Handler** (`package/src/handlers/createDecisionMatrix.ts`): Creates TLdraw shapes for the matrix
3. **Hook** (`example/client/hooks/useDecisionMatrix.ts`): Provides boundary object functionality
4. **Transforms**: Handle coordinate and ID transformations

### Backend Components

1. **Schema** (`example/worker/do/openai/schema.ts`): Defines `SimpleDecisionMatrixEvent`
2. **Event Handler** (`example/worker/do/openai/getTldrawAiChangesFromSimpleEvents.ts`): Converts backend events to frontend changes

### Visual Layout

The decision matrix is rendered as a grid:

```
        | Criterion 1 | Criterion 2 | Criterion 3 | Total
--------|-------------|-------------|-------------|-------
Option A|     4       |     3       |     5       | 4.0
Option B|     3       |     4       |     3       | 3.3
Option C|     2       |     2       |     4       | 2.7
```

- **Header Row**: Criteria with optional weights
- **Option Column**: Options with descriptions
- **Score Cells**: Color-coded scores (green=4-5, yellow=3, orange=2, red=1, gray=0)
- **Total Column**: Weighted average scores

## Configuration Options

```typescript
interface UseDecisionMatrixOptions {
  editor: Editor
  startPosition?: { x: number; y: number }
  metadata?: {
    cellWidth?: number      // Default: 100
    cellHeight?: number     // Default: 60
    spacing?: number        // Default: 20
    headerHeight?: number   // Default: 40
    headerWidth?: number    // Default: 120
  }
}
```

## Color Coding

Scores are color-coded for quick visual assessment:
- **Green**: Score 4-5 (Excellent)
- **Yellow**: Score 3 (Good)
- **Orange**: Score 2 (Fair)
- **Red**: Score 1 (Poor)
- **Light Gray**: Score 0 (Not applicable)

## Weighted Scoring

When criteria have weights, the total score is calculated as:
```
Total = Σ(score[i] × weight[i]) / Σ(weight[i])
```

This allows for more sophisticated decision making where some criteria are more important than others.

## Integration with AI System

The DecisionMatrix boundary object integrates with the TLdraw AI system through:

1. **Natural Language Processing**: AI can generate decision matrices from conversational prompts
2. **Structured Output**: Consistent format for AI-generated decision matrices
3. **Visual Rendering**: Automatic conversion to TLdraw shapes
4. **Interactive Updates**: Support for modifying existing matrices

## Example Component

See `example/client/components/DecisionMatrixExample.tsx` for a complete implementation example that demonstrates:

- Natural language input processing
- Sample data generation
- Visual matrix creation
- Interactive controls

## Testing

The implementation includes comprehensive test coverage for:

- Natural language parsing patterns
- Score extraction and validation
- Weighted total calculations
- Visual layout generation
- Error handling

## Future Enhancements

Potential improvements for future versions:

1. **Interactive Editing**: Click-to-edit scores and weights
2. **Export Capabilities**: Export matrices to CSV/Excel
3. **Advanced Scoring**: Support for different scoring scales
4. **Collaborative Features**: Real-time collaborative matrix editing
5. **Templates**: Pre-defined matrix templates for common use cases



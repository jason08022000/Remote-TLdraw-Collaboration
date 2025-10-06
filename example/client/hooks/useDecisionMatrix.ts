import { useCallback, useMemo } from 'react'
import { Editor } from 'tldraw'
import { TLAiCreateDecisionMatrixChange } from '@tldraw/ai'
import { toRichText } from 'tldraw'

export interface DecisionMatrixOption {
    id: string
    title: string
    description?: string
    color?: string
}

export interface DecisionMatrixCriterion {
    id: string
    title: string
    weight?: number
    color?: string
}

export interface DecisionMatrixData {
    options: DecisionMatrixOption[]
    criteria: DecisionMatrixCriterion[]
    scores: number[][] // scores[i][j] = score for option i, criterion j
}

export interface UseDecisionMatrixOptions {
    editor: Editor
    startPosition?: { x: number; y: number }
    metadata?: {
        cellWidth?: number
        cellHeight?: number
        spacing?: number
        headerHeight?: number
        headerWidth?: number
    }
}

/**
 * A React hook that provides DecisionMatrix boundary object functionality.
 * Handles parsing natural language input and creating decision matrices.
 */
export function useDecisionMatrix(options: UseDecisionMatrixOptions) {
    const { editor, startPosition = { x: 100, y: 100 }, metadata } = options

    /**
     * Parse natural language input to extract DecisionMatrix data
     * Trigger: "There are options/standards/scores/advantages/disadvantages"
     * Rules: 
     * - options[] is derived from "We can A/B/C"
     * - criteria[] is derived from "It is important to consider cost/risk/velocity"
     * - when "I give B a 4/5 score" appears → fill in scores[i][j]
     */
    const parseDecisionMatrixInput = useCallback((input: string): DecisionMatrixData | null => {
        const lines = input.split('\n').map(line => line.trim()).filter(line => line.length > 0)

        let options: DecisionMatrixOption[] = []
        let criteria: DecisionMatrixCriterion[] = []
        let scores: number[][] = []

        // Extract options from "We can A/B/C" patterns
        const optionPatterns = [
            /we can (.+)/i,
            /options? are (.+)/i,
            /choices? are (.+)/i,
            /alternatives? are (.+)/i
        ]

        for (const line of lines) {
            for (const pattern of optionPatterns) {
                const match = line.match(pattern)
                if (match) {
                    const optionText = match[1]
                    // Split by common separators
                    const optionList = optionText.split(/[,;|&\/]/).map(opt => opt.trim())
                    options = optionList.map((opt, index) => ({
                        id: `option-${index + 1}`,
                        title: opt,
                        color: ['blue', 'green', 'red', 'yellow', 'purple'][index % 5]
                    }))
                    break
                }
            }
        }

        // Extract criteria from "It is important to consider cost/risk/velocity" patterns
        const criteriaPatterns = [
            /it is important to consider (.+)/i,
            /criteria are (.+)/i,
            /factors? to consider (.+)/i,
            /we should evaluate (.+)/i
        ]

        for (const line of lines) {
            for (const pattern of criteriaPatterns) {
                const match = line.match(pattern)
                if (match) {
                    const criteriaText = match[1]
                    // Split by common separators
                    const criteriaList = criteriaText.split(/[,;|&\/]/).map(crit => crit.trim())
                    criteria = criteriaList.map((crit, index) => ({
                        id: `criterion-${index + 1}`,
                        title: crit,
                        weight: 1, // Default weight
                        color: ['blue', 'green', 'red', 'yellow', 'purple'][index % 5]
                    }))
                    break
                }
            }
        }

        // Extract scores from "I give B a 4/5 score" patterns
        const scorePatterns = [
            /i give (.+) a (\d+)\/5 score/i,
            /i rate (.+) a (\d+) for (.+)/i,
            /(.+) gets (\d+) for (.+)/i,
            /(.+) scores (\d+) on (.+)/i
        ]

        // Initialize scores matrix
        if (options.length > 0 && criteria.length > 0) {
            scores = Array(options.length).fill(null).map(() => Array(criteria.length).fill(0))
        }

        for (const line of lines) {
            for (const pattern of scorePatterns) {
                const match = line.match(pattern)
                if (match) {
                    const optionName = match[1].trim()
                    const score = parseInt(match[2])
                    const criterionName = match[3]?.trim() || ''

                    // Find option index
                    const optionIndex = options.findIndex(opt =>
                        opt.title.toLowerCase().includes(optionName.toLowerCase()) ||
                        optionName.toLowerCase().includes(opt.title.toLowerCase())
                    )

                    // Find criterion index
                    const criterionIndex = criteria.findIndex(crit =>
                        crit.title.toLowerCase().includes(criterionName.toLowerCase()) ||
                        criterionName.toLowerCase().includes(crit.title.toLowerCase())
                    )

                    if (optionIndex !== -1 && criterionIndex !== -1) {
                        scores[optionIndex][criterionIndex] = score
                    }
                }
            }
        }

        // Return null if we don't have enough data
        if (options.length === 0 || criteria.length === 0) {
            return null
        }

        return { options, criteria, scores }
    }, [])

    /**
     * Create a DecisionMatrix change from parsed data
     */
    const createDecisionMatrixChange = useCallback((data: DecisionMatrixData): TLAiCreateDecisionMatrixChange => {
        return {
            type: 'createDecisionMatrix',
            description: `Decision matrix with ${data.options.length} options and ${data.criteria.length} criteria`,
            options: data.options,
            criteria: data.criteria,
            scores: data.scores,
            startPosition,
            metadata: {
                option_count: data.options.length,
                criteria_count: data.criteria.length,
                ...metadata
            }
        }
    }, [startPosition, metadata])

    /**
     * Process natural language input and create decision matrix
     */
    const processDecisionMatrixInput = useCallback((input: string) => {
        const data = parseDecisionMatrixInput(input)
        if (!data) {
            console.warn('Could not parse decision matrix from input:', input)
            return null
        }

        const change = createDecisionMatrixChange(data)
        return change
    }, [parseDecisionMatrixInput, createDecisionMatrixChange])

    /**
     * Create a sample decision matrix for testing
     */
    const createSampleDecisionMatrix = useCallback((): TLAiCreateDecisionMatrixChange => {
        const sampleData: DecisionMatrixData = {
            options: [
                { id: 'option-1', title: 'Option A', color: 'blue' },
                { id: 'option-2', title: 'Option B', color: 'green' },
                { id: 'option-3', title: 'Option C', color: 'red' }
            ],
            criteria: [
                { id: 'criterion-1', title: 'Cost', weight: 2, color: 'blue' },
                { id: 'criterion-2', title: 'Risk', weight: 1, color: 'green' },
                { id: 'criterion-3', title: 'Velocity', weight: 1, color: 'red' }
            ],
            scores: [
                [4, 3, 5], // Option A scores
                [3, 4, 3], // Option B scores
                [2, 2, 4]  // Option C scores
            ]
        }

        return createDecisionMatrixChange(sampleData)
    }, [createDecisionMatrixChange])

    // Memoized utilities
    const utilities = useMemo(() => ({
        parseDecisionMatrixInput,
        createDecisionMatrixChange,
        processDecisionMatrixInput,
        createSampleDecisionMatrix
    }), [
        parseDecisionMatrixInput,
        createDecisionMatrixChange,
        processDecisionMatrixInput,
        createSampleDecisionMatrix
    ])

    return utilities
}



import React from 'react'
import { Editor, toRichText } from 'tldraw'
import { useDecisionMatrix } from '../hooks/useDecisionMatrix'

interface DecisionMatrixExampleProps {
    editor: Editor
}

/** 把 scores 规范化为可靠的稠密矩阵：rows=options, cols=criteria */
function buildDenseScores(
    options: Array<{ id: string; title: string }>,
    criteria: Array<{ id: string; title: string }>,
    scores?: number[][],
    scoreCells?: Array<{
        optionId?: string
        optionTitle?: string
        criterionId?: string
        criterionTitle?: string
        value: number
        max?: number
    }>,
    maxScore: number = 5,
    indexConvention: 'rowsAreCriteria' | 'rowsAreOptions' = 'rowsAreOptions'
) {
    const rows = options.length
    const cols = criteria.length
    const m = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0))

    // 1) 先落已有的二维 scores
    if (Array.isArray(scores)) {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const v = scores?.[i]?.[j]
                if (Number.isFinite(v)) m[i][j] = Number(v)
            }
        }
    }

    // 2) 用稀疏 scoreCells 覆盖/补齐（同时支持按 id 或 title 匹配）
    if (Array.isArray(scoreCells) && scoreCells.length) {
        const optIndexById = new Map(options.map((o, i) => [o.id, i]))
        const optIndexByTitle = new Map(options.map((o, i) => [o.title.trim().toLowerCase(), i]))
        const criIndexById = new Map(criteria.map((c, j) => [c.id, j]))
        const criIndexByTitle = new Map(criteria.map((c, j) => [c.title.trim().toLowerCase(), j]))

        for (const cell of scoreCells) {
            let i = -1, j = -1
            if (cell.optionId && optIndexById.has(cell.optionId)) i = optIndexById.get(cell.optionId)!
            if (i < 0 && cell.optionTitle) i = optIndexByTitle.get(cell.optionTitle.trim().toLowerCase()) ?? -1
            if (cell.criterionId && criIndexById.has(cell.criterionId)) j = criIndexById.get(cell.criterionId)!
            if (j < 0 && cell.criterionTitle) j = criIndexByTitle.get(cell.criterionTitle.trim().toLowerCase()) ?? -1
            if (i < 0 || j < 0) continue

            const denom = cell.max && Number.isFinite(cell.max) ? Number(cell.max) : maxScore
            const v = Math.max(0, Math.min(denom, Number(cell.value) || 0)) // 夹逼到 [0, max]
            m[i][j] = v
        }
    }

    // 3) 若后端用 rowsAreCriteria，则转置成 rowsAreOptions（我们渲染用 rows=options, cols=criteria）
    if (indexConvention === 'rowsAreCriteria') {
        const t = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0))
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                t[i][j] = m[j]?.[i] ?? 0
            }
        }
        return t
    }

    return m
}

/**
 * Example component demonstrating DecisionMatrix boundary object usage
 */
export function DecisionMatrixExample({ editor }: DecisionMatrixExampleProps) {
    const decisionMatrix = useDecisionMatrix({
        editor,
        startPosition: { x: 200, y: 200 },
        metadata: {
            cellWidth: 100,
            cellHeight: 60,
            spacing: 20,         // 兼容老字段
            headerHeight: 40,
            headerWidth: 120
        }
    })

    const handleSampleInput = () => {
        const sampleInput = `
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
    `.trim()

        const change = decisionMatrix.processDecisionMatrixInput(sampleInput)
        if (!change) return

        // 清理旧的矩阵
        editor.getCurrentPageShapes().forEach(shape => {
            if (shape.id.includes('decision-matrix-')) {
                editor.deleteShape(shape.id)
            }
        })

        const {
            options,
            criteria,
            scores,
            scoreCells,
            startPosition,
            metadata
        } = change

        // 配置（兼容 spacing / spacingX / spacingY）
        const cellWidth = metadata?.cellWidth ?? 100
        const cellHeight = metadata?.cellHeight ?? 60
        const spacingX = (metadata?.spacingX ?? metadata?.spacingX) ?? 20
        const spacingY = (metadata?.spacingY ?? metadata?.spacingX) ?? 20
        const headerHeight = metadata?.headerHeight ?? 40
        const headerWidth = metadata?.headerWidth ?? 120
        const maxScore = metadata?.maxScore ?? 5
        const indexConvention = metadata?.indexConvention ?? 'rowsAreOptions'

        // ✅ 关键：把 scores 规范化为可靠的稠密矩阵
        const denseScores = buildDenseScores(
            options,
            criteria,
            scores,
            scoreCells,
            maxScore,
            indexConvention
        )

        // 表头（criteria）
        criteria.forEach((criterion, j) => {
            const x = startPosition.x + headerWidth + j * (cellWidth + spacingX)
            const y = startPosition.y

            editor.createShape({
                id: `shape:decision-matrix-criterion-${criterion.id}` as any,
                type: 'geo',
                x,
                y,
                props: {
                    geo: 'rectangle',
                    w: cellWidth,
                    h: headerHeight,
                    color: criterion.color || 'blue',
                    fill: 'solid',
                    richText: toRichText(
                        criterion.title + (criterion.weight ? `\n(W: ${criterion.weight})` : '')
                    ),
                },
            })
        })

        // 行表头（options）
        options.forEach((option, i) => {
            const x = startPosition.x
            const y = startPosition.y + headerHeight + i * (cellHeight + spacingY)

            editor.createShape({
                id: `shape:decision-matrix-option-${option.id}` as any,
                type: 'geo',
                x,
                y,
                props: {
                    geo: 'rectangle',
                    w: headerWidth,
                    h: cellHeight,
                    color: option.color || 'green',
                    fill: 'solid',
                    richText: toRichText(option.title + (option.description ? `\n${option.description}` : '')),
                },
            })
        })

        // 分数格（使用 denseScores，彻底避免 undefined / 越界）
        options.forEach((option, i) => {
            criteria.forEach((criterion, j) => {
                const x = startPosition.x + headerWidth + j * (cellWidth + spacingX)
                const y = startPosition.y + headerHeight + i * (cellHeight + spacingY)

                const score = denseScores?.[i]?.[j] ?? 0

                let cellColor: any = 'grey'
                if (score >= 4) cellColor = 'green'
                else if (score >= 3) cellColor = 'yellow'
                else if (score >= 2) cellColor = 'orange'
                else if (score >= 1) cellColor = 'red'

                editor.createShape({
                    id: `shape:decision-matrix-score-${option.id}-${criterion.id}` as any,
                    type: 'geo',
                    x,
                    y,
                    props: {
                        geo: 'rectangle',
                        w: cellWidth,
                        h: cellHeight,
                        color: cellColor,
                        fill: 'solid',
                        richText: toRichText(String(score)),
                    },
                })
            })
        })

        // Total 列（加权平均也用 denseScores）
        const totalColumnX = startPosition.x + headerWidth + criteria.length * (cellWidth + spacingX)
        options.forEach((option, i) => {
            const y = startPosition.y + headerHeight + i * (cellHeight + spacingY)

            let totalScore = 0
            let totalWeight = 0
            criteria.forEach((criterion, j) => {
                const score = denseScores?.[i]?.[j] ?? 0
                const weight = criterion.weight || 1
                totalScore += score * weight
                totalWeight += weight
            })
            const weightedAverage = totalWeight > 0 ? (totalScore / totalWeight).toFixed(1) : '0'

            editor.createShape({
                id: `shape:decision-matrix-total-${option.id}` as any,
                type: 'geo',
                x: totalColumnX,
                y,
                props: {
                    geo: 'rectangle',
                    w: cellWidth,
                    h: cellHeight,
                    color: 'purple',
                    fill: 'solid',
                    richText: toRichText(weightedAverage),
                },
            })
        })

        // “Total” 表头
        editor.createShape({
            id: `shape:decision-matrix-total-header` as any,
            type: 'geo',
            x: totalColumnX,
            y: startPosition.y,
            props: {
                geo: 'rectangle',
                w: cellWidth,
                h: headerHeight,
                color: 'purple',
                fill: 'solid',
                richText: toRichText('Total'),
            },
        })
    }

    const handleCreateSample = () => {
        const sampleChange = decisionMatrix.createSampleDecisionMatrix()
        console.log('Sample DecisionMatrix change:', sampleChange)
    }

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
            <h3>DecisionMatrix Boundary Object Example</h3>
            <p>This demonstrates the DecisionMatrix boundary object functionality:</p>
            <ul>
                <li><strong>Trigger:</strong> "There are options/standards/scores/advantages/disadvantages"</li>
                <li><strong>Rules:</strong></li>
                <li>• options[] is derived from "We can A/B/C"</li>
                <li>• criteria[] is derived from "It is important to consider cost/risk/velocity"</li>
                <li>• when "I give B a 4/5 score" appears → fill in scores[i][j]</li>
            </ul>

            <div style={{ marginTop: '20px' }}>
                <button onClick={handleSampleInput} style={{ marginRight: '10px', padding: '10px' }}>
                    Create Sample Decision Matrix
                </button>
                <button onClick={handleCreateSample} style={{ padding: '10px' }}>
                    Generate Sample Change Object
                </button>
            </div>

            <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                <strong>Example Input:</strong><br />
                "We can Option A, Option B, Option C.<br />
                It is important to consider cost, risk, velocity.<br />
                I give Option A a 4 for cost.<br />
                I give Option B a 3 for risk.<br />
                Cost matters most. I rate Option B a 4 for cost."
            </div>
        </div>
    )
}

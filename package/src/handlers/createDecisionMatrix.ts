import { Editor, createShapeId, toRichText } from 'tldraw'
import { TLAiCreateDecisionMatrixChange } from '../types'

export function createDecisionMatrix(editor: Editor, change: TLAiCreateDecisionMatrixChange): void {
    const {
        options,
        criteria,
        scores: incomingScores,
        scoreCells,
        advantages,
        disadvantages,
        notes,
        startPosition,
        metadata,
    } = change

    // ====== Configuration (with defaults) ======
    const title = metadata?.title ?? 'Decision Matrix'
    const cellW = metadata?.cellWidth ?? 100
    const cellH = metadata?.cellHeight ?? 60
    const gapX = (metadata as any)?.spacingX ?? (metadata as any)?.spacing ?? 20
    const gapY = (metadata as any)?.spacingY ?? (metadata as any)?.spacing ?? 20
    const headerH = metadata?.headerHeight ?? 40
    const headerW = metadata?.headerWidth ?? 120
    const maxScore = metadata?.maxScore ?? 5
    const convention = metadata?.indexConvention ?? 'rowsAreCriteria'

    const x0 = startPosition.x
    const y0 = startPosition.y

    // ====== Remove existing shapes (optional) ======
    const existing = editor.getCurrentPageShapes().filter((s) => s.id.includes('decision-matrix-'))
    if (existing.length) editor.deleteShapes(existing.map((s) => s.id))

    // ====== Build normalized score matrix M ======
    const optIndex = new Map(options.map((o, i) => [o.title.toLowerCase().trim(), i]))
    const criIndex = new Map(criteria.map((c, j) => [c.title.toLowerCase().trim(), j]))
    const M: (number | null)[][] = Array.from({ length: options.length }, () =>
        Array.from({ length: criteria.length }, () => null)
    )

    if (incomingScores && incomingScores.length) {
        if (convention === 'rowsAreCriteria') {
            for (let i = 0; i < criteria.length; i++) {
                for (let j = 0; j < options.length; j++) {
                    const v = incomingScores[i]?.[j]
                    if (typeof v === 'number') M[j][i] = v
                }
            }
        } else {
            for (let i = 0; i < options.length; i++) {
                for (let j = 0; j < criteria.length; j++) {
                    const v = incomingScores[i]?.[j]
                    if (typeof v === 'number') M[i][j] = v
                }
            }
        }
    }

    if (scoreCells && scoreCells.length) {
        for (const s of scoreCells) {
            const optKey = (s.optionTitle ?? '').toLowerCase().trim()
            const criKey = (s.criterionTitle ?? '').toLowerCase().trim()
            const i = s.optionId ? options.findIndex(o => o.id === s.optionId) : optIndex.get(optKey)
            const j = s.criterionId ? criteria.findIndex(c => c.id === s.criterionId) : criIndex.get(criKey)
            if (typeof i === 'number' && i >= 0 && typeof j === 'number' && j >= 0) {
                M[i][j] = s.value
            }
        }
    }

    // ====== Helper functions ======
    const addText = (x: number, y: number, text: string) =>
        editor.createShapes([
            {
                id: createShapeId(),
                type: 'text',
                x,
                y,
                props: {
                    richText: toRichText(text),
                    color: 'black',
                    size: 'm',
                    align: 'start',
                } as any,
            },
        ])

    const addGeoRect = (x: number, y: number, w: number, h: number, text: string, color: string) =>
        editor.createShapes([
            {
                id: createShapeId(),
                type: 'geo',
                x,
                y,
                props: {
                    geo: 'rectangle',
                    w,
                    h,
                    fill: 'solid',
                    color,
                    label: text, // ✅ FIXED (was text:)
                    size: 'm',
                    align: 'middle',
                } as any,
            },
        ])

    // ====== Color scale for scores ======
    const scoreToColor = (v: number | null): string => {
        if (v == null) return 'grey'
        if (v >= Math.max(4, maxScore * 0.8)) return 'green'
        if (v >= Math.max(3, maxScore * 0.6)) return 'yellow'
        if (v >= Math.max(2, maxScore * 0.4)) return 'orange'
        if (v >= 1) return 'red'
        return 'grey'
    }

    // ====== Title ======
    addText(x0, y0 - 60, title)

    // ====== Column headers (criteria) ======
    criteria.forEach((criterion, j) => {
        const x = x0 + headerW + j * (cellW + gapX)
        const y = y0
        const label = criterion.title + (criterion.weight ? `\n(W: ${criterion.weight})` : '')
        addGeoRect(x, y, cellW, headerH, label, criterion.color || 'blue')
    })

    // ====== Row headers (options) ======
    options.forEach((option, i) => {
        const x = x0
        const y = y0 + headerH + i * (cellH + gapY)
        const label = option.title + (option.description ? `\n${option.description}` : '')
        addGeoRect(x, y, headerW, cellH, label, option.color || 'green')
    })

    // ====== Score cells ======
    options.forEach((option, i) => {
        criteria.forEach((criterion, j) => {
            const x = x0 + headerW + j * (cellW + gapX)
            const y = y0 + headerH + i * (cellH + gapY)
            const v = M[i][j]
            const text = v == null ? '' : String(v)
            addGeoRect(x, y, cellW, cellH, text, scoreToColor(v))
        })
    })

    // ====== Totals ======
    const totalX = x0 + headerW + criteria.length * (cellW + gapX)
    options.forEach((_, i) => {
        const y = y0 + headerH + i * (cellH + gapY)
        let sum = 0
        let wsum = 0
        criteria.forEach((c, j) => {
            const v = M[i][j] ?? 0
            const w = c.weight ?? 1
            sum += v * w
            wsum += w
        })
        const avg = wsum > 0 ? (sum / wsum).toFixed(1) : '0'
        addGeoRect(totalX, y, cellW, cellH, avg, 'violet')
    })
    addGeoRect(totalX, y0, cellW, headerH, 'Total', 'violet')

    // ====== Pros / Cons / Notes ======
    const baseY = y0 + headerH + options.length * (cellH + gapY) + gapY
    if (advantages) {
        const y = baseY
        Object.entries(advantages).forEach(([optKey, list], idx) => {
            addText(x0, y + idx * 20, `Pros of ${optKey}: ${list.join('; ')}`)
        })
    }
    if (disadvantages) {
        const y = baseY + 40
        Object.entries(disadvantages).forEach(([optKey, list], idx) => {
            addText(x0, y + idx * 20, `Cons of ${optKey}: ${list.join('; ')}`)
        })
    }
    if (notes?.length) {
        addText(x0, baseY + 80, 'Notes: ' + notes.join('; '))
    }

    console.log(`✅ ${change.type} created successfully!`)
}

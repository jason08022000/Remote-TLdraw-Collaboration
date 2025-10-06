import { Editor, TLShapeId } from 'tldraw'
import { TLAiCreateTableChange } from '../types'
import { toRichText } from 'tldraw'

export function createTable(editor: Editor, change: TLAiCreateTableChange): void {
    const { rows, startPosition, metadata } = change

    // Defaults
    const baseColWidth = metadata?.colWidth || 120
    const baseRowHeight = metadata?.rowHeight || 80
    const spacing = metadata?.spacing ?? 6

    if (!rows || rows.length === 0) return

    // Generate unique batch ID to avoid shape ID conflicts
    const batchId = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`

    // --- 1️⃣ Calculate widths based on text content length (pre-calculate for consistency)
    const numCols = rows[0].cells.length
    const columnWidths = Array(numCols).fill(baseColWidth)
    rows.forEach((row) => {
        row.cells.forEach((cell, i) => {
            const text = (cell.content || '').trim()
            const len = text.length
            const estWidth = Math.max(baseColWidth, 40 + len * 10)
            if (estWidth > columnWidths[i]) columnWidths[i] = estWidth
        })
    })

    // --- 2️⃣ Draw table row by row with sequential processing
    async function processRowByRow() {
        let yOffset = startPosition.y

        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            const row = rows[rowIndex]
            let xOffset = startPosition.x
            const rowCellIds: TLShapeId[] = []

            // Create all cells in this row
            row.cells.forEach((cell, colIndex) => {
                const width = columnWidths[colIndex]
                const isHeader = rowIndex === 0
                const isEvenRow = rowIndex % 2 === 0

                const cellColor = isHeader
                    ? 'light-blue'
                    : isEvenRow
                        ? 'light-green'
                        : 'light-red'

                const shapeId = `shape:table-cell-${batchId}-${rowIndex}-${colIndex}` as TLShapeId

                editor.createShape({
                    id: shapeId,
                    type: 'geo',
                    x: xOffset,
                    y: yOffset,
                    props: {
                        geo: 'rectangle',
                        w: width,
                        h: baseRowHeight,
                        color: cellColor,
                        fill: 'solid',
                        richText: toRichText(cell.content || ''),
                        dash: 'solid',
                        size: isHeader ? 'l' : 'm',
                    },
                })

                rowCellIds.push(shapeId)
                xOffset += width + spacing
            })

            // Wait a bit for TLDraw to calculate text bounds
            await new Promise(resolve => setTimeout(resolve, 10))

            // Find max height in this row
            let maxHeight = baseRowHeight
            rowCellIds.forEach(cellId => {
                const bounds = editor.getShapePageBounds(cellId)
                if (bounds) {
                    maxHeight = Math.max(maxHeight, bounds.h)
                }
            })

            console.log(`Row ${rowIndex}: maxHeight = ${maxHeight}`)

            // Update all cells in this row to the max height
            const updates = rowCellIds.map(cellId => ({
                id: cellId,
                type: 'geo' as const,
                props: {
                    h: maxHeight,
                },
            }))
            
            editor.updateShapes(updates as any)

            // Move Y offset down for next row
            yOffset += maxHeight + spacing
        }

        console.log('✅ Dynamic height table created!')
    }

    // Start the sequential processing
    processRowByRow()
}
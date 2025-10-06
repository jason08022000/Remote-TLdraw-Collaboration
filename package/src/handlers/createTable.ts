import { Editor } from 'tldraw'
import { TLAiCreateTableChange } from '../types'
import { toRichText } from 'tldraw'

export function createTable(editor: Editor, change: TLAiCreateTableChange): void {
    const { rows, startPosition, metadata } = change

    // Defaults
    const baseColWidth = metadata?.colWidth || 120
    const baseRowHeight = metadata?.rowHeight || 80
    const spacing = metadata?.spacing ?? 6
    const borderColor = metadata?.borderColor || 'black'

    if (!rows || rows.length === 0) return

    // --- 1️⃣ Detect number of columns
    const numCols = rows[0].cells.length

    // --- 2️⃣ Calculate widths based on text content length
    const columnWidths = Array(numCols).fill(baseColWidth)
    rows.forEach((row) => {
        row.cells.forEach((cell, i) => {
            const text = (cell.content || '').trim()
            const len = text.length
            const estWidth = Math.max(baseColWidth, 40 + len * 10) // scaled for readability
            if (estWidth > columnWidths[i]) columnWidths[i] = estWidth
        })
    })

    // --- 3️⃣ Calculate row heights
    const rowHeights = rows.map((row) => {
        const lines = Math.max(...row.cells.map((c) => (c.content || '').split('\n').length))
        return Math.max(baseRowHeight, lines * 24)
    })

    // --- 4️⃣ Draw the table
    let yCursor = startPosition.y

    rows.forEach((row, rowIndex) => {
        let xCursor = startPosition.x

        row.cells.forEach((cell, colIndex) => {
            const width = columnWidths[colIndex]
            const height = rowHeights[rowIndex]

            const isHeader = rowIndex === 0
            const isEvenRow = rowIndex % 2 === 0

            // ✅ valid tldraw colors
            const cellColor = isHeader
                ? 'light-blue'
                : isEvenRow
                    ? 'light-green'
                    : 'light-red'

            // ✅ Proper color & fill inside props (not meta)
            const fillColor = isHeader
                ? 'light-blue'
                : isEvenRow
                    ? 'light-grey'
                    : 'white'

            editor.createShape({
                id: `shape:table-cell-${rowIndex}-${colIndex}` as any,
                type: 'geo',
                x: xCursor,
                y: yCursor,
                props: {
                    geo: 'rectangle',
                    w: width,
                    h: height,
                    color: cellColor,
                    fill: 'solid',
                    richText: toRichText(cell.content || ''),
                    dash: 'solid',
                    size: isHeader ? 'l' : 'm',
                    //fillColor: fillColor, // ✅ apply here
                },
            })

            xCursor += width + spacing
        })

        yCursor += rowHeights[rowIndex] + spacing
    })

    console.log('Auto-sized colorful table created!')
}
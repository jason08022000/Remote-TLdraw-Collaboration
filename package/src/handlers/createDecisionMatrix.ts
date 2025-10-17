// package/src/handlers/createNowNextLater.ts
import { Editor, TLGeoShape, TLTextShape, TLNoteShape, TLShapeId } from 'tldraw'
import { TLAiCreateNowNextLaterChange } from '../types'
import { toRichText } from 'tldraw'

export function createNowNextLater(editor: Editor, change: TLAiCreateNowNextLaterChange) {
    const { items, startPosition, size, metadata } = change
    const W = size?.width ?? 900
    const H = size?.height ?? 540
    const x0 = startPosition.x, y0 = startPosition.y
    const colW = W / 3

    const titles = metadata?.columnTitles ?? {
        now: 'Now', next: 'Next', later: 'Later'
    }

    // 背板
    editor.createShape<TLGeoShape>({
        id: 'nnl-board' as TLShapeId,
        type: 'geo',
        x: x0, y: y0,
        props: { w: W, h: H, geo: 'rectangle', fill: 'semi', dash: 'dashed' }
    })

    // 三列背景 + 标题
    const col = (i: number, title: string) => {
        const x = x0 + i * colW
        const text = toRichText(title)

        editor.createShape<TLGeoShape>({
            id: `nnl-col-${i}` as TLShapeId,
            type: 'geo',
            x, y: y0,
            props: { w: colW, h: H, geo: 'rectangle', fill: 'none', dash: 'solid' }
        })
        editor.createShape<TLTextShape>({
            id: `nnl-col-${i}-title` as TLShapeId,
            type: 'text',
            x: x + 12, y: y0 + 12,
            props: { richText: toRichText(title) }
        })
    }
    col(0, titles.now); col(1, titles.next); col(2, titles.later)

    // 便签落位（根据 column 选择列，否则平均分/随机）
    const dropIn = (which?: 'now' | 'next' | 'later', i?: number) => {
        const idx = which === 'now' ? 0 : which === 'next' ? 1 : which === 'later' ? 2 : (i ?? 0) % 3
        const margin = 60
        const x = x0 + idx * colW + margin + Math.random() * (colW - 2 * margin)
        const y = y0 + 60 + (i ?? 0) * 10 % (H - 120) // 简单避让
        return { x, y }
    }

    items.forEach((it, i) => {
        const p = dropIn(it.column, i)
        editor.createShape<TLNoteShape>({
            id: `nnl-note-${i}-${Date.now()}` as TLShapeId,
            type: 'note',
            x: p.x, y: p.y,
            props: { richText: toRichText(it.text), size: 'm', color: 'yellow' }
        })
    })
}

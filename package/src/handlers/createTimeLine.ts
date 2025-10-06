import { Editor } from 'tldraw'
import { TLAiCreateTimelineChange } from '../types'

function parseISO(s: string) {
  const d = new Date(s)
  if (isNaN(d.getTime())) throw new Error(`Invalid ISO date: ${s}`)
  return d
}
function msBetween(a: Date, b: Date) { return b.getTime() - a.getTime() }

function pickScale(totalMs: number): 'days'|'weeks'|'months'|'years' {
  const days = totalMs / (1000*60*60*24)
  if (days <= 120) return 'days'
  if (days <= 540) return 'weeks'
  if (days <= 5*365) return 'months'
  return 'years'
}
function pxPerUnit(scale: 'days'|'weeks'|'months'|'years') {
  // Heuristics—tweak as you like
  switch (scale) {
    case 'days': return 6
    case 'weeks': return 42
    case 'months': return 120
    case 'years': return 360
  }
}

export function createTimeline(editor: Editor, change: TLAiCreateTimelineChange): void {
  const { items, layout, startPosition, metadata } = change
  if (!items?.length) return

  const prefix = 'timeline'
  // Optional: clear previous timeline shapes
  const existing = editor.getCurrentPageShapes().filter(s => s.id.includes(`${prefix}-`))
  if (existing.length) editor.deleteShapes(existing.map(s => s.id))

  const itemH = metadata?.itemHeight ?? 40
  const vGap  = metadata?.vSpacing ?? 120
  const laneGap = metadata?.laneSpacing ?? 60

  // Domain
  const starts = items.map(i => parseISO(i.start))
  const ends   = items.map(i => parseISO(i.end ?? i.start))
  const domainStart = metadata?.timelineStart ? parseISO(metadata.timelineStart) : new Date(Math.min(...starts.map(d => d.getTime())))
  const domainEnd   = metadata?.timelineEnd   ? parseISO(metadata.timelineEnd)   : new Date(Math.max(...ends.map(d => d.getTime())))
  const totalMs = Math.max(1, msBetween(domainStart, domainEnd))

  // Scale
  const chosenScale = (metadata?.scale && metadata.scale !== 'auto')
    ? metadata.scale
    : pickScale(totalMs)
  const unitPx = pxPerUnit(chosenScale)

  const unitMs =
    chosenScale === 'days'   ? (1000*60*60*24) :
    chosenScale === 'weeks'  ? (1000*60*60*24*7) :
    chosenScale === 'months' ? (1000*60*60*24*30) :
    (1000*60*60*24*365)

  // Lanes
  const lanes = Array.from(new Set(items.map(i => i.lane ?? '_default')))
  const laneIndex = new Map<string, number>()
  lanes.forEach((l, idx) => laneIndex.set(l, idx))

  // Position & draw
  items.forEach((it) => {
    const start = parseISO(it.start)
    const end   = it.end ? parseISO(it.end) : start
    const fromUnits = msBetween(domainStart, start) / unitMs
    const toUnits   = msBetween(domainStart, end)   / unitMs
    const laneI = laneIndex.get(it.lane ?? '_default') ?? 0

    // Base anchor per lane
    const laneOffsetPrimary  = (layout === 'horizontal')
      ? startPosition.y + laneI * (itemH + vGap) + laneGap * laneI
      : startPosition.x + laneI * (itemH + vGap) + laneGap * laneI

    const primaryStart = Math.round(fromUnits * unitPx)
    const primaryEnd   = Math.round(toUnits * unitPx)

    const x = (layout === 'horizontal') ? startPosition.x + primaryStart : laneOffsetPrimary
    const y = (layout === 'horizontal') ? laneOffsetPrimary : startPosition.y + primaryStart

    const isMilestone = !it.end || start.getTime() === end.getTime()

    if (isMilestone) {
      // Milestone dot + label
      editor.createShape({
        id: `shape:${prefix}-milestone-${it.id}` as any,
        type: 'geo',
        x: (layout === 'horizontal') ? x - 8 : x,
        y: (layout === 'horizontal') ? y - 8 : y - 8,
        props: {
          geo: 'ellipse',
          w: 16,
          h: 16,
          color: it.color ?? 'blue',
          fill: 'solid',
        },
      })
      editor.createShape({
        id: `shape:${prefix}-label-${it.id}` as any,
        type: 'text',
        x: (layout === 'horizontal') ? x + 10 : x + 20,
        y: (layout === 'horizontal') ? y - 10 : y + 10,
        props: { text: it.title, size: 's' },
      })
    } else {
      // Rectangle with inline text
      const barLen = Math.max(10, Math.abs(primaryEnd - primaryStart))
      const w = (layout === 'horizontal') ? barLen : (metadata?.itemWidth ?? 16)
      const h = (layout === 'horizontal') ? (metadata?.itemWidth ?? itemH) : barLen

      editor.createShape({
        id: `shape:${prefix}-bar-${it.id}` as any,
        type: 'geo',
        x,
        y,
        props: {
          geo: 'rectangle',
          w,
          h,
          color: it.color ?? 'green',
          fill: 'solid',
          text: it.title,
          align: 'middle',
        },
      })
    }
  })

}

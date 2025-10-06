// example/client/features/boundary-objects/timeline.ts
import { z } from "zod";
import { useCallback } from "react";
import { useEditor } from "@tldraw/tldraw";

/** ---- 1) Schema & Types ---- */
export const TimelineEventSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1),
  /** ISO date (e.g., "2025-10-01") OR a stage-order integer */
  date: z.string().optional(),
  order: z.number().int().optional(),
  description: z.string().optional(),
});

export const TimelineSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  x: z.number(),
  y: z.number(),
  width: z.number().default(640),
  height: z.number().default(120),
  orientation: z.enum(["horizontal", "vertical"]).default("horizontal"),
  events: z.array(TimelineEventSchema).min(2),
  sourceTranscriptIds: z.array(z.string()).optional(),
}).refine(
  (v) => v.events.every((e) => e.date || typeof e.order === "number"),
  { message: "Each event needs a date or an order." }
);

export type TimelineParams = z.infer<typeof TimelineSchema>;
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

/** ---- 2) Helpers: normalize order & layout ---- */
function sortEvents(evts: TimelineEvent[]): TimelineEvent[] {
  // Prefer date if both have it; fall back to order; finally keep input order.
  const withIdx = evts.map((e, i) => ({ e, i }));
  return withIdx
    .sort((a, b) => {
      const ad = a.e.date ? Date.parse(a.e.date) : NaN;
      const bd = b.e.date ? Date.parse(b.e.date) : NaN;
      if (!Number.isNaN(ad) && !Number.isNaN(bd)) return ad - bd;
      if (!Number.isNaN(ad)) return -1;
      if (!Number.isNaN(bd)) return 1;
      const ao = typeof a.e.order === "number" ? a.e.order : Infinity;
      const bo = typeof b.e.order === "number" ? b.e.order : Infinity;
      if (ao !== bo) return ao - bo;
      return a.i - b.i;
    })
    .map((x) => x.e);
}

function positionsForHorizontal(
  x: number,
  y: number,
  width: number,
  n: number
) {
  const pad = 24; // left/right padding
  const usable = Math.max(0, width - pad * 2);
  const step = n > 1 ? usable / (n - 1) : 0;
  return Array.from({ length: n }, (_, i) => ({
    px: x + pad + i * step,
    py: y + 48, // baseline y
  }));
}

/** ---- 3) Hook that draws a timeline into TLDraw ---- */
export function useCreateTimeline() {
  const editor = useEditor();

  const createTimeline = useCallback(
    (params: TimelineParams) => {
      const v = TimelineSchema.parse(params);
      const baseId = v.id ?? `timeline_${crypto.randomUUID()}`;
      const events = sortEvents(v.events);

      // 3.1) Draw the baseline as a thin rectangle (safe across TLDraw versions)
      const baselineId = `${baseId}_line`;
      const lineHeight = 2;
      editor.createShapes([
        {
          id: baselineId,
          type: "geo",
          x: v.x,
          y: v.y + 48,
          props: { w: v.width, h: lineHeight, geo: "rectangle" },
        } as any,
      ]);

      // 3.2) Place ticks + labels
      const pts =
        v.orientation === "horizontal"
          ? positionsForHorizontal(v.x, v.y, v.width, events.length)
          : (() => {
              // Simple vertical layout if you ever need it
              const pad = 24;
              const usable = Math.max(0, v.height - pad * 2);
              const step = events.length > 1 ? usable / (events.length - 1) : 0;
              return Array.from({ length: events.length }, (_, i) => ({
                px: v.x + 80,
                py: v.y + pad + i * step,
              }));
            })();

      const createdIds: string[] = [baselineId];

      events.forEach((evt, i) => {
        const dotId = `${baseId}_dot_${i}`;
        const textId = `${baseId}_label_${i}`;
        const px = pts[i].px;
        const py = pts[i].py;

        // Dot as a small circle
        editor.createShapes([
          {
            id: dotId,
            type: "geo",
            x: px - 5,
            y: py - 5,
            props: { w: 10, h: 10, geo: "ellipse" },
          } as any,
        ]);
        createdIds.push(dotId);

        // Label (1st line = label, 2nd line = date if present)
        const second = evt.date
          ? (() => {
              const d = new Date(evt.date);
              return isNaN(d.getTime()) ? evt.date : d.toLocaleDateString();
            })()
          : typeof evt.order === "number"
          ? `#${evt.order}`
          : "";
        const label = second ? `${evt.label}\n${second}` : evt.label;

        editor.createShapes([
          {
            id: textId,
            type: "text",
            x: px - 60,
            y: py + 8,
            props: { text: label },
          } as any,
        ]);
        createdIds.push(textId);
      });

      // 3.3) Optional title above the line
      if (v.title) {
        const titleId = `${baseId}_title`;
        editor.createShapes([
          {
            id: titleId,
            type: "text",
            x: v.x,
            y: v.y,
            props: { text: v.title },
          } as any,
        ]);
        createdIds.push(titleId);
      }

      return { id: baseId, shapeIds: createdIds };
    },
    [editor]
  );

  return { createTimeline };
}
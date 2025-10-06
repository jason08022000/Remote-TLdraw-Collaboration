// package/boundary-object/index.ts
export type BoundaryObject = {
    id: string;
    label: string;
    geometry: { x: number; y: number; w: number; h: number };
    metadata?: Record<string, unknown>;
};

export function createBoundaryObject(
    partial: Partial<BoundaryObject> = {}
): BoundaryObject {
    const id = partial.id ?? `bo_${Math.random().toString(36).slice(2)}`;
    return {
        id,
        label: partial.label ?? 'Boundary Object',
        geometry:
            partial.geometry ?? { x: 100, y: 100, w: 320, h: 180 },
        metadata: partial.metadata ?? {},
    };

}

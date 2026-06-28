/**
 * Gradient palettes — Drift spec §4.2 (the "mood engine").
 * Three base palettes mapping to session types. Each is a set of color stops the
 * shader places as drifting color sources.
 */

export type PaletteId = 'dusk' | 'deepWater' | 'ember'

export interface Palette {
  id: PaletteId
  name: string
  /** Hex stops, dark → light. Fed to the shader as color sources. */
  stops: [string, string, string]
  /** Short descriptor surfaced in the UI ("Indigo · Slow drift"). */
  descriptor: string
}

export const PALETTES: Record<PaletteId, Palette> = {
  dusk: {
    id: 'dusk',
    name: 'Dusk',
    stops: ['#1A0B3B', '#3D1A6E', '#7A2E5B'], // Indigo → Violet → Rose
    descriptor: 'Indigo · Slow drift',
  },
  deepWater: {
    id: 'deepWater',
    name: 'Deep Water',
    stops: ['#060D2B', '#0D3B5E', '#1B4A6B'], // Navy → Teal → Slate
    descriptor: 'Navy · Tidal',
  },
  ember: {
    id: 'ember',
    name: 'Ember',
    stops: ['#1A0A05', '#5C2B0A', '#8B3A1A'], // Charcoal → Amber → Burnt Sienna
    descriptor: 'Amber · Warm',
  },
}

/** Convert "#RRGGBB" to normalized [r,g,b] in 0..1 for the shader. */
export function hexToRgb01(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  return [r, g, b]
}

export const PALETTE_ORDER: PaletteId[] = ['dusk', 'deepWater', 'ember']

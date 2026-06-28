/**
 * MiniGradient — lightweight CSS-gradient preview for cards (§8.1).
 * We deliberately avoid spinning up a WebGL context per card; the live shader is
 * reserved for the full-screen Pre-Play / Session views (§13 perf).
 */

import { PALETTES, PaletteId } from '../theme/palettes'

export function MiniGradient({ palette, style }: { palette: PaletteId; style?: React.CSSProperties }) {
  const [a, b, c] = PALETTES[palette].stops
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(120% 110% at 25% 20%, ${c} 0%, ${b} 45%, ${a} 100%)`,
        ...style,
      }}
    />
  )
}

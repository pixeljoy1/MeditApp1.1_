/**
 * ControlOverlay — Drift spec §8.3.
 * Frosted card, centered. Exactly 4 controls: Pause, Volume, +10 min, End Session.
 * Auto-hides after 4s (handled by the parent). rgba(8,8,16,0.72) blur behind card.
 */

import { haptic } from '../state/util'
import { radius } from '../theme/tokens'

interface Props {
  paused: boolean
  volume: number
  onTogglePause: () => void
  onVolume: (v: number) => void
  onAddTime: () => void
  onEnd: () => void
}

export function ControlOverlay({ paused, volume, onTogglePause, onVolume, onAddTime, onEnd }: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(8,8,16,0.50)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 30,
        animation: 'fade 200ms ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(560px, 84%)',
          background: 'rgba(8,8,16,0.72)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: radius.card,
          padding: 24,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
        }}
      >
        <button onClick={onTogglePause} style={ctl}>
          <span style={{ fontSize: 20 }}>{paused ? '▶' : '⏸'}</span>
          <span style={lbl}>{paused ? 'Resume' : 'Pause'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 16 }}>🔊</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => onVolume(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--accent)' }}
            aria-label="Volume"
          />
        </div>

        <button
          onClick={() => {
            haptic.doublePulse()
            onAddTime()
          }}
          style={ctl}
        >
          <span style={{ fontSize: 18 }}>＋</span>
          <span style={lbl}>10 min</span>
        </button>

        <button onClick={onEnd} style={{ ...ctl, color: 'var(--text-secondary)' }}>
          <span style={{ fontSize: 18 }}>✕</span>
          <span style={lbl}>End Session</span>
        </button>
      </div>
    </div>
  )
}

const ctl: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  minHeight: 44,
  color: 'var(--text-primary)',
}
const lbl: React.CSSProperties = { fontSize: 16, fontWeight: 300 }

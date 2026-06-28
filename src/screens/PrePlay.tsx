/**
 * Pre-Play — Drift spec §8.2.
 * Gradient already runs live (shared controller from App — continues into session,
 * no break). Title + duration + descriptor, timer radio pills, single Begin action.
 * Back arrow / swipe-left dismisses.
 */

import { Session } from '../session/types'
import { TimerPicker } from '../components/TimerPicker'
import { Pill } from '../components/Pill'
import { useStore } from '../state/store'
import { PALETTES } from '../theme/palettes'
import { effectivePalette } from '../state/util'

export function PrePlay({
  session,
  onBegin,
  onBack,
}: {
  session: Session
  onBegin: () => void
  onBack: () => void
}) {
  const { persisted, selectedTimer, setTimer } = useStore()
  const palette = PALETTES[effectivePalette(session, persisted.settings)]

  return (
    <div className="screen">
      {/* gradient is rendered by App at the base layer */}
      <button onClick={onBack} aria-label="Back to home" style={backBtn}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>←</span>
        <span>Home</span>
      </button>

      <div style={layout}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h1 className="serif" style={{ fontSize: 44, margin: 0 }}>
            {session.title}
          </h1>
          <div style={{ fontSize: 16, color: 'var(--text-primary)' }}>{session.durationMin} min</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{palette.descriptor}</div>
        </div>

        <div style={{ minWidth: 240 }}>
          <div className="label" style={{ marginBottom: 12 }}>
            Sleep Timer
          </div>
          <TimerPicker value={selectedTimer} onChange={setTimer} premium={persisted.premium} />
        </div>
      </div>

      <div style={beginWrap}>
        <Pill onClick={onBegin} full style={{ maxWidth: 420 }}>
          Begin Session
        </Pill>
      </div>
    </div>
  )
}

const backBtn: React.CSSProperties = {
  position: 'absolute',
  top: 16,
  left: 20,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  height: 40,
  padding: '0 16px',
  borderRadius: 100,
  background: 'rgba(8,8,16,0.45)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.1)',
  fontSize: 15,
  color: 'var(--text-primary)',
  zIndex: 10,
}
const layout: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  padding: '0 56px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 48,
  flexWrap: 'wrap',
}
const beginWrap: React.CSSProperties = {
  position: 'absolute',
  bottom: 28,
  left: 0,
  right: 0,
  display: 'grid',
  placeItems: 'center',
  padding: '0 24px',
}

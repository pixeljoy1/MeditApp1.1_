/**
 * Active Session — Drift spec §8.3 (immersive) + §8.5 (breathwork special case).
 * Default state: only the timer + sleep-timer label. Tap summons the control
 * overlay (auto-hides in 4s). Breathwork swaps the clock for a BreathRing.
 */

import { useEffect, useRef, useState } from 'react'
import { Session } from '../session/types'
import { SessionRuntime } from '../state/useSession'
import { ControlOverlay } from '../components/ControlOverlay'
import { BreathRing } from '../components/BreathRing'
import { Equalizer } from '../components/Equalizer'
import { breathStateAt } from '../session/BreathController'
import { clock } from '../state/util'
import { color } from '../theme/tokens'

export function ActiveSession({ session, runtime }: { session: Session; runtime: SessionRuntime }) {
  const [overlay, setOverlay] = useState(false)
  const [hint, setHint] = useState(true)
  const hideTimer = useRef<number | null>(null)
  const isBreath = !!session.breath

  const summon = () => {
    setOverlay(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setOverlay(false), 4000) // auto-hide 4s (§7.2)
  }
  const dismiss = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setOverlay(false)
  }

  // Teach the interaction: show a brief hint at session start, then fade it.
  useEffect(() => {
    const t = window.setTimeout(() => setHint(false), 4500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => () => void (hideTimer.current && clearTimeout(hideTimer.current)), [])

  // breathwork ring needs a smooth tick; cheap rAF only when breathing.
  const [, force] = useState(0)
  useEffect(() => {
    if (!isBreath) return
    let raf = 0
    const loop = () => {
      force((n) => n + 1)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [isBreath])

  const sleepLabel =
    runtime.sleepRemainingSec == null
      ? 'Until you stop it'
      : `🌙 ${clock(runtime.sleepRemainingSec)} remaining`

  return (
    <div className="screen" onClick={overlay ? dismiss : summon}>
      {/* Always-visible exit — a clean pathway home, no discovery required. */}
      <button
        aria-label="End session and return home"
        onClick={(e) => {
          e.stopPropagation()
          runtime.endSession()
        }}
        style={exitBtn}
      >
        ✕
      </button>

      <div style={center}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
          {isBreath ? (
            <BreathRing state={breathStateAt(session.breath!, runtime.elapsedSec)} accent={color.accent} />
          ) : (
            <div
              className="serif"
              style={{ fontSize: 48, opacity: runtime.timerOpacity, transition: 'opacity 1s linear' }}
            >
              {clock(runtime.elapsedSec)}
            </div>
          )}
          {/* audio-reactive equalizer — mimics the playing music */}
          <Equalizer opacity={0.3 + 0.7 * runtime.timerOpacity} width={300} height={56} />
        </div>
      </div>

      {!isBreath && (
        <div style={sleepRow}>
          <span style={{ fontSize: 13, color: 'var(--text-ghost)' }}>{sleepLabel}</span>
        </div>
      )}

      {runtime.statusNote && (
        <div style={statusRow}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{runtime.statusNote}</span>
        </div>
      )}

      {/* fading first-run hint */}
      {hint && !overlay && (
        <div style={hintRow}>
          <span style={{ fontSize: 12, color: 'var(--text-ghost)', animation: 'hint-fade 4.5s ease forwards' }}>
            Tap anywhere for controls · ✕ to end
          </span>
        </div>
      )}

      {overlay && (
        <ControlOverlay
          paused={runtime.paused}
          volume={runtime.volume}
          onTogglePause={runtime.togglePause}
          onVolume={runtime.setVolume}
          onAddTime={runtime.addTen}
          onEnd={runtime.endSession}
        />
      )}

      {/* fade-to-black overlay (§5.3 / §8.3) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#000',
          opacity: runtime.blackout,
          transition: `opacity ${runtime.blackout ? runtime.blackoutMs : 0}ms linear`,
          pointerEvents: runtime.blackout ? 'auto' : 'none',
          zIndex: 40,
        }}
      />
      <style>{`@keyframes hint-fade { 0%,70% { opacity: 1 } 100% { opacity: 0 } }`}</style>
    </div>
  )
}

const exitBtn: React.CSSProperties = {
  position: 'absolute',
  top: 14,
  right: 16,
  width: 40,
  height: 40,
  borderRadius: 100,
  background: 'rgba(8,8,16,0.4)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'var(--text-secondary)',
  fontSize: 15,
  zIndex: 35,
}
const hintRow: React.CSSProperties = {
  position: 'absolute',
  bottom: 18,
  left: 0,
  right: 0,
  textAlign: 'center',
  pointerEvents: 'none',
}

const center: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'grid',
  placeItems: 'center',
}
const sleepRow: React.CSSProperties = {
  position: 'absolute',
  bottom: 40,
  left: 0,
  right: 0,
  textAlign: 'center',
}
const statusRow: React.CSSProperties = {
  position: 'absolute',
  top: 20,
  left: 0,
  right: 0,
  textAlign: 'center',
}

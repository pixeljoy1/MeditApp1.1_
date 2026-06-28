/**
 * TimerPicker — Drift spec §8.2 / §6.2.
 * Large radio pills (44dp touch targets). Used in Pre-Play and Onboarding.
 * Respects the free-tier 30-min cap (§14): capped options render disabled.
 */

import { TIMER_OPTIONS, SleepTimer } from '../state/types'
import { timerLabel, haptic } from '../state/util'
import { radius } from '../theme/tokens'

interface Props {
  value: SleepTimer
  onChange: (t: SleepTimer) => void
  premium: boolean
}

export function TimerPicker({ value, onChange, premium }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} role="radiogroup" aria-label="Sleep timer">
      {TIMER_OPTIONS.map((t) => {
        const capped = !premium && (t === 'infinite' || (typeof t === 'number' && t > 30))
        const selected = value === t
        return (
          <button
            key={String(t)}
            role="radio"
            aria-checked={selected}
            disabled={capped}
            onClick={() => {
              haptic.light()
              onChange(t)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minHeight: 44,
              padding: '0 18px',
              borderRadius: radius.pill,
              background: selected ? 'rgba(167,139,250,0.16)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${selected ? 'var(--accent)' : 'rgba(255,255,255,0.06)'}`,
              color: capped ? 'var(--text-ghost)' : 'var(--text-primary)',
              opacity: capped ? 0.55 : 1,
              transition: 'all 200ms cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--text-ghost)'}`,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {selected && (
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
              )}
            </span>
            <span style={{ fontSize: 16 }}>{timerLabel(t)}</span>
            {capped && <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-ghost)' }}>Premium</span>}
          </button>
        )
      })}
    </div>
  )
}

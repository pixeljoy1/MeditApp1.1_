/**
 * Onboarding — Drift spec §10. Three screens, no account required.
 *   1. Name   2. Intent (sets default ordering, not locked)   3. Sleep timer → start
 */

import { useMemo, useState } from 'react'
import { GradientCanvas } from '../gradient/GradientCanvas'
import { GradientController } from '../gradient/GradientController'
import { Pill } from '../components/Pill'
import { TimerPicker } from '../components/TimerPicker'
import { useStore } from '../state/store'
import { SleepTimer } from '../state/types'
import { radius } from '../theme/tokens'
import { haptic } from '../state/util'

type Intent = 'asleep' | 'wind' | 'stress'

export function Onboarding({ onDone }: { onDone: (timer: SleepTimer) => void }) {
  const { patchSettings, setOnboardingComplete } = useStore()
  const controller = useMemo(() => new GradientController('dusk'), [])
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [, setIntent] = useState<Intent | null>(null)
  const [timer, setTimer] = useState<SleepTimer>(45)

  const next = () => {
    haptic.light()
    setStep((s) => s + 1)
  }

  return (
    <div className="screen">
      <GradientCanvas controller={controller} psychedelic={0.7} />
      <div style={overlay}>
        {step === 0 && (
          <div style={panel}>
            <h1 className="serif" style={{ fontSize: 40, margin: 0 }}>
              What's your name?
            </h1>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="(optional)"
              style={inputStyle}
            />
            <Pill
              onClick={() => {
                patchSettings({ name: name.trim() })
                next()
              }}
            >
              Continue
            </Pill>
          </div>
        )}

        {step === 1 && (
          <div style={panel}>
            <h1 className="serif" style={{ fontSize: 36, margin: 0 }}>
              When do you usually come here?
            </h1>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {(
                [
                  ['asleep', 'Falling asleep'],
                  ['wind', 'Winding down'],
                  ['stress', 'Stressed'],
                ] as [Intent, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => {
                    setIntent(id)
                    next()
                  }}
                  style={{
                    minHeight: 48,
                    padding: '0 22px',
                    borderRadius: radius.pill,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-primary)',
                    fontSize: 16,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={panel}>
            <h1 className="serif" style={{ fontSize: 36, margin: 0 }}>
              Set a sleep timer for tonight
            </h1>
            <div style={{ maxWidth: 320, width: '100%' }}>
              <TimerPicker value={timer} onChange={setTimer} premium={false} />
            </div>
            <Pill
              onClick={() => {
                patchSettings({ defaultSleepTimer: timer })
                setOnboardingComplete(true)
                onDone(timer)
              }}
            >
              Start tonight with Drift
            </Pill>
          </div>
        )}
      </div>
    </div>
  )
}

const overlay: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'grid',
  placeItems: 'center',
  padding: 24,
}
const panel: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  alignItems: 'flex-start',
  maxWidth: 480,
  width: '100%',
}
const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid var(--text-ghost)',
  padding: '12px 4px',
  fontSize: 24,
  fontFamily: 'var(--serif)',
  outline: 'none',
}

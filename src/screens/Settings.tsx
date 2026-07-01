/**
 * Settings — simplified. Just the essentials: who you are, the look, how long,
 * and the prototype premium unlock. Swipe the sheet down to dismiss.
 */

import { Sheet } from '../components/Sheet'
import { useStore } from '../state/store'
import { PALETTE_ORDER, PALETTES } from '../theme/palettes'
import { TIMER_OPTIONS } from '../state/types'
import { timerLabel } from '../state/util'

export function Settings() {
  const { settingsOpen, openSettings, persisted, patchSettings, setPremium } = useStore()
  const s = persisted.settings

  return (
    <Sheet open={settingsOpen} onClose={() => openSettings(false)} title="Settings">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Row label="Your name">
          <input
            value={s.name}
            onChange={(e) => patchSettings({ name: e.target.value })}
            placeholder="—"
            style={textInput}
          />
        </Row>

        <Row label="Theme">
          <select
            value={s.theme}
            onChange={(e) => patchSettings({ theme: e.target.value as any })}
            style={select}
          >
            <option value="dark">Dark</option>
            <option value="pastel">Pastel</option>
          </select>
        </Row>

        <Row label="Palette">
          <select
            value={s.preferredPalette}
            onChange={(e) => patchSettings({ preferredPalette: e.target.value as any })}
            style={select}
          >
            <option value="auto">Auto</option>
            {PALETTE_ORDER.map((p) => (
              <option key={p} value={p}>
                {PALETTES[p].name}
              </option>
            ))}
          </select>
        </Row>

        <Row label="Default sleep timer">
          <select
            value={String(s.defaultSleepTimer)}
            onChange={(e) =>
              patchSettings({
                defaultSleepTimer: e.target.value === 'infinite' ? 'infinite' : Number(e.target.value),
              })
            }
            style={select}
          >
            {TIMER_OPTIONS.map((t) => (
              <option key={String(t)} value={String(t)}>
                {timerLabel(t)}
              </option>
            ))}
          </select>
        </Row>

        <Toggle label="Drift Premium" value={persisted.premium} onChange={setPremium} />
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-ghost)', margin: '20px 0 0', textAlign: 'center' }}>
        No ads. Ever. Your calm is sacred.
      </p>
    </Sheet>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <span style={{ fontSize: 16, color: 'var(--text-primary)' }}>{label}</span>
      {children}
    </div>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Row label={label}>
      <button
        onClick={() => onChange(!value)}
        aria-pressed={value}
        style={{
          width: 48,
          height: 28,
          borderRadius: 100,
          background: value ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
          position: 'relative',
          transition: 'background 200ms ease',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: value ? 23 : 3,
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: '#fff',
            transition: 'left 200ms cubic-bezier(0.34,1.2,0.4,1)',
          }}
        />
      </button>
    </Row>
  )
}

const select: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  padding: '8px 12px',
  fontSize: 14,
  color: 'var(--text-primary)',
}
const textInput: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  padding: '8px 12px',
  fontSize: 14,
  textAlign: 'right',
  width: 160,
  outline: 'none',
}

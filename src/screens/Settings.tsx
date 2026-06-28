/**
 * Settings — Drift spec §9. Bottom sheet, three sections. No notification settings.
 * Also exposes a Premium toggle here (prototype-only) so reviewers can unlock the
 * full catalog / unlimited timer without a real billing flow.
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
      <Section title="Personalization">
        <Row label="Display name">
          <input
            value={s.name}
            onChange={(e) => patchSettings({ name: e.target.value })}
            placeholder="—"
            style={textInput}
          />
        </Row>
        <Row label="Preferred palette">
          <select
            value={s.preferredPalette}
            onChange={(e) => patchSettings({ preferredPalette: e.target.value as any })}
            style={select}
          >
            <option value="auto">Auto (from session)</option>
            {PALETTE_ORDER.map((p) => (
              <option key={p} value={p}>
                {PALETTES[p].name}
              </option>
            ))}
          </select>
        </Row>
        <Row label="Default session length">
          <select
            value={s.defaultSessionLength}
            onChange={(e) => patchSettings({ defaultSessionLength: Number(e.target.value) })}
            style={select}
          >
            {[10, 20, 30, 45, 60].map((m) => (
              <option key={m} value={m}>
                {m} min
              </option>
            ))}
          </select>
        </Row>
      </Section>

      <Section title="Sleep Behavior">
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
        <Toggle label="Screen off after session ends" value={s.screenOffAfter} onChange={(v) => patchSettings({ screenOffAfter: v })} />
        <Toggle label="Bedtime mode (mute UI sounds after)" value={s.bedtimeMode} onChange={(v) => patchSettings({ bedtimeMode: v })} />
      </Section>

      <Section title="Audio">
        <Toggle label="Preload sessions on Wi-Fi only" value={s.preloadWifiOnly} onChange={(v) => patchSettings({ preloadWifiOnly: v })} />
        <Row label="Audio quality">
          <select
            value={s.audioQuality}
            onChange={(e) => patchSettings({ audioQuality: e.target.value as any })}
            style={select}
            disabled={!persisted.premium && s.audioQuality === 'standard'}
          >
            <option value="standard">Standard · 320kbps</option>
            <option value="flac" disabled={!persisted.premium}>
              High · FLAC (Premium)
            </option>
          </select>
        </Row>
        <Toggle label="Nightly “Ready to sleep?” prompt" value={s.nightlyPrompt} onChange={(v) => patchSettings({ nightlyPrompt: v })} />
      </Section>

      <Section title="Account">
        <Toggle label="Drift Premium (prototype unlock)" value={persisted.premium} onChange={setPremium} />
        <p style={{ fontSize: 11, color: 'var(--text-ghost)', margin: '4px 0 0' }}>
          No ads. Ever. Sleep is sacred.
        </p>
      </Section>
    </Sheet>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div className="label" style={{ marginBottom: 12 }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
    </div>
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

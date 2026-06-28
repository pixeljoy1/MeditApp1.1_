/**
 * Home — Drift spec §8.1. Landscape-first; portrait stacks (§8.4).
 * Gear (settings) top-left, brand + moon top-right. Greeting. Featured last-played
 * card on the right. Horizontal mood rows of session cards. No bottom nav (§7.3).
 */

import { useMemo } from 'react'
import { CATALOG, byId } from '../session/catalog'
import { GROUP_LABEL, Session, SessionGroup } from '../session/types'
import { SessionCard } from '../components/SessionCard'
import { useStore } from '../state/store'
import { greeting } from '../state/util'

const ROW_ORDER: SessionGroup[] = ['sleep', 'bodyScan', 'breathwork', 'focus']

export function Home({
  onSelect,
  onPreview,
  onLocked,
}: {
  onSelect: (s: Session) => void
  onPreview: (s: Session) => void
  onLocked: (s: Session) => void
}) {
  const { persisted, openSettings } = useStore()
  const name = persisted.settings.name
  const featured = useMemo(
    () => byId(persisted.lastPlayedId ?? 'drift') ?? byId('drift')!,
    [persisted.lastPlayedId],
  )

  const rows = useMemo(
    () =>
      ROW_ORDER.map((g) => ({ group: g, items: CATALOG.filter((s) => s.group === g) })).filter(
        (r) => r.items.length > 0,
      ),
    [],
  )

  return (
    <div className="screen" style={{ background: 'var(--surface)', overflow: 'hidden' }}>
      {/* top bar */}
      <div style={topBar}>
        <button aria-label="Settings" onClick={() => openSettings(true)} style={{ fontSize: 20, color: 'var(--text-ghost)' }}>
          ⚙
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
          <span className="serif" style={{ fontSize: 18, color: 'var(--text-primary)' }}>
            Drift
          </span>
          <span style={{ fontSize: 16 }}>🌙</span>
        </div>
      </div>

      <div style={body}>
        {/* left: greeting + mood rows */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto', paddingRight: 8 }}>
          <div>
            <h1 className="serif" style={{ fontSize: 34, margin: 0 }}>
              {greeting()}
              {name ? `, ${name}` : ''}
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: '6px 0 0', fontSize: 16 }}>
              What do you need tonight?
            </p>
          </div>

          {rows.map((row) => (
            <div key={row.group}>
              <div className="label" style={{ marginBottom: 10 }}>
                {GROUP_LABEL[row.group]}
              </div>
              <div style={scrollRow}>
                {row.items.map((s) => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    onSelect={onSelect}
                    onPreview={onPreview}
                    onLocked={onLocked}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* right: featured last-played (persistent, not algorithmic §8.1) */}
        <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: 46 }}>
          <SessionCard session={featured} onSelect={onSelect} onPreview={onPreview} onLocked={onLocked} featured />
        </div>
      </div>
    </div>
  )
}

const topBar: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 52,
  padding: '0 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  zIndex: 10,
}
const body: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  paddingTop: 60,
  paddingLeft: 24,
  paddingRight: 24,
  paddingBottom: 20,
  display: 'flex',
  gap: 24,
}
const scrollRow: React.CSSProperties = {
  display: 'flex',
  gap: 14,
  overflowX: 'auto',
  paddingBottom: 4,
}

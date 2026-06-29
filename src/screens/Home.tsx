/**
 * Home — Drift spec §8.1 / §8.4.
 * Mobile-first and responsive: a single vertical scroll column with a fixed top
 * bar. The featured (last-played) session sits up top, then each mood group is a
 * wrapping responsive grid of cards — so nothing is cut off in portrait or
 * landscape, on phone or desktop. No bottom nav (§7.3).
 */

import { useMemo, useState } from 'react'
import { CATALOG, byId } from '../session/catalog'
import { GROUP_LABEL, Session, SessionGroup } from '../session/types'
import { SessionCard } from '../components/SessionCard'
import { VersionPill } from '../components/VersionPill'
import { PullToRefresh } from '../components/PullToRefresh'
import { AddThemeCard } from '../components/AddThemeCard'
import { RequestCard } from '../components/RequestCard'
import { RequestThemeSheet } from '../components/RequestThemeSheet'
import { useStore } from '../state/store'
import { greeting } from '../state/util'
import { emailThemeRequest, makeId } from '../state/themeRequest'

const ROW_ORDER: SessionGroup[] = ['sleep', 'chanting', 'bodyScan', 'breathwork']

export function Home({
  onSelect,
  onPreview,
  onLocked,
}: {
  onSelect: (s: Session) => void
  onPreview: (s: Session) => void
  onLocked: (s: Session) => void
}) {
  const { persisted, openSettings, addRequest } = useStore()
  const name = persisted.settings.name
  const [requestOpen, setRequestOpen] = useState(false)

  const submitRequest = async (data: { name: string; mood: string; note: string }) => {
    addRequest({ id: makeId(), createdAt: Date.now(), ...data })
    return emailThemeRequest({ ...data, from: name || 'anonymous' })
  }
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
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
      {/* fixed top bar: app name left · version + settings right */}
      <div style={topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="serif" style={{ fontSize: 18, color: 'var(--text-primary)' }}>
            Drift
          </span>
          <span style={{ fontSize: 16 }}>🌙</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <VersionPill />
          <button aria-label="Settings" onClick={() => openSettings(true)} style={gear}>
            ⚙
          </button>
        </div>
      </div>

      {/* scrollable content with pull-to-refresh */}
      <PullToRefresh style={scroll}>
        <div style={{ maxWidth: 760, margin: '0 auto', width: '100%' }}>
          <h1 className="serif" style={{ fontSize: 30, margin: '4px 0 2px' }}>
            {greeting()}
            {name ? `, ${name}` : ''}
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 20px', fontSize: 15 }}>
            What do you need tonight?
          </p>

          {/* featured — continue last played */}
          <div className="label" style={{ marginBottom: 10 }}>
            Continue
          </div>
          <SessionCard session={featured} onSelect={onSelect} onPreview={onPreview} onLocked={onLocked} featured fluid />

          {/* mood groups as wrapping grids */}
          {rows.map((row) => (
            <div key={row.group} style={{ marginTop: 26 }}>
              <div className="label" style={{ marginBottom: 10 }}>
                {GROUP_LABEL[row.group]}
              </div>
              <div style={grid}>
                {row.items.map((s) => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    onSelect={onSelect}
                    onPreview={onPreview}
                    onLocked={onLocked}
                    fluid
                  />
                ))}
              </div>
            </div>
          ))}

          {/* request a new theme — logged here + emailed to the developer */}
          <div style={{ marginTop: 26 }}>
            <div className="label" style={{ marginBottom: 10 }}>
              Your Themes
            </div>
            <div style={grid}>
              <AddThemeCard onClick={() => setRequestOpen(true)} />
              {persisted.requests.map((r) => (
                <RequestCard key={r.id} req={r} />
              ))}
            </div>
          </div>

          <div style={{ height: 16 }} />
        </div>
      </PullToRefresh>

      <RequestThemeSheet open={requestOpen} onClose={() => setRequestOpen(false)} onSubmit={submitRequest} />
    </div>
  )
}

const topBar: React.CSSProperties = {
  flex: '0 0 auto',
  height: 52,
  padding: '0 18px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
}
const gear: React.CSSProperties = { fontSize: 20, color: 'var(--text-secondary)' }
const scroll: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  WebkitOverflowScrolling: 'touch',
  padding: '18px 18px 8px',
}
const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
  gap: 12,
}

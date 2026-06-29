/** A logged theme request shown on the homepage (pending review). */

import { ThemeRequest } from '../state/types'
import { radius } from '../theme/tokens'

export function RequestCard({ req }: { req: ThemeRequest }) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 116,
        borderRadius: radius.card,
        overflow: 'hidden',
        background: 'linear-gradient(160deg, rgba(167,139,250,0.10), rgba(15,15,30,0.5))',
        border: '1px solid rgba(255,255,255,0.06)',
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <span
        className="label"
        style={{
          position: 'absolute',
          top: 12,
          left: 14,
          color: 'var(--accent)',
          fontSize: 11,
        }}
      >
        ◷ Requested
      </span>
      <span className="serif" style={{ fontSize: 20, lineHeight: 1.05 }}>
        {req.name}
      </span>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
        {req.mood ? req.mood : 'Pending review'}
      </span>
    </div>
  )
}

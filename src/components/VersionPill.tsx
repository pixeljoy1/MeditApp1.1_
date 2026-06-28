/** Small build-version pill. Increments every build (v1.00, v1.01, …). */

import { APP_VERSION } from '../version'
import { radius } from '../theme/tokens'

export function VersionPill({ style }: { style?: React.CSSProperties }) {
  return (
    <span
      title={`Drift build ${APP_VERSION}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 22,
        padding: '0 10px',
        borderRadius: radius.pill,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'var(--text-ghost)',
        fontSize: 11,
        letterSpacing: 0.5,
        fontFamily: 'var(--sans)',
        userSelect: 'none',
        ...style,
      }}
    >
      {APP_VERSION}
    </span>
  )
}

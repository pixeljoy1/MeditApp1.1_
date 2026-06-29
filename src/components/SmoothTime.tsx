/**
 * SmoothTime — a soft, non-digital clock.
 * Renders mm:ss but animates each character only when it changes, with a gentle
 * fade + vertical drift + slight blur — so seconds melt rather than snap. Used
 * for the large session countdown (§8.3), matching the app's calm motion language.
 */

import { clock } from '../state/util'

export function SmoothTime({
  seconds,
  size = 48,
  opacity = 1,
}: {
  seconds: number
  size?: number
  opacity?: number
}) {
  const text = clock(seconds)
  return (
    <span
      className="serif"
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        fontSize: size,
        opacity,
        transition: 'opacity 1s linear',
        lineHeight: 1,
      }}
      aria-label={`${text} remaining`}
    >
      {text.split('').map((ch, i) => (
        <span
          // key includes the char so a changed position remounts → re-animates
          key={`${i}-${ch}`}
          style={{
            display: 'inline-block',
            width: ch === ':' ? '0.32em' : '0.6em',
            textAlign: 'center',
            animation: 'time-tick 560ms cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          {ch}
        </span>
      ))}
      <style>{`
        @keyframes time-tick {
          from { opacity: 0; transform: translateY(-0.16em); filter: blur(3px); }
          to   { opacity: 1; transform: none;              filter: blur(0);   }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="time-tick"] { animation-duration: 1ms !important; }
        }
      `}</style>
    </span>
  )
}

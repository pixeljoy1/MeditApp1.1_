/**
 * WindDown — supporting messages shown as a session gently ends.
 * Steps through a few calm lines, each cross-fading, while the screen dims to
 * black beneath it (blackout overlay sits above and covers everything at the end).
 */

import { useEffect, useState } from 'react'

const LINES = ['Winding down…', 'Let everything soften', 'Sleep well']

export function WindDown({ durationMs }: { durationMs: number }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const step = Math.max(900, durationMs / LINES.length)
    const id = window.setInterval(() => setI((n) => Math.min(n + 1, LINES.length - 1)), step)
    return () => clearInterval(id)
  }, [durationMs])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        zIndex: 25,
        pointerEvents: 'none',
      }}
    >
      <div
        key={i}
        className="serif"
        style={{ fontSize: 30, color: 'var(--text-primary)', animation: 'wd-fade 1200ms ease' }}
      >
        {LINES[i]}
      </div>
      <style>{`@keyframes wd-fade { 0% { opacity: 0; transform: translateY(6px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}

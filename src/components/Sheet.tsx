/**
 * Sheet — bottom sheet (§7.3 / §8.4). 28dp top corners (§4.4), frosted surface.
 * Used for Settings (§9) and the Paywall (§14). Springs up on open and slides
 * back down on close — both directions animate (kept mounted during exit).
 */

import { useEffect, useState } from 'react'
import { radius } from '../theme/tokens'

interface Props {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function Sheet({ open, onClose, children, title }: Props) {
  const [render, setRender] = useState(open)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (open) {
      setRender(true)
      // mount closed, then flip on next frame so the slide-up animates
      const r = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
      return () => cancelAnimationFrame(r)
    } else {
      setShown(false)
      const t = window.setTimeout(() => setRender(false), 360)
      return () => clearTimeout(t)
    }
  }, [open])

  if (!render) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        background: shown ? 'rgba(8,8,16,0.55)' : 'rgba(8,8,16,0)',
        backdropFilter: shown ? 'blur(2px)' : 'blur(0px)',
        display: 'flex',
        alignItems: 'flex-end',
        zIndex: 50,
        transition: 'background 320ms ease, backdrop-filter 320ms ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '88%',
          overflowY: 'auto',
          background: 'var(--surface-raised)',
          borderTopLeftRadius: radius.sheet,
          borderTopRightRadius: radius.sheet,
          padding: '20px 24px 32px',
          transform: shown ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 360ms cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            background: 'var(--text-ghost)',
            margin: '0 auto 16px',
          }}
        />
        {title && (
          <h2 className="serif" style={{ fontSize: 28, margin: '0 0 16px' }}>
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  )
}

/**
 * Sheet — bottom sheet (§7.3 / §8.4). 28dp top corners (§4.4), frosted surface.
 * Used for Settings (§9) and the Paywall (§14). Dismiss on backdrop tap.
 */

import { radius } from '../theme/tokens'

interface Props {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function Sheet({ open, onClose, children, title }: Props) {
  if (!open) return null
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(8,8,16,0.55)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'flex-end',
        zIndex: 50,
        animation: 'fade 200ms ease',
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
          animation: 'sheet-up 340ms cubic-bezier(0.34,1.2,0.4,1)',
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
      <style>{`
        @keyframes fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes sheet-up { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @media (prefers-reduced-motion: reduce) {
          [style*="sheet-up"] { animation-duration: 1ms !important }
        }
      `}</style>
    </div>
  )
}

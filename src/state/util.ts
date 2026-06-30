/** Shared helpers — greetings, palette resolution, haptics, formatting. */

import { PaletteId } from '../theme/palettes'
import { Session } from '../session/types'
import { Settings, SleepTimer } from './types'

/** §8.1 greeting adapts to time of day. */
export function greeting(now = new Date()): string {
  const h = now.getHours()
  if (h >= 18 || h < 2) return 'Good evening'
  if (h >= 2 && h < 6) return 'Rest well'
  return 'Take a breath'
}

/** Rotating invitation lines — a fresh one each visit (≥10 before any repeat). */
const INVITATIONS = [
  'What do you need tonight?',
  'Let the day go.',
  'How shall we wind down?',
  'Ready to soften into sleep?',
  'Let your shoulders drop.',
  'Breathe out the day.',
  "What would feel good right now?",
  "Let's quiet the noise.",
  'Set the day down for a while.',
  'Drift somewhere gentle?',
  'Nothing to do but rest.',
  'Time to come back to yourself.',
]

/** Returns the next invitation line, cycling so all are shown before repeating. */
export function nextInvitation(): string {
  let i = 0
  try {
    i = parseInt(localStorage.getItem('drift.invite.idx') || '0', 10) || 0
    localStorage.setItem('drift.invite.idx', String((i + 1) % INVITATIONS.length))
  } catch {
    i = Math.floor(Math.random() * INVITATIONS.length)
  }
  return INVITATIONS[i % INVITATIONS.length]
}

/** Resolve the palette actually used: preference overrides session default (§9.1). */
export function effectivePalette(session: Session, settings: Settings): PaletteId {
  return settings.preferredPalette === 'auto' ? session.palette : settings.preferredPalette
}

/** §14 free-tier sleep-timer cap: 30 min unless premium. */
export function cappedTimer(t: SleepTimer, premium: boolean): SleepTimer {
  if (premium) return t
  if (t === 'infinite') return 30
  return Math.min(t, 30)
}

export function timerLabel(t: SleepTimer): string {
  return t === 'infinite' ? 'Until I stop it' : `${t} min`
}

/** mm:ss for the session timer (§8.3). */
export function clock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

/** §7.1 haptic language. Best-effort; no-op where unsupported. */
export const haptic = {
  light: () => navigator.vibrate?.(8),
  medium: () => navigator.vibrate?.(18),
  doublePulse: () => navigator.vibrate?.([14, 80, 14]),
}

/** §12.3 honor system reduced-motion. */
export function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/** A session is locked when it's premium-only and the user isn't premium (§14),
 * or it's a Focus "coming soon" placeholder (§6.3). */
export function isLocked(session: Session, premium: boolean): boolean {
  if (session.comingSoon) return true
  return !session.free && !premium
}

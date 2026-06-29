/** Session domain types — Drift spec §6.3 / §8.5. */

import { PaletteId } from '../theme/palettes'
import { SessionSound } from '../audio/AudioEngine'

export type SessionGroup = 'sleep' | 'bodyScan' | 'breathwork' | 'chanting'

/** A single breath phase. duration in seconds; 0 = skip phase. */
export interface BreathPhase {
  label: 'Inhale' | 'Hold' | 'Exhale' | 'Rest'
  seconds: number
}

export interface BreathPattern {
  /** e.g. "4-7-8". Display only. */
  name: string
  phases: BreathPhase[]
}

export interface Session {
  id: string
  title: string
  group: SessionGroup
  /** Minutes (the session's nominal length). */
  durationMin: number
  palette: PaletteId
  /** Synth parameters driving the AudioEngine. */
  sound: SessionSound
  /** Present only for breathwork sessions (§8.5). */
  breath?: BreathPattern
  /** Free tier sessions (§14): Drift, Coastal Night, Box Breath. */
  free: boolean
  /** Focus group is locked "Coming Soon" in MVP (§6.3). */
  comingSoon?: boolean
}

export const GROUP_LABEL: Record<SessionGroup, string> = {
  sleep: 'Sleep',
  bodyScan: 'Body Scan',
  breathwork: 'Breathwork',
  chanting: 'Chanting',
}

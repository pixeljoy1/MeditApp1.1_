/** App state types — Drift spec §9 (Settings) + navigation model §7.3. */

import { PaletteId } from '../theme/palettes'

export type Screen = 'onboarding' | 'home' | 'preplay' | 'session'

/** Sleep timer in minutes, or 'infinite' = "Until I stop it" (§6.2). */
export type SleepTimer = number | 'infinite'

export const TIMER_OPTIONS: SleepTimer[] = [10, 20, 30, 45, 60, 'infinite']

export interface Settings {
  // §9.1 Personalization
  name: string
  preferredPalette: 'auto' | PaletteId
  defaultSessionLength: number // minutes, informational
  // §9.2 Sleep behavior
  defaultSleepTimer: SleepTimer
  screenOffAfter: boolean
  bedtimeMode: boolean
  // §9.3 Audio
  preloadWifiOnly: boolean
  audioQuality: 'standard' | 'flac' // flac requires premium
  // §9 opt-in nightly prompt, off by default
  nightlyPrompt: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  name: '',
  preferredPalette: 'auto',
  defaultSessionLength: 30,
  defaultSleepTimer: 45,
  screenOffAfter: true,
  bedtimeMode: false,
  preloadWifiOnly: true,
  audioQuality: 'standard',
  nightlyPrompt: false,
}

/** A user-submitted request for a new theme (§ feature). */
export interface ThemeRequest {
  id: string
  name: string
  mood: string
  note: string
  createdAt: number
}

export interface Persisted {
  settings: Settings
  onboardingComplete: boolean
  premium: boolean
  lastPlayedId: string | null
  requests: ThemeRequest[]
}

export const DEFAULT_PERSISTED: Persisted = {
  settings: DEFAULT_SETTINGS,
  onboardingComplete: false,
  premium: false,
  lastPlayedId: null,
  requests: [],
}

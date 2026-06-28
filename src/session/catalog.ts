/**
 * Session catalog — Drift spec §6.3 (MVP, 20 sessions + 4 Focus placeholders).
 * Free tier (§14): Drift, Coastal Night, Box Breath.
 *
 * Synth params are hand-tuned per session to evoke its character with the
 * mock audio engine. When licensed stems land, swap `sound` for stream URLs.
 */

import { BreathPattern, Session } from './types'

const BOX: BreathPattern = {
  name: '4-4-4-4',
  phases: [
    { label: 'Inhale', seconds: 4 },
    { label: 'Hold', seconds: 4 },
    { label: 'Exhale', seconds: 4 },
    { label: 'Rest', seconds: 4 },
  ],
}

export const CATALOG: Session[] = [
  // ── Sleep (8) ────────────────────────────────────────────────
  {
    id: 'drift',
    title: 'Drift',
    group: 'sleep',
    durationMin: 48,
    palette: 'dusk',
    free: true,
    sound: { root: 110, breathCycle: 7, ambientDensity: 0.25, cutoff: 600 },
  },
  {
    id: 'coastal-night',
    title: 'Coastal Night',
    group: 'sleep',
    durationMin: 32,
    palette: 'deepWater',
    free: true,
    sound: { root: 98, breathCycle: 6, ambientDensity: 0.5, cutoff: 700 },
  },
  {
    id: 'rainfall-system',
    title: 'Rainfall System',
    group: 'sleep',
    durationMin: 40,
    palette: 'deepWater',
    free: false,
    sound: { root: 90, breathCycle: 5, ambientDensity: 0.8, cutoff: 1200 },
  },
  {
    id: 'northern-lights',
    title: 'Northern Lights',
    group: 'sleep',
    durationMin: 35,
    palette: 'dusk',
    free: false,
    sound: { root: 130, breathCycle: 6.5, ambientDensity: 0.4, cutoff: 900 },
  },
  {
    id: 'forest-breathe',
    title: 'Forest Breathe',
    group: 'sleep',
    durationMin: 38,
    palette: 'ember',
    free: false,
    sound: { root: 100, breathCycle: 6, ambientDensity: 0.55, cutoff: 800 },
  },
  {
    id: 'deep-tide',
    title: 'Deep Tide',
    group: 'sleep',
    durationMin: 45,
    palette: 'deepWater',
    free: false,
    sound: { root: 70, breathCycle: 7, ambientDensity: 0.3, cutoff: 420 },
  },
  {
    id: 'starfield',
    title: 'Starfield',
    group: 'sleep',
    durationMin: 50,
    palette: 'dusk',
    free: false,
    sound: { root: 120, breathCycle: 7, ambientDensity: 0.12, cutoff: 1100 },
  },
  {
    id: 'mountain-pass',
    title: 'Mountain Pass',
    group: 'sleep',
    durationMin: 36,
    palette: 'ember',
    free: false,
    sound: { root: 105, breathCycle: 6, ambientDensity: 0.35, cutoff: 750 },
  },

  // ── Body Scan (4) ────────────────────────────────────────────
  {
    id: 'slow-descent',
    title: 'Slow Descent',
    group: 'bodyScan',
    durationMin: 20,
    palette: 'deepWater',
    free: false,
    sound: { root: 96, breathCycle: 6, ambientDensity: 0.15, cutoff: 650 },
  },
  {
    id: 'weight-and-warmth',
    title: 'Weight & Warmth',
    group: 'bodyScan',
    durationMin: 22,
    palette: 'ember',
    free: false,
    sound: { root: 92, breathCycle: 6.5, ambientDensity: 0.2, cutoff: 700 },
  },
  {
    id: 'pressure-release',
    title: 'Pressure Release',
    group: 'bodyScan',
    durationMin: 25,
    palette: 'deepWater',
    free: false,
    sound: { root: 85, breathCycle: 6, ambientDensity: 0.18, cutoff: 600 },
  },
  {
    id: 'stillness',
    title: 'Stillness',
    group: 'bodyScan',
    durationMin: 30,
    palette: 'dusk',
    free: false,
    sound: { root: 110, breathCycle: 7, ambientDensity: 0.1, cutoff: 900 },
  },

  // ── Breathwork (4) ───────────────────────────────────────────
  {
    id: 'box-breath',
    title: 'Box Breath',
    group: 'breathwork',
    durationMin: 10,
    palette: 'ember',
    free: true,
    sound: { root: 120, breathCycle: 4, ambientDensity: 0.05, cutoff: 1000 },
    breath: { ...BOX },
  },
  {
    id: '4-7-8-sleep',
    title: '4-7-8 Sleep',
    group: 'breathwork',
    durationMin: 12,
    palette: 'dusk',
    free: false,
    sound: { root: 110, breathCycle: 7, ambientDensity: 0.05, cutoff: 800 },
    breath: {
      name: '4-7-8',
      phases: [
        { label: 'Inhale', seconds: 4 },
        { label: 'Hold', seconds: 7 },
        { label: 'Exhale', seconds: 8 },
      ],
    },
  },
  {
    id: 'coherent-breath',
    title: 'Coherent Breath',
    group: 'breathwork',
    durationMin: 12,
    palette: 'deepWater',
    free: false,
    sound: { root: 100, breathCycle: 5.5, ambientDensity: 0.05, cutoff: 900 },
    breath: {
      name: '5.5 · 5.5',
      phases: [
        { label: 'Inhale', seconds: 5.5 },
        { label: 'Exhale', seconds: 5.5 },
      ],
    },
  },
  {
    id: 'exhale-extended',
    title: 'Exhale Extended',
    group: 'breathwork',
    durationMin: 10,
    palette: 'ember',
    free: false,
    sound: { root: 105, breathCycle: 6, ambientDensity: 0.05, cutoff: 850 },
    breath: {
      name: '4 · 8',
      phases: [
        { label: 'Inhale', seconds: 4 },
        { label: 'Exhale', seconds: 8 },
      ],
    },
  },

  // ── Focus (4) — locked "Coming Soon" in MVP (§6.3) ───────────
  ...['Clarity', 'Flow State', 'Deep Work', 'Reset'].map(
    (title, i): Session => ({
      id: `focus-${i}`,
      title,
      group: 'focus',
      durationMin: 25,
      palette: 'deepWater',
      free: false,
      comingSoon: true,
      sound: { root: 130, breathCycle: 5, ambientDensity: 0.1, cutoff: 1200 },
    }),
  ),
]

export const byId = (id: string) => CATALOG.find((s) => s.id === id)
export const FREE_IDS = CATALOG.filter((s) => s.free).map((s) => s.id)

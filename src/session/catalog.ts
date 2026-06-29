/**
 * Session catalog — Drift spec §6.3 (MVP, 20 sessions + 4 Focus placeholders).
 * Each session carries a mood-matched gradient palette and a specific ambient
 * sound module. All Sleep themes are free so the textures can be experienced.
 *
 * When licensed stems land, swap `sound` for stream URLs.
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
  // ── Sleep (8) — all free, each with its own palette + ambient module ──
  {
    id: 'drift',
    title: 'Drift',
    group: 'sleep',
    durationMin: 48,
    palette: 'dusk',
    free: true,
    sound: { root: 110, breathCycle: 7, ambientDensity: 0.3, cutoff: 600, ambient: 'none' },
  },
  {
    id: 'coastal-night',
    title: 'Coastal Night',
    group: 'sleep',
    durationMin: 32,
    palette: 'coastal',
    free: true,
    sound: { root: 98, breathCycle: 6, ambientDensity: 0.9, cutoff: 700, ambient: 'waves' },
  },
  {
    id: 'rainfall-system',
    title: 'Rainfall System',
    group: 'sleep',
    durationMin: 40,
    palette: 'rainfall',
    free: true,
    sound: { root: 90, breathCycle: 5, ambientDensity: 0.95, cutoff: 1200, ambient: 'rain' },
  },
  {
    id: 'northern-lights',
    title: 'Northern Lights',
    group: 'sleep',
    durationMin: 35,
    palette: 'aurora',
    free: true,
    sound: { root: 130, breathCycle: 6.5, ambientDensity: 0.55, cutoff: 900, ambient: 'shimmer' },
  },
  {
    id: 'forest-breathe',
    title: 'Forest Breathe',
    group: 'sleep',
    durationMin: 38,
    palette: 'forest',
    free: true,
    sound: { root: 100, breathCycle: 6, ambientDensity: 0.7, cutoff: 800, ambient: 'forest' },
  },
  {
    id: 'deep-tide',
    title: 'Deep Tide',
    group: 'sleep',
    durationMin: 45,
    palette: 'tide',
    free: true,
    sound: { root: 70, breathCycle: 7, ambientDensity: 0.7, cutoff: 420, ambient: 'waves' },
  },
  {
    id: 'starfield',
    title: 'Starfield',
    group: 'sleep',
    durationMin: 50,
    palette: 'starfield',
    free: true,
    sound: { root: 120, breathCycle: 7, ambientDensity: 0.2, cutoff: 1100, ambient: 'shimmer' },
  },
  {
    id: 'mountain-pass',
    title: 'Mountain Pass',
    group: 'sleep',
    durationMin: 36,
    palette: 'mountain',
    free: true,
    sound: { root: 105, breathCycle: 6, ambientDensity: 0.6, cutoff: 750, ambient: 'wind' },
  },

  // ── Body Scan (4) ────────────────────────────────────────────
  {
    id: 'slow-descent',
    title: 'Slow Descent',
    group: 'bodyScan',
    durationMin: 20,
    palette: 'deepWater',
    free: false,
    sound: { root: 96, breathCycle: 6, ambientDensity: 0.1, cutoff: 650, ambient: 'none' },
  },
  {
    id: 'weight-and-warmth',
    title: 'Weight & Warmth',
    group: 'bodyScan',
    durationMin: 22,
    palette: 'ember',
    free: false,
    sound: { root: 92, breathCycle: 6.5, ambientDensity: 0.15, cutoff: 700, ambient: 'none' },
  },
  {
    id: 'pressure-release',
    title: 'Pressure Release',
    group: 'bodyScan',
    durationMin: 25,
    palette: 'deepWater',
    free: false,
    sound: { root: 85, breathCycle: 6, ambientDensity: 0.1, cutoff: 600, ambient: 'none' },
  },
  {
    id: 'stillness',
    title: 'Stillness',
    group: 'bodyScan',
    durationMin: 30,
    palette: 'dusk',
    free: false,
    sound: { root: 110, breathCycle: 7, ambientDensity: 0.12, cutoff: 900, ambient: 'shimmer' },
  },

  // ── Breathwork (4) ───────────────────────────────────────────
  {
    id: 'box-breath',
    title: 'Box Breath',
    group: 'breathwork',
    durationMin: 10,
    palette: 'ember',
    free: true,
    sound: { root: 120, breathCycle: 4, ambientDensity: 0.05, cutoff: 1000, ambient: 'none' },
    breath: { ...BOX },
  },
  {
    id: '4-7-8-sleep',
    title: '4-7-8 Sleep',
    group: 'breathwork',
    durationMin: 12,
    palette: 'dusk',
    free: false,
    sound: { root: 110, breathCycle: 7, ambientDensity: 0.05, cutoff: 800, ambient: 'none' },
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
    sound: { root: 100, breathCycle: 5.5, ambientDensity: 0.05, cutoff: 900, ambient: 'none' },
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
    sound: { root: 105, breathCycle: 6, ambientDensity: 0.05, cutoff: 850, ambient: 'none' },
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
      sound: { root: 130, breathCycle: 5, ambientDensity: 0.1, cutoff: 1200, ambient: 'none' },
    }),
  ),
]

export const byId = (id: string) => CATALOG.find((s) => s.id === id)
export const FREE_IDS = CATALOG.filter((s) => s.free).map((s) => s.id)

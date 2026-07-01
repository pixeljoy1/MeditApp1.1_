/**
 * useSession — the runtime "Session Engine" (spec §15).
 * Coordinates AudioEngine + DimmingScheduler + sleep timer + fade-to-black for one
 * active session. Exposes a per-frame `sample()` for the gradient and 1Hz display
 * state for the timer UI.
 *
 * Android twin: SessionEngine + SessionForegroundService.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Session } from '../session/types'
import { SleepTimer } from './types'
import { audioEngine } from '../audio/AudioEngine'
import { dimStateAt, timerOpacityAt } from '../gradient/DimmingScheduler'

interface Options {
  session: Session
  timer: SleepTimer
  onExit: () => void
}

export interface SessionRuntime {
  elapsedSec: number
  sleepRemainingSec: number | null // null = "Until I stop it"
  paused: boolean
  volume: number
  timerOpacity: number
  blackout: number // 0..1 fade-to-black overlay
  blackoutMs: number // duration of the fade-to-black transition
  statusNote: string | null // §11 transient states ("Paused — call in progress" etc.)
  sample: () => { dim: number; driftScale: number; breath: number }
  togglePause: () => void
  setVolume: (v: number) => void
  addTen: () => void
  endSession: () => void
}

// §8.3 spec'd an 8s fade; in practice a manual exit needs to feel immediate, so
// End Session fades audio over 2s and returns home in ~0.9s — a clean pathway.
// The natural wind-down (sleep-timer complete) is slow and deliberate instead.

export function useSession({ session, timer, onExit }: Options): SessionRuntime {
  const startRef = useRef(performance.now())
  const pausedAccumRef = useRef(0)
  const pausedAtRef = useRef<number | null>(null)
  // total sleep-timer budget in seconds (null = infinite)
  const sleepBudgetRef = useRef<number | null>(timer === 'infinite' ? null : timer * 60)

  const [paused, setPaused] = useState(false)
  const [volume, setVol] = useState(audioEngine.volume)
  const [tick, setTick] = useState(0) // 1Hz display tick
  const [blackout, setBlackout] = useState(0)
  const [blackoutMs, setBlackoutMs] = useState(700)
  const [statusNote, setStatusNote] = useState<string | null>(null)
  const sleepStartedRef = useRef(false)
  const exitedRef = useRef(false)

  const elapsed = useCallback(() => {
    const base = pausedAtRef.current ?? performance.now()
    return (base - startRef.current - pausedAccumRef.current) / 1000
  }, [])

  // Start audio on mount; stop on unmount.
  useEffect(() => {
    audioEngine.play(session.track, session.sound.breathCycle)
    return () => audioEngine.stop()
  }, [session.id])

  // §11 headphone disconnect / visibility (app backgrounded).
  useEffect(() => {
    const onVis = () => {
      // Gradient pauses when hidden (handled by canvas paused prop in parent);
      // audio keeps playing (foreground-service analog).
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  const finish = useCallback(
    (audioFadeSec: number, exitDelayMs: number, fadeMs: number) => {
      if (exitedRef.current) return
      exitedRef.current = true
      audioEngine.fadeOut(audioFadeSec)
      setBlackoutMs(fadeMs)
      setBlackout(1)
      window.setTimeout(() => onExit(), exitDelayMs)
    },
    [onExit],
  )

  // 1Hz loop: advance display, drive sleep timer + fades.
  useEffect(() => {
    const id = window.setInterval(() => {
      setTick((t) => t + 1)
      if (paused || exitedRef.current) return
      const e = elapsed()
      const budget = sleepBudgetRef.current

      // sleep timer reached → the wind-down: a very slow, deliberate "lights
      // going out" — sound and screen dim together over the same long fade, then
      // quietly return home after a beat. Applies to every timer, incl. the trial.
      if (budget != null && !sleepStartedRef.current && e >= budget) {
        sleepStartedRef.current = true
        const sec = budget <= 60 ? 22 : 90 // trial gets a felt 22s; full timers 90s
        finish(sec, sec * 1000 + 2500, sec * 1000)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [paused, elapsed, finish])

  const sample = useCallback(() => {
    const e = elapsed()
    const d = dimStateAt(e)
    return { dim: d.brightness, driftScale: d.driftScale, breath: audioEngine.breathEnvelope() }
  }, [elapsed])

  const togglePause = useCallback(() => {
    setPaused((p) => {
      const next = !p
      if (next) {
        pausedAtRef.current = performance.now()
        audioEngine.pause()
        setStatusNote('Paused')
      } else {
        if (pausedAtRef.current != null) {
          pausedAccumRef.current += performance.now() - pausedAtRef.current
        }
        pausedAtRef.current = null
        audioEngine.resume()
        setStatusNote(null)
      }
      return next
    })
  }, [])

  const setVolume = useCallback((v: number) => {
    audioEngine.setVolume(v)
    setVol(v)
  }, [])

  const addTen = useCallback(() => {
    if (sleepBudgetRef.current != null) sleepBudgetRef.current += 600
    sleepStartedRef.current = false
  }, [])

  // quick, clean exit: short audio fade + brief blackout, then home
  const endSession = useCallback(() => finish(2, 900, 700), [finish])

  const e = elapsed()
  const budget = sleepBudgetRef.current
  const sleepRemainingSec = budget == null ? null : Math.max(0, budget - e)

  return useMemo(
    () => ({
      elapsedSec: e,
      sleepRemainingSec,
      paused,
      volume,
      timerOpacity: timerOpacityAt(e),
      blackout,
      blackoutMs,
      statusNote,
      sample,
      togglePause,
      setVolume,
      addTen,
      endSession,
    }),
    // tick drives recompute each second
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tick, paused, volume, blackout, blackoutMs, statusNote, sample, togglePause, setVolume, addTen, endSession],
  )
}

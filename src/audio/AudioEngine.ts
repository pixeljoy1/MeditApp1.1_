/**
 * AudioEngine — Drift spec §6.
 * Web Audio twin of the ExoPlayer + LayerMixer + SleepFader stack.
 *
 * Because V1 ships with synth/mock audio (no licensed stems, see §18 Q2), each
 * session is rendered live from three oscillator-based layers:
 *   Layer 1 — Foundation  : continuous detuned drone (never stops)         §6.1
 *   Layer 2 — Breath      : slow LFO swell on a filtered pad (4–7s cycle)  §6.1
 *   Layer 3 — Ambient drift: sparse random tonal flickers                  §6.1
 *
 * The user controls overall volume only (§6.1). The SleepFader applies an
 * exponential fade-to-silence (§6.2).
 */

import { SleepFader } from './SleepFader'

export interface SessionSound {
  /** Root frequency (Hz) for the foundation drone. */
  root: number
  /** Breath cycle seconds (4–7s typical). Drives Layer 2 + the visual breath envelope. */
  breathCycle: number
  /** Ambient flicker density 0..1 (Layer 3). */
  ambientDensity: number
  /** Lowpass cutoff (Hz) — darker = sleepier. */
  cutoff: number
}

export class AudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private fader: SleepFader | null = null

  private foundation: OscillatorNode[] = []
  private foundationGain: GainNode | null = null
  private breathGain: GainNode | null = null
  private breathLfo: OscillatorNode | null = null
  private ambientTimer: number | null = null
  private filter: BiquadFilterNode | null = null

  private _volume = 0.8
  private _breathPhase = 0
  private current: SessionSound | null = null

  /** Latest breath envelope 0..1, polled by the gradient for luminosity sync. */
  breathEnvelope(): number {
    if (!this.current) return 0.5
    const ctx = this.ctx
    if (!ctx) return 0.5
    // sine envelope over the breath cycle, normalized 0..1
    const t = ctx.currentTime
    const phase = ((t / this.current.breathCycle) * Math.PI * 2 + this._breathPhase) % (Math.PI * 2)
    return 0.5 + 0.5 * Math.sin(phase)
  }

  get volume() {
    return this._volume
  }

  /** Lazily create the context (must follow a user gesture per browser policy). */
  private ensure(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.master = this.ctx.createGain()
      this.master.gain.value = this._volume
      this.filter = this.ctx.createBiquadFilter()
      this.filter.type = 'lowpass'
      this.filter.frequency.value = 800
      this.filter.connect(this.master)
      this.master.connect(this.ctx.destination)
      this.fader = new SleepFader(this.ctx, this.master)
    }
    return this.ctx
  }

  /** Start a session: build the three layers and fade in over 3s (§12.2). */
  async play(sound: SessionSound) {
    const ctx = this.ensure()
    if (ctx.state === 'suspended') await ctx.resume()
    this.stopLayers()
    this.current = sound

    this.filter!.frequency.setValueAtTime(sound.cutoff, ctx.currentTime)

    // Layer 1 — Foundation: 3 detuned oscillators for a warm drone.
    this.foundationGain = ctx.createGain()
    this.foundationGain.gain.value = 0.22
    this.foundationGain.connect(this.filter!)
    ;[0, -5, 7].forEach((detune, i) => {
      const o = ctx.createOscillator()
      o.type = i === 0 ? 'sine' : 'triangle'
      o.frequency.value = sound.root
      o.detune.value = detune
      o.connect(this.foundationGain!)
      o.start()
      this.foundation.push(o)
    })

    // Layer 2 — Breath: a fifth above, swelled by a slow LFO at the breath cycle.
    this.breathGain = ctx.createGain()
    this.breathGain.gain.value = 0.0
    this.breathGain.connect(this.filter!)
    const breathOsc = ctx.createOscillator()
    breathOsc.type = 'sine'
    breathOsc.frequency.value = sound.root * 1.5
    breathOsc.connect(this.breathGain)
    breathOsc.start()
    this.foundation.push(breathOsc)
    this.breathLfo = ctx.createOscillator()
    this.breathLfo.frequency.value = 1 / sound.breathCycle
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.12
    this.breathLfo.connect(lfoGain)
    lfoGain.connect(this.breathGain.gain)
    this.breathLfo.start()

    // Layer 3 — Ambient drift: sparse random bell-like flickers.
    this.scheduleAmbient(sound)

    // Master fade-in (3s, §12.2). SleepFader owns master.gain envelopes.
    this.fader!.fadeIn(this._volume, 3)
  }

  private scheduleAmbient(sound: SessionSound) {
    const ctx = this.ctx!
    const tick = () => {
      if (!this.current) return
      if (Math.random() < sound.ambientDensity) {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.type = 'sine'
        const intervals = [0, 3, 5, 7, 12]
        const semi = intervals[Math.floor(Math.random() * intervals.length)]
        o.frequency.value = sound.root * 2 * Math.pow(2, semi / 12)
        g.gain.value = 0
        o.connect(g)
        g.connect(this.filter!)
        const now = ctx.currentTime
        g.gain.setValueAtTime(0, now)
        g.gain.linearRampToValueAtTime(0.06, now + 0.4)
        g.gain.exponentialRampToValueAtTime(0.0001, now + 3.5)
        o.start(now)
        o.stop(now + 3.6)
      }
      this.ambientTimer = window.setTimeout(tick, 1800 + Math.random() * 2600)
    }
    this.ambientTimer = window.setTimeout(tick, 1500)
  }

  /** Begin the exponential fade-to-silence over `seconds` (§6.2, default 180s). */
  beginSleepFade(seconds = 180) {
    this.fader?.fadeToSilence(seconds)
  }

  /** Hard fade out (e.g. End Session 8s, §8.3). */
  fadeOut(seconds = 8) {
    this.fader?.fadeToSilence(seconds)
    window.setTimeout(() => this.stopLayers(), seconds * 1000 + 100)
  }

  pause() {
    this.ctx?.suspend()
  }
  resume() {
    this.ctx?.resume()
  }

  setVolume(v: number) {
    this._volume = Math.max(0, Math.min(1, v))
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this._volume, this.ctx.currentTime, 0.05)
    }
  }

  stop() {
    this.stopLayers()
  }

  private stopLayers() {
    this.current = null
    if (this.ambientTimer) {
      clearTimeout(this.ambientTimer)
      this.ambientTimer = null
    }
    this.foundation.forEach((o) => {
      try {
        o.stop()
      } catch {
        /* already stopped */
      }
    })
    this.foundation = []
    this.breathLfo?.stop()
    this.breathLfo = null
  }
}

// Singleton — one engine per app, like a single ExoPlayer instance.
export const audioEngine = new AudioEngine()
